package com.radiodns.auto;

import android.arch.persistence.room.Room;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaBrowserServiceCompat;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.util.Log;

import com.radiodns.auto.auto_database.AutoNode;
import com.radiodns.auto.auto_database.RadioDNSDatabase;

import java.util.ArrayList;
import java.util.List;

public class AutoService extends MediaBrowserServiceCompat {

    // MEDIA CONTROLS INPUTS
    private MediaSessionCompat session;

    private final String TAG = "RadioDNS-mobile-demo-media-session-compat";
    private final String MEDIA_ROOT_ID = "MEDIA_ROOT_ID";
    private RadioDNSDatabase db;

    @Override
    public void onCreate() {
        super.onCreate();

        db = Room.databaseBuilder(getApplicationContext(), RadioDNSDatabase.class, "RadioDNSAuto-db").allowMainThreadQueries().build();

        session = new MediaSessionCompat(this, "RADIODNS_MEDIA_COMPAT_SESSION_TAG");
        setSessionToken(session.getSessionToken());
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS | MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS);
        session.setCallback(new MediaSessionCompat.Callback() {

            @Override
            public void onPlayFromMediaId(String mediaId, Bundle extras) {
                Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromMediaId");
            }

            @Override
            public void onPlayFromSearch(String query, Bundle extras) {
                Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromSearch");
            }

            @Override
            public void onPlay() {
                Log.i("[" + this.getClass().getName() + "]", "ON PLAY");
            }

            @Override
            public void onPause() {
                Log.i("[" + this.getClass().getName() + "]", "ON PAUSE");
            }

            @Override
            public void onStop() {
                Log.i("[" + this.getClass().getName() + "]", "ON STOP");
            }
        });
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
        return new BrowserRoot(MEDIA_ROOT_ID, null);
    }

    @Override
    public void onLoadChildren(@NonNull String parentId, @NonNull Result<List<MediaBrowserCompat.MediaItem>> result) {
        // Assume for example that the music catalog is already loaded/cached.

        List<MediaBrowserCompat.MediaItem> mediaItems = new ArrayList<>();

        if (MEDIA_ROOT_ID.equals(parentId)) {
            mediaItems.add(new MediaBrowserCompat.MediaItem(
                    new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, "root")
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, "RadioDNS auto demo")
                            .build().getDescription(),
                    MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
            ));
        } else {
            List<AutoNode> nodes = db.autoNodeDAO().loadChildrens(parentId);
            for (AutoNode node : nodes) {
                mediaItems.add(new MediaBrowserCompat.MediaItem(
                        new MediaMetadataCompat.Builder()
                                .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, node.key)
                                .putString(MediaMetadataCompat.METADATA_KEY_TITLE, node.value)
                                .putString(MediaMetadataCompat.	METADATA_KEY_DISPLAY_TITLE, node.value)
                                .putString(MediaMetadataCompat.METADATA_KEY_ART_URI, node.imageURI)
                                .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON_URI, node.imageURI)
                                .build().getDescription(),
                        node.streamURI != null ? MediaBrowserCompat.MediaItem.FLAG_PLAYABLE : MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
                ));
            }
        }

        result.sendResult(mediaItems);
    }
}
