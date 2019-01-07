import * as React from "react"
import MusicControl from "react-native-music-control";
import {Command} from "react-native-music-control/lib/types";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Station} from "../../models/Station";
import {RootReducerState} from "../../reducers/root-reducer";
import {setNextStation, setPausedState, setPreviousStation, setVolume} from "../../reducers/stations";

interface Props {
    // injected props
    currentSteam?: Station | null;
    paused?: boolean;
    loading?: boolean;
    volume?: number;
    setPausedState?: (paused: boolean) => void;
    setLoadingState?: (loading: boolean) => void;
    setNextStation?: () => void;
    setPreviousStation?: () => void;
    setVolume?: (volume: number) => void;
}

/**
 * Control notification listener. Will listen to commands made in the control notification an will dispatch redux actions accordingly.
 */
class BackgroundControllerContainer extends React.Component<Props> {

    public componentDidMount() {
        MusicControl.enableControl("play", true);
        MusicControl.enableControl("pause", true);
        MusicControl.enableControl("nextTrack", true);
        MusicControl.enableControl("previousTrack", true);
        MusicControl.enableControl("volume", true);
        MusicControl.enableControl("closeNotification", true, {when: "always"});

        MusicControl.on(Command.play, () => this.props.setPausedState!(false));

        MusicControl.on(Command.pause, () => this.props.setPausedState!(true));

        MusicControl.on(Command.nextTrack, this.props.setNextStation!);

        MusicControl.on(Command.previousTrack, this.props.setPreviousStation!);

        MusicControl.on(Command.volume, (volume: number) => this.props.setVolume!(volume));

        MusicControl.on(Command.closeNotification, () => this.props.setPausedState!(true));
    }

    public render() {
        return null;
    }
}

export const BackgroundController = connect(
    (state: RootReducerState) => ({
        currentSteam: state.stations.activeStation,
        paused: state.stations.paused,
        loading: state.stations.loading,
        volume: state.stations.volume,
    }),
    ((dispatch: Dispatch) => ({
        setPausedState: (paused: boolean) => dispatch(setPausedState(paused)),
        setNextStation: () => dispatch(setNextStation()),
        setPreviousStation: () => dispatch(setPreviousStation()),
        setVolume: (volume: number) => dispatch(setVolume(volume)),
    })),
)(BackgroundControllerContainer);
