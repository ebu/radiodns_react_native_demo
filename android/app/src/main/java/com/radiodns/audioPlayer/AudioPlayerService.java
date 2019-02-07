package com.radiodns.audioPlayer;

import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.Player;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.audio.AudioAttributes;
import com.radiodns.auto.messages.AutoServiceMessages;

import java.util.ArrayList;


public class AudioPlayerService extends Service {

    public Messenger mMessenger;
    private ArrayList<Messenger> clients = new ArrayList<>();

    private SimpleExoPlayer player;

    protected String currentURL = "";
    protected boolean isPlaying = false;
    protected int currentPlaybackState = Player.STATE_IDLE;

    @Override
    public void onCreate() {
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setUsage(C.USAGE_MEDIA)
                .setContentType(C.CONTENT_TYPE_MUSIC)
                .build();
        player = ExoPlayerFactory.newSimpleInstance(getApplicationContext());
        player.setAudioAttributes(audioAttributes, true);
        player.addListener(new Player.EventListener() {

            // @Override
            // public void onLoadingChanged(boolean isLoading) {
            //     Message msg = Message.obtain(null, AutoServiceMessages.SEND_EXO_PLAYER_LOADING_STATE);
            //     Bundle data = new Bundle();
            //     data.putBoolean("LOADING", isLoading);
            //     msg.setData(data);
            //     sendMessage(msg);
            // }

            @Override
            public void onPlayerError(ExoPlaybackException error) {
                Message msg = Message.obtain(null, AutoServiceMessages.SEND_EXO_PLAYER_ERROR);
                Bundle data = new Bundle();
                data.putString("ERROR", error.getMessage());
                sendMessage(msg, data);
                player.setPlayWhenReady(false);
            }

            @Override
            public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
                Log.d("AUDIO_PLAYER_DEBUG", playbackState + "");
                Bundle data = new Bundle();
                Message msg;
                if (currentPlaybackState == playbackState) {
                    return;
                }

                switch(playbackState) {
                    case Player.STATE_BUFFERING:
                        msg = Message.obtain(null, AutoServiceMessages.SEND_EXO_PLAYER_LOADING_STATE);
                        data.putBoolean("LOADING", true);
                        sendMessage(msg, data);
                        break;
                    case Player.STATE_READY:
                        msg = Message.obtain(null, AutoServiceMessages.SEND_EXO_PLAYER_LOADING_STATE);
                        data.putBoolean("LOADING", false);
                        sendMessage(msg, data);
                        break;
                    case Player.STATE_IDLE:
                    case Player.STATE_ENDED:
                        msg = Message.obtain(null, AutoServiceMessages.SEND_EXO_PLAYER_FINISHED);
                        sendMessage(msg, data);
                        break;
                }
                currentPlaybackState = playbackState;
            }
        });
    }

    @Override
    public void onDestroy() {
        player.setPlayWhenReady(false);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        mMessenger = new Messenger(new IncomingMessageHandler(this, getApplicationContext()));
        return mMessenger.getBinder();
    }

    /**
     * Sends a message to all client registered to this service.
     *
     * @param msg: the message to send
     */
    private void sendMessage(Message msg, Bundle data) {
        for (Messenger client : clients) {
            try {
                msg.setData(data);
                client.send(msg);
            } catch (RemoteException e) {
                clients.remove(client);
                e.printStackTrace();
            }
        }
    }

    public ArrayList<Messenger> getClients() {
        return clients;
    }

    public SimpleExoPlayer getPlayer() {
        return player;
    }
}
