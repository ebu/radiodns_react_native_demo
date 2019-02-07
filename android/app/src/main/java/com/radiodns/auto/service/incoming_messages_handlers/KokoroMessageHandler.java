package com.radiodns.auto.service.incoming_messages_handlers;

import android.os.Handler;
import android.os.Message;

import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.auto.service.MediaService;

/**
 * Incoming message handler class to handle communication from the React Native module and this service.
 */
public class KokoroMessageHandler extends Handler {
    private MediaService service;

    public KokoroMessageHandler(MediaService service) {
        this.service = service;
    }

    @Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
            case AutoServiceMessages.KOKORO_READY:
                service.setKokoroReady(true);
                for (Message message: service.getPendingMessages()) {
                    service.sendKokoroMessage(message);
                }
                break;
            default:
                super.handleMessage(msg);
        }
    }
}
