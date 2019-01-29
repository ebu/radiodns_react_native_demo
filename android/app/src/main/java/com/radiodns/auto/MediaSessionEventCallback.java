package com.radiodns.auto;

import android.content.Intent;
import android.media.session.PlaybackState;
import android.os.Bundle;
import android.support.v4.media.session.MediaSessionCompat;
import android.text.TextUtils;
import android.util.Log;

public class MediaSessionEventCallback extends MediaSessionCompat.Callback {

    private MediaService autoService;

    public MediaSessionEventCallback(MediaService autoService) {
        this.autoService = autoService;
    }

    @Override
    public void onPlayFromMediaId(String mediaId, Bundle extras) {
        Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromMediaId");
        autoService.setCurrentMediaID(mediaId);
        autoService.updateState("PLAYING", PlaybackState.STATE_BUFFERING);
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
        autoService.updateState("PLAYING", PlaybackState.STATE_PLAYING);
    }

    @Override
    public void onPause() {
        Log.i("[" + this.getClass().getName() + "]", "ON PAUSE");
        autoService.updateState("PAUSED", PlaybackState.STATE_PAUSED);
    }

    @Override
    public void onStop() {
        Log.i("[" + this.getClass().getName() + "]", "ON STOP");
        autoService.updateState("STOPPED", PlaybackState.STATE_STOPPED);
    }

    @Override
    public void onSkipToPrevious() {
        Log.i("[" + this.getClass().getName() + "]", "ON PREVIOUS");
        autoService.setCurrentMediaID(autoService.getPreviousMediaID());
        autoService.updateState("PREVIOUS", PlaybackState.STATE_BUFFERING);
    }

    @Override
    public void onSkipToNext() {
        Log.i("[" + this.getClass().getName() + "]", "ON NEXT");
        autoService.setCurrentMediaID(autoService.getNextMediaID());
        autoService.updateState("NEXT", PlaybackState.STATE_BUFFERING);
    }

    @Override
    public boolean onMediaButtonEvent(Intent mediaButtonEvent) {
        return super.onMediaButtonEvent(mediaButtonEvent);
    }
}
