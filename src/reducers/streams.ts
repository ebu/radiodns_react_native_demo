import MusicControl from "react-native-music-control";

/**
 * Streams reducer. Stores the available streams that were recovered from radiodns and holds the information
 * about the currently played stream. This reducer uses the ducks-modular-redux pattern
 * (https://github.com/erikras/ducks-modular-redux).
 */
import {Action} from "redux";
import {Stream} from "../models/Stream";
import {displayAudioPlayerNotifControl, injectedPropReader} from "../utilities";

// Types
interface StreamsLoadAction extends Action<typeof FETCH_SERVICES_SUCCESS> {
    streams: Stream[];
}

interface StreamsSetActiveAction extends Action<typeof SET_ACTIVE> {
    activeStream: Stream;
}

interface StreamsSetLoading extends Action<typeof SET_LOADING> {
    loading: boolean;
}

interface StreamsSetPaused extends Action<typeof SET_PAUSED> {
    paused: boolean;
}

interface StreamsSetError extends Action<typeof SET_ERROR> {
    error: boolean;
}

interface StreamsSetVolume extends Action<typeof SET_VOLUME> {
    volume: number;
}

interface StreamsSetVisibility extends Action<typeof SET_VISIBILITY> {
    searchedStream: string;
}

type StreamsActions = Action<typeof GET_SERVICES>
    | StreamsLoadAction
    | Action<typeof FETCH_SERVICES_FAILURE>
    | StreamsSetActiveAction
    | StreamsSetLoading
    | StreamsSetPaused
    | Action<typeof SET_ACTIVE_NEXT>
    | Action<typeof SET_ACTIVE_PREVIOUS>
    | StreamsSetVolume
    | StreamsSetVisibility
    | StreamsSetError;

export interface StreamsReducerState {
    streams: Stream[];
    loadingStreamsState: "LOADING" | "ERROR" | "SUCCESS";
    activeStream: Stream | null;
    loading: boolean;
    paused: boolean;
    index: number;
    volume: number; // [0, 1] float
    error: boolean;
    searchedStream: string;
}

// Actions
const GET_SERVICES = "radiodns_react_native_technical_demo/streams/GET_SERVICES";
const FETCH_SERVICES_SUCCESS = "radiodns_react_native_technical_demo/streams/FETCH_SERVICES_SUCCESS";
const FETCH_SERVICES_FAILURE = "radiodns_react_native_technical_demo/streams/FETCH_SERVICES_FAILURE";
const SET_ACTIVE = "radiodns_react_native_technical_demo/streams/SET_ACTIVE";
const SET_LOADING = "radiodns_react_native_technical_demo/streams/SET_LOADING";
const SET_PAUSED = "radiodns_react_native_technical_demo/streams/SET_PAUSED";
const SET_ACTIVE_NEXT = "radiodns_react_native_technical_demo/streams/SET_ACTIVE_NEXT";
const SET_ACTIVE_PREVIOUS = "radiodns_react_native_technical_demo/streams/SET_ACTIVE_PREVIOUS";
const SET_VOLUME = "radiodns_react_native_technical_demo/streams/SET_VOLUME";
const SET_ERROR = "radiodns_react_native_technical_demo/streams/SET_ERROR";
const SET_VISIBILITY = "radiodns_react_native_technical_demo/streams/SET_VISIBILITY";

// Reducer

export const STREAMS_REDUCER_DEFAULT_STATE: StreamsReducerState = {
    streams: [],
    loadingStreamsState: "LOADING",
    activeStream: null,
    loading: true,
    paused: false,
    index: 0,
    volume: 1,
    error: false,
    searchedStream: "",
};

// TODO add catch to prevent parsing errors form crashing the app.
export function reducer(state: StreamsReducerState = STREAMS_REDUCER_DEFAULT_STATE, action: StreamsActions): StreamsReducerState {
    switch (action.type) {
        case GET_SERVICES:
            return {...state, loadingStreamsState: "LOADING"};
        case FETCH_SERVICES_SUCCESS:
            return {...state, loadingStreamsState: "SUCCESS", streams: Array.from(action.streams), searchedStream: ""};
        case FETCH_SERVICES_FAILURE:
            return {...state, loadingStreamsState: "ERROR"};
        case SET_ACTIVE:
            return setNewIndexHelper({...state, activeStream: action.activeStream, error: false}, getIndexFromActive);
        case SET_LOADING:
            if (!state.error) {
                MusicControl.updatePlayback({
                    state: action.loading ? MusicControl.STATE_BUFFERING : MusicControl.STATE_PLAYING,
                });
            }
            return {...state, loading: action.loading, error: false};
        case SET_PAUSED:
            if (!state.error) {
                displayAudioPlayerNotifControl(injectedPropReader(state.activeStream));
                MusicControl.updatePlayback({
                    state: action.paused ? MusicControl.STATE_PAUSED : MusicControl.STATE_PLAYING,
                });
            }
            return {...state, paused: action.paused};
        case SET_ACTIVE_NEXT:
            return setNewIndexHelper({
                ...state,
                error: false,
            }, (s) => s.index - 1 >= 0 ? s.index - 1 : s.streams.length - 1);
        case SET_ACTIVE_PREVIOUS:
            return setNewIndexHelper({...state, error: false}, (s) => s.index + 1 < s.streams.length ? s.index + 1 : 0);
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
                searchedStream: action.searchedStream.toLocaleLowerCase(),
            };
        default:
            return state;
    }
}

const setNewIndexHelper = (state: StreamsReducerState, updateFn: (state: StreamsReducerState) => number) => {
    if (state.streams.length === 0) {
        return state;
    }

    const index = updateFn(state);
    if (!state.error) {
        displayAudioPlayerNotifControl(state.streams[index]);
    }
    return {
        ...state,
        index,
        activeStream: state.streams[index],
    };
};

const getIndexFromActive = (state: StreamsReducerState) => {
    if (state.activeStream === null) {
        return state.index;
    }
    const currentIndex = state.streams
        .filter((stream) => stream.bearer !== undefined)
        .map((stream) => stream.bearer.id).indexOf(state.activeStream.bearer.id);
    return currentIndex === -1 ? 0 : currentIndex;
};

// Action creators
export const streamsLoading: () => Action<typeof GET_SERVICES> = () => ({
    type: GET_SERVICES,
});

export const loadStreams: (streams: Stream[]) => StreamsLoadAction = (streams) => ({
    type: FETCH_SERVICES_SUCCESS,
    streams,
});

export const loadStreamsFailed: () => Action<typeof FETCH_SERVICES_FAILURE> = () => ({
    type: FETCH_SERVICES_FAILURE,
});

export const setActiveStream: (activeStream: Stream) => StreamsSetActiveAction = (activeStream) => ({
    type: SET_ACTIVE,
    activeStream,
});

export const setStreamLoadingState: (loading: boolean) => StreamsSetLoading = (loading) => ({
    type: SET_LOADING,
    loading,
});

export const setStreamPausedState: (paused: boolean) => StreamsSetPaused = (paused) => ({
    type: SET_PAUSED,
    paused,
});

export const setNextStream: () => Action<typeof SET_ACTIVE_NEXT> = () => ({
    type: SET_ACTIVE_NEXT,
});

export const setPreviousStream: () => Action<typeof SET_ACTIVE_PREVIOUS> = () => ({
    type: SET_ACTIVE_PREVIOUS,
});

export const setVolumeStream: (volume: number) => StreamsSetVolume = (volume) => ({
    type: SET_VOLUME,
    volume,
});

export const setErrorStream: (error: boolean) => StreamsSetError = (error) => ({
    type: SET_ERROR,
    error,
});

export const setStreamsVisibility: (searchedStream: string) => StreamsSetVisibility = (searchedStream) => ({
    type: SET_VISIBILITY,
    searchedStream,
});
