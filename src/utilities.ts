import PushNotification from "react-native-push-notification";
import {PUSH_NOTIFICATION_ID} from "./constants";
import {Logo} from "./models/Stream";

/**
 * Returns the media to be displayed for the stream. This is really an example implementation and one should come with
 * something smarter.
 * @param medias: The medias from where to choose from.
 */
export const getMedia = (medias: Logo[] | undefined) =>
    (medias || []).reduce((best, current) => current.width > best.width ? current : best).url;

/**
 * Verifies if the provided string verifies web http/https/www schemes. Returns true if so, false otherwise.
 * @param url: The url to be verified.
 */
export const isWebScheme: (url: string) => boolean = (url) =>
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);

/**
 * Displays a local notification with the name of the played stream.
 * @param streamName: The name of the stream.
 */
export const displayAudioPlayerNotifControl = (streamName: string) => {
    PushNotification.localNotification({
        /* Android Only Properties */
        id: PUSH_NOTIFICATION_ID,
        autoCancel: false,
        bigText: "Metadata provided by EBU.io",
        vibrate: false,
        /* iOS and Android properties */
        title: "Now playing: " + streamName,
        message: "Metadata provided by EBU.io",
        playSound: false,
    })
};

/**
 * [ANDROID ONLY] Cancels the local notification (dismiss it).
 */
export const cancelAudioPlayerNotifControl = () => (PushNotification as any).clearLocalNotification(parseInt(PUSH_NOTIFICATION_ID, 10));

export const injectedFunctionInvoker: (fn?: (...args: any[]) => any, ...args: any[]) => any = (fn, args) => fn ? fn(args) : {};
export const injectedPropReader: <T>(arg: T | undefined | null) => T = (arg) => arg ? arg : {} as any;
