package com.radiodns.auto.service;

import android.os.AsyncTask;
import android.support.v4.media.MediaBrowserCompat;
import android.support.v4.media.MediaBrowserServiceCompat;
import android.support.v4.media.MediaMetadataCompat;

import com.radiodns.auto.database.AutoNode;
import com.radiodns.auto.database.RadioDNSDatabase;

import java.util.ArrayList;
import java.util.List;

public class LoadChildrenTask extends AsyncTask<Void, Void, Void> {

    // Android Room database connection.
    private RadioDNSDatabase db;

    // Parent id of the node to load.
    private String parentId;

    private MediaBrowserServiceCompat.Result<List<MediaBrowserCompat.MediaItem>> result;

    private List<MediaBrowserCompat.MediaItem> mediaItems;

    public LoadChildrenTask(RadioDNSDatabase db, String parentId, MediaBrowserServiceCompat.Result<List<MediaBrowserCompat.MediaItem>> result) {
        this.db = db;
        this.parentId = parentId;
        this.result = result;
    }

    @Override
    protected Void doInBackground(Void... voids) {
        mediaItems = new ArrayList<>();

        List<AutoNode> nodes;

        // It should always be at least one node in the database. At least one stating that there is
        // no results.
        do {
            nodes = db.autoNodeDAO().loadChildren(parentId);
            if (nodes.size() == 0) {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        } while (nodes.size() == 0);

        for (AutoNode node : nodes) {
            mediaItems.add(new MediaBrowserCompat.MediaItem(
                    new MediaMetadataCompat.Builder()
                            .putString(MediaMetadataCompat.METADATA_KEY_MEDIA_ID, node.key)
                            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, node.value)
                            .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_SUBTITLE, "Powered by RadioDNS")
                            .putString(MediaMetadataCompat.METADATA_KEY_DISPLAY_ICON_URI, node.imageURI)
                            .build().getDescription(),
                    node.streamURI != null ? MediaBrowserCompat.MediaItem.FLAG_PLAYABLE : MediaBrowserCompat.MediaItem.FLAG_BROWSABLE
            ));
        }
        return null;
    }

    @Override
    protected void onPostExecute(Void param) {
        result.sendResult(mediaItems);
    }
}
