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
import com.radiodns.kokoro.js_runtime.JSExecutorService;

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
                    params.putString("state", msg.getData().getString("msg"));
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
                    Message msg = Message.obtain(null, AutoServiceMessages.REGISTER_CLIENT);
                    msg.replyTo = mMessenger;
                    mService.send(msg);
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

        reactContext.bindService(new Intent(reactContext, JSExecutorService.class), mConnection, Context.BIND_AUTO_CREATE);
        reactContext.startService(new Intent(reactContext, JSExecutorService.class));
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
        sendMessage(AutoServiceMessages.EMIT_MESSAGE, data);
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private void sendMessage(int msg, Bundle data) {
        if (!mBound) return;

        try {
            Message message = Message.obtain(null, msg);
            message.setData(data);
            mService.send(message);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }
}
