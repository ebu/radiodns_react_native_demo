import {Store} from "redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {SERVICE_PROVIDERS} from "../constants";
import {getBearer, getMedia} from "../utilities";
import {OutgoingMessageType} from "./messages";
import {setServiceProviders} from "./reducers/service-providers";
import {getAllSPIs, SPICacheContainer} from "./services/SPICache";

declare class LiquidCore {
    public static on: (eventName: string, handler: (msg: any) => void) => void;
    public static emit: (eventName: string, msg?: any) => void;
}

export const parseAndCacheSPI = async (store: Store) => {
    // Add SPI files to the app's state.
    const spiCacheResponses = await getAllSPIs(SERVICE_PROVIDERS);

    // Add root nodes to browse by genre and by service provider.
    addAutoNode(
        "root",
        "byServiceProviderRoot",
        "By service provider",
        "",
        null,
    );

    addAutoNode(
        "root",
        "byGenreRoot",
        "By genre",
        "",
        null,
    );

    spiCacheResponses.forEach(cacheForAndroidAuto);
    parseAndCacheGenresForAndroidAuto(spiCacheResponses);

    store.dispatch(setServiceProviders(spiCacheResponses));
};

const parseAndCacheGenresForAndroidAuto = (spiCacheResponses: SPICacheContainer[]) => {
    const genres: { [key: string]: Service[] } = {};
    spiCacheResponses.reduce((acc, spiCache) => acc.concat(spiCache.stations || []), [] as Service[])
        .reduce((acc, station) => acc.concat(
            station.genre.map((genre) => ({genre: genre.text.replace("\"", "").trim(), station})),
        ), [] as Array<{ station: Service, genre: string }>)
        .sort((a, b) => {
            if (a.genre < b.genre) {
                return -1;
            }
            if (a.genre > b.genre) {
                return 1;
            }
            return 0;
        })
        .filter((a) => getBearer(a.station.bearer).id)
        .forEach((a) => genres[a.genre] ? genres[a.genre].push(a.station) : genres[a.genre] = [a.station]);

    Object.keys(genres).forEach((genre) => {
        addAutoNode(
            "byGenreRoot",
            genre,
            genre,
            "",
            null,
        );
        genres[genre].forEach((station) => {
            const mediaUri = getMedia(station.mediaDescription);
            addAutoNode(
                genre,
                genre + getBearer(station.bearer).id,
                station.shortName || "",
                mediaUri,
                getBearer(station.bearer).id,
            );
        });
    });
};

/**
 * Sets the provided cache response in the cache of the native Android Auto module. Later when in Auto mode
 * the MediaBrowserService will query this cache for a list of nodes to render for the user.
 * @param cacheResponse: The cache response.
 */
const cacheForAndroidAuto = (cacheResponse: SPICacheContainer) => {
    if (!cacheResponse.serviceProvider || !cacheResponse.stations) {
        return;
    }
    addAutoNode(
        "byServiceProviderRoot",
        cacheResponse.spUrl,
        cacheResponse.serviceProvider.shortName ? cacheResponse.serviceProvider.shortName.text : "",
        getMedia(cacheResponse.serviceProvider.mediaDescription),
        null,
    );
    cacheResponse.stations.forEach((station) => {
        const mediaUri = getMedia(station.mediaDescription);

        // ADD CHANNEL
        addAutoNode(
            cacheResponse.spUrl,
            getBearer(station.bearer).id,
            station.shortName || "",
            mediaUri,
            getBearer(station.bearer).id,
        );
    });
};

const addAutoNode = (childOf: string, key: string, value: string, imageURI: string, streamURI: string | null) => {
    LiquidCore.emit(OutgoingMessageType.SEND_AUTO_NODE, {
        childOf,
        key,
        value,
        imageURI,
        streamURI,
    });
};
