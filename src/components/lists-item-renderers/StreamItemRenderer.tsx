import * as React from "react";
import {Text, TouchableOpacity} from "react-native";
import {Avatar} from "react-native-elements";
import {Stream} from "../../models/Stream";
import {getMedia} from "../../utilities";

interface Props {
    stream: Stream;
    onPress: () => void;
}

export const StreamItemRenderer: React.FC<Props> = (props) => (
    <TouchableOpacity
        style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 5,
        }}
        onPress={props.onPress}
    >
        <Avatar
            small
            rounded
            source={{uri: getMedia(props.stream.mediaDescription)}}
        />
        <Text style={{marginLeft: 10}}>{props.stream.longName._text}</Text>
    </TouchableOpacity>
);
