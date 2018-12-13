import * as React from "react"
import Video, {LoadError} from "react-native-video";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Stream} from "../../models/Stream";
import {RootReducerState} from "../../reducers/root-reducer";
import {setErrorStream, setStreamLoadingState} from "../../reducers/streams";
import {displayAudioPlayerNotifControl, injectedFunctionInvoker, injectedPropReader} from "../../utilities";

interface Props {
    // injected props
    currentSteam?: Stream | null;
    paused?: boolean;
    loading?: boolean;
    volume?: number;
    setStreamPausedState?: (paused: boolean) => void;
    setStreamLoadingState?: (loading: boolean) => void;
    setErrorStream?: (loading: boolean) => void;
}

class PlayerContainer extends React.Component<Props> {

    // @ts-ignore
    private playerRef: Video;

    public render() {
        if (!this.props.currentSteam) {
            return null;
        }
        const uri = this.props.currentSteam.bearer.id;
        return (
            <Video
                ref={this.onRef}
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

    // COMPONENT LIFECYCLE AND OTHER METHODS
    private onRef = (ref: Video) => this.playerRef = ref;

    // MEDIA HANDLING
    private onMediaReady = () => {
        injectedFunctionInvoker(this.props.setStreamLoadingState, false);
        this.updateControlNotif();
    };

    private onProgress = () => {
        if (this.props.loading) {
            this.onMediaReady();
        }
    };

    private onLoadStart = () => injectedFunctionInvoker(this.props.setStreamLoadingState, true);

    private onBuffering = () => injectedFunctionInvoker(this.props.setStreamLoadingState, true);

    // PLAYER IMPLEMENTATION METHODS

    private onError = (e: LoadError) => {
        // TODO display error on both notif and screen.
        injectedFunctionInvoker(this.props.setErrorStream, true);
        this.updateControlNotif();
        console.error(e.error)
    };

    private updateControlNotif = () => displayAudioPlayerNotifControl(injectedPropReader(this.props.currentSteam).mediumName);
}

export const Player = connect(
    (state: RootReducerState) => ({
        currentSteam: state.streams.activeStream,
        paused: state.streams.paused,
        loading: state.streams.loading,
        volume: state.streams.volume,
    }),
    ((dispatch: Dispatch) => ({
        setStreamLoadingState: (loading: boolean) => dispatch(setStreamLoadingState(loading)),
        setErrorStream: (error: boolean) => dispatch(setErrorStream(error)),
    })),
)(PlayerContainer);
