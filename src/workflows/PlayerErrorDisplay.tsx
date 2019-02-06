import * as React from "react";
import {View} from "react-native";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {COLOR_DANGER, COLOR_PRIMARY} from "../colors";
import {MediaPlayNextButton} from "../components/buttons/MediaPlayNextButton";
import {MediaPlayPreviousButton} from "../components/buttons/MediaPlayPreviousButton";
import {TextDanger} from "../components/texts/TextDanger";
import {setNextStation, setPreviousStation} from "../kokoro/reducers/stations";
import {dispatch} from "../native-modules/Kokoro";
import {RootReducerState} from "../reducers/slave-reducer";

interface Props {
    // injected
    error?: boolean;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
    closeModal?: () => void;
}

/**
 * Player error display. Will display an error message if the player failed to load the station.
 */
class PlayerErrorDisplayContainer extends React.Component<Props> {

    public render() {
        if (this.props.error) {
            return (
                <View
                    style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: COLOR_DANGER,
                    }}
                >
                    <Icon name="error-outline" color={COLOR_PRIMARY} size={200}/>
                    <View style={{flex: 0.3}}/>
                    <TextDanger>An error has occurred and this application cannot listen to this ip
                        station.</TextDanger>
                    <View style={{flex: 0.3}}/>
                    <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <MediaPlayNextButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                        <View style={{flex: 0.2}}/>
                        <TextDanger>Try an other station</TextDanger>
                        <View style={{flex: 0.2}}/>
                        <MediaPlayPreviousButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                    </View>
                </View>
            );
        }
        return this.props.children;
    }
}

export const PlayerErrorDisplay = connect(
    (state: RootReducerState) => ({error: state.stations.error}),
    (() => ({
        onNextPressed: () => dispatch(setNextStation()),
        onPreviousPressed: () => dispatch(setPreviousStation()),
    })),
)(PlayerErrorDisplayContainer);
