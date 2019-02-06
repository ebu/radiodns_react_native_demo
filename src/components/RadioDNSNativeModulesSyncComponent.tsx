import * as React from "react"
import {DeviceEventEmitter} from "react-native";
import {connect} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {
    setActiveStation,
    setNextStation,
    setPausedState,
    setPreviousStation,
    setStationPlaylist,
    setVolume,
} from "../kokoro/reducers/stations";
import {dispatch} from "../native-modules/Kokoro";
import RadioDNSAuto from "../native-modules/RadioDNSAuto";
import {Event, Signal} from "../native-modules/RadioDNSAuto";
import RadioDNSControlNotification from "../native-modules/RadioDNSControlNotification";
import RadioDNSExitApp from "../native-modules/RadioDNSExitApp";
import {RootReducerState, updateGlobalState} from "../reducers/slave-reducer";
import {SPICacheContainer} from "../services/SPICache";
import {commonWords, getBearer, getMedia, shuffleArray} from "../utilities";

interface Props {
    // injected props
    serviceProviders?: SPICacheContainer[];
    activeStation?: Service | null;
    paused?: boolean;
    loading?: boolean;
    error?: boolean;
    volume?: number;
    setPausedState?: (paused: boolean) => void;
    setLoadingState?: (loading: boolean) => void;
    setNextStation?: () => void;
    setPreviousStation?: () => void;
    setVolume?: (volume: number) => void;
    setStationPlaylist?: (stations: Service[]) => void;
    setActiveStation?: (activeStation: Service) => void;
    updateGlobalState?: (state: RootReducerState) => void;
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
            const result = this.props.serviceProviders
                .reduce((acc, spiCache) => acc.concat(spiCache.stations!), [] as Service[])
                .map((station) => ({
                    id: getBearer(station.bearer).id,
                    score: commonWords(station.shortName || "", e.SEARCH_STRING) + commonWords(station.mediumName || "", e.SEARCH_STRING)
                        + commonWords(station.longName || "", e.SEARCH_STRING),
                }))
                .sort((a, b) => b.score - a.score)[0];
            this.playFromId(result.id);
            RadioDNSAuto.updateChannelId(result.id);
        });

        DeviceEventEmitter.addListener(Event.PLAY_RANDOM, () => {
            const scrambledArray = shuffleArray(this.props.serviceProviders!
                .filter((cacheContainer) => cacheContainer.stations !== undefined)
                .reduce((acc, cacheContainer) => acc!.concat(cacheContainer.stations!), [] as Service[])
                .map((stations) => getBearer(stations.bearer).id));
            this.playFromId(scrambledArray[0]);
        });

        DeviceEventEmitter.addListener("update_state", (event) => {
            this.props.updateGlobalState!(JSON.parse(event.state));
        });
    }

    public componentDidUpdate(prevProps: Readonly<Props>): void {
        if (prevProps.activeStation !== this.props.activeStation && !!this.props.activeStation) {
            const {mediumName, mediaDescription} = this.props.activeStation;
            RadioDNSControlNotification.prepareNotification(mediumName || "", "", getMedia(mediaDescription));
        }

        if (this.props.activeStation !== null) {
            const {loading, error, paused} = this.props;
            RadioDNSControlNotification.displayNotification(!loading && !error && !paused);
        }

        if (prevProps.loading !== this.props.loading) {
            RadioDNSAuto.sendSignal(
                this.props.loading
                    ? Signal.UPDATE_MEDIA_STATE_TO_BUFFERING
                    : Signal.UPDATE_MEDIA_STATE_TO_PLAYING,
            );
        }

        if (!prevProps.error && this.props.error) {
            RadioDNSAuto.sendSignal(Signal.UPDATE_MEDIA_STATE_TO_ERROR);
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
                getBearer(station.bearer).id === channelId).length > 0
                ? current
                : prev
                , []);
        this.props.setStationPlaylist!(stationGroup!);
        this.props.setActiveStation!(stationGroup!.reduce((prev, current) =>
            getBearer(current.bearer).id === channelId
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
    ((disp) => ({
        setPausedState: (paused: boolean) => dispatch(setPausedState(paused)),
        setNextStation: () => dispatch(setNextStation()),
        setPreviousStation: () => dispatch(setPreviousStation()),
        setVolume: (volume: number) => dispatch(setVolume(volume)),
        setStationPlaylist: (stations: Service[]) => dispatch(setStationPlaylist(stations)),
        setActiveStation: (station: Service) => dispatch(setActiveStation(station)),
        updateGlobalState: (state: RootReducerState) => disp(updateGlobalState(state)),
    })),
)(RadioDNSNativeModulesSyncComponentReduxListener);
