import * as React from "react";
import {Image, View} from "react-native";
import Video from "react-native-video";
import {IconButton} from "../components/buttons/IconButton";
import {displayAudioPlayerNotifControl} from "../local-notification-push/LNP";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";

interface AudioStreamData {
    stationName: string;
    uri: string;
    logoUri: string;
}

interface State {
    streams: AudioStreamData[];
    currentStream: number;
    loading: boolean;
    paused: boolean;
}

export class AudioPlayer extends React.Component<{}, State> {

    public readonly state: State = {
        streams: [
            {
                stationName: "7radio",
                uri: "http://178.32.107.33/7radio-192k.mp3",
                logoUri: "http://static.zzebu.dev.staging-radiodns.com/600x600/f4276e30-6a9c-47ef-b13b-883741ab722a.png",
            },
            {
                stationName: "Rouge fm",
                uri: "http://rougefm.ice.infomaniak.ch/rougefm-high.mp3",
                logoUri: "https://upload.wikimedia.org/wikipedia/fr/9/92/Rouge_FM_2011_logo.png",
            },
        ],
        currentStream: 0,
        loading: true,
        paused: false,
    };

    // @ts-ignore
    private playerRef: Video;

    public render() {
        const {uri, logoUri}: AudioStreamData = this.state.streams[this.state.currentStream];
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Image
                    source={{uri: logoUri}}
                    style={{height: 400, width: 600}}
                    resizeMethod="auto"
                />
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <IconButton
                        iconName={"chevron-left"}
                        color={COLOR_SECONDARY}
                        backgroundColor={COLOR_PRIMARY}
                        onPress={this.onPreviousButtonPress}
                    />
                    <View style={{flex: 0.1}}/>
                    <IconButton
                        big
                        withBorder
                        iconName={this.state.paused ? "chevron-right" : "pause"}
                        disabled={this.state.loading}
                        color={COLOR_SECONDARY}
                        backgroundColor={COLOR_PRIMARY}
                        onPress={this.onPausePlayButtonPress}
                    />
                    <View style={{flex: 0.1}}/>
                    <IconButton
                        iconName={"chevron-right"}
                        color={COLOR_SECONDARY}
                        backgroundColor={COLOR_PRIMARY}
                        onPress={this.onNextButtonPress}
                    />
                </View>
                <Video
                    ref={this.onRef}
                    allowsExternalPlayback
                    source={{uri}}   // Can be a URL or a local file.
                    onBuffer={this.onBuffering}                // Callback when remote video is buffering
                    onError={this.onError}               // Callback when video cannot be loaded
                    style={{display: "none"}}
                    onLoad={this.onMediaReady}
                    onLoadStart={this.onLoadStart}
                    playInBackground
                    paused={this.state.paused}
                />
            </View>
        );
    }

    private onMediaReady = () => {
        this.setState({loading: false});
        this.updateControlNotif(true);
    };
    private onLoadStart = () => this.setState({loading: true});
    private onBuffering = () => {
        this.setState({loading: true});
    };

    private onRef = (ref: Video) => this.playerRef = ref;

    private onPausePlayButtonPress = () => this.setState((prevState) => {
        const paused = !prevState.paused;
        this.updateControlNotif(paused);
        return {paused};
    });
    private onNextButtonPress = () => {
        this.setState((prevState) =>
            ({currentStream: (prevState.currentStream + 1) >= prevState.streams.length ? 0 : prevState.currentStream + 1}));
        this.updateControlNotif(false);
    };
    private onPreviousButtonPress = () => {
        this.setState((prevState) =>
            ({currentStream: (prevState.currentStream - 1) < 0 ? prevState.streams.length - 1 : prevState.currentStream - 1}));
        this.updateControlNotif(false);
    };

    private onError = () => {
        // TODO display error on both notif and screen.
        this.updateControlNotif(false);
    };

    private updateControlNotif = (playing: boolean) => {
        const {stationName}: AudioStreamData = this.state.streams[this.state.currentStream];
        displayAudioPlayerNotifControl(stationName, `["${playing ? "pause" : "play"}"]`);
    };
}
