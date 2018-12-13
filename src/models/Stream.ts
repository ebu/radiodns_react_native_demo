import {LinkAttributes} from "./SPIModel";

/**
 * Describes a stream logo.
 */
export interface StreamLogos {
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
        id: string;
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
    streamLogos: StreamLogos[],
    // RadioDns informations.
    radiodns: {
        fqdn: string;
        serviceIdentifier: string;
    },
}
