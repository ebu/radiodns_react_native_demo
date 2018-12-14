import {LinkAttributes} from "./SPIModel";
import {Logo} from "./Stream";

interface LocalizedText {
    text: string;
    lang: string;
}

export interface ServiceProvider {
    geolocation: {
        country: string;
    },
    link: LinkAttributes[],
    shortName: LocalizedText,
    mediumName: LocalizedText,
    longName: LocalizedText,
    shortDescription: LocalizedText,
    mediaDescription: Logo[],
}
