package com.radiodns.auto.module;

import android.arch.persistence.room.Room;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiodns.auto.Commands;
import com.radiodns.auto.auto_database.AutoNode;
import com.radiodns.auto.auto_database.RadioDNSDatabase;

import javax.annotation.Nullable;

public class RadioDNSAutoModule extends ReactContextBaseJavaModule {

    private class DataUpdateReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            switch (intent.getAction()) {
                case Commands.SEND_NEW_PLAYER_STATE_EVENT:
                    WritableMap params = Arguments.createMap();
                    params.putString("CHANNEL_ID", intent.getStringExtra("CHANNEL_ID"));
                    params.putString("STATE", intent.getStringExtra("STATE"));
                    sendEvent(RadioDNSAutoModule.this.reactContext, "updateState", params);
                    break;
                default:
            }
        }
    }

    private RadioDNSDatabase db;
    private ReactApplicationContext reactContext;


    public RadioDNSAutoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        db = Room.databaseBuilder(reactContext, RadioDNSDatabase.class, "RadioDNSAuto-db").build();
        DataUpdateReceiver dataUpdateReceiver = new DataUpdateReceiver();
        IntentFilter intentFilter = new IntentFilter(Commands.SEND_NEW_PLAYER_STATE_EVENT);
        reactContext.registerReceiver(dataUpdateReceiver, intentFilter);
    }

    @Override
    public String getName() {
        return "RadioDNSAuto";
    }

    /**
     * Adds a node for the android auto playbac.
     *
     * @param childOf:   Which node this node is the child.
     * @param key:       The key of the node. Should be unique in its subtree.
     * @param value:     The value of the node.
     *                   If the type is "NUMBER" it will be parsed as an int.
     *                   If the type if "IMG" will be decoded from base64.
     * @param streamURI: If not null, the node will be considered as a playable node by android auto.
     *                   Otherwise it will be browsable.
     */
    @ReactMethod
    public void addNode(@NonNull String childOf, @NonNull String key, @NonNull String value, @NonNull String imageURI, String streamURI) {
        AutoNode node = new AutoNode();
        node.key = key;
        node.childOf = childOf;
        node.value = value;
        node.imageURI = imageURI;
        node.streamURI = streamURI;
        db.autoNodeDAO().insertAll(node);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
}
