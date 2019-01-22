package com.radiodns.auto.module;

import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v4.content.LocalBroadcastManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.radiodns.auto.Commands;

public class RadioDNSAutoModule extends ReactContextBaseJavaModule {

    private ReactApplicationContext reactContext;

    public RadioDNSAutoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "RadioDNSAuto";
    }

    /**
     * Adds a node for the android auto playbac.
     * @param childOf: Which node this node is the child.
     * @param key: The key of the node. Should be unique in its subtree.
     * @param value: The value of the node.
     *             If the type is "NUMBER" it will be parsed as an int.
     *             If the type if "IMG" will be decoded from base64.
     * @param streamURI: If not null, the node will be considered as a playable node by android auto.
     *                  Otherwise it will be browsable.
     */
    @ReactMethod
    public void addNode(@NonNull String childOf, @NonNull String key, @NonNull String value, @NonNull String imageURI, String streamURI) {
        Intent addNodeCMD = new Intent();
        addNodeCMD.setAction(Commands.ADD_NODE);
        addNodeCMD.putExtra("CHILD_OF", childOf);
        addNodeCMD.putExtra("KEY", key);
        addNodeCMD.putExtra("VALUE", value);
        addNodeCMD.putExtra("IMG_URI", imageURI);
        addNodeCMD.putExtra("STREAM_URI", streamURI);
        this.reactContext.sendBroadcast(addNodeCMD);
    }
}
