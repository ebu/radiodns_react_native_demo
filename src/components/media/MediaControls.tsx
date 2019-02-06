import * as React from "react"
import {ActivityIndicator, View} from "react-native";
import {connect} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../../colors";
import {setPausedState} from "../../kokoro/reducers/stations";
import {dispatch} from "../../native-modules/Kokoro";
import {RootReducerState} from "../../reducers/slave-reducer";
import {IconButton} from "../buttons/IconButton";
import {MediaPlayNextButton} from "../buttons/MediaPlayNextButton";
import {MediaPlayPreviousButton} from "../buttons/MediaPlayPreviousButton";

interface Props {
    // injected props
    currentSteam?: Service | null;
    paused?: boolean;
    loading?: boolean;
    setPausedState?: (paused: boolean) => void;
}

/**
 * Control bar for the player with a previous, pause/play and next button. Ready to use as it is.
 */
class MediaControlsContainer extends React.Component<Props> {

    public render() {
        return (
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <MediaPlayNextButton color={COLOR_SECONDARY} backgroundColor={COLOR_PRIMARY}/>
                <View style={{flex: 0.1}}/>
                {!this.props.loading && <IconButton
                    big
                    withBorder
                    iconName={this.props.paused ? "chevron-right" : "pause"}
                    color={COLOR_SECONDARY}
                    backgroundColor={COLOR_PRIMARY}
                    onPress={this.onPausePlayButtonPress}
                />}
                {this.props.loading &&
                <ActivityIndicator size="large" style={{width: 80, height: 80}} color={COLOR_SECONDARY}/>}
                <View style={{flex: 0.1}}/>
                <MediaPlayPreviousButton color={COLOR_SECONDARY} backgroundColor={COLOR_PRIMARY}/>
            </View>
        );
    }

    private onPausePlayButtonPress = () => {
        const paused = !this.props.paused;
        this.props.setPausedState!(paused);
    };
}

export const MediaControls = connect(
    (state: RootReducerState) => ({
        currentSteam: state.stations.activeStation,
        paused: state.stations.paused,
        loading: state.stations.loading,
    }),
    (() => ({
        setPausedState: (paused: boolean) => dispatch(setPausedState(paused)),
    })),
)(MediaControlsContainer);
