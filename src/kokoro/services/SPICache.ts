import {Service, ServiceProvider, SPIFile} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {parse} from "spi_xml_file_parser/artifacts/src/parser";
import {CACHE_SPI_MAX_AGE, SERVICE_PROVIDERS, SPI_3_1} from "../../constants";
import {isWebScheme} from "../../utilities"
import {IncomingMessageType, OutgoingMessageType} from "../messages";
import {httpRequest} from "./http";

// Declare LiquidCore capabilities.
declare class LiquidCore {
    public static on: (eventName: string, handler: (msg: any) => void) => void;
    public static emit: (eventName: string, msg?: any) => void;
}

/**
 * Describes a parsed SPI file in cache.
 */
export interface SPICacheContainer {
    // date when the SPI file will become stale. In milliseconds.
    expires: number;

    // stations of this SPI file.
    stations?: Service[];

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
    return new Promise(async (resolve) => {
        const res = await httpRequest("GET", serviceProviderUrl + SPI_3_1);
        let cacheContainer: SPICacheContainer;

        if (!res || res.status !== 200 || !res.data) {
            cacheContainer = {expires: -1, error: true, spUrl: serviceProviderUrl};
        } else {
            try {
                const parsedSPI: SPIFile = parse(res.data);
                cacheContainer = {
                    expires: Date.now() + CACHE_SPI_MAX_AGE,
                    stations: parsedSPI.services || undefined,
                    serviceProvider: parsedSPI.serviceProvider || undefined,
                    error: false,
                    spUrl: serviceProviderUrl,
                };
            } catch (e) {
                cacheContainer = {
                    error: true,
                    expires: Date.now() + CACHE_SPI_MAX_AGE,
                    spUrl: serviceProviderUrl,
                }
            }
        }
        LiquidCore.on(IncomingMessageType.EMIT_STORAGE_ITEM_SET_COMPLETED, (msg: { key: string }) => {
            if (msg.key === serviceProviderUrl) {
                console.log("DEBUG: SPI PUT IN CACHE FULLY COMPLETED!", msg.key);
                resolve(cacheContainer);
            }
        });
        console.log("DEBUG: SET_ITEM_STORAGE_INTENT");
        LiquidCore.emit(OutgoingMessageType.SET_ITEM_STORAGE_INTENT, {
            key: serviceProviderUrl,
            data: JSON.stringify(cacheContainer),
        });
    });
};

/**
 * Clears the cache for all service providers. It is meant to be used for development purposes.
 */
export const clearCache = () =>
    Promise.all(SERVICE_PROVIDERS.map((key) => LiquidCore.emit(OutgoingMessageType.REMOVE_ITEM_STORAGE, {key})));

/**
 * Gets an SPI file either from cache or by fetching it.
 * @param serviceProviderUrl: The url for the service provider. For example: "https://atorf.spi.radio.ebu.io"
 */
const getSPI = async (serviceProviderUrl: string) => {
    let cacheContainer: SPICacheContainer = {expires: -1, error: true, spUrl: serviceProviderUrl};

    return new Promise<SPICacheContainer>((resolve) => {
        LiquidCore.on(IncomingMessageType.EMIT_STORAGE_ITEM_GET_COMPLETED, async (res: { key: string, value: any }) => {
            if (res.key !== serviceProviderUrl) {
                return;
            }
            console.log("DEBUG: GOT SPI CACHE RESPONSE!", res.key, res.value);
            try {
                if (res.value) {
                    cacheContainer = JSON.parse(res.value);
                    if (cacheContainer.error || Date.now() > cacheContainer.expires) {
                        cacheContainer = await fetchAndPutInCache(serviceProviderUrl);
                    }
                } else {
                    cacheContainer = await fetchAndPutInCache(serviceProviderUrl);
                }
            } catch (error) {
                console.error("DEBUG: ERROR", error);
            }
            resolve(cacheContainer);
        });
        console.log("DEBUG: GET_ITEM_STORAGE_INTENT");
        LiquidCore.emit(OutgoingMessageType.GET_ITEM_STORAGE_INTENT, {key: serviceProviderUrl});
    });
};

export const getAllSPIs: (serviceProviders: string[]) => Promise<SPICacheContainer[]> = async (serviceProviders: string[]) => {
    return (await Promise.all(serviceProviders.map((sp) => getSPI(sp))))
        .filter((cacheResponse) => !cacheResponse.error
            && cacheResponse.serviceProvider
            && cacheResponse.stations
            && cacheResponse.stations.length > 0,
        ).map((cacheResponse) => ({
                ...cacheResponse, stations: cacheResponse.stations!
                    .map((station) => {
                        return station;
                    })
                    .map((station) => ({...station, bearer: station.bearer.filter((b) => isWebScheme(b.id) && b.cost)}))
                    .filter(
                        (station) => station.bearer.length > 0,
                    ),
            }
        )).filter((cacheResponse) => cacheResponse.stations.length > 0);
};
