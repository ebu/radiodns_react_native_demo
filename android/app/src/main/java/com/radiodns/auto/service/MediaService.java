package com.radiodns.auto.service;

import android.arch.persistence.room.Room;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.media.MediaMetadata;
import android.media.session.PlaybackState;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaBrowserServiceCompat;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;

import com.radiodns.auto.Constants;
import com.radiodns.auto.RadioDNSAutoModule;
import com.radiodns.auto.database.AutoNode;
import com.radiodns.auto.database.RadioDNSDatabase;
import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.auto.service.incoming_messages_handlers.KokoroMessageHandler;
import com.radiodns.auto.service.incoming_messages_handlers.ModuleMessageHandler;
import com.radiodns.kokoro.js_runtime.Kokoro;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

/**
 * MediaBrowserService implementation for the RadioDNS demonstrator.
 */
public class MediaService extends MediaBrowserServiceCompat {

    // Current android media session
    private MediaSessionCompat session;

    // Android Room database connection.
    private RadioDNSDatabase db;

    // Id (url) of the media currently being played.
    private String currentMediaID;
    private String previousMediaID;
    private String nextMediaID;

    // List of activities that are bound to this service and registered to get Messages form this
    // service.
    private ArrayList<Messenger> clients = new ArrayList<>();

    // Constants for defining the root of the android auto render tree.
    private final String MEDIA_ROOT = "MEDIA_ROOT";
    private final String MEDIA_ROOT_ID = "root";

    // Target for clients to send message to IncomingHandler.
    public Messenger mMessenger;

    // Kokoro service connection
    public Messenger kokoroMessenger;
    private Messenger kokoroService;
    private ServiceConnection kokoroConnection;
    private boolean kokoroBound;
    private boolean kokoroReady = false;
    private LinkedList<Message> pendingMessages = new LinkedList<>();

    @Override
    public IBinder onBind(Intent intent) {
        // If the bind request comes from our Native Module (RadioDNSAutoModule class) use the binder
        // of the messenger. Otherwise (when android auto binds to this service for example) use the
        // default implementation (should we omit to do that, android auto would have a message binder
        // instead of the media browser its expects to have).
        if (intent.getAction() != null && (
                intent.getAction().equals(RadioDNSAutoModule.class.getName())
                        || intent.getAction().equals(Kokoro.class.getName()))) {
            mMessenger = new Messenger(new ModuleMessageHandler(this));
            return mMessenger.getBinder();
        }
        return super.onBind(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();

        db = Room.databaseBuilder(getApplicationContext(), RadioDNSDatabase.class, Constants.DATABASE_NAME).allowMainThreadQueries().build();

        session = new MediaSessionCompat(this, Constants.RADIODNS_MEDIA_COMPAT_SESSION_TAG);
        setSessionToken(session.getSessionToken());
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        setMediaSessionState(PlaybackState.STATE_BUFFERING);

        session.setCallback(new MediaSessionEventCallback(this));
        session.setActive(true);

        // kokoro connection
        kokoroConnection = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName className, IBinder service) {
                kokoroService = new Messenger(service);
                kokoroBound = true;

                try {
                    Message msg = Message.obtain(null, AutoServiceMessages.REGISTER_CLIENT);
                    msg.replyTo = mMessenger;
                    kokoroService.send(msg);
                } catch (RemoteException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onServiceDisconnected(ComponentName className) {
                kokoroService = null;
                kokoroBound = false;
            }
        };

        kokoroMessenger = new Messenger(new KokoroMessageHandler(this));
        Context context = getApplicationContext();
        context.bindService(new Intent(context, Kokoro.class), kokoroConnection, Context.BIND_AUTO_CREATE);
        context.startService(new Intent(context, Kokoro.class));
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        session.setActive(false);
        session.release();
        if (kokoroBound) {
            getApplicationContext().unbindService(kokoroConnection);
            kokoroBound = false;
        }
    }

    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) {
        // TODO Verify that the specified package is allowed to access your content! You'll need to write your own logic to do this.
        //if (!isValid(clientPackageName, clientUid)) {
        // If the request comes from an untrusted package, return null.
        // No further calls will be made to other media browsing methods.

        // return null;
        //}

        return new BrowserRoot(MEDIA_ROOT_ID, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        result.detach();

        new LoadChildrenTask(db, parentId, result).execute();
    }

    /**
     * Updates the state of the currently played station. Sets the available actions on the
     * session's PlaybackState and sets the current station metadata for the session.
     * <p>
     * Sends the new state to the React Native module.
     *
     * @param state:  String state that will update the JS side.
     * @param iState: integer State that will update the PlayBackState of the session.
     */
    public void updateState(String state, int iState) {

        AutoNode node = setNodeData();

        setMediaSessionState(iState);

        Message msg = Message.obtain(null, AutoServiceMessages.SEND_NEW_PLAYER_STATE_EVENT);
        Bundle data = new Bundle();
        data.putString("CHANNEL_ID", node.streamURI);
        data.putString("STATE", state);
        msg.setData(data);
        sendKokoroMessage(msg);
    }

    /**
     * Sends to the JS side a command to play a random station.
     */
    public void sendPlayRandom() {
        Message msg = Message.obtain(null, AutoServiceMessages.SEND_PLAY_RANDOM);
        sendMessage(msg);
    }

    /**
     * Sends to the JS side a command to play the station that has the name the most related to the
     * search string.
     */
    public void sendPlayFromSearchString(String searchString) {
        Message msg = Message.obtain(null, AutoServiceMessages.SEND_PLAY_FROM_SEARCH_STRING);
        Bundle data = new Bundle();
        data.putString("SEARCH_STRING", searchString);
        msg.setData(data);

        sendMessage(msg);
    }

    /**
     * Sets the session's playback state.
     *
     * @param state: The playback state.
     */
    public void setMediaSessionState(int state) {
        long actions = PlaybackState.ACTION_PLAY_FROM_MEDIA_ID
                | PlaybackState.ACTION_PLAY_FROM_SEARCH;

        if (state == PlaybackState.STATE_PLAYING) {
            actions |= PlaybackState.ACTION_PAUSE;
        }

        if (state == PlaybackState.STATE_PAUSED || state == PlaybackState.STATE_STOPPED || state == PlaybackState.STATE_BUFFERING) {
            actions |= PlaybackState.ACTION_PLAY;
        }

        if (nextMediaID != null) {
            actions |= PlaybackState.ACTION_SKIP_TO_NEXT;
        }
        if (previousMediaID != null) {
            actions |= PlaybackState.ACTION_SKIP_TO_PREVIOUS;
        }
        PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder();
        stateBuilder.setActions(actions);
        stateBuilder.setState(state, 0, 1);
        session.setPlaybackState(stateBuilder.build());
    }

    /**
     * Sets the current node metadata in android auto play view. Also updates the list
     * of next/previous station available with this station.
     */
    public AutoNode setNodeData() {
        AutoNode node = db.autoNodeDAO().find(currentMediaID);
        List<AutoNode> playlist = db.autoNodeDAO().loadChildren(node.childOf);

        previousMediaID = null;
        nextMediaID = null;

        // indexOf doesn't work so by hand
        if (playlist.size() > 1) {
            Iterator<AutoNode> i = playlist.iterator();
            int index = 0;
            while (i.hasNext()) {
                if (i.next().key.equals(node.key)) {
                    break;
                }
                index++;
            }

            previousMediaID = playlist.get(index == 0 ? playlist.size() - 1 : index - 1).key;
            nextMediaID = playlist.get(index == playlist.size() - 1 ? 0 : index + 1).key;
        }
        session.setMetadata(
                new MediaMetadataCompat.Builder()
                        .putString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE, node.value)
                        .putString(MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE, "Powered by RadioDNS")
                        .putString(MediaMetadata.METADATA_KEY_ALBUM_ART_URI, node.imageURI)
                        .build());
        return node;
    }

    /**
     * Sends a message to all client registered to this service.
     *
     * @param msg: the message to send
     */
    private void sendMessage(Message msg) {
        for (Messenger client : clients) {
            try {
                client.send(msg);
            } catch (RemoteException e) {
                clients.remove(client);
                e.printStackTrace();
            }
        }
    }

    public void sendKokoroMessage(Message msg) {
        if (!kokoroReady) {
            pendingMessages.add(msg);
        }
        try {
            kokoroService.send(msg);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    public MediaSessionCompat getSession() {
        return session;
    }

    public void setCurrentMediaID(String currentMediaID) {
        this.currentMediaID = currentMediaID;
    }

    public String getPreviousMediaID() {
        return previousMediaID;
    }

    public String getNextMediaID() {
        return nextMediaID;
    }

    public String getCurrentMediaID() {
        return currentMediaID;
    }

    public void setPreviousMediaID(String previousMediaID) {
        this.previousMediaID = previousMediaID;
    }

    public void setNextMediaID(String nextMediaID) {
        this.nextMediaID = nextMediaID;
    }

    public ArrayList<Messenger> getClients() {
        return clients;
    }

    public RadioDNSDatabase getDb() {
        return db;
    }

    public LinkedList<Message> getPendingMessages() {
        return pendingMessages;
    }

    public void setKokoroReady(boolean kokoroReady) {
        this.kokoroReady = kokoroReady;
    }
}
