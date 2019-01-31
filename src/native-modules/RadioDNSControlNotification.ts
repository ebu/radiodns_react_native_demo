import {NativeModules} from "react-native";

/**
 * React native module that handle a notifications that provides media controls such as
 * play, pause, next and previous station/song/stream/etc.
 */
export interface RadioDNSControlNotification {
    /**
     * Prepares the notification's display data.
     * @param title: Sets the title of the notification.
     * @param subtitle: Sets the subtitle of the notification.
     * @param imgUrl: Sets the image url of the notification.
     */
    prepareNotification: (title: string, subtitle: string, imgUrl: string) => void;

    /**
     * Displays the notification. This method should be called before the [prepareNotification] method
     * is called at least once before.
     *
     * If an other notification existed before, will update it.
     * @param playing: If the associated media is playing or is paused.
     */
    displayNotification: (playing: boolean) => void;

    /**
     * Dismisses the notification.
     */
    dismissNotification: () => void;
}

const RadioDNSControlNotification: RadioDNSControlNotification = NativeModules.RadioDNSControlNotification;

export default RadioDNSControlNotification;
