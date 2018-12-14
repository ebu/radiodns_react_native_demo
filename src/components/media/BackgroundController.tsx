import * as React from "react"
import MusicControl from "react-native-music-control";
import {Command} from "react-native-music-control/lib/types";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Stream} from "../../models/Stream";
import {RootReducerState} from "../../reducers/root-reducer";
import {
    setNextStream,
    setPreviousStream,
    setStreamLoadingState,
    setStreamPausedState,
    setVolumeStream,
} from "../../reducers/streams";
import {injectedFunctionInvoker} from "../../utilities";

interface Props {
    // injected props
    currentSteam?: Stream | null;
    paused?: boolean;
    loading?: boolean;
    volume?: number;
    setStreamPausedState?: (paused: boolean) => void;
    setStreamLoadingState?: (loading: boolean) => void;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
    setVolume?: (volume: number) => void;
}

class BackgroundControllerContainer extends React.Component<Props> {

    public componentDidMount() {
        MusicControl.enableControl("play", true);
        MusicControl.enableControl("pause", true);
        MusicControl.enableControl("nextTrack", true);
        MusicControl.enableControl("previousTrack", true);
        MusicControl.enableControl("volume", true);
        MusicControl.enableControl("closeNotification", true, {when: "always"});

        MusicControl.on(Command.play, () => {
            injectedFunctionInvoker(this.props.setStreamPausedState, false);
        });

        MusicControl.on(Command.pause, () => {
            injectedFunctionInvoker(this.props.setStreamPausedState, true);
        });

        MusicControl.on(Command.nextTrack, () => {
            injectedFunctionInvoker(this.props.onNextPressed);
        });

        MusicControl.on(Command.previousTrack, () => {
            injectedFunctionInvoker(this.props.onPreviousPressed);
        });

        MusicControl.on(Command.volume, (volume: number) => injectedFunctionInvoker(this.props.setVolume, volume));

        MusicControl.on(Command.closeNotification, () => {
            injectedFunctionInvoker(this.props.setStreamPausedState, true);
        })
    }

    public render() {
        return null;
    }
}

export const BackgroundController = connect(
    (state: RootReducerState) => ({
        currentSteam: state.streams.activeStream,
        paused: state.streams.paused,
        loading: state.streams.loading,
        volume: state.streams.volume,
    }),
    ((dispatch: Dispatch) => ({
        setStreamPausedState: (paused: boolean) => dispatch(setStreamPausedState(paused)),
        setStreamLoadingState: (loading: boolean) => dispatch(setStreamLoadingState(loading)),
        onPreviousPressed: () => dispatch(setPreviousStream()),
        onNextPressed: () => dispatch(setNextStream()),
        setVolume: (volume: number) => dispatch(setVolumeStream(volume)),
    })),
)(BackgroundControllerContainer);
