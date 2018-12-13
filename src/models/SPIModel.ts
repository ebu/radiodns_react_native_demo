import {DeclarationAttributes} from "xml-js";

export type ArrayOrOne<T> = T[] | T;

export interface LinkAttributes {
    url?: string;
    mimeValue?: string;
    "xml:lang"?: string;
    uri?: string;
}

export interface LocalizedText {
    _text: string;
    _attributes: {
        "xml:lang": string;
    },
}

export interface MediaDescription {
    multimedia: {
        _attributes: {
            height: string;
            type: string;
            url: string;
            width: string;
        },
    },
}

export interface ParsedServiceWithBearer extends ParsedService {
    bearer: ArrayOrOne<{
        _attributes: {
            id: string;
            cost: string;
            offset?: string;
            mimeValue: "audio/aacp" | "audio/mpeg";
        },
    }>,
}

export interface ParsedService {
    bearer?: ArrayOrOne<{
        _attributes: {
            id?: string;
            cost?: string;
            offset?: string;
            mimeValue?: "audio/aacp" | "audio/mpeg";
        },
    }>,
    genre?: ArrayOrOne<{
        _attributes: {
            href: string;
        },
        _text: string;
    }>,
    link?: ArrayOrOne<{
        _attributes: LinkAttributes,
    }>,
    shortName?: {
        _text: string;
    },
    mediumName?: {
        _text: string;
    },
    longName?: {
        _text: string;
    },
    shortDescription?: LocalizedText,
    mediaDescription?: MediaDescription[],
    radiodns: {
        _attributes: {
            fqdn: string;
            serviceIdentifier: string;
        },
    }
}

export interface ParsedServiceProvider {
    geolocation?: {
        country: {
            _text: string;
        },
    },
    link?: ArrayOrOne<{
        _attributes: LinkAttributes,
    }>,
    shortName?: LocalizedText,
    mediumName?: LocalizedText,
    longName?: LocalizedText,
    shortDescription?: LocalizedText,
    mediaDescription?: MediaDescription[],
}

export interface ParsedSPIFile {
    _declaration: {
        _attributes: DeclarationAttributes,
    },
    serviceInformation: {
        services: {
            service?: ParsedService[],
            serviceProvider?: ParsedServiceProvider,
        },
    },
}
