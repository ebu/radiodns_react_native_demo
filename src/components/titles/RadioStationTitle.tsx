import * as React from "react";
import {Text} from "react-native-elements";
import {connect} from "react-redux"
import {COLOR_PRIMARY} from "../../colors";
import {Station} from "../../models/Station";
import {RootReducerState} from "../../reducers/root-reducer";

interface Props {
    // injected props
    activeStation?: Station | null;
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
