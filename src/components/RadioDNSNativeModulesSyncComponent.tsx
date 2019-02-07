import * as React from "react"
import {DeviceEventEmitter} from "react-native";
import {connect} from "react-redux";
import {RootReducerState, updateGlobalState} from "../reducers/slave-reducer";

interface Props {
    // injected props
    updateGlobalState?: (state: RootReducerState) => void;
}

/**
 * Control notification listener. Will listen to commands made in the control notification an will dispatch redux actions accordingly.
 */
class RadioDNSNativeModulesSyncComponentReduxListener extends React.Component<Props> {

    public componentDidMount() {
        DeviceEventEmitter.addListener("update_state", (event) => {
            this.props.updateGlobalState!(JSON.parse(event.state));
        });
    }

    public render() {
        return null;
    }
}

export const RadioDNSNativeModulesSyncComponent = connect(
    (state: RootReducerState) => ({
        serviceProviders: state.serviceProviders.serviceProviders,
        activeStation: state.stations.activeStation,
        paused: state.stations.paused,
        loading: state.stations.loading,
        error: state.stations.error,
        volume: state.stations.volume,
    }),
    ((disp) => ({
        updateGlobalState: (state: RootReducerState) => disp(updateGlobalState(state)),
    })),
)(RadioDNSNativeModulesSyncComponentReduxListener);
