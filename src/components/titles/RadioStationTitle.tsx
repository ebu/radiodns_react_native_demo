import * as React from "react";
import {Text} from "react-native-elements";
import {connect} from "react-redux"
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_PRIMARY} from "../../colors";
import {RootReducerState} from "../../reducers/slave-reducer";

interface Props {
    // injected props
    activeStation?: Service | null;
}

/**
 * Component for the stack navigator. Adds a title to the app's activities.
 */
const RadioStationTitleContainer: React.FC<Props> = (props) => (
    <Text
        style={{
            color: COLOR_PRIMARY,
            fontWeight: "bold",
            fontSize: 20,
        }}
    >
        {props.activeStation ? props.activeStation.mediumName : ""}
    </Text>
);

export const RadioStationTitle = connect(
    (state: RootReducerState) => ({
        activeStation: state.stations.activeStation,
    }),
)(RadioStationTitleContainer);
