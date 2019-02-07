package com.radiodns.kokoro.js_runtime.incoming_messages_handlers;

import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.kokoro.js_runtime.IncomingEvents;
import com.radiodns.kokoro.js_runtime.Kokoro;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Incoming message handler class to handle communication from the React Native module and this service.
 */
public class AudioServiceMessageHandler extends Handler {
    private Kokoro kokoro;

    public AudioServiceMessageHandler(Kokoro kokoro) {
        this.kokoro = kokoro;
    }

    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case AutoServiceMessages.SEND_EXO_PLAYER_LOADING_STATE:
                try {
                    JSONObject jsResponse = new JSONObject();
                    jsResponse.put("loading", msg.getData().getBoolean("LOADING"));
                    kokoro.getJsRuntime().emit(IncomingEvents.EXO_PLAYER_LOADING_UPDATE, jsResponse);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                break;
            case AutoServiceMessages.SEND_EXO_PLAYER_ERROR:
                try {
                    JSONObject jsResponse = new JSONObject();
                    jsResponse.put("cause", msg.getData().getString("ERROR"));
                    kokoro.getJsRuntime().emit(IncomingEvents.EXO_PLAYER_ERROR, jsResponse);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                break;
            case AutoServiceMessages.SEND_EXO_PLAYER_FINISHED:
                kokoro.getJsRuntime().emit(IncomingEvents.EXO_PLAYER_FINISHED);
                break;
            default:
                super.handleMessage(msg);
        }
    }
}
