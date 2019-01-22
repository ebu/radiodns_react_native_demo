package com.radiodns.auto.module;

import android.arch.persistence.room.Room;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.radiodns.auto.auto_database.AutoNode;
import com.radiodns.auto.auto_database.RadioDNSDatabase;

public class RadioDNSAutoModule extends ReactContextBaseJavaModule {

    private RadioDNSDatabase db;

    public RadioDNSAutoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        db = Room
                .databaseBuilder(reactContext, RadioDNSDatabase.class, "RadioDNSAuto-db")
                .build();
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
}
