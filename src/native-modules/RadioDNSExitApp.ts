import {NativeModules} from "react-native";

/**
 * React native module that provide a native way of killing the application.
 */
export interface RadioDNSExitApp {
    /**
     * Kills the application.
     */
    exitApp: () => void;
}

const RadioDNSExitApp: RadioDNSExitApp = NativeModules.RadioDNSExitApp;

export default RadioDNSExitApp;
