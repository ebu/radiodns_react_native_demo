package com.radiodns.auto;

import android.arch.persistence.room.Room;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.radiodns.auto.service.MediaService;
import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.auto.database.AutoNode;
import com.radiodns.auto.database.RadioDNSDatabase;

import javax.annotation.Nullable;

/**
 * RadioDNS Android Auto module. This module handle the android auto music playback capabilities of
 * the demonstrator. It provides an easy way to build the android auto layout + bindings to the media
 * controls.
 */
public class RadioDNSAutoModule extends ReactContextBaseJavaModule {

    private Messenger mService = null;
    private boolean mBound;

    // Incoming message handler class to handle communication from the MediaBrowser service and this Native Module.
    class IncomingHandler extends Handler {

        public IncomingHandler(Looper looper) {
            super(looper);
        }

        @Override
        public void handleMessage(Message msg) {
            WritableMap params = Arguments.createMap();
            switch (msg.what) {
                case AutoServiceMessages.SEND_NEW_PLAYER_STATE_EVENT:
                    params.putString("CHANNEL_ID", msg.getData().getString("CHANNEL_ID"));
                    params.putString("STATE", msg.getData().getString("STATE"));
                    sendEvent("updateState", params);
                    break;
                case AutoServiceMessages.SEND_PLAY_FROM_SEARCH_STRING:
                    params.putString("SEARCH_STRING", msg.getData().getString("SEARCH_STRING"));
                    sendEvent("playFromSearchString", params);
                    break;
                case AutoServiceMessages.SEND_PLAY_RANDOM:
                    sendEvent("playRandom", params);
                    break;
                default:
                    super.handleMessage(msg);
            }
        }
    }

    public Messenger mMessenger;

    private ServiceConnection mConnection;

    private RadioDNSDatabase db;
    private ReactApplicationContext reactContext;


    public RadioDNSAutoModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        db = Room.databaseBuilder(reactContext, RadioDNSDatabase.class, Constants.DATABASE_NAME).build();
        mConnection = new ServiceConnection() {
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

            public void onServiceDisconnected(ComponentName className) {
                mService = null;
                mBound = false;
            }
        };
        mMessenger = new Messenger(new IncomingHandler(Looper.getMainLooper()));
        Intent bindingIntent = new Intent(reactContext, MediaService.class);
        bindingIntent.setAction(this.getClass().getName());
        reactContext.bindService(bindingIntent, mConnection, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        sendMessage(AutoServiceMessages.UNREGISTER_CLIENT);

        if (mBound) {
            reactContext.unbindService(mConnection);
            mBound = false;
        }
    }

    @Override
    public String getName() {
        return "RadioDNSAuto";
    }

    /**
     * Adds a node for the RadioDNS Android Auto module. Theses nodes are the representation of the
     * interface of the RadioDNS demonstrator in the Android Auto mode.
     * <p>
     * Nodes behave as "browsable" or "playable" elements that form a tree. So each element has a parent.
     * <p>
     * It look something like this:
     * <p>
     * root
     * /   \
     * Browsable1   Song 2
     * /
     * Song 1
     * <p>
     * You can add a node anywhere on the tree as long as its parent is of type "browsable".
     * <p>
     * The root node of the tree has as key "root".
     *
     * @param childOf:   The parent of this node. Use "root" for the top level elements.
     * @param key:       The key of the node. Should be unique in its subtree.
     * @param value:     The value of the node. It will be the title for browsable and playable elements.
     * @param imageURI:  Image uri for this node. Will be the folder icon for browsable elements and the art cover for
     *                   playable elements.
     * @param streamURI: If not null, the node will be considered as a playable node by android auto.
     *                   Otherwise it will be browsable.
     */
    @ReactMethod
    public void addNode(String childOf, String key, String value, String imageURI, String streamURI) {
        AutoNode node = new AutoNode();
        node.key = key;
        node.childOf = childOf;
        node.value = value;
        node.imageURI = imageURI;
        node.streamURI = streamURI;
        db.autoNodeDAO().insertAll(node);
    }

    /**
     * Refreshes the contents of android auto.
     */
    @ReactMethod
    public void refresh() {
        sendMessage(AutoServiceMessages.REFRESH_FROM_DB);
    }

    /**
     * Sends an signal to the MediaService. A signal is just a number that has a certain meaning for
     * the application. Refer to [AutoServiceMessages] for a list of integers that can be used as signals.
     */
    @ReactMethod
    public void sendSignal(Integer signal) {
        sendMessage(signal);
    }

    private void sendEvent(String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private void sendMessage(int msg) {
        if (!mBound) return;

        try {
            Message message = Message.obtain(null, msg);
            mService.send(message);
        } catch (RemoteException e) {
            e.printStackTrace();
        }
    }
}
