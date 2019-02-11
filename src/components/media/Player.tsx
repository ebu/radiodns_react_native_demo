import * as React from "react"
import Video, {LoadError} from "react-native-video";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {RootReducerState} from "../../reducers/root-reducer";
import {setError, setLoadingState} from "../../reducers/stations";
import {getBearer} from "../../utilities";

interface Props {
    // injected props
    currentSteam?: Service | null;
    paused?: boolean;
    loading?: boolean;
    volume?: number;
    setLoadingState?: (loading: boolean) => void;
    setError?: (loading: boolean) => void;
}

/**
 * This components contains and handles the video component and its events.
 */
class PlayerContainer extends React.Component<Props> {

    public render() {
        if (!this.props.currentSteam) {
            return null;
        }
        const uri = getBearer(this.props.currentSteam.bearer).id;
        return (
            <Video
                allowsExternalPlayback
                source={{uri}}
                onBuffer={this.onBuffering}
                onError={this.onError}
                style={{display: "none"}}
                onLoad={this.onMediaReady}
                onProgress={this.onProgress}
                onLoadStart={this.onLoadStart}
                playInBackground
                paused={this.props.paused}
                volume={this.props.volume}
            />
        );
    }

    // MEDIA HANDLING
    private onMediaReady = () => this.props.setLoadingState!(false);

    private onProgress = () => {
        if (this.props.loading) {
            this.onMediaReady();
        }
    };

    private onLoadStart = () => this.props.setLoadingState!(true);

    private onBuffering = () => this.props.setLoadingState!(true);

    // PLAYER IMPLEMENTATION METHODS
    private onError = (e: LoadError) => {
        this.props.setError!(true);
        console.error(e.error)
    };
}

export const Player = connect(
    (state: RootReducerState) => ({
        currentSteam: state.stations.activeStation,
        paused: state.stations.paused,
        loading: state.stations.loading,
        volume: state.stations.volume,
    }),
    ((dispatch: Dispatch) => ({
        setLoadingState: (loading: boolean) => dispatch(setLoadingState(loading)),
        setError: (error: boolean) => dispatch(setError(error)),
    })),
)(PlayerContainer);
