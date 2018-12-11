import * as React from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {setNextStream} from "../../reducers/streams";
import {IconButton} from "./IconButton";

interface Props {
    color: string;
    backgroundColor: string
    // injected
    onNextPressed?: () => void;
}

const MediaPlayNextButtonContainer: React.FC<Props> = (props) => (
    <IconButton
        big
        color={props.color}
        backgroundColor={props.color}
        iconName={"chevron-left"}
        onPress={props.onNextPressed}
    />
);

export const MediaPlayNextButton = connect(
    () => ({}),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStream()),
    })),
)(MediaPlayNextButtonContainer);
