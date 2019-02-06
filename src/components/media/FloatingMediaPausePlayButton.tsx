import * as React from "react";
import {ActivityIndicator} from "react-native";
import ActionButton from "react-native-action-button";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_DANGER, COLOR_PRIMARY} from "../../colors";
import {setNextStation, setPausedState, setPreviousStation} from "../../kokoro/reducers/stations";
import {dispatch} from "../../native-modules/Kokoro";
import {RootReducerState} from "../../reducers/slave-reducer";

interface Props {
    // injected
    activeStation?: Service | null;
    loading?: boolean;
    paused?: boolean;
    error?: boolean;
    setPausedState?: (paused: boolean) => void;
    setNextStation?: () => void;
    setPreviousStation?: () => void;
}

class FloatingMediaControlsButtonContainer extends React.Component<Props> {

    public render() {
        if (!this.props.activeStation) {
            return null;
        }
        return (
            <ActionButton buttonColor="rgba(231,76,60,1)" autoInactive={false}>
                <ActionButton.Item buttonColor="#3498db" onPress={this.props.setPreviousStation}>
                    <Icon name="skip-next" size={22} color={COLOR_PRIMARY}/>
                </ActionButton.Item>
                <ActionButton.Item buttonColor="#3498db" onPress={this.props.setNextStation}>
                    <Icon name="skip-previous" size={22} color={COLOR_PRIMARY}/>
                </ActionButton.Item>
                <ActionButton.Item
                    buttonColor={this.props.error ? COLOR_DANGER : this.props.paused ? "#1abc9c" : "#3498db"}
                    onPress={this.onPlayPausePressed}
                    title={this.props.activeStation
                        ? this.props.error
                            ? "Failed to read the station's stream!"
                            : `Listening to ${this.props.activeStation.mediumName}`
                        : ""}
                >
                    {!this.props.loading && !this.props.error &&
                    <Icon name={this.props.paused ? "chevron-right" : "pause"} size={22} color={COLOR_PRIMARY}/>}
                    {!this.props.loading && this.props.error &&
                    <Icon name="error" size={22} color={COLOR_PRIMARY}/>}
                    {this.props.loading && !this.props.error &&
                    <ActivityIndicator size="large" style={{width: 80, height: 80}} color={COLOR_PRIMARY}/>}
                </ActionButton.Item>
            </ActionButton>
        );
    }

    private onPlayPausePressed = () => {
        if (!this.props.loading) {
            this.props.setPausedState!(!this.props.paused);
        }
    }
}

export const FloatingMediaControlsButton = connect(
    (state: RootReducerState) => ({
        activeStation: state.stations.activeStation,
        paused: state.stations.paused,
        loading: state.stations.loading,
        error: state.stations.error,
    }),
    (() => ({
        setPausedState: (paused: boolean) => dispatch(setPausedState(paused)),
        setNextStation: () => dispatch(setNextStation()),
        setPreviousStation: () => dispatch(setPreviousStation()),
    })),
)(FloatingMediaControlsButtonContainer);
