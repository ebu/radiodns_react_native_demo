import {Action} from "redux";
import {SPICacheContainer} from "../services/SPICache";

// Types
interface ServiceProvidersSetAction extends Action<typeof SET_SERVICE_PROVIDERS> {
    serviceProviders: SPICacheContainer[];
}

type ServiceProvidersActions = ServiceProvidersSetAction;

export interface ServiceProvidersReducerState {
    serviceProviders: SPICacheContainer[];
}

// Actions
const SET_SERVICE_PROVIDERS = "radiodns_react_native_technical_demo/kokoro/service-providers/SET_SERVICE_PROVIDERS";

// Reducer
export const SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE: ServiceProvidersReducerState = {
    serviceProviders: [],
};

export function reducer(state: ServiceProvidersReducerState = SERVICE_PROVIDERS_REDUCER_DEFAULT_STATE,
                        action: ServiceProvidersActions): ServiceProvidersReducerState {
    switch (action.type) {
        case SET_SERVICE_PROVIDERS:
            return {...state, serviceProviders: Array.from(action.serviceProviders)};
        default:
            return state;
    }
}

// Action creators
export const setServiceProviders: (serviceProviders: SPICacheContainer[]) => ServiceProvidersSetAction = (serviceProviders) => ({
    type: SET_SERVICE_PROVIDERS,
    serviceProviders,
});
