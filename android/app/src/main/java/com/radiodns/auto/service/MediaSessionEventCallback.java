package com.radiodns.auto.service;

import android.content.Intent;
import android.media.session.PlaybackState;
import android.os.Bundle;
import android.support.v4.media.session.MediaSessionCompat;
import android.text.TextUtils;
import android.util.Log;

import com.radiodns.StateUpdatesMessages;

public class MediaSessionEventCallback extends MediaSessionCompat.Callback {

    private MediaService autoService;

    public MediaSessionEventCallback(MediaService autoService) {
        this.autoService = autoService;
    }

    @Override
    public void onPlayFromMediaId(String mediaId, Bundle extras) {
        Log.i("[" + this.getClass().getName() + "]", "ON onPlayFromMediaId");
        autoService.setCurrentMediaID(mediaId);
        autoService.updateState(StateUpdatesMessages.PLAY, PlaybackState.STATE_BUFFERING);
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
        autoService.updateState(StateUpdatesMessages.PLAY, PlaybackState.STATE_PLAYING);
    }

    @Override
    public void onPause() {
        Log.i("[" + this.getClass().getName() + "]", "ON PAUSE");
        autoService.updateState(StateUpdatesMessages.PAUSE, PlaybackState.STATE_PAUSED);
    }

    @Override
    public void onStop() {
        Log.i("[" + this.getClass().getName() + "]", "ON STOP");
        autoService.updateState(StateUpdatesMessages.STOP, PlaybackState.STATE_STOPPED);
    }

    @Override
    public void onSkipToPrevious() {
        Log.i("[" + this.getClass().getName() + "]", "ON PREVIOUS");
        autoService.setCurrentMediaID(autoService.getPreviousMediaID());
        autoService.updateState(StateUpdatesMessages.PREVIOUS, PlaybackState.STATE_BUFFERING);
    }

    @Override
    public void onSkipToNext() {
        Log.i("[" + this.getClass().getName() + "]", "ON NEXT");
        autoService.setCurrentMediaID(autoService.getNextMediaID());
        autoService.updateState(StateUpdatesMessages.NEXT, PlaybackState.STATE_BUFFERING);
    }

    @Override
    public boolean onMediaButtonEvent(Intent mediaButtonEvent) {
        return super.onMediaButtonEvent(mediaButtonEvent);
    }
}
