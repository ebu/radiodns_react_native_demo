package com.radiodns.auto;

import android.content.Intent;
import android.media.session.PlaybackState;
import android.os.Bundle;
import android.support.v4.media.session.MediaSessionCompat;
import android.text.TextUtils;
import android.util.Log;

public class MediaSessionEventCallback extends MediaSessionCompat.Callback {

    private AutoService autoService;

    public MediaSessionEventCallback(AutoService autoService) {
        this.autoService = autoService;
    }

    // @Override
    // public void onPrepare() {
    //     MediaMetadataCompat.Builder builder = new MediaMetadataCompat.Builder();
    //     builder.putString(MediaMetadataCompat.METADATA_KEY_ALBUM_ART_URI, "http://static.nonrk.radio.ebu.io/600x600/5847153a-7167-4da5-9bfe-21c0af7ebea6.png");
    //     builder.putString(MediaMetadataCompat.METADATA_KEY_TITLE, "Title");
    //     autoService.getSession().setMetadata(builder.build());
    // }

    @Override
    public void onPlayFromMediaId(String mediaId, Bundle extras) {
        Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromMediaId");
        autoService.setCurrentMediaID(mediaId);
        autoService.setMediaSessionState(PlaybackState.STATE_BUFFERING);
        autoService.updateState("PLAYING");
    }

    @Override
    public void onPlayFromSearch(String query, Bundle extras) {
        Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromSearch: " + query);
        autoService.setMediaSessionState(PlaybackState.STATE_BUFFERING);

        if (TextUtils.isEmpty(query)) {
            autoService.sendPlayRandom();
        } else {
            autoService.sendPlayFromSearchString(query);
        }
    }

    @Override
    public void onPlay() {
        Log.i("[" + this.getClass().getName() + "]", "ON PLAY");
        autoService.setMediaSessionState(PlaybackState.STATE_PLAYING);
        autoService.updateState("PLAYING");
    }

    @Override
    public void onPause() {
        Log.i("[" + this.getClass().getName() + "]", "ON PAUSE");
        autoService.setMediaSessionState(PlaybackState.STATE_PAUSED);
        autoService.updateState("PAUSED");
    }

    @Override
    public void onStop() {
        Log.i("[" + this.getClass().getName() + "]", "ON STOP");
        autoService.setMediaSessionState(PlaybackState.STATE_STOPPED);
        autoService.updateState("STOPPED");
    }

    @Override
    public void onSkipToPrevious() {
        Log.i("[" + this.getClass().getName() + "]", "ON PREVIOUS");
        autoService.setMediaSessionState(PlaybackState.STATE_BUFFERING);
        autoService.updateState("PREVIOUS");
    }

    @Override
    public void onSkipToNext() {
        Log.i("[" + this.getClass().getName() + "]", "ON NEXT");
        autoService.setMediaSessionState(PlaybackState.STATE_BUFFERING);
        autoService.updateState("NEXT");
    }

    @Override
    public boolean onMediaButtonEvent(Intent mediaButtonEvent) {
        return super.onMediaButtonEvent(mediaButtonEvent);
    }
}
