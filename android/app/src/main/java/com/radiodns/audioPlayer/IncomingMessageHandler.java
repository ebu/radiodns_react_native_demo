package com.radiodns.audioPlayer;

import android.content.Context;
import android.net.Uri;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.ads.AdsMediaSource;
import com.google.android.exoplayer2.source.dash.DashMediaSource;
import com.google.android.exoplayer2.source.hls.HlsMediaSource;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory;
import com.google.android.exoplayer2.util.Util;
import com.radiodns.auto.messages.AutoServiceMessages;

/**
 * Incoming message handler class to handle communication from the React Native module and this service.
 */
public class IncomingMessageHandler extends Handler {
    private AudioPlayerService service;
    private Context context;

    public IncomingMessageHandler(AudioPlayerService service, Context context) {
        this.service = service;
        this.context = context;
    }

    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case AutoServiceMessages.REGISTER_CLIENT:
                service.getClients().add(msg.replyTo);
                break;
            case AutoServiceMessages.UNREGISTER_CLIENT:
                service.getClients().remove(msg.replyTo);
                break;
            case AutoServiceMessages.SET_EXO_PLAYER_URL:
                String newUrl = msg.getData().getString("player_url");
                if (service.currentURL.equals(newUrl)) {
                    return;
                }
                service.currentURL = newUrl;

                DataSource.Factory dataSourceFactory =
                        new DefaultDataSourceFactory(context, Util.getUserAgent(context, "RadioDNS"));
                // This is the MediaSource representing the media to be played.
                Uri mediaUri = Uri.parse(newUrl);

                AdsMediaSource.MediaSourceFactory audioSourceFactory;

                // Guess the type of the stream (if supported).
                switch (Util.inferContentType(mediaUri)) {
                    case C.TYPE_DASH:
                        audioSourceFactory = new DashMediaSource.Factory(dataSourceFactory);
                        break;
                    case C.TYPE_SS:
                        audioSourceFactory = new DashMediaSource.Factory(dataSourceFactory);
                        break;
                    case C.TYPE_HLS:
                        audioSourceFactory = new HlsMediaSource.Factory(dataSourceFactory);
                        break;
                    case C.TYPE_OTHER:
                    default:
                        audioSourceFactory = new ExtractorMediaSource.Factory(dataSourceFactory);

                }

                MediaSource audioSource = audioSourceFactory.createMediaSource(mediaUri);
                // Prepare the player with the source.
                service.getPlayer().prepare(audioSource);

                // Auto play.
                service.getPlayer().setPlayWhenReady(true);
                break;
            case AutoServiceMessages.SET_PLAYER_IS_PLAYING:
                boolean newIsPlayingState = msg.getData().getBoolean("player_playing");
                Log.d("OUIIIIIIIIII", service.isPlaying + " : " +newIsPlayingState);
                if (service.isPlaying != newIsPlayingState) {
                    Log.d("OUIIIIIIIIII",   "UPDATE" + newIsPlayingState);
                    service.isPlaying = newIsPlayingState;
                    service.getPlayer().setPlayWhenReady(newIsPlayingState);
                }
                break;
            case AutoServiceMessages.SET_PLAYER_VOLUME:
                float volume = msg.getData().getFloat("player_volume");
                service.getPlayer().setVolume(volume);
                break;
            default:
                super.handleMessage(msg);
        }
    }
}
