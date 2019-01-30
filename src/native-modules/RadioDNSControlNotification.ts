import {NativeModules} from "react-native";

export interface RadioDNSControlNotification {
    buildNotification: (title: string, subtitle: string, imgUrl: string) => void;
    updateNotifState: (playing: boolean, nextEnabled: boolean, previousEnabled: boolean) => void;
    dismissNotification: () => void;
}

const RadioDNSControlNotification: RadioDNSControlNotification = NativeModules.RadioDNSControlNotification;

export default RadioDNSControlNotification;
