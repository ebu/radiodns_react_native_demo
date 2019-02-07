package com.radiodns.kokoro.js_runtime;

import android.app.Service;
import android.arch.persistence.room.Room;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;
import android.support.annotation.Nullable;
import android.util.Log;

import com.radiodns.audioPlayer.Constants;
import com.radiodns.audioPlayer.AudioPlayerService;
import com.radiodns.auto.messages.AutoServiceMessages;
import com.radiodns.auto.service.MediaService;
import com.radiodns.kokoro.database.KokoroData;
import com.radiodns.kokoro.database.KokoroDatabase;
import com.radiodns.kokoro.js_runtime.incoming_messages_handlers.AudioServiceMessageHandler;
import com.radiodns.kokoro.js_runtime.incoming_messages_handlers.DefaultMessageHandler;
import com.radiodns.notificationControl.MediaNotificationManager;
import com.radiodns.utilities.GZIPCompression;

import org.json.JSONException;
import org.json.JSONObject;
import org.liquidplayer.service.MicroService;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedList;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

public class Kokoro extends Service {

    public static final MediaType JSON = MediaType.get("application/json; charset=utf-8");


    // List of activities that are bound to this service and registered to get Messages form this
    // service.
    private ArrayList<Messenger> clients = new ArrayList<>();
    private ArrayList<Messenger> stateClients = new ArrayList<>();
    private boolean ready = false;

    private MicroService jsRuntime;
    public Messenger mMessenger;
    public Messenger audioMessenger;
    public Messenger autoMessenger;

    private LinkedList<String> queue = new LinkedList<>();

    private KokoroDatabase db;

    private OkHttpClient httpClient;

    // Audio service connection
    private Messenger audioService;
    private ServiceConnection audioConnection;
    private boolean audioBound;

    // Audio service connection
    private Messenger autoService;
    private ServiceConnection autoConnection;
    private boolean autoBound;

    // notification manager
    private MediaNotificationManager mediaNotificationManager;

    @Override
    public void onCreate() {
        db = Room.databaseBuilder(getApplicationContext(), KokoroDatabase.class, Constants.DATABASE_NAME).allowMainThreadQueries().build();
        mediaNotificationManager = new MediaNotificationManager(getApplicationContext());
        httpClient = new OkHttpClient();
        Log.d(this.getClass().getName(), "DEBUG: ON CREATE");
        try {
            jsRuntime = new MicroService(
                    getApplicationContext(),
                    new URI("android.resource://" + getPackageName() + "/raw/kokoro"),
                    new MicroService.ServiceStartListener() {
                        @Override
                        public void onStart(MicroService service) {
                            service.addEventListener(OutgoingEvents.READY, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    ready = true;
                                    for (String msg : queue) {
                                        if (msg != null) {
                                            Log.d(this.getClass().getName(), "DEBUG: SENDING MESSAGE FROM QUEUE: " + msg);
                                            jsRuntime.emit(IncomingEvents.EMIT_MESSAGE, msg);
                                        }
                                    }
                                    // Notify clients (like android auto) that data are ready along with
                                    // other capabilities like AudioService.
                                    Message msg = Message.obtain(null, AutoServiceMessages.KOKORO_READY);
                                    sendMessageToClient(clients, msg);
                                }
                            });
                            service.addEventListener(OutgoingEvents.UPDATE_STATE, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        Log.d(this.getClass().getName(), "DEBUG: UPDATE TO " + clients.size() + " clients!");
                                        Message msg = Message.obtain(null, AutoServiceMessages.UPDATE_STATE);
                                        Bundle data = new Bundle();
                                        // TODO thoses message should have a max size and be chucked.
                                        // Otherwise we might overflow the parcelable buffer AGAIN.
                                        String ssss = payload.getString("msg");
                                        data.putByteArray("msg", GZIPCompression.compress(ssss));
                                        msg.setData(data);
                                        sendMessageToClient(stateClients, msg);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (IOException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            // LONG TERM STORAGE
                            service.addEventListener(OutgoingEvents.SET_ITEM_STORAGE_INTENT, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        String key = payload.getString("key");
                                        Log.d(this.getClass().getName(), "DEBUG: SET STORAGE: " + key);
                                        db.kokoroDataDAO().insertAll(new KokoroData(key, payload.getString("data")));
                                        JSONObject response = new JSONObject();
                                        response.put("key", key);
                                        jsRuntime.emit(IncomingEvents.EMIT_STORAGE_ITEM_SET_COMPLETED, response);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            service.addEventListener(OutgoingEvents.REMOVE_ITEM_STORAGE, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        db.kokoroDataDAO().delete(payload.getString("key"));
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            service.addEventListener(OutgoingEvents.GET_ITEM_STORAGE_INTENT, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        String key = payload.getString("key");
                                        Log.d(this.getClass().getName(), "DEBUG: GET STORAGE: " + key);
                                        KokoroData data = db.kokoroDataDAO().find(key);
                                        JSONObject response = new JSONObject();
                                        response.put("key", key);
                                        response.put("value", data == null ? null : data.data);
                                        jsRuntime.emit(IncomingEvents.EMIT_STORAGE_ITEM_GET_COMPLETED, response);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            // HTTP
                            service.addEventListener(OutgoingEvents.MAKE_HTTP_CALL_INTENT, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        Request.Builder requestBuilder = new Request.Builder().url(payload.getString("url"));
                                        String transactionId = payload.getString("transactionId");
                                        switch (payload.getString("method")) {
                                            case "POST":
                                                requestBuilder = requestBuilder.post(RequestBody.create(JSON, payload.getString("body")));
                                                break;
                                            case "PATCH":
                                                requestBuilder = requestBuilder.patch(RequestBody.create(JSON, payload.getString("body")));
                                                break;
                                            case "PUT":
                                                requestBuilder = requestBuilder.put(RequestBody.create(JSON, payload.getString("body")));
                                                break;
                                        }

                                        Response response = httpClient.newCall(requestBuilder.build()).execute();
                                        JSONObject jsResponse = new JSONObject();
                                        jsResponse.put("status", response.code());
                                        ResponseBody body = response.body();
                                        if (body != null) {
                                            jsResponse.put("body", body.string());
                                        }
                                        jsRuntime.emit(IncomingEvents.HTTP_CALL_RESPONSE + transactionId, jsResponse);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (IOException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            // EXO PLAYER
                            service.addEventListener(OutgoingEvents.SET_EXO_PLAYER_URL, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        String url = payload.getString("url");
                                        Log.d(this.getClass().getName(), "DEBUG: SET PLAY URL TO " + url
                                                + " for " + clients.size() + " clients!");
                                        Message msg = Message.obtain(null, AutoServiceMessages.SET_EXO_PLAYER_URL);
                                        Bundle data = new Bundle();
                                        data.putString("player_url", url);
                                        msg.setData(data);
                                        audioService.send(msg);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (RemoteException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            service.addEventListener(OutgoingEvents.SET_EXO_PLAYER_IS_PLAYING, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        boolean isPlaying = payload.getBoolean("playing");
                                        Message msg = Message.obtain(null, AutoServiceMessages.SET_PLAYER_IS_PLAYING);
                                        Bundle data = new Bundle();
                                        data.putBoolean("player_playing", isPlaying);
                                        msg.setData(data);
                                        audioService.send(msg);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (RemoteException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            // ANDROID AUTO
                            service.addEventListener(OutgoingEvents.SEND_AUTO_SIGNAL, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        int SIGNAL = payload.getInt("signal");
                                        autoService.send( Message.obtain(null, SIGNAL));
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (RemoteException e) {
                                        e.printStackTrace();
                                    }
                                }
                            });
                            service.addEventListener(OutgoingEvents.UPDATE_CHANNEL_ID, new MicroService.EventListener() {
                                @Override
                                public void onEvent(MicroService service, String event, JSONObject payload) {
                                    try {
                                        Message msg = Message.obtain(null, AutoServiceMessages.UPDATE_CURRENT_CHANNEL_ID);
                                        Bundle data = new Bundle();
                                        data.putString("channelId", payload.getString("id"));
                                        msg.setData(data);
                                        autoService.send(msg);
                                    } catch (JSONException e) {
                                        e.printStackTrace();
                                    } catch (RemoteException e) {
                                        e.printStackTrace();
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
                            Log.d("DEBUG: BYE BYE", "THE JS ENGINE IS GONE!");
                        }
                    }
            );
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }

        // audio service connection
        audioConnection = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName className, IBinder service) {
                audioService = new Messenger(service);
                audioBound = true;

                try {
                    Message msg = Message.obtain(null, AutoServiceMessages.REGISTER_CLIENT);
                    msg.replyTo = audioMessenger;
                    audioService.send(msg);
                } catch (RemoteException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onServiceDisconnected(ComponentName className) {
                audioService = null;
                audioBound = false;
            }
        };

        Context context = getApplicationContext();
        context.bindService(new Intent(context, AudioPlayerService.class), audioConnection, Context.BIND_AUTO_CREATE);
        context.startService(new Intent(context, AudioPlayerService.class));
        audioMessenger = new Messenger(new AudioServiceMessageHandler(this));

        // auto Service connection
        autoConnection = new ServiceConnection() {
            @Override
            public void onServiceConnected(ComponentName className, IBinder service) {
                autoService = new Messenger(service);
                autoBound = true;

                // try {
                //     Message msg = Message.obtain(null, AutoServiceMessages.REGISTER_CLIENT);
                //     msg.replyTo = autoMessenger;
                //     autoService.send(msg);
                // } catch (RemoteException e) {
                //     e.printStackTrace();
                // }
            }

            @Override
            public void onServiceDisconnected(ComponentName className) {
                autoService = null;
                autoBound = false;
            }
        };

        Intent bindingIntent = new Intent(context, MediaService.class);
        bindingIntent.setAction(this.getClass().getName());
        context.bindService(bindingIntent, autoConnection, Context.BIND_AUTO_CREATE);
        context.startService(new Intent(context, MediaService.class));
        // autoMessenger = new Messenger(new AutoServiceMessageHandler(this));

        jsRuntime.start();
    }

    @Override
    public void onDestroy() {
        if (audioBound) {
            getApplicationContext().unbindService(audioConnection);
            audioBound = false;
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        mMessenger = new Messenger(new DefaultMessageHandler(this));
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

    public ArrayList<Messenger> getStateClients() {
        return stateClients;
    }

    public MicroService getJsRuntime() {
        return jsRuntime;
    }

    private void sendMessageToClient(ArrayList<Messenger> clients, Message msg) {
        for (Messenger client : stateClients) {
            try {
                client.send(msg);
            } catch (RemoteException e) {
                Log.w(this.getClass().getName(), "Client is no longer active! Removing...");
                clients.remove(client);
            }
        }
    }
}
