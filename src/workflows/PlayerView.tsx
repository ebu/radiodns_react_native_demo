import * as React from "react";
import {Image, View} from "react-native";
import {Text} from "react-native-elements";
import {connect} from "react-redux";
import {MediaPlayer} from "../components/media/MediaPlayer";
import {SoundBar} from "../components/media/SoundBar";
import {AudioStreamData} from "../models/streams-models";
import {RootReducerState} from "../reducers/root-reducer";
import {COLOR_SECONDARY} from "../styles";

interface Props {
    // injected props
    activeStream?: AudioStreamData;
}

const PlayerViewContainer: React.FC<Props> = (props) => (
    <View
        style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
        }}
    >
        <Image
            style={{
                width: 350,
                height: 300,
            }}
            defaultSource={require("../../ressources/ebu_logo.png")}
            resizeMode="contain"
            source={{uri: props.activeStream.logoUri}}
        />
        <View style={{flex: 0.2}}/>
        <Text h4 style={{color: COLOR_SECONDARY}}>{props.activeStream.stationName}</Text>
        <View style={{flex: 0.4}}/>
        <SoundBar/>
        <MediaPlayer/>
    </View>
);

// TODO decorator with the FC maybe?
export const PlayerView = connect(
    (state: RootReducerState) => ({
        activeStream: state.streams.activeStream,
    }),
)(PlayerViewContainer);
