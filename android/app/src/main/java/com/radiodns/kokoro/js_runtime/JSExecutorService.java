package com.radiodns.kokoro.js_runtime;

import android.app.Service;
import android.content.Intent;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.radiodns.auto.messages.AutoServiceMessages;

import org.json.JSONException;
import org.json.JSONObject;
import org.liquidplayer.service.MicroService;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedList;

public class JSExecutorService extends Service {

    // List of activities that are bound to this service and registered to get Messages form this
    // service.
    private ArrayList<Messenger> clients = new ArrayList<>();
    private boolean ready = false;

    private MicroService jsRuntime;
    public Messenger mMessenger;

    private LinkedList<String> queue = new LinkedList<>();

    @Override
    public void onCreate() {
        try {
            jsRuntime = new MicroService(
                    getApplicationContext(),
                    new URI("android.resource://" + getPackageName() + "/raw/kokoro"),
                    new MicroService.ServiceStartListener() {
                        @Override
                        public void onStart(MicroService service) {
                            service.addEventListener(OutgoingEvents.UPDATE_STATE, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        for (Messenger client : clients) {
                                            Message msg = Message.obtain(null, AutoServiceMessages.UPDATE_STATE);
                                            Bundle data = new Bundle();
                                            data.putString("msg", payload.getString("msg"));
                                            msg.setData(data);
                                            client.send(msg);
                                        }
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (RemoteException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            service.addEventListener(OutgoingEvents.READY, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    ready = true;
                                    jsRuntime.emit("MY_EVENT", "test");
                                    for (String msg : queue) {
                                        jsRuntime.emit(IncomingEvents.EMIT_MESSAGE, msg);
                                    }
                                }
                            });
                        }
                    },
                    new MicroService.ServiceErrorListener() {
                        @Override
                        public void onError(MicroService service, Exception e) {
                            throw new RuntimeException(e);
                        }
                    },
                    new MicroService.ServiceExitListener() {
                        @Override
                        public void onExit(MicroService service, Integer exitCode) {
                            Log.d("BYE BYE", "THE JS ENGINE IS GONE!");
                        }
                    }
            );
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
        jsRuntime.start();

    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        mMessenger = new Messenger(new IncomingMessageHandler(this));
        return mMessenger.getBinder();
    }

    public void emitMessage(String msg) {
        if (!ready) {
            queue.add(msg);
        } else {
            jsRuntime.emit(IncomingEvents.EMIT_MESSAGE, msg);
        }
    }

    public ArrayList<Messenger> getClients() {
        return clients;
    }
}
