import {NativeModules} from "react-native";

export interface RadioDNSExitApp {
    exitApp: () => void;
}

const RadioDNSExitApp: RadioDNSExitApp = NativeModules.RadioDNSExitApp;

export default RadioDNSExitApp;
