package com.radiodns.auto.service;

import android.arch.persistence.room.Room;
import android.content.Intent;
import android.media.MediaMetadata;
import android.media.session.PlaybackState;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
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
import android.util.Log;

import com.radiodns.MainActivity;
import com.radiodns.R;
import com.radiodns.auto.RadioDNSAutoModule;
import com.radiodns.auto.database.AutoNode;
import com.radiodns.auto.database.RadioDNSDatabase;
import com.radiodns.auto.messages.AutoServiceMessages;

import java.util.ArrayList;
import java.util.Iterator;
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
    private ArrayList<Messenger> mClients = new ArrayList<>();

    // Constants for defining the root of the android auto render tree.
    private final String MEDIA_ROOT = "MEDIA_ROOT";
    private final String MEDIA_ROOT_ID = "root";

    // Target for clients to send message to IncomingHandler.
    public Messenger mMessenger;

    // Incoming Message handler.
    static class IncomingHandler extends Handler {
        private MediaService service;

        IncomingHandler(MediaService service) {
            this.service = service;
        }

        @Override
        public void handleMessage(Message msg) {
            switch (msg.what) {
                case AutoServiceMessages.REGISTER_CLIENT:
                    service.getmClients().add(msg.replyTo);
                    break;
                case AutoServiceMessages.UNREGISTER_CLIENT:
                    service.getmClients().remove(msg.replyTo);
                    break;
                case AutoServiceMessages.RESET_DB:
                    service.db.autoNodeDAO().nukeTable();
                    break;
                case AutoServiceMessages.REFRESH_FROM_DB:
                    Log.i("[" + this.getClass().getName() + "]", "ON refresh from db. ");
                    break;
                case AutoServiceMessages.UPDATE_MEDIA_STATE_TO_PLAYING:
                    service.setMediaSessionState(PlaybackState.STATE_PLAYING);
                    break;
                case AutoServiceMessages.UPDATE_MEDIA_STATE_TO_BUFFERING:
                    service.setMediaSessionState(PlaybackState.STATE_BUFFERING);
                    break;
                case AutoServiceMessages.UPDATE_MEDIA_STATE_TO_ERROR:
                    PlaybackStateCompat.Builder stateBuilder = new PlaybackStateCompat.Builder();
                    stateBuilder.setState(PlaybackState.STATE_ERROR, 0, 0);
                    stateBuilder.setErrorMessage(1, service.getApplicationContext().getResources().getString(R.string.error_media_format_unsuported));
                    service.session.setPlaybackState(stateBuilder.build());
                default:
                    super.handleMessage(msg);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        // If the bind request comes from our Native Module (RadioDNSAutoModule class) use the binder
        // of the messenger. Otherwise (when android auto binds to this service for example) use the
        // default implementation (should we omit to do that, android auto would have a message binder
        // instead of the media browser its expects to have).
        if (intent.getAction() != null && intent.getAction().equals(RadioDNSAutoModule.class.getName())) {
            mMessenger = new Messenger(new IncomingHandler(this));
            return mMessenger.getBinder();
        }
        return super.onBind(intent);
    }

    @Override
    public void onCreate() {
        super.onCreate();

        db = Room.databaseBuilder(getApplicationContext(), RadioDNSDatabase.class, "RadioDNSAuto-db").allowMainThreadQueries().build();

        session = new MediaSessionCompat(this, "RADIODNS_MEDIA_COMPAT_SESSION_TAG");
        setSessionToken(session.getSessionToken());
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        setMediaSessionState(PlaybackState.STATE_BUFFERING);

        session.setCallback(new MediaSessionEventCallback(this));
        session.setActive(true);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        session.setActive(false);
        session.release();
    }

    // LAYOUT
    @Nullable
    @Override
    public BrowserRoot onGetRoot(@NonNull String clientPackageName, int clientUid, @Nullable Bundle rootHints) {
        // TODO Verify that the specified package is allowed to access your content! You'll need to write your own logic to do this.
        //if (!isValid(clientPackageName, clientUid)) {
        // If the request comes from an untrusted package, return null.
        // No further calls will be made to other media browsing methods.

        // return null;
        //}

        return new BrowserRoot(MEDIA_ROOT, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {

        if (MEDIA_ROOT.equals(parentId)) {
            List<MediaBrowserCompat.MediaItem> mediaItems = new ArrayList<>();
            mediaItems.add(new MediaBrowserCompat.MediaItem(
                    new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, MEDIA_ROOT_ID)
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, "RadioDNS auto demo")
                            .build().getDescription(),
                    MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
            ));
            result.sendResult(mediaItems);
        } else {
            result.detach();

            new LoadChildrenTask(db, parentId, result).execute();
        }
    }

    public void updateState(String state, int iState) {
        AutoNode node = db.autoNodeDAO().find(currentMediaID);
        List<AutoNode> playlist = db.autoNodeDAO().loadChildren(node.childOf);

        if (playlist.size() >= 3) {
            Iterator<AutoNode> i = playlist.iterator();
            int index = 0;
            while(i.hasNext()) {
                if (i.next().key.equals(node.key)) {
                    break;
                }
                index++;
            }

            previousMediaID = playlist.get(index == 0 ? playlist.size() - 1 : index - 1).key;
            nextMediaID = playlist.get(index == playlist.size() - 1 ? 0 : index + 1).key;
        } else {
            previousMediaID = null;
            nextMediaID = null;
        }

        session.setMetadata(
                new MediaMetadataCompat.Builder()
                        .putString(MediaMetadata.METADATA_KEY_DISPLAY_TITLE, node.value)
                        .putString(MediaMetadata.METADATA_KEY_DISPLAY_SUBTITLE, "Powered by RadioDNS")
                        .putString(MediaMetadata.METADATA_KEY_ALBUM_ART_URI, node.imageURI)
                        .build());

        setMediaSessionState(iState);

        Message msg = Message.obtain(null, AutoServiceMessages.SEND_NEW_PLAYER_STATE_EVENT);
        Bundle data = new Bundle();
        data.putString("CHANNEL_ID", currentMediaID);
        data.putString("STATE", state);
        msg.setData(data);

        sendMessage(msg);
    }

    public void sendPlayRandom() {
        Message msg = Message.obtain(null, AutoServiceMessages.SEND_PLAY_RANDOM);
        sendMessage(msg);
    }

    public void sendPlayFromSearchString(String searchString) {
        Message msg = Message.obtain(null, AutoServiceMessages.SEND_PLAY_FROM_SEARCH_STRING);
        Bundle data = new Bundle();
        data.putString("SEARCH_STRING", searchString);
        msg.setData(data);

        sendMessage(msg);
    }

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

    public ArrayList<Messenger> getmClients() {
        return mClients;
    }

    private void sendMessage(Message msg) {
        for (Messenger client : mClients) {
            try {
                client.send(msg);
            } catch (RemoteException e) {
                mClients.remove(client);
                e.printStackTrace();
            }
        }
    }

}
