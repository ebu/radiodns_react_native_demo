import {Action, createStore} from "redux";
import {
    SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE,
    ServiceProvidersReducerState,
} from "../kokoro/reducers/service-providers";
import {STATIONS_REDUCER_DEFAULT_STATE, StationsReducerState} from "../kokoro/reducers/stations";

export interface RootReducerState {
    stations: StationsReducerState,
    serviceProviders: ServiceProvidersReducerState,
}

const UPDATE_ROOT_REDUCER_STATE = "radiodns_react_native_technical_demo/service-providers/UPDATE_ROOT_REDUCER_STATE";

export interface RootReducerAction extends Action<typeof UPDATE_ROOT_REDUCER_STATE> {
    state: RootReducerState;
}

export const updateGlobalState: (state: RootReducerState) => RootReducerAction = (state) => ({
    type: UPDATE_ROOT_REDUCER_STATE,
    state,
});

const ROOT_REDUCER_INITIAL_STATE = {
    stations: STATIONS_REDUCER_DEFAULT_STATE,
    serviceProviders: SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE,
};

function reducer(state: RootReducerState = ROOT_REDUCER_INITIAL_STATE, action: RootReducerAction): RootReducerState {
    switch (action.type) {
        case UPDATE_ROOT_REDUCER_STATE:
            return {...action.state};
        default:
            return state;
    }
}

export const store = createStore(
    reducer,
    ROOT_REDUCER_INITIAL_STATE,
);
