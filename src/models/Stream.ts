import {LinkAttributes} from "./SPIModel";

/**
 * Describes a stream logo.
 */
export interface Logo {
    height: number;
    type: string;
    url: string;
    width: number
}

/**
 * Describes a radio stream.
 */
export interface Stream {
    // Selected channel from metadata to listen to the ip station.
    bearer: {
        id: string | null;
        cost: string;
        offset?: number;
        mimeValue: "audio/aacp" | "audio/mpeg";
    },
    // Genres of the station.
    genre: Array<{
        href: string;
        text: string;
    }>,
    // Useful links related to the station.
    link: LinkAttributes[],
    // max 8 chars long
    shortName: string,
    // max 16 chars long
    mediumName: string,
    // max 128 chars long
    longName: string,
    shortDescription: {
        text: string;
        lang: string,
    },
    // Station's logos
    streamLogos: Logo[],
    // RadioDns informations.
    radiodns: {
        fqdn: string;
        serviceIdentifier: string;
    },
    visible: boolean;
}
