import {combineReducers} from "redux";
import {reducer as streamReducer, STREAMS_REDUCER_DEFAULT_STATE, StreamsReducerState} from "./streams";

export interface RootReducerState {
    streams: StreamsReducerState,
}

export const ROOT_REDUCER_INITIAL_STATE = {
    streams: STREAMS_REDUCER_DEFAULT_STATE,
};

export const rootReducer = combineReducers<RootReducerState>({
    streams: streamReducer,
});
