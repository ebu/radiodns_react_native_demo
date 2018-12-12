import * as React from "react";
import {Text} from "react-native-elements";
import {connect} from "react-redux";
import {AudioStreamData} from "../../models/streams-models";
import {RootReducerState} from "../../reducers/root-reducer";
import {COLOR_PRIMARY} from "../../styles";

interface Props {
    // injected props
    activeStream?: AudioStreamData;
}

const RadioStationTitleContainer: React.FC<Props> = (props) => (
    <Text
        style={{
            color: COLOR_PRIMARY,
            fontWeight: "bold",
            fontSize: 20,
        }}
    >
        {props.activeStream ? props.activeStream.stationName : ""}
    </Text>
);

export const RadioStationTitle = connect(
    (state: RootReducerState) => ({
        activeStream: state.streams.activeStream,
    }),
)(RadioStationTitleContainer);
