import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {Signal} from "../native-modules/events-and-signals/RadioDNSAutoAS";
import {commonWords, getBearer, getMedia, shuffleArray} from "../utilities";
import {IncomingMessageType, OutgoingMessageType} from "./messages";
import {ROOT_REDUCER_INITIAL_STATE, RootReducerState, store} from "./reducers/root-reducer";
import {
    setActiveStation,
    setError,
    setLoadingState,
    setNextStation,
    setPausedState,
    setPreviousStation,
    setStationPlaylist,
} from "./reducers/stations";
import {parseAndCacheSPI} from "./spi";

interface ParsedEmittedMessage {
    type: IncomingMessageType;
    payload: any;
}

// Declare LiquidCore capabilities.
declare class LiquidCore {
    public static on: (eventName: string, handler: (msg: any) => void) => void;
    public static emit: <T extends object>(eventName: string, msg?: T) => void;
}

let prevState: RootReducerState = ROOT_REDUCER_INITIAL_STATE;

// redux listener + Native listener.
store.subscribe(() => {
    const state = store.getState();
    LiquidCore.emit(OutgoingMessageType.UPDATE_ANDROID_AUTO_STATE, {msg: JSON.stringify(state)});
    // TODO: emit also other events based on what has changed.

    if (prevState.stations.activeStation !== state.stations.activeStation && !!state.stations.activeStation) {
        const {mediumName, mediaDescription, bearer} = state.stations.activeStation;
        LiquidCore.emit(OutgoingMessageType.PREPARE_NOTIFICATION, {
            title: mediumName || "",
            subtitle: "",
            imgUrl: getMedia(mediaDescription),
        });
        console.log("DEBUG: SET PLAYER URL:", getBearer(bearer).id);
        LiquidCore.emit(OutgoingMessageType.SET_EXO_PLAYER_URL, {url: getBearer(bearer).id});
    }

    if (state.stations.activeStation !== null) {
        const playing = !state.stations.loading && !state.stations.paused && !state.stations.error;
        LiquidCore.emit(OutgoingMessageType.DISPLAY_NOTIFICATION, {playing});

        LiquidCore.emit(OutgoingMessageType.SET_EXO_PLAYER_IS_PLAYING, {playing});
        // RadioDNSAudioPlayer.setPlayerVolume(this.props.volume!);
    }

    console.log("THAT IS HOT ------>", prevState.stations.loading, state.stations.loading);
    if (prevState.stations.loading !== state.stations.loading) {
        LiquidCore.emit(OutgoingMessageType.SEND_AUTO_SIGNAL, {
            signal: state.stations.loading
                ? Signal.UPDATE_MEDIA_STATE_TO_BUFFERING
                : Signal.UPDATE_MEDIA_STATE_TO_PLAYING,
        })
    }

    if (!prevState.stations.error && state.stations.error) {
        LiquidCore.emit(OutgoingMessageType.SEND_AUTO_SIGNAL, {signal: Signal.UPDATE_MEDIA_STATE_TO_ERROR});
    }

    prevState = {...state};
});

LiquidCore.on(IncomingMessageType.EMIT_MESSAGE, (rawMsg) => {
    const msg: ParsedEmittedMessage = JSON.parse(rawMsg);
    switch (msg.type) {
        case IncomingMessageType.DISPATCH_ACTION:
            store.dispatch(msg.payload);
            break;
        default:
            console.warn("Unknown message type:", msg.type);
    }
});

LiquidCore.on(IncomingMessageType.UPDATE_STATE, (e: {
    STATE: "PLAYING" | "PAUSED" | "STOPPED" | "PREVIOUS" | "NEXT",
    CHANNEL_ID?: string,
}) => {
    console.log("DEBUG: New playbacks tate form auto", e.STATE);
    switch (e.STATE) {
        case "PLAYING":
            if (e.CHANNEL_ID) {
                playFromId(e.CHANNEL_ID);
            } else {
                store.dispatch(setPausedState(false));
            }
            break;
        case "STOPPED":
            LiquidCore.emit(OutgoingMessageType.EXIT_APP);
            break;
        case "PAUSED":
            store.dispatch(setPausedState(true));
            break;
        case "PREVIOUS":
            store.dispatch(setNextStation());
            break;
        case "NEXT":
            store.dispatch(setPreviousStation());
            break;
        default:
            console.warn("UNSUPPORTED COMMAND FROM ANDROID AUTO:", e.STATE);
    }
});

LiquidCore.on(IncomingMessageType.PLAY_FROM_SEARCH_STRING, (e: { search_string: string }) => {
    const state = store.getState();
    if (!state.serviceProviders.serviceProviders || state.serviceProviders.serviceProviders.length === 0) {
        return;
    }
    const result = state.serviceProviders.serviceProviders
        .reduce((acc, spiCache) => acc.concat(spiCache.stations!), [] as Service[])
        .map((station) => ({
            id: getBearer(station.bearer).id,
            score: commonWords(station.shortName || "", e.search_string) + commonWords(station.mediumName || "", e.search_string)
                + commonWords(station.longName || "", e.search_string),
        }))
        .sort((a, b) => b.score - a.score)[0];
    playFromId(result.id);
    LiquidCore.emit(OutgoingMessageType.UPDATE_CHANNEL_ID, {id: result.id});
});

LiquidCore.on(IncomingMessageType.PLAY_RANDOM, () => {
    const state = store.getState();
    const scrambledArray = shuffleArray(state.serviceProviders.serviceProviders!
        .filter((cacheContainer) => cacheContainer.stations !== undefined)
        .reduce((acc, cacheContainer) => acc!.concat(cacheContainer.stations!), [] as Service[])
        .map((stations) => getBearer(stations.bearer).id));
    playFromId(scrambledArray[0]);
});

LiquidCore.on(IncomingMessageType.EXO_PLAYER_LOADING_UPDATE, (e: { loading: boolean }) => {
    console.log("DEBUG: LOADING?", e.loading);
    store.dispatch(setLoadingState(e.loading));
});

LiquidCore.on(IncomingMessageType.EXO_PLAYER_ERROR, (error: { cause: string }) => {
    console.log("ERROR:", error);
    store.dispatch(setError(true));
});

LiquidCore.on(IncomingMessageType.EXO_PLAYER_FINISHED, () => {
    console.log("FINISHED!");
    store.dispatch(setPausedState(true));
});

const playFromId = (channelId: string) => {
    const state = store.getState();
    const stationGroup = state.serviceProviders.serviceProviders!
        .map((spiCache) => spiCache.stations)
        .filter((stations) => stations !== undefined)
        .reduce((prev, current) => current!.filter((station) =>
            getBearer(station.bearer).id === channelId).length > 0
            ? current
            : prev
            , []);
    store.dispatch(setStationPlaylist!(stationGroup!));
    store.dispatch(setActiveStation!(stationGroup!.reduce((prev, current) =>
        getBearer(current.bearer).id === channelId
            ? current
            : prev)));
};

parseAndCacheSPI(store).then(() => LiquidCore.emit(OutgoingMessageType.READY));

const theShowNeverEnds = () => setTimeout(theShowNeverEnds, 1000);
theShowNeverEnds();
