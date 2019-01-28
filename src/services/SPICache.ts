import axios from "axios";
import {AsyncStorage} from "react-native";
import {xml2js} from "xml-js";
import {CACHE_SPI_MAX_AGE, SERVICE_PROVIDERS, SPI_3_1} from "../constants";
import {RawService, RawServiceProvider, RawServiceWithBearer, RawSPIFile} from "../models/RawSPI";
import {ServiceProvider} from "../models/ServiceProvider";
import {Station} from "../models/Station";
import {isWebScheme} from "../utilities";

/**
 * Describes a parsed SPI file in cache.
 */
export interface SPICacheContainer {
    // date when the SPI file will become stale. In milliseconds.
    expires: number;

    // stations of this SPI file.
    stations?: Station[];

    // informations about the service provider.
    serviceProvider?: ServiceProvider;

    // if the SPI file was correctly loaded/parsed.
    error: boolean;

    spUrl: string;
}

/**
 * Fetches and parse and store in the react native async storage a specified SPI file.
 * @param serviceProviderUrl: The url for the service provider. For example: "https://atorf.spi.radio.ebu.io"
 */
const fetchAndPutInCache: (serviceProviderUrl: string) => Promise<SPICacheContainer> = async (serviceProviderUrl) => {
    const res = await axios({
        url: serviceProviderUrl + SPI_3_1,
    });
    let cacheContainer: SPICacheContainer | null = null;

    if (res.status !== 200 || !res.data) {
        cacheContainer = {expires: -1, error: true, spUrl: serviceProviderUrl};
    } else {
        const parsedSPI: RawSPIFile = xml2js(res.data, {compact: true}) as any;
        const {service, serviceProvider} = parsedSPI.serviceInformation.services;
        cacheContainer = {
            expires: Date.now() + CACHE_SPI_MAX_AGE,
            stations: service ? rawServicesToStations(Array.isArray(service) ? service : [service]) : [],
            serviceProvider: serviceProvider ? rawServiceProviderToServiceProvider(serviceProvider) : undefined,
            error: false,
            spUrl: serviceProviderUrl,
        };
    }
    await AsyncStorage.setItem(serviceProviderUrl, JSON.stringify(cacheContainer));
    return cacheContainer;
};

/**
 * Clears the cache for all service providers. It is meant to be used for development purposes.
 */
export const clearCache = () =>
    Promise.all(SERVICE_PROVIDERS.map((key) => AsyncStorage.removeItem(key)));

/**
 * Gets an SPI file either from cache or by fetching it.
 * @param serviceProviderUrl: The url for the service provider. For example: "https://atorf.spi.radio.ebu.io"
 */
export const getSPI = async (serviceProviderUrl: string) => {
    let cacheContainer: SPICacheContainer = {expires: -1, error: true, spUrl: serviceProviderUrl};
    try {
        const value = await AsyncStorage.getItem(serviceProviderUrl);
        if (value) {
            cacheContainer = JSON.parse(value);
            if (cacheContainer.error || Date.now() > cacheContainer.expires) {
                cacheContainer = await fetchAndPutInCache(serviceProviderUrl);
            }
        } else {
            cacheContainer = await fetchAndPutInCache(serviceProviderUrl);
        }
    } catch (error) {
        console.error("ERROR", error);
    }
    return cacheContainer;
};

export const getAllSPIs: (serviceProviders: string[]) => Promise<SPICacheContainer[]> = async (serviceProviders: string[]) => {
    return (await Promise.all(serviceProviders.map((sp) => getSPI(sp))))
        .filter((cacheResponse) => !cacheResponse.error
            && cacheResponse.serviceProvider
            && cacheResponse.stations
            && cacheResponse.stations.length > 0,
        );
};

/**
 * Converts raw services to stations. Only retain the services that have ip bearers.
 * @param services: The raw services from an SPI file.
 */
const rawServicesToStations = (services: RawService[]) => {
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
        .map((service) => rawServiceToStation(service as RawServiceWithBearer));
};

/**
 * Converts a RawService object into a Station object. RawService objects are from the parsing of the xml-js
 * library.
 * @param service: The RawService to convert.
 */
const rawServiceToStation: (service: RawServiceWithBearer) => Station = (service) => {
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
        stationLogos: service.mediaDescription ? service.mediaDescription.map((mediaDescription) => ({
                ...mediaDescription.multimedia._attributes,
                height: parseInt(mediaDescription.multimedia._attributes.height, 10),
                width: parseInt(mediaDescription.multimedia._attributes.width, 10),
            }))
            : [],
        radiodns: {...service.radiodns._attributes},
    }
};

/**
 * Converts a raw service provider to a service provider.
 * @param rawServiceProvider
 */
const rawServiceProviderToServiceProvider: (rawServiceProvider: RawServiceProvider) => ServiceProvider = (rawServiceProvider) => ({
    geolocation: rawServiceProvider.geolocation.country ? {country: rawServiceProvider.geolocation.country._text} : {country: "None"},
    link: rawServiceProvider.link
        ? {
            ...Array.isArray(rawServiceProvider.link)
                ? rawServiceProvider.link.map((link) => ({...link._attributes}))
                : [{...rawServiceProvider.link._attributes}],
        }
        : [],
    shortName: rawServiceProvider.shortName ? {
            lang: rawServiceProvider.shortName._attributes["xml:lang"],
            text: rawServiceProvider.shortName._text,
        }
        : {
            lang: "en-Us",
            text: "No short name to display.",
        },
    mediumName: rawServiceProvider.mediumName ? {
            lang: rawServiceProvider.mediumName._attributes["xml:lang"],
            text: rawServiceProvider.mediumName._text,
        }
        : {
            lang: "en-Us",
            text: "No medium name to display.",
        },
    longName: rawServiceProvider.longName ? {
            lang: rawServiceProvider.longName._attributes["xml:lang"],
            text: rawServiceProvider.longName._text,
        }
        : {
            lang: "en-Us",
            text: "No long name to display.",
        },
    shortDescription: rawServiceProvider.shortDescription ? {
            lang: rawServiceProvider.shortDescription._attributes["xml:lang"],
            text: rawServiceProvider.shortDescription._text,
        }
        : {
            lang: "en-Us",
            text: "No short description to display.",
        },
    mediaDescription: rawServiceProvider.mediaDescription ? rawServiceProvider.mediaDescription.map((mediaDescription) => ({
            ...mediaDescription.multimedia._attributes,
            height: parseInt(mediaDescription.multimedia._attributes.height, 10),
            width: parseInt(mediaDescription.multimedia._attributes.width, 10),
        }))
        : [],
});
