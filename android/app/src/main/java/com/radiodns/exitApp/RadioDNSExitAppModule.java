package com.radiodns.exitApp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class RadioDNSExitAppModule extends ReactContextBaseJavaModule {

    public RadioDNSExitAppModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RadioDNSExitApp";
    }

    @ReactMethod
    public void exitApp() {
        android.os.Process.killProcess(android.os.Process.myPid());
    }
}
