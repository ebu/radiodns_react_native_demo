package com.radiodns.kokoro.js_runtime;

import android.os.Handler;
import android.os.Message;

import com.radiodns.auto.messages.AutoServiceMessages;

/**
 * Incoming message handler class to handle communication from the React Native module and this service.
 */
public class IncomingMessageHandler extends Handler {
    private JSExecutorService jsRuntime;

    public IncomingMessageHandler(JSExecutorService jsRuntime) {
        this.jsRuntime = jsRuntime;
    }

    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case AutoServiceMessages.REGISTER_CLIENT:
                jsRuntime.getClients().add(msg.replyTo);
                break;
            case AutoServiceMessages.UNREGISTER_CLIENT:
                jsRuntime.getClients().remove(msg.replyTo);
                break;
            case AutoServiceMessages.EMIT_MESSAGE:
                jsRuntime.emitMessage(msg.getData().getString("msg"));
                break;
            default:
                super.handleMessage(msg);
        }
    }
}
