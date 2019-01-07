import MusicControl from "react-native-music-control";
import {Action} from "redux";
import {Station} from "../models/Station";
import {displayAudioPlayerNotifControl} from "../utilities";

/**
 * Stations reducer. Stores the available stations that were recovered from radiodns and holds the information
 * about the currently played station.
 */

// Types
interface StationsLoadAction extends Action<typeof FETCH_SERVICES_SUCCESS> {
    stations: Station[];
}

interface StationsSetActiveAction extends Action<typeof SET_ACTIVE> {
    activeStation: Station;
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

type StationsActions = Action<typeof GET_SERVICES>
    | StationsLoadAction
    | Action<typeof FETCH_SERVICES_FAILURE>
    | StationsSetActiveAction
    | StationsSetLoading
    | StationsSetPaused
    | Action<typeof SET_ACTIVE_NEXT>
    | Action<typeof SET_ACTIVE_PREVIOUS>
    | StationsSetVolume
    | StationsSetVisibility
    | StationsSetError;

export interface StationsReducerState {
    stations: Station[];
    loadingStationsState: "LOADING" | "ERROR" | "SUCCESS";
    activeStation: Station | null;
    loading: boolean;
    paused: boolean;
    index: number;
    volume: number; // [0, 1] float
    error: boolean;
    searchedStation: string;
}

// Actions
const GET_SERVICES = "radiodns_react_native_technical_demo/stations/GET_SERVICES";
const FETCH_SERVICES_SUCCESS = "radiodns_react_native_technical_demo/stations/FETCH_SERVICES_SUCCESS";
const FETCH_SERVICES_FAILURE = "radiodns_react_native_technical_demo/stations/FETCH_SERVICES_FAILURE";
const SET_ACTIVE = "radiodns_react_native_technical_demo/stations/SET_ACTIVE";
const SET_LOADING = "radiodns_react_native_technical_demo/stations/SET_LOADING";
const SET_PAUSED = "radiodns_react_native_technical_demo/stations/SET_PAUSED";
const SET_ACTIVE_NEXT = "radiodns_react_native_technical_demo/stations/SET_ACTIVE_NEXT";
const SET_ACTIVE_PREVIOUS = "radiodns_react_native_technical_demo/stations/SET_ACTIVE_PREVIOUS";
const SET_VOLUME = "radiodns_react_native_technical_demo/stations/SET_VOLUME";
const SET_ERROR = "radiodns_react_native_technical_demo/stations/SET_ERROR";
const SET_VISIBILITY = "radiodns_react_native_technical_demo/stations/SET_VISIBILITY";

// Reducer
export const STATIONS_REDUCER_DEFAULT_STATE: StationsReducerState = {
    stations: [],
    loadingStationsState: "LOADING",
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
        case GET_SERVICES:
            return {...state, loadingStationsState: "LOADING"};
        case FETCH_SERVICES_SUCCESS:
            return {...state, loadingStationsState: "SUCCESS", stations: Array.from(action.stations), searchedStation: ""};
        case FETCH_SERVICES_FAILURE:
            return {...state, loadingStationsState: "ERROR"};
        case SET_ACTIVE:
            return setActiveStationHelper({...state, activeStation: action.activeStation, error: false}, getIndexFromActiveStation);
        case SET_LOADING:
            if (!state.error) {
                MusicControl.updatePlayback({
                    state: action.loading ? MusicControl.STATE_BUFFERING : MusicControl.STATE_PLAYING,
                });
            }
            return {...state, loading: action.loading, error: false};
        case SET_PAUSED:
            if (!state.error) {
                displayAudioPlayerNotifControl(state.activeStation);
                MusicControl.updatePlayback({
                    state: action.paused ? MusicControl.STATE_PAUSED : MusicControl.STATE_PLAYING,
                });
            }
            return {...state, paused: action.paused};
        case SET_ACTIVE_NEXT:
            return setActiveStationHelper({
                ...state,
                error: false,
            }, (s) => s.index - 1 >= 0 ? s.index - 1 : s.stations.length - 1);
        case SET_ACTIVE_PREVIOUS:
            return setActiveStationHelper({...state, error: false}, (s) => s.index + 1 < s.stations.length ? s.index + 1 : 0);
        case SET_VOLUME:
            return {...state, volume: action.volume};
        case SET_ERROR:
            MusicControl.updatePlayback({
                state: MusicControl.STATE_ERROR,
            });
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
export const stationsLoading: () => Action<typeof GET_SERVICES> = () => ({
    type: GET_SERVICES,
});

export const loadStations: (stations: Station[]) => StationsLoadAction = (stations) => ({
    type: FETCH_SERVICES_SUCCESS,
    stations,
});

export const loadStationsFailed: () => Action<typeof FETCH_SERVICES_FAILURE> = () => ({
    type: FETCH_SERVICES_FAILURE,
});

export const setActiveStation: (activeStation: Station) => StationsSetActiveAction = (activeStation) => ({
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
    if (state.stations.length === 0) {
        return state;
    }

    const index = updateFn(state);
    if (!state.error) {
        displayAudioPlayerNotifControl(state.stations[index]);
    }
    return {
        ...state,
        index,
        activeStation: state.stations[index],
    };
};

/**
 * Gets the index of the currently active station. Returns -1 if the active station is null, does not exists in the station list or if the station
 * list is empty. Otherwise returns the index of the said station.
 * @param state: The state of the reducer.
 */
const getIndexFromActiveStation = (state: StationsReducerState) => {
    if (state.stations.length === 0 || state.activeStation === null) {
        return -1;
    }

    const currentIndex = state.stations
        .map((station) => station.bearer.id)
        .indexOf(state.activeStation.bearer.id);
    return currentIndex === -1 ? 0 : currentIndex;
};
