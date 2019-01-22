package com.radiodns.auto;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaBrowserServiceCompat;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.util.Log;

import com.radiodns.auto.auto_tree.AutoNode;
import com.radiodns.auto.auto_tree.AutoTree;

import java.util.ArrayList;
import java.util.List;

public class AutoService extends MediaBrowserServiceCompat {

    // MEDIA CONTROLS INPUTS
    private MediaSessionCompat session;

    private final String TAG = "RadioDNS-mobile-demo-media-session-compat";
    private final String MEDIA_ROOT_ID = "MEDIA_ROOT_ID";

    private AutoTree tree;

    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            switch (action) {
                case Commands.ADD_NODE:
                    tree.addNode(
                            new AutoNode(
                                    intent.getStringExtra("KEY"),
                                    intent.getStringExtra("VALUE"),
                                    intent.getStringExtra("IMG_URI"),
                                    intent.getStringExtra("STREAM_URI")
                            ),
                            intent.getStringExtra("CHILD_OF")
                    );
            }
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();

        tree = new AutoTree();
        session = new MediaSessionCompat(this, "session tag");
        setSessionToken(session.getSessionToken());
        session.setFlags(MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS);
        session.setCallback(new MediaSessionCompat.Callback() {

            @Override
            public void onPlayFromMediaId(String mediaId, Bundle extras) {
                super.onPlayFromMediaId(mediaId, extras);
            }

            @Override
            public void onPlayFromSearch(String query, Bundle extras) {
                super.onPlayFromSearch(query, extras);
            }

            @Override
            public void onPlay() {
                super.onPlay();
                Log.i("[" + this.getClass().getName() + "]", "ON PLAY");
            }

            @Override
            public void onPause() {
                super.onPause();
                Log.i("[" + this.getClass().getName() + "]", "ON PAUSE");
            }

            @Override
            public void onStop() {
                super.onStop();
                Log.i("[" + this.getClass().getName() + "]", "ON STOP");
            }

            @Override
            public void onSkipToNext() {
                super.onSkipToNext();
                Log.i("[" + this.getClass().getName() + "]", "ON NEXT");
            }

            @Override
            public void onSkipToPrevious() {
                super.onSkipToPrevious();
                Log.i("[" + this.getClass().getName() + "]", "ON PREVIOUS");
            }

        });

        IntentFilter filter = new IntentFilter();
        filter.addAction(Commands.ADD_NODE);
        registerReceiver(receiver, filter);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        session.release();
        unregisterReceiver(receiver);
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
        return new BrowserRoot("root", null);
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
            AutoNode node = tree.getNode(parentId);
            mediaItems.add(new MediaBrowserCompat.MediaItem(
                    new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, node.getKey())
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, node.getValue())
                            .build().getDescription(),
                    node.isPlayable() ? MediaBrowserCompat.MediaItem.FLAG_PLAYABLE : MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
            ));
        }

        result.sendResult(mediaItems);
    }
}
