import * as React from "react";
import {Text} from "react-native-elements";
import {connect} from "react-redux";
import {RootReducerState} from "../../reducers/root-reducer";
import {COLOR_PRIMARY} from "../../styles";

interface Props {
    // injected props
    stationName?: string;
}

const RadioStationTitleContainer: React.FC<Props> = (props) => (
    <Text
        style={{
            color: COLOR_PRIMARY,
            fontWeight: "bold",
            fontSize: 20,
        }}
    >
        {props.stationName}
    </Text>
);

export const RadioStationTitle = connect(
    (state: RootReducerState) => ({
        stationName: state.streams.activeStream.stationName,
    }),
)(RadioStationTitleContainer);
