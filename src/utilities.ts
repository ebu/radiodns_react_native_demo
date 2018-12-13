import PushNotification from "react-native-push-notification";
import {PUSH_NOTIFICATION_ID} from "./constants";
import {ParsedServiceWithBearer} from "./models/SPIModel";
import {Stream, StreamLogos} from "./models/Stream";

/**
 * Returns the media to be displayed for the stream. This is really an example implementation and one should come with
 * something smarter.
 * @param medias: The medias from where to choose from.
 */
export const getMedia = (medias: StreamLogos[] | undefined) =>
    (medias || []).reduce((best, current) => current.width > best.width ? current : best).url;

/**
 * Verifies if the provided string verifies web http/https/www schemes. Returns true if so, false otherwise.
 * @param url: The url to be verified.
 */
export const isWebScheme: (url: string) => boolean = (url) =>
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);

/**
 * Converts a ParsedService object into a Stream object. ParsedService objects are from the parsing of the xml-js
 * library.
 * @param service: The ParsedService to convert.
 */
export const parsedServiceToStream: (service: ParsedServiceWithBearer) => Stream = (service) => {
    const parsedBearer = {
        ...(Array.isArray(service.bearer)
            ? service.bearer
                .filter((bearer) => isWebScheme(bearer._attributes.id))
                .reduce((best, current) =>
                    parseInt(current._attributes.cost, 10) > parseInt(best._attributes.cost, 10) ? current : best)
            : service.bearer)._attributes,
    };

    return {
        ...service,
        bearer: {
            ...parsedBearer,
            offset: parsedBearer.offset ? parseInt(parsedBearer.offset, 10) : 0,
        },
        genre: service.genre
            ? Array.isArray(service.genre)
                ? service.genre.map((genre) => ({text: genre._text, ...genre._attributes}))
                : [{text: service.genre._text, ...service.genre._attributes}]
            : [],
        link: service.link
            ? {
                ...Array.isArray(service.link)
                    ? service.link.map((link) => ({...link._attributes}))
                    : [{...service.link._attributes}],
            }
            : [],
        shortName: service.shortName ? service.shortName._text : "Unnamed",
        mediumName: service.mediumName ? service.mediumName._text : "Unnamed station",
        longName: service.longName ? service.longName._text : "Unnamed station",
        shortDescription: service.shortDescription
            ? {
                lang: service.shortDescription._attributes["xml:lang"],
                text: service.shortDescription._text,
            }
            : {
                lang: "en-Us",
                text: "No description to display.",
            },
        streamLogos: service.mediaDescription ? service.mediaDescription.map((mediaDescription) => ({
                ...mediaDescription.multimedia._attributes,
                height: parseInt(mediaDescription.multimedia._attributes.height, 10),
                width: parseInt(mediaDescription.multimedia._attributes.width, 10),
            }))
            : [],
        radiodns: {...service.radiodns._attributes},
    }
};

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
