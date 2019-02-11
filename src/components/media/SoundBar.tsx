import * as React from "react";
import {View} from "react-native";
import {Icon, Slider} from "react-native-elements";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {COLOR_SECONDARY} from "../../colors";
import {RootReducerState} from "../../reducers/root-reducer";
import {setVolume} from "../../reducers/stations";

interface Props {
    // injected props
    volume?: number;
    setVolume?: (volume: number) => void;
}

/**
 * Sounds control for the player. Read to use as it is.
 * @param props: The component props.
 */
const SoundBarContainer: React.FC<Props> = (props) => (
    <View
        style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingRight: 20,
            paddingLeft: 20,
        }}
    >
        <Icon name="volume-down" color={COLOR_SECONDARY}/>
        <Slider
            value={props.volume}
            onValueChange={props.setVolume}
            minimumValue={0}
            maximumValue={1}
            thumbTintColor={COLOR_SECONDARY}
            style={{width: "90%"}}
        />
        <Icon name="volume-up" color={COLOR_SECONDARY}/>
    </View>
);

export const SoundBar = connect(
    (state: RootReducerState) => ({
        volume: state.stations.volume,
    }),
    (dispatch: Dispatch) => ({
        setVolume: (volume: number) => dispatch(setVolume(volume)),
    }),
)(SoundBarContainer);
