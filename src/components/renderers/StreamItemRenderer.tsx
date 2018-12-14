import * as React from "react";
import {TouchableOpacity} from "react-native";
import {Avatar} from "react-native-elements";
import {Stream} from "../../models/Stream";
import {getMedia} from "../../utilities";
import {MediumText} from "../texts/MediumText";

interface Props {
    stream: Stream;
    // callback for when one touch this component.
    onPress: () => void;
}

/**
 * Renders the stream logo and its medium name. Wrapped in a Touchable opacity for interactivity.
 * @param props: The component props.
 * @constructor
 */
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
            medium
            rounded
            source={getMedia(props.stream.streamLogos) === ""
                ? require("../../../ressources/ebu_logo.png")
                : {uri: getMedia(props.stream.streamLogos)}}
        />
        <MediumText style={{marginLeft: 10}}>{props.stream.mediumName}</MediumText>
    </TouchableOpacity>
);
