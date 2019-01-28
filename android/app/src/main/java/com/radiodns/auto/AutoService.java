package com.radiodns.auto;

import android.arch.persistence.room.Room;
import android.content.Intent;
import android.media.session.PlaybackState;
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

import com.radiodns.R;
import com.radiodns.auto.database.AutoNode;
import com.radiodns.auto.database.RadioDNSDatabase;
import com.radiodns.auto.module.RadioDNSAutoModule;

import java.util.ArrayList;
import java.util.List;

/**
 * MediaBrowserService implementation for the RadioDNS demonstrator.
 */
public class AutoService extends MediaBrowserServiceCompat {

    // Current android media session
    private MediaSessionCompat session;

    // Android Room database connection.
    private RadioDNSDatabase db;

    // State builder for updating state of media session.
    private PlaybackStateCompat.Builder stateBuilder;

    // Id (url) of the media currently being played.
    private String currentMediaID;

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
        private AutoService service;

        IncomingHandler(AutoService service) {
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
                    service.stateBuilder.setState(PlaybackState.STATE_ERROR, 0, 0);
                    service.stateBuilder.setErrorMessage(1, service.getApplicationContext().getResources().getString(R.string.error_media_format_unsuported));
                    service.session.setPlaybackState(service.stateBuilder.build());
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
        stateBuilder = new PlaybackStateCompat.Builder();
        stateBuilder.setActions(PlaybackState.ACTION_PLAY
                | PlaybackState.ACTION_PAUSE
                | PlaybackState.ACTION_SKIP_TO_NEXT
                | PlaybackState.ACTION_SKIP_TO_PREVIOUS
                | PlaybackState.ACTION_PLAY_FROM_MEDIA_ID
                | PlaybackState.ACTION_PLAY_FROM_SEARCH
        );

        session.setActive(true);
        setSessionToken(session.getSessionToken());
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);

        setMediaSessionState(PlaybackState.STATE_BUFFERING);

        session.setCallback(new MediaSessionEventCallback(this));
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
        List<MediaBrowserCompat.MediaItem> mediaItems = new ArrayList<>();

        if (MEDIA_ROOT.equals(parentId)) {
            mediaItems.add(new MediaBrowserCompat.MediaItem(
                    new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, MEDIA_ROOT_ID)
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, "RadioDNS auto demo")
                            .build().getDescription(),
                    MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
            ));
        } else {
            List<AutoNode> nodes = db.autoNodeDAO().loadChildren(parentId);
            for (AutoNode node : nodes) {
                mediaItems.add(new MediaBrowserCompat.MediaItem(
                        new MediaMetadataCompat.Builder()
                                .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, node.key)
                                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, node.value)
                                .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, "Powered by RadioDNS")
                                .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON_URI, node.imageURI)
                                //.putString(MediaMetadataCompat.METADATA_KEY_ALBUM, node.value)
                                //.putString(MediaMetadataCompat.METADATA_KEY_ALBUM, node.imageURI)
                                //.putString(MediaMetadataCompat.METADATA_KEY_ART_URI, node.imageURI)
                                //.putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI, node.imageURI)
                                //.putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_TITLE, node.value)
                                //.putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_DESCRIPTION, "Descriptionnnn")
                                .build().getDescription(),
                        node.streamURI != null ? MediaBrowserCompat.MediaItem.FLAG_PLAYABLE : MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
                ));
            }
        }

        result.sendResult(mediaItems);
    }

    public void updateState(String state) {

        Message msg = Message.obtain(null, AutoServiceMessages.SEND_NEW_PLAYER_STATE_EVENT);
        Bundle data = new Bundle();
        data.putString("CHANNEL_ID", currentMediaID);
        data.putString("STATE", state);
        msg.setData(data);

        sendMessage(msg);
    }

    public void setSearchString(String searchString) {
        Message msg = Message.obtain(null, AutoServiceMessages.SEND_SEARCH_STRING);
        Bundle data = new Bundle();
        data.putString("SEARCH_STRING", searchString);
        msg.setData(data);

        sendMessage(msg);
    }

    public void setMediaSessionState(int state) {
        stateBuilder.setState(state, 0, 1);
        session.setPlaybackState(stateBuilder.build());
    }

    public MediaSessionCompat getSession() {
        return session;
    }

    public void setCurrentMediaID(String currentMediaID) {
        this.currentMediaID = currentMediaID;
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
