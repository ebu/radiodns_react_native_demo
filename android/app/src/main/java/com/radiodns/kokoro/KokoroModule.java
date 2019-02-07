package com.radiodns.kokoro;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.kokoro.js_runtime.Kokoro;
import com.radiodns.utilities.GZIPCompression;

import java.io.IOException;

import javax.annotation.Nullable;

/**
 * React native module that handle a notifications that provides media controls such as
 * play, pause, next and previous station/song/stream/etc.
 */
public class KokoroModule extends ReactContextBaseJavaModule {

    private ReactContext reactContext;
    private ServiceConnection mConnection;
    private boolean mBound;
    public Messenger mMessenger;
    private Messenger mService = null;

    // Incoming message handler class to handle communication from the MediaBrowser service and this Native Module.
    class IncomingHandler extends Handler {

        public IncomingHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            WritableMap params = Arguments.createMap();
            switch (msg.what) {
                case AutoServiceMessages.UPDATE_STATE:
                    byte[] compressed = msg.getData().getByteArray("msg");
                    try {
                        params.putString("state", GZIPCompression.decompress(compressed));
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    sendEvent("update_state", params);
                default:
                    super.handleMessage(msg);
            }
        }
    }

    public KokoroModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        mMessenger = new Messenger(new IncomingHandler(Looper.getMainLooper()));
        mConnection = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName className, IBinder service) {
                mService = new Messenger(service);
                mBound = true;

                try {
                    sendMessage(AutoServiceMessages.REGISTER_CLIENT, new Bundle(), mMessenger);
                    sendMessage(AutoServiceMessages.KOKORO_REGISTER_STATE_UPDATES, new Bundle(), mMessenger);
                } catch (RemoteException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onServiceDisconnected(ComponentName className) {
                mService = null;
                mBound = false;
            }
        };

        reactContext.bindService(new Intent(reactContext, Kokoro.class), mConnection, Context.BIND_AUTO_CREATE);
        reactContext.startService(new Intent(reactContext, Kokoro.class));
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        sendMessage(AutoServiceMessages.UNREGISTER_CLIENT, new Bundle());

        if (mBound) {
            reactContext.unbindService(mConnection);
            mBound = false;
        }
    }

    @Override
    public String getName() {
        return "Kokoro";
    }

    @ReactMethod
    public void dispatch(String action) {
        Bundle data = new Bundle();
        data.putString("msg", action);
        try {
            sendMessage(AutoServiceMessages.EMIT_MESSAGE, data);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private void sendMessage(int msg, Bundle data) throws RemoteException {
        sendMessage(msg, data, null);
    }

    private void sendMessage(int msg, Bundle data, @Nullable Messenger replyTo) throws RemoteException {
        if (!mBound) return;
        Message message = Message.obtain(null, msg);
        message.setData(data);
        if (replyTo != null) {
            message.replyTo = replyTo;
        }
        mService.send(message);
    }
}
