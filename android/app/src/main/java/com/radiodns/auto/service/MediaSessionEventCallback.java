package com.radiodns.auto.service;

import android.content.Intent;
import android.media.session.PlaybackState;
import android.os.Bundle;
import android.support.v4.media.session.MediaSessionCompat;
import android.text.TextUtils;

import com.radiodns.StateUpdatesMessages;

/**
 *  MediaSessionCompat.Callback implementation. This class holds the callback that are fired when
 *  the user interacts with the android auto layout.
 */
public class MediaSessionEventCallback extends MediaSessionCompat.Callback {

    private MediaService autoService;

    public MediaSessionEventCallback(MediaService autoService) {
        this.autoService = autoService;
    }

    @Override
    public void onPlayFromMediaId(String mediaId, Bundle extras) {
        autoService.setCurrentMediaID(mediaId);
        autoService.updateState(StateUpdatesMessages.PLAY, PlaybackState.STATE_BUFFERING);
    }

    @Override
    public void onPlayFromSearch(String query, Bundle extras) {
        autoService.setMediaSessionState(PlaybackState.STATE_BUFFERING);

        if (TextUtils.isEmpty(query)) {
            autoService.sendPlayRandom();
        } else {
            autoService.sendPlayFromSearchString(query);
        }
    }

    @Override
    public void onPlay() {
        autoService.updateState(StateUpdatesMessages.PLAY, PlaybackState.STATE_PLAYING);
    }

    @Override
    public void onPause() {
        autoService.updateState(StateUpdatesMessages.PAUSE, PlaybackState.STATE_PAUSED);
    }

    @Override
    public void onStop() {
        autoService.updateState(StateUpdatesMessages.STOP, PlaybackState.STATE_STOPPED);
    }

    @Override
    public void onSkipToPrevious() {
        autoService.setCurrentMediaID(autoService.getPreviousMediaID());
        autoService.updateState(StateUpdatesMessages.PREVIOUS, PlaybackState.STATE_BUFFERING);
    }

    @Override
    public void onSkipToNext() {
        autoService.setCurrentMediaID(autoService.getNextMediaID());
        autoService.updateState(StateUpdatesMessages.NEXT, PlaybackState.STATE_BUFFERING);
    }

    @Override
    public boolean onMediaButtonEvent(Intent mediaButtonEvent) {
        return super.onMediaButtonEvent(mediaButtonEvent);
    }
}
