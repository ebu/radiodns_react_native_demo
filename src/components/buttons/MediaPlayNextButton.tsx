import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {setNextStation} from "../../reducers/stations";
import {IconButton} from "./IconButton";

interface Props {
    // Color of the arrow icon of the button.
    color: string;
    // Background color of the button.
    backgroundColor: string
    // injected
    onNextPressed?: () => void;
}

/**
 * Player control button, ready to use as it is. Will set the next active station when pressed.
 * @param props: The component props.
 */
const MediaPlayNextButtonContainer: React.FC<Props> = (props) => (
    <IconButton
        big
        color={props.color}
        backgroundColor={props.color}
        iconName={"skip-previous"}
        onPress={props.onNextPressed}
    />
);

export const MediaPlayNextButton = connect(
    () => ({}),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStation()),
    })),
)(MediaPlayNextButtonContainer);
