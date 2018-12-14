import MusicControl from "react-native-music-control";
import {Logo, Stream} from "./models/Stream";

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
// @ts-ignore
export const displayAudioPlayerNotifControl = (stream: Stream) => {
    MusicControl.setNowPlaying({
        title: stream.mediumName,
        artwork: getMedia(stream.streamLogos), // URL or RN's image require()
        description: "", // Android Only
    });
    MusicControl.updatePlayback({
        state: MusicControl.STATE_PLAYING,
    });
};

/**
 * [ANDROID ONLY] Cancels the local notification (dismiss it).
 */
export const cancelAudioPlayerNotifControl = () => MusicControl.resetNowPlaying();

export const injectedFunctionInvoker: (fn?: (...args: any[]) => any, ...args: any[]) => any = (fn, args) => fn ? fn(args) : {};
export const injectedPropReader: <T>(arg: T | undefined | null) => T = (arg) => arg ? arg : {} as any;
