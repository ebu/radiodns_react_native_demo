import axios from "axios";
import {AsyncStorage} from "react-native";
import {xml2js} from "xml-js";
import {CACHE_SPI_MAX_AGE, SERVICE_PROVIDERS, SPI_3_1} from "../constants";
import {ServiceProvider} from "../models/ServiceProvider";
import {ParsedService, ParsedServiceProvider, ParsedServiceWithBearer, ParsedSPIFile} from "../models/SPIModel";
import {Stream} from "../models/Stream";
import {isWebScheme} from "../utilities";

export interface SPICacheContainer {
    expires: number;
    streams?: Stream[];
    serviceProvider?: ServiceProvider;
    error: boolean;
}

const fetchAndParseSPI: (key: string) => Promise<SPICacheContainer> = async (key) => {
    const res = await axios({
        url: key + SPI_3_1,
    });

    if (res.status !== 200 || !res.data) {
        return {expires: -1, error: true};
    } else {
        const parsedSPI: ParsedSPIFile = xml2js(res.data, {compact: true}) as any;
        const {service, serviceProvider} = parsedSPI.serviceInformation.services;
        return {
            expires: Date.now() + CACHE_SPI_MAX_AGE,
            streams: service ? parsedServicesToStream(Array.isArray(service) ? service : [service]) : [],
            serviceProvider: serviceProvider ? parsedServiceProviderToServiceProvider(serviceProvider) : undefined,
            error: false,
        }
    }
};

const fetchAndPutInCache: (key: string) => Promise<SPICacheContainer> = async (key) => {
    const cacheContainer = await fetchAndParseSPI(key);
    await AsyncStorage.setItem(key, JSON.stringify(cacheContainer));
    return cacheContainer;
};

export const clearCache = () =>
    Promise.all(SERVICE_PROVIDERS.map((key) => AsyncStorage.removeItem(key)));

export const getFromSPICache = async (key: string) => {
    let cacheContainer: SPICacheContainer = {expires: -1, error: true};
    try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
            cacheContainer = JSON.parse(value);
            if (cacheContainer.error || Date.now() > cacheContainer.expires) {
                cacheContainer = await fetchAndPutInCache(key);
            }
        } else {
            cacheContainer = await fetchAndPutInCache(key);
        }
    } catch (error) {
        console.log("ERROR", error);
    }
    return cacheContainer;
};

const parsedServicesToStream = (services: ParsedService[]) => {
    return services
        .filter((service) => {
            if (service.bearer) {
                return Array.isArray(service.bearer)
                    ? service.bearer
                        .some((bearer) => isWebScheme(bearer._attributes.id ? bearer._attributes.id : ""))
                    : isWebScheme(service.bearer._attributes.id ? service.bearer._attributes.id : "")
            }
            return false;
        })
        // Typescript doesn't know but here by filtering bearers we ensured that we have one.
        .map((stream) => parsedServiceToStream(stream as ParsedServiceWithBearer));
};

/**
 * Converts a ParsedService object into a Stream object. ParsedService objects are from the parsing of the xml-js
 * library.
 * @param service: The ParsedService to convert.
 */
const parsedServiceToStream: (service: ParsedServiceWithBearer) => Stream = (service) => {
    const parsedBearer = {
        ...(Array.isArray(service.bearer)
            ? service.bearer
                .filter((bearer) => isWebScheme(bearer._attributes.id))
                .reduce((best, current) =>
                    parseInt(current._attributes.cost, 10) > parseInt(best._attributes.cost, 10) ? current : best)
            : service.bearer)._attributes,
    };

    return {
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
        visible: true,
    }
};

const parsedServiceProviderToServiceProvider: (psp: ParsedServiceProvider) => ServiceProvider = (psp) => ({
    geolocation: psp.geolocation.country ? {country: psp.geolocation.country._text} : {country: "None"},
    link: psp.link
        ? {
            ...Array.isArray(psp.link)
                ? psp.link.map((link) => ({...link._attributes}))
                : [{...psp.link._attributes}],
        }
        : [],
    shortName: psp.shortName ? {
            lang: psp.shortName._attributes["xml:lang"],
            text: psp.shortName._text,
        }
        : {
            lang: "en-Us",
            text: "No short name to display.",
        },
    mediumName: psp.mediumName ? {
            lang: psp.mediumName._attributes["xml:lang"],
            text: psp.mediumName._text,
        }
        : {
            lang: "en-Us",
            text: "No medium name to display.",
        },
    longName: psp.longName ? {
            lang: psp.longName._attributes["xml:lang"],
            text: psp.longName._text,
        }
        : {
            lang: "en-Us",
            text: "No long name to display.",
        },
    shortDescription: psp.shortDescription ? {
            lang: psp.shortDescription._attributes["xml:lang"],
            text: psp.shortDescription._text,
        }
        : {
            lang: "en-Us",
            text: "No short description to display.",
        },
    mediaDescription: psp.mediaDescription ? psp.mediaDescription.map((mediaDescription) => ({
            ...mediaDescription.multimedia._attributes,
            height: parseInt(mediaDescription.multimedia._attributes.height, 10),
            width: parseInt(mediaDescription.multimedia._attributes.width, 10),
        }))
        : [],
});
