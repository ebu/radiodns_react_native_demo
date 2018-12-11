import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {setPreviousStream} from "../../reducers/streams";
import {IconButton} from "./IconButton";

interface Props {
    color: string;
    backgroundColor: string
    // injected
    onPreviousPressed?: () => void;
}

const MediaPlayPreviousButtonContainer: React.FC<Props> = (props) => (
    <IconButton
        big
        color={props.color}
        backgroundColor={props.color}
        iconName={"chevron-right"}
        onPress={props.onPreviousPressed}
    />
);

export const MediaPlayPreviousButton = connect(
    () => ({}),
    ((dispatch: Dispatch) => ({
        onPreviousPressed: () => dispatch(setPreviousStream()),
    })),
)(MediaPlayPreviousButtonContainer);
