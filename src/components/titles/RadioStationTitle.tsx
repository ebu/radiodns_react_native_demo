import * as React from "react";
import {Text} from "react-native-elements";
import {connect} from "react-redux"
import {Stream} from "../../models/Stream";
import {RootReducerState} from "../../reducers/root-reducer";
import {COLOR_PRIMARY} from "../../styles";

interface Props {
    // injected props
    activeStream?: Stream | null;
}

const RadioStationTitleContainer: React.FC<Props> = (props) => (
    <Text
        style={{
            color: COLOR_PRIMARY,
            fontWeight: "bold",
            fontSize: 20,
        }}
    >
        {props.activeStream ? props.activeStream.mediumName : ""}
    </Text>
);

export const RadioStationTitle = connect(
    (state: RootReducerState) => ({
        activeStream: state.streams.activeStream,
    }),
)(RadioStationTitleContainer);
