import PushNotification from "react-native-push-notification";

export const displayAudioPlayerNotifControl = (stationName: string, actions: string) => {
    PushNotification.cancelLocalNotifications({id: "28"});
    PushNotification.localNotification({
        /* Android Only Properties */
        id: "28",
        autoCancel: false, // (optional) default: true
        bigText: "Now playing: " + stationName, // (optional) default: "message" prop
        subText: "Metadata provided by EBU.io", // (optional) default: none
        vibrate: false, // (optional) default: true
        /* iOS and Android properties */
        title: "Now playing: " + stationName, // (optional)
        message: "Metadata provided by EBU.io", // (required)
        playSound: false, // (optional) default: true
        actions,  // (Android only) See the doc for notification actions to know more
    })
};
