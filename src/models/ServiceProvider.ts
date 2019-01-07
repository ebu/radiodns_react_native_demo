import {RawLinkAttributes} from "./RawSPI";
import {Logo} from "./Station";

interface LocalizedText {
    text: string;
    lang: string;
}

export interface ServiceProvider {
    geolocation: {
        country: string;
    },
    link: RawLinkAttributes[],
    shortName: LocalizedText,
    mediumName: LocalizedText,
    longName: LocalizedText,
    shortDescription: LocalizedText,
    mediaDescription: Logo[],
}
