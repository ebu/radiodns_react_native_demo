import * as React from "react";
import {TouchableOpacity} from "react-native";
import {Avatar} from "react-native-elements";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {getMedia} from "../../utilities";
import {MediumText} from "../texts/MediumText";

interface Props {
    station: Service;
    // callback for when one touch this component.
    onPress: () => void;
}

/**
 * Renders the station logo and its medium name. Wrapped in a Touchable opacity for interactivity.
 * @param props: The component props.
 */
export const StationItemRenderer: React.FC<Props> = (props) => (
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
            source={getMedia(props.station.mediaDescription) === ""
                ? require("../../../ressources/ebu_logo.png")
                : {uri: getMedia(props.station.mediaDescription)}}
        />
        <MediumText style={{marginLeft: 10}}>{props.station.mediumName}</MediumText>
    </TouchableOpacity>
);
