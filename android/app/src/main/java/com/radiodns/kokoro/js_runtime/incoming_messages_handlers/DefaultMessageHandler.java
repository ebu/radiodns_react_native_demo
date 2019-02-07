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
public class DefaultMessageHandler extends Handler {
    private Kokoro kokoro;

    public DefaultMessageHandler(Kokoro kokoro) {
        this.kokoro = kokoro;
    }

    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case AutoServiceMessages.REGISTER_CLIENT:
                kokoro.getClients().add(msg.replyTo);
                break;
            case AutoServiceMessages.UNREGISTER_CLIENT:
                kokoro.getClients().remove(msg.replyTo);
                break;
            case AutoServiceMessages.KOKORO_REGISTER_STATE_UPDATES:
                kokoro.getStateClients().add(msg.replyTo);
                break;
            case AutoServiceMessages.EMIT_MESSAGE:
                kokoro.emitMessage(msg.getData().getString("msg"));
                break;
            case AutoServiceMessages.SEND_NEW_PLAYER_STATE_EVENT:
                try {
                    String state = msg.getData().getString("STATE");
                    Log.d(this.getClass().getName(), "DEBUG: ANDROID AUTO COMMAND: " + state);
                    JSONObject jsResponse = new JSONObject();
                    String channelId = msg.getData().getString("CHANNEL_ID");
                    if (channelId != null) {
                        jsResponse.put("CHANNEL_ID", channelId);
                    }
                    jsResponse.put("STATE", state);
                    kokoro.getJsRuntime().emit(IncomingEvents.UPDATE_STATE, jsResponse);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                break;
            case AutoServiceMessages.SEND_PLAY_RANDOM:
                kokoro.getJsRuntime().emit(IncomingEvents.PLAY_RANDOM);
                break;
            case AutoServiceMessages.SEND_PLAY_FROM_SEARCH_STRING:
                try {
                    JSONObject jsResponse = new JSONObject();
                    jsResponse.put("search_string", msg.getData().getString("SEARCH_STRING"));
                    kokoro.getJsRuntime().emit(IncomingEvents.PLAY_FROM_SEARCH_STRING, jsResponse);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                break;
            default:
                super.handleMessage(msg);
        }
    }
}
