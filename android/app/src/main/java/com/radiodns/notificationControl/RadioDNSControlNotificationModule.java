package com.radiodns.notificationControl;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiodns.StateUpdatesMessages;

public class RadioDNSControlNotificationModule extends ReactContextBaseJavaModule {

    private ReactContext reactContext;

    private String title;
    private String subtitle;
    private String imgUrl;

    private MediaNotificationManager mediaNotificationManager;
    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            WritableMap params = Arguments.createMap();
            params.putString("STATE", intent.getAction());
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("updateState", params);
        }
    };

    public RadioDNSControlNotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        mediaNotificationManager = new MediaNotificationManager(reactContext);

        IntentFilter filter = new IntentFilter();
        filter.addAction(StateUpdatesMessages.NEXT);
        filter.addAction(StateUpdatesMessages.PAUSE);
        filter.addAction(StateUpdatesMessages.PLAY);
        filter.addAction(StateUpdatesMessages.PREVIOUS);
        filter.addAction(StateUpdatesMessages.STOP);
        reactContext.registerReceiver(receiver, filter);
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        reactContext.unregisterReceiver(receiver);
    }

    @Override
    public String getName() {
        return "RadioDNSControlNotification";
    }

    @ReactMethod
    public void buildNotification(String title, String subtitle, String imgUrl) {
        this.title = title;
        this.subtitle = subtitle;
        this.imgUrl = imgUrl;
    }

    @ReactMethod
    public void updateNotifState(boolean playing, boolean nextEnabled, boolean previousEnabled) {
        mediaNotificationManager.buildNotification(title, subtitle, imgUrl, playing, nextEnabled, previousEnabled);
    }

    @ReactMethod
    public void dismissNotification() {
        mediaNotificationManager.getNotificationManager().cancel(mediaNotificationManager.NOTIFICATION_ID);
    }
}
