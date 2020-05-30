export type ArrayOrOne<T> = T[] | T;

export interface RawLinkAttributes {
    url?: string;
    mimeValue?: string;
    "xml:lang"?: string;
    uri?: string;
}

export interface RawLocalizedText {
    _text: string;
}

export interface RawMediaDescription {
    multimedia?: {
        _attributes: {
            height: string;
            type: string;
            url: string;
            width: string;
        },
    },
    shortDescription?: {
        _text: string;
    }
}

export interface RawServiceWithBearer extends RawService {
    bearer: ArrayOrOne<{
        _attributes: {
            id: string;
            cost: string;
            offset?: string;
            mimeValue: "audio/aacp" | "audio/mpeg";
        },
    }>,
}

export interface RawService {
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
        _attributes: RawLinkAttributes,
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
    shortDescription?: RawLocalizedText,
    mediaDescription?: RawMediaDescription[],
    radiodns: {
        _attributes: {
            fqdn: string;
            serviceIdentifier: string;
        },
    }
}

export interface RawServiceProvider {
    geolocation: {
        country?: {
            _text: string;
        },
    },
    link?: ArrayOrOne<{
        _attributes: RawLinkAttributes,
    }>,
    shortName?: RawLocalizedText,
    mediumName?: RawLocalizedText,
    longName?: RawLocalizedText,
    shortDescription?: RawLocalizedText,
    mediaDescription?: RawMediaDescription[],
}

export interface RawSPIFile {
    serviceInformation: {
        services: {
            service?: ArrayOrOne<RawService>,
            serviceProvider?: RawServiceProvider,
        },
    },
}
