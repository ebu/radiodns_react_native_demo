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

/**
 * React native module that handle a notifications that provides media controls such as
 * play, pause, next and previous station/song/stream/etc.
 */
public class RadioDNSControlNotificationModule extends ReactContextBaseJavaModule {

    private ReactContext reactContext;

    private String title;
    private String subtitle;
    private String imgUrl;

    private MediaNotificationManager mediaNotificationManager;

    // Broadcast receiver to handle intents broadcasted from the notification.
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

    /**
     * Prepares the notification's display data.
     * @param title: Sets the title of the notification.
     * @param subtitle: Sets the subtitle of the notification.
     * @param imgUrl: Sets the image url of the notification.
     */
    @ReactMethod
    public void prepareNotification(String title, String subtitle, String imgUrl) {
        this.title = title;
        this.subtitle = subtitle;
        this.imgUrl = imgUrl;
    }

    /**
     * Displays the notification. This method should be called before the [prepareNotification] method
     * is called at least once before.
     *
     * If an other notification existed before, will update it.
     * @param playing: If the associated media is playing or is paused.
     */
    @ReactMethod
    public void displayNotification(boolean playing) {
        mediaNotificationManager.buildNotification(title, subtitle, imgUrl, playing);
    }

    /**
     * Dismisses the notification.
     */
    @ReactMethod
    public void dismissNotification() {
        mediaNotificationManager.getNotificationManager().cancel(mediaNotificationManager.NOTIFICATION_ID);
    }
}
