/**
 * Streams reducer. Stores the available streams that were recovered from radiodns and holds the information
 * about the currently played stream. This reducer uses the ducks-modular-redux pattern
 * (https://github.com/erikras/ducks-modular-redux).
 */
import {Action} from "redux";
import {AudioStreamData} from "../models/streams-models";

// Types
interface StreamsLoadAction extends Action<typeof LOAD> {
    streams: AudioStreamData[];
}

interface StreamsSetActiveAction extends Action<typeof SET_ACTIVE> {
    activeStream: AudioStreamData;
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

type StreamsActions = StreamsLoadAction
    | StreamsSetActiveAction
    | StreamsSetLoading
    | StreamsSetPaused
    | Action<typeof SET_ACTIVE_NEXT>
    | Action<typeof SET_ACTIVE_PREVIOUS>
    | StreamsSetVolume
    | StreamsSetError;

export interface StreamsReducerState {
    streams: AudioStreamData[];
    activeStream: AudioStreamData;
    loading: boolean;
    paused: boolean;
    index: number;
    volume: number; // [0, 1] float
    error: boolean;
}

export const STREAMS_REDUCER_DEFAULT_STATE: StreamsReducerState = {
    streams: [],
    activeStream: null,
    loading: true,
    paused: false,
    index: 0,
    volume: 1,
    error: false,
};

// Actions
const LOAD = "radiodns_react_native_technical_demo/streams/LOAD";
const SET_ACTIVE = "radiodns_react_native_technical_demo/streams/SET_ACTIVE";
const SET_LOADING = "radiodns_react_native_technical_demo/streams/SET_LOADING";
const SET_PAUSED = "radiodns_react_native_technical_demo/streams/SET_PAUSED";
const SET_ACTIVE_NEXT = "radiodns_react_native_technical_demo/streams/SET_ACTIVE_NEXT";
const SET_ACTIVE_PREVIOUS = "radiodns_react_native_technical_demo/streams/SET_ACTIVE_PREVIOUS";
const SET_VOLUME = "radiodns_react_native_technical_demo/streams/SET_VOLUME";
const SET_ERROR = "radiodns_react_native_technical_demo/streams/SET_ERROR";

// Reducer
const setNewIndexHelper = (state: StreamsReducerState, updateFn: (state: StreamsReducerState) => number) => {
    if (state.streams.length === 0) {
        return state;
    }

    const index = updateFn(state);
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
    const currentIndex = state.streams.map((stream) => stream.uri).indexOf(state.activeStream.uri);
    return currentIndex === -1 ? 0 : currentIndex;
};

export function reducer(state: StreamsReducerState = STREAMS_REDUCER_DEFAULT_STATE, action: StreamsActions): StreamsReducerState {
    switch (action.type) {
        case LOAD:
            return {...state, streams: Array.from(action.streams)};
        case SET_ACTIVE:
            return setNewIndexHelper({...state, activeStream: action.activeStream, error: false}, getIndexFromActive);
        case SET_LOADING:
            return {...state, loading: action.loading, error: false};
        case SET_PAUSED:
            return {...state, paused: action.paused};
        case SET_ACTIVE_NEXT:
            return setNewIndexHelper({...state, error: false}, (s) => s.index + 1 < s.streams.length ? s.index + 1 : 0);
        case SET_ACTIVE_PREVIOUS:
            return setNewIndexHelper({...state, error: false}, (s) => s.index - 1 >= 0 ? s.index - 1 : s.streams.length - 1);
        case SET_VOLUME:
            return {...state, volume: action.volume};
        case SET_ERROR:
            return {...state, error: action.error};
        default:
            return state;
    }
}

// Action creators
export const loadStreams: (streams: AudioStreamData[]) => StreamsLoadAction = (streams) => {
    return {
        type: LOAD,
        streams,
    };
};

export const setActiveStream: (activeStream: AudioStreamData) => StreamsSetActiveAction = (activeStream) => {
    return {
        type: SET_ACTIVE,
        activeStream,
    };
};

export const setStreamLoadingState: (loading: boolean) => StreamsSetLoading = (loading) => {
    return {
        type: SET_LOADING,
        loading,
    };
};

export const setStreamPausedState: (paused: boolean) => StreamsSetPaused = (paused) => {
    return {
        type: SET_PAUSED,
        paused,
    };
};

export const setNextStream: () => Action<typeof SET_ACTIVE_NEXT> = () => {
    return {
        type: SET_ACTIVE_NEXT,
    };
};

export const setPreviousStream: () => Action<typeof SET_ACTIVE_PREVIOUS> = () => {
    return {
        type: SET_ACTIVE_PREVIOUS,
    };
};

export const setVolumeStream: (volume: number) => StreamsSetVolume = (volume) => {
    return {
        type: SET_VOLUME,
        volume,
    };
};

export const setErrorStream: (error: boolean) => StreamsSetError = (error) => {
    return {
        type: SET_ERROR,
        error,
    };
};
