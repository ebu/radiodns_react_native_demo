import {Action} from "redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {getBearer} from "../../utilities";

/**
 * Stations reducer. Stores the available stations that were recovered from radiodns and holds the information
 * about the currently played station.
 */

// Types
interface StationSetPlaylistAction extends Action<typeof SET_STATION_PLAYLIST> {
    stations: Service[];
}

interface StationSetCurrentlyVisibleAction extends Action<typeof SET_STATIONS_CURRENTLY_VISIBLE> {
    stations: Service[];
}

interface StationsSetActiveAction extends Action<typeof SET_ACTIVE> {
    activeStation: Service;
}

interface StationsSetLoading extends Action<typeof SET_LOADING> {
    loading: boolean;
}

interface StationsSetPaused extends Action<typeof SET_PAUSED> {
    paused: boolean;
}

interface StationsSetError extends Action<typeof SET_ERROR> {
    error: boolean;
}

interface StationsSetVolume extends Action<typeof SET_VOLUME> {
    volume: number;
}

interface StationsSetVisibility extends Action<typeof SET_VISIBILITY> {
    searchedStation: string;
}

type StationsActions =
    | StationSetPlaylistAction
    | StationSetCurrentlyVisibleAction
    | StationsSetActiveAction
    | StationsSetLoading
    | StationsSetPaused
    | Action<typeof SET_ACTIVE_NEXT>
    | Action<typeof SET_ACTIVE_PREVIOUS>
    | StationsSetVolume
    | StationsSetVisibility
    | StationsSetError;

export interface StationsReducerState {
    station_playlist: Service[];
    stations_currently_visible: Service[];
    activeStation: Service | null;
    loading: boolean;
    paused: boolean;
    index: number;
    volume: number; // [0, 1] float
    error: boolean;
    searchedStation: string;
}

// Actions
const SET_STATION_PLAYLIST = "radiodns_react_native_technical_demo/kokoro/stations/SET_STATION_PLAYLIST";
const SET_STATIONS_CURRENTLY_VISIBLE = "radiodns_react_native_technical_demo/kokoro/stations/SET_STATIONS_CURRENTLY_VISIBLE";
const SET_ACTIVE = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE";
const SET_LOADING = "radiodns_react_native_technical_demo/kokoro/stations/SET_LOADING";
const SET_PAUSED = "radiodns_react_native_technical_demo/kokoro/stations/SET_PAUSED";
const SET_ACTIVE_NEXT = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE_NEXT";
const SET_ACTIVE_PREVIOUS = "radiodns_react_native_technical_demo/kokoro/stations/SET_ACTIVE_PREVIOUS";
const SET_VOLUME = "radiodns_react_native_technical_demo/kokoro/stations/SET_VOLUME";
const SET_ERROR = "radiodns_react_native_technical_demo/kokoro/stations/SET_ERROR";
const SET_VISIBILITY = "radiodns_react_native_technical_demo/kokoro/stations/SET_VISIBILITY";

// Reducer
export const STATIONS_REDUCER_DEFAULT_STATE: StationsReducerState = {
    station_playlist: [],
    stations_currently_visible: [],
    activeStation: null,
    loading: true,
    paused: false,
    index: 0,
    volume: 1,
    error: false,
    searchedStation: "",
};

export function reducer(state: StationsReducerState = STATIONS_REDUCER_DEFAULT_STATE, action: StationsActions): StationsReducerState {
    switch (action.type) {
        case SET_STATION_PLAYLIST:
            return {...state, station_playlist: Array.from(action.stations)};
        case SET_STATIONS_CURRENTLY_VISIBLE:
            return {...state, stations_currently_visible: Array.from(action.stations), searchedStation: ""};
        case SET_ACTIVE:
            return setActiveStationHelper({
                ...state,
                activeStation: action.activeStation,
                error: false,
                paused: false,
            }, getIndexFromActiveStation);
        case SET_LOADING:
            return {...state, loading: action.loading, error: false};
        case SET_PAUSED:
            return {...state, paused: action.paused};
        case SET_ACTIVE_NEXT:
            return setActiveStationHelper({
                ...state,
                error: false,
                paused: false,
            }, (s) => s.index - 1 >= 0 ? s.index - 1 : s.station_playlist.length - 1);
        case SET_ACTIVE_PREVIOUS:
            return setActiveStationHelper({
                ...state,
                error: false,
                paused: false,
            }, (s) => s.index + 1 < s.station_playlist.length ? s.index + 1 : 0);
        case SET_VOLUME:
            return {...state, volume: action.volume};
        case SET_ERROR:
            return {...state, error: action.error};
        case SET_VISIBILITY:
            return {
                ...state,
                searchedStation: action.searchedStation.toLocaleLowerCase(),
            };
        default:
            return state;
    }
}

// Action creators

export const setStationPlaylist: (stations: Service[]) => StationSetPlaylistAction = (stations) => ({
    type: SET_STATION_PLAYLIST,
    stations,
});

export const setStationsCurrentlyVisible: (stations: Service[]) => StationSetCurrentlyVisibleAction = (stations) => ({
    type: SET_STATIONS_CURRENTLY_VISIBLE,
    stations,
});

export const setActiveStation: (activeStation: Service) => StationsSetActiveAction = (activeStation) => ({
    type: SET_ACTIVE,
    activeStation,
});

export const setLoadingState: (loading: boolean) => StationsSetLoading = (loading) => ({
    type: SET_LOADING,
    loading,
});

export const setPausedState: (paused: boolean) => StationsSetPaused = (paused) => ({
    type: SET_PAUSED,
    paused,
});

export const setNextStation: () => Action<typeof SET_ACTIVE_NEXT> = () => ({
    type: SET_ACTIVE_NEXT,
});

export const setPreviousStation: () => Action<typeof SET_ACTIVE_PREVIOUS> = () => ({
    type: SET_ACTIVE_PREVIOUS,
});

export const setVolume: (volume: number) => StationsSetVolume = (volume) => ({
    type: SET_VOLUME,
    volume,
});

export const setError: (error: boolean) => StationsSetError = (error) => ({
    type: SET_ERROR,
    error,
});

export const setStationsVisibility: (searchedStation: string) => StationsSetVisibility = (searchedStation) => ({
    type: SET_VISIBILITY,
    searchedStation,
});

// Utilities
/**
 * Helper to set an active station. Takes as parameter a function that will return the new index based on the current one and sets the active
 * station from this new index.
 *
 * @param state: The state of the reducer.
 * @param updateFn: A function that takes the state of the reducer as parameter and returns a new index.
 */
const setActiveStationHelper = (state: StationsReducerState, updateFn: (state: StationsReducerState) => number) => {
    if (state.station_playlist.length === 0) {
        return state;
    }

    const index = updateFn(state);
    return {
        ...state,
        index,
        activeStation: state.station_playlist[index],
    };
};

/**
 * Gets the index of the currently active station. Returns -1 if the active station is null, does not exists in the station list or if the station
 * list is empty. Otherwise returns the index of the said station.
 * @param state: The state of the reducer.
 */
const getIndexFromActiveStation = (state: StationsReducerState) => {
    if (state.station_playlist.length === 0 || state.activeStation === null) {
        return -1;
    }

    const currentIndex = state.station_playlist
        .map((station) => getBearer(station.bearer).id)
        .indexOf(getBearer(state.activeStation.bearer).id);
    return currentIndex === -1 ? 0 : currentIndex;
};
