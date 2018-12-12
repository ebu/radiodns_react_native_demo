import * as React from "react"
import {ActivityIndicator, View} from "react-native";
import Video, {LoadError} from "react-native-video";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AudioStreamData} from "../../models/streams-models";
import {RootReducerState} from "../../reducers/root-reducer";
import {
    setErrorStream,
    setNextStream,
    setPreviousStream,
    setStreamLoadingState,
    setStreamPausedState,
} from "../../reducers/streams";
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
    volume?: number;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
    setStreamPausedState?: (paused: boolean) => void;
    setStreamLoadingState?: (loading: boolean) => void;
    setErrorStream?: (loading: boolean) => void;
}

class MediaPlayerContainer extends React.Component<Props> {

    // @ts-ignore
    private playerRef: Video;

    public render() {
        const {uri} = this.props.currentSteam;
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
                <Video
                    ref={this.onRef}
                    allowsExternalPlayback
                    source={{uri}}   // Can be a URL or a local file.
                    onBuffer={this.onBuffering}                // Callback when remote video is buffering
                    onError={this.onError}               // Callback when video cannot be loaded
                    style={{display: "none"}}
                    onLoad={this.onMediaReady}
                    onProgress={this.onProgress}
                    onLoadStart={this.onLoadStart}
                    playInBackground
                    paused={this.props.paused}
                    volume={this.props.volume}
                />
            </>
        );
    }

    // COMPONENT LIFECYCLE AND OTHER METHODS
    private onRef = (ref: Video) => this.playerRef = ref;

    // MEDIA HANDLING
    private onMediaReady = () => {
        this.props.setStreamLoadingState(false);
        this.updateControlNotif();
    };

    private onProgress = () => {
        if (this.props.loading) {
            this.onMediaReady();
        }
    };

    private onLoadStart = () => this.props.setStreamLoadingState(true);

    private onBuffering = () => this.props.setStreamLoadingState(true);

    // PLAYER IMPLEMENTATION METHODS
    private onPausePlayButtonPress = () => {
        const paused = !this.props.paused;
        paused
            ? cancelAudioPlayerNotifControl()
            : this.updateControlNotif();
        this.props.setStreamPausedState(paused);
    };

    private onError = (e: LoadError) => {
        // TODO display error on both notif and screen.
        this.props.setErrorStream(true);
        this.updateControlNotif();
        console.error(e.error)
    };

    private updateControlNotif = () => {
        const {stationName}: AudioStreamData = this.props.currentSteam;
        displayAudioPlayerNotifControl(stationName);
    };
}

export const MediaPlayer = connect(
    (state: RootReducerState) => ({
        currentSteam: state.streams.activeStream,
        paused: state.streams.paused,
        loading: state.streams.loading,
        volume: state.streams.volume,
    }),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStream()),
        onPreviousPressed: () => dispatch(setPreviousStream()),
        setStreamPausedState: (paused: boolean) => dispatch(setStreamPausedState(paused)),
        setStreamLoadingState: (loading: boolean) => dispatch(setStreamLoadingState(loading)),
        setErrorStream: (error: boolean) => dispatch(setErrorStream(error)),
    })),
)(MediaPlayerContainer);
