import * as React from "react"
import {DeviceEventEmitter} from "react-native";
import MusicControl from "react-native-music-control";
import {Command} from "react-native-music-control/lib/types";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Station} from "../../models/Station";
import {RootReducerState} from "../../reducers/root-reducer";
import {
    setActiveStation,
    setNextStation,
    setPausedState,
    setPreviousStation,
    setStationPlaylist,
    setVolume,
} from "../../reducers/stations";
import {SPICacheContainer} from "../../services/SPICache";

interface Props {
    // injected props
    serviceProviders?: SPICacheContainer[];
    currentSteam?: Station | null;
    paused?: boolean;
    loading?: boolean;
    volume?: number;
    setPausedState?: (paused: boolean) => void;
    setLoadingState?: (loading: boolean) => void;
    setNextStation?: () => void;
    setPreviousStation?: () => void;
    setVolume?: (volume: number) => void;
    setStationPlaylist?: (stations: Station[]) => void;
    setActiveStation?: (activeStation: Station) => void;
}

/**
 * Control notification listener. Will listen to commands made in the control notification an will dispatch redux actions accordingly.
 */
class BackgroundControllerContainer extends React.Component<Props> {

    public componentDidMount() {
        // SETUP MUSIC CONTROLS
        MusicControl.enableControl("play", true);
        MusicControl.enableControl("pause", true);
        MusicControl.enableControl("nextTrack", true);
        MusicControl.enableControl("previousTrack", true);
        MusicControl.enableControl("volume", true);
        MusicControl.enableControl("closeNotification", true, {when: "always"});

        MusicControl.on(Command.play, () => this.props.setPausedState!(false));
        MusicControl.on(Command.pause, () => this.props.setPausedState!(true));
        MusicControl.on(Command.nextTrack, this.props.setPreviousStation!);
        MusicControl.on(Command.previousTrack, this.props.setNextStation!);
        MusicControl.on(Command.volume, (volume: number) => this.props.setVolume!(volume));
        MusicControl.on(Command.closeNotification, () => this.props.setPausedState!(true));

        // SETUP AUTO CONTROLS
        DeviceEventEmitter.addListener("updateState", (e: {
            STATE: "PLAYING" | "PAUSED" | "STOPPED" | "PREVIOUS" | "NEXT",
            CHANNEL_ID: string,
        }) => {
            switch (e.STATE) {
                case "PLAYING":
                    const stationGroup = this.props.serviceProviders!
                        .map((spiCache) => spiCache.stations)
                        .filter((stations) => stations !== undefined)
                        .reduce((prev, current) => current!.filter((station) =>
                            station.bearer.id === e.CHANNEL_ID).length > 0
                            ? current
                            : prev
                            , []);
                    this.props.setStationPlaylist!(stationGroup!);
                    this.props.setActiveStation!(stationGroup!.reduce((prev, current) =>
                        current.bearer.id === e.CHANNEL_ID
                            ? current
                            : prev));
                    break;
                case "STOPPED":
                case "PAUSED":
                    this.props.setPausedState!(true);
                    break;
                case "PREVIOUS":
                    this.props.setNextStation!();
                    break;
                case "NEXT":
                    this.props.setPreviousStation!();
                    break;
                default:
                    console.warn("UNSUPPORTED COMMAND FROM ANDROID AUTO:", e.STATE);
            }
        });
    }

    public render() {
        return null;
    }
}

export const BackgroundController = connect(
    (state: RootReducerState) => ({
        serviceProviders: state.serviceProviders.serviceProviders,
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
        setStationPlaylist: (stations: Station[]) => dispatch(setStationPlaylist(stations)),
        setActiveStation: (station: Station) => dispatch(setActiveStation(station)),
    })),
)(BackgroundControllerContainer);
