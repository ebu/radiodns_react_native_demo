package com.radiodns.exitApp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * React native module that provide a native way of killing the application.
 */
public class RadioDNSExitAppModule extends ReactContextBaseJavaModule {

    public RadioDNSExitAppModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "RadioDNSExitApp";
    }

    /**
     * Kills the application.
     */
    @ReactMethod
    public void exitApp() {
        android.os.Process.killProcess(android.os.Process.myPid());
    }
}
