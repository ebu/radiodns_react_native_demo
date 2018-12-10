import * as React from "react";
import {Image, StyleSheet} from "react-native";
import Video from "react-native-video";
import {PaddedView} from "../views/PaddedView";

interface State {
    videoUri: string | null;
}

export class AudioPlayer extends React.Component<{}, State> {

    public readonly state: State = {
        videoUri: "",
    };

    private player: Video;

    public render() {
        return (
            <PaddedView>
                <Image
                    source={{uri: "http://static.zzebu.dev.staging-radiodns.com/600x" +
                        "600/f4276e30-6a9c-47ef-b13b-883741ab722a.png"}}
                />
                <Video
                    source={{uri: this.state.videoUri}}   // Can be a URL or a local file.
                    ref={this.onRef}                      // Store reference
                    onBuffer={this.onBuffer}              // Callback when remote video is buffering
                    onError={this.videoError}             // Callback when video cannot be loaded
                    style={styles.audioPlayer}
                />
            </PaddedView>
        );
    }

    public componentDidMount() {
        console.log("PLAYER", this.player)
    }

    private onRef = (ref: Video) => this.player = ref;

    private onBuffer = () => {
    };

    private videoError = () => {
    };
}

const styles = StyleSheet.create({
    audioPlayer:  {
        position:  "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    loadingThing: {
        position:  "absolute",
        top: "50%",
        left: "50%",
    },
});
