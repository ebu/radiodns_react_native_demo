import * as React from "react";
import {View} from "react-native";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {RootReducerState} from "../../reducers/root-reducer";
import {setNextStream, setPreviousStream} from "../../reducers/streams";
import {COLOR_DANGER, COLOR_PRIMARY} from "../../styles";
import {MediaPlayNextButton} from "../buttons/MediaPlayNextButton";
import {MediaPlayPreviousButton} from "../buttons/MediaPlayPreviousButton";
import {TextDanger} from "../texts/TextDanger";
import {BaseView} from "../views/BaseView";

interface Props {
    // injected
    error?: boolean;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
    closeModal?: () => void;
}

interface State {
    hasError: boolean;
}

// TODO verify that we are on the player screen to display this error.
/**
 * Player error display. Will display an error message if the player failed to load the stream.
 */
class PlayerErrorDisplayContainer extends React.Component<Props, State> {

    public readonly state = {
        hasError: false,
    };

    public render() {
        if (this.props.error) {
            return (
                <BaseView backgroundColor={COLOR_DANGER}>
                    <Icon name="error-outline" color={COLOR_PRIMARY} size={200}/>
                    <View style={{flex: 0.3}}/>
                    <TextDanger>An error has occurred and this application cannot listen to this ip station.</TextDanger>
                    <View style={{flex: 0.3}}/>
                    <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <MediaPlayNextButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                        <View style={{flex: 0.2}}/>
                        <TextDanger>Try an other station</TextDanger>
                        <View style={{flex: 0.2}}/>
                        <MediaPlayPreviousButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                    </View>
                </BaseView>
            );
        }
        return this.props.children;
    }
}

export const PlayerErrorDisplay = connect(
    (state: RootReducerState) => ({error: state.streams.error}),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStream()),
        onPreviousPressed: () => dispatch(setPreviousStream()),
    })),
)(PlayerErrorDisplayContainer);
