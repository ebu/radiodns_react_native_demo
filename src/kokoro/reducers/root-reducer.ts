import {combineReducers, createStore} from "redux";
import {reducer as serviceProvidersReducer, SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE, ServiceProvidersReducerState} from "./service-providers";
import {reducer as stationReducer, STATIONS_REDUCER_DEFAULT_STATE, StationsReducerState} from "./stations";

export interface RootReducerState {
    stations: StationsReducerState,
    serviceProviders: ServiceProvidersReducerState,
}

export const ROOT_REDUCER_INITIAL_STATE = {
    stations: STATIONS_REDUCER_DEFAULT_STATE,
    serviceProviders: SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE,
};

export const store = createStore(
    combineReducers<RootReducerState>({
        stations: stationReducer,
        serviceProviders: serviceProvidersReducer,
    }),
);
