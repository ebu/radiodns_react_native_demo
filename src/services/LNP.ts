import PushNotification from "react-native-push-notification";
import {PUSH_NOTIFICATION_ID} from "../constants";

export const displayAudioPlayerNotifControl = (stationName: string, actions: string) => {
    PushNotification.cancelLocalNotifications({id: PUSH_NOTIFICATION_ID});
    PushNotification.localNotification({
        /* Android Only Properties */
        id: PUSH_NOTIFICATION_ID,
        autoCancel: false,
        bigText: "Metadata provided by EBU.io",
        vibrate: false,
        /* iOS and Android properties */
        title: "Now playing: " + stationName,
        message: "Metadata provided by EBU.io",
        playSound: false,
        actions,
    })
};
