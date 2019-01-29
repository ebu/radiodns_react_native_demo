import MusicControl from "react-native-music-control";
import {Logo, Station} from "./models/Station";

/**
 * Returns the media to be displayed for the station (the bigger one). This is really an example implementation and one should come with
 * something smarter.
 * @param medias: The medias from where to choose from.
 */
export const getMedia = (medias: Logo[] | undefined) => {
    if (medias && medias.length > 0) {
        return medias.reduce((best, current) => current.width > best.width ? current : best).url;
    }
    return "";
};

/**
 * Verifies if the provided string verifies web http/https/www schemes. Returns true if so, false otherwise.
 * @param url: The url to be verified.
 */
export const isWebScheme: (url: string) => boolean = (url) =>
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);

/**
 * Displays a local notification with the name of the played station.
 * @param station: The name of the station.
 */
export const displayAudioPlayerNotifControl = (station: Station | null) => {
    MusicControl.setNowPlaying({
        title: station ? station.mediumName : "",
        artwork: getMedia(station ? station.stationLogos : []),
        description: "",
    });
    MusicControl.updatePlayback({
        state: MusicControl.STATE_PLAYING,
    });
};

/**
 * No operation function.
 */
export const noop = () => {};

/**
 * [ANDROID ONLY] Cancels the local notification (dismiss it).
 */
export const cancelAudioPlayerNotifControl = () => MusicControl.resetNowPlaying();

/**
 * Assuming the two parameters are sentences composed of words separated with blanks, counts the
 * number of works the two parameters have in common.
 * @param a: The first string to compare.
 * @param b: The string to compare the first to.
 */
export const commonWords: (a: string, b: string) => number = (a, b) =>
    a.split(" ").reduce((acc, aWord) => acc + b.split(" ").filter((bWord) => bWord === aWord).length, 0);

/**
 * Shuffles the provided array.
 * @param a: The array to be shuffled.
 */
export const shuffleArray = <T>(a: T[]) => {
    const array = Array.from(a);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const x = array[i];
        array[i] = array[j];
        array[j] = x;
    }
    return array;
};
