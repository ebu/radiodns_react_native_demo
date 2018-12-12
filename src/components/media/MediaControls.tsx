import * as React from "react"
import {ActivityIndicator, View} from "react-native";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AudioStreamData} from "../../models/streams-models";
import {RootReducerState} from "../../reducers/root-reducer";
import {setStreamPausedState} from "../../reducers/streams";
import {cancelAudioPlayerNotifControl, displayAudioPlayerNotifControl} from "../../services/LNP";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../../styles";
import {IconButton} from "../buttons/IconButton";
import {MediaPlayNextButton} from "../buttons/MediaPlayNextButton";
import {MediaPlayPreviousButton} from "../buttons/MediaPlayPreviousButton";

interface Props {
    // injected props
    currentSteam?: AudioStreamData;
    paused?: boolean;
    loading?: boolean;
    setStreamPausedState?: (paused: boolean) => void;
}

class MediaControlsContainer extends React.Component<Props> {

    public render() {
        return (
            <>
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
            </>
        );
    }

    // PLAYER IMPLEMENTATION METHODS
    private onPausePlayButtonPress = () => {
        const paused = !this.props.paused;
        paused
            ? cancelAudioPlayerNotifControl()
            : this.updateControlNotif();
        this.props.setStreamPausedState(paused);
    };

    private updateControlNotif = () => {
        const {stationName}: AudioStreamData = this.props.currentSteam;
        displayAudioPlayerNotifControl(stationName);
    };
}

export const MediaControls = connect(
    (state: RootReducerState) => ({
        currentSteam: state.streams.activeStream,
        paused: state.streams.paused,
        loading: state.streams.loading,
    }),
    ((dispatch: Dispatch) => ({
        setStreamPausedState: (paused: boolean) => dispatch(setStreamPausedState(paused)),
    })),
)(MediaControlsContainer);
