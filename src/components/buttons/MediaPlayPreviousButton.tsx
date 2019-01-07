import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {setPreviousStation} from "../../reducers/stations";
import {IconButton} from "./IconButton";

interface Props {
    // Color of the arrow icon of the button.
    color: string;
    // Background color of the button.
    backgroundColor: string
    // injected
    onPreviousPressed?: () => void;
}

/**
 * Player control button, ready to use as it is. Will set the previous active station when pressed.
 * @param props: The component props.
 */
const MediaPlayPreviousButtonContainer: React.FC<Props> = (props) => (
    <IconButton
        big
        color={props.color}
        backgroundColor={props.color}
        iconName={"skip-next"}
        onPress={props.onPreviousPressed}
    />
);

export const MediaPlayPreviousButton = connect(
    () => ({}),
    ((dispatch: Dispatch) => ({
        onPreviousPressed: () => dispatch(setPreviousStation()),
    })),
)(MediaPlayPreviousButtonContainer);
