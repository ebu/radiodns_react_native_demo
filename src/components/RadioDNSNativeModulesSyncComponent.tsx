import * as React from "react"
import {DeviceEventEmitter} from "react-native";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Station} from "../models/Station";
import * as RadioDNSAuto from "../native-modules/RadioDNSAuto";
import {Event, Signal} from "../native-modules/RadioDNSAuto";
import RadioDNSControlNotification from "../native-modules/RadioDNSControlNotification";
import RadioDNSExitApp from "../native-modules/RadioDNSExitApp";
import {RootReducerState} from "../reducers/root-reducer";
import {
    setActiveStation,
    setNextStation,
    setPausedState,
    setPreviousStation,
    setStationPlaylist,
    setVolume,
} from "../reducers/stations";
import {SPICacheContainer} from "../services/SPICache";
import {commonWords, getMedia, shuffleArray} from "../utilities";

interface Props {
    // injected props
    serviceProviders?: SPICacheContainer[];
    activeStation?: Station | null;
    paused?: boolean;
    loading?: boolean;
    error?: boolean;
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
class RadioDNSNativeModulesSyncComponentReduxListener extends React.Component<Props> {

    public componentDidMount() {
        DeviceEventEmitter.addListener(Event.UPDATE_STATE, (e: {
            STATE: "PLAYING" | "PAUSED" | "STOPPED" | "PREVIOUS" | "NEXT",
            CHANNEL_ID?: string,
        }) => {
            switch (e.STATE) {
                case "PLAYING":
                    if (e.CHANNEL_ID) {
                        this.playFromId(e.CHANNEL_ID);
                    } else {
                        this.props.setPausedState!(false);
                    }
                    break;
                case "STOPPED":
                    RadioDNSExitApp.exitApp();
                    break;
                case "PAUSED":
                    console.log("PAUSE");
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

        DeviceEventEmitter.addListener(Event.PLAY_FROM_SEARCH_STRING, (e: { SEARCH_STRING: string }) => {
            if (!this.props.serviceProviders || this.props.serviceProviders.length === 0) {
                return;
            }
            const potentialStations = this.props.serviceProviders
                .reduce((acc, spiCache) => acc.concat(spiCache.stations!), [] as Station[])
                .map((station) => ({
                    id: station.bearer.id,
                    score: commonWords(station.shortName, e.SEARCH_STRING) + commonWords(station.mediumName, e.SEARCH_STRING)
                        + commonWords(station.longName, e.SEARCH_STRING),
                }))
                .sort((a, b) => b.score - a.score);
            this.playFromId(potentialStations[0].id!);
        });

        DeviceEventEmitter.addListener(Event.PLAY_RANDOM, () => {
            const scrambledArray = shuffleArray(this.props.serviceProviders!
                .filter((cacheContainer) => cacheContainer.stations !== undefined)
                .reduce((acc, cacheContainer) => acc!.concat(cacheContainer.stations!), [] as Station[])
                .map((stations) => stations.bearer.id));
            this.playFromId(scrambledArray[0]);
        })
    }

    public componentDidUpdate(prevProps: Readonly<Props>): void {
        if (prevProps.activeStation !== this.props.activeStation && !!this.props.activeStation) {
            const {mediumName, stationLogos} = this.props.activeStation;
            RadioDNSControlNotification.prepareNotification(mediumName, "", getMedia(stationLogos));
        }

        if (this.props.activeStation !== null) {
            const {loading, error, paused} = this.props;
            RadioDNSControlNotification.displayNotification(!loading && !error && !paused);
        }

        if (prevProps.loading !== this.props.loading) {
            RadioDNSAuto.default.sendSignal(
                this.props.loading
                    ? Signal.UPDATE_MEDIA_STATE_TO_BUFFERING
                    : Signal.UPDATE_MEDIA_STATE_TO_PLAYING,
            );
        }

        if (!prevProps.error && this.props.error) {
            RadioDNSAuto.default.sendSignal(Signal.UPDATE_MEDIA_STATE_TO_ERROR);
        }
    }

    public render() {
        return null;
    }

    private playFromId(channelId: string) {
        const stationGroup = this.props.serviceProviders!
            .map((spiCache) => spiCache.stations)
            .filter((stations) => stations !== undefined)
            .reduce((prev, current) => current!.filter((station) =>
                station.bearer.id === channelId).length > 0
                ? current
                : prev
                , []);
        this.props.setStationPlaylist!(stationGroup!);
        this.props.setActiveStation!(stationGroup!.reduce((prev, current) =>
            current.bearer.id === channelId
                ? current
                : prev));
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
    ((dispatch: Dispatch) => ({
        setPausedState: (paused: boolean) => dispatch(setPausedState(paused)),
        setNextStation: () => dispatch(setNextStation()),
        setPreviousStation: () => dispatch(setPreviousStation()),
        setVolume: (volume: number) => dispatch(setVolume(volume)),
        setStationPlaylist: (stations: Station[]) => dispatch(setStationPlaylist(stations)),
        setActiveStation: (station: Station) => dispatch(setActiveStation(station)),
    })),
)(RadioDNSNativeModulesSyncComponentReduxListener);
