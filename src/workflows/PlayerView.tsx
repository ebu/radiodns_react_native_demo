import * as React from "react";
import {Image, View} from "react-native";
import {Text} from "react-native-elements";
import GestureRecognizer from "react-native-swipe-gestures";
import {NavigationScreenConfig, NavigationScreenOptions, NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../colors";
import {MediaControls} from "../components/media/MediaControls";
import {SoundBar} from "../components/media/SoundBar";
import {BigText} from "../components/texts/BigText";
import {RadioStationTitle} from "../components/titles/RadioStationTitle";
import {BaseView} from "../components/views/BaseView";
import {setNextStation, setPreviousStation} from "../kokoro/reducers/stations";
import {dispatch} from "../native-modules/Kokoro";
import {RootReducerState} from "../reducers/slave-reducer";
import {getMedia} from "../utilities";
import {PlayerErrorDisplay} from "./PlayerErrorDisplay";

interface Props extends NavigationScreenProps {
    // injected
    activeStation?: Service | null;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
}

/**
 * Player view. Provides sound, navigation and play/pause station controls.
 */
class PlayerViewContainer extends React.Component<Props> {

    public static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = {
        headerTitle: <RadioStationTitle/>,
    };

    public render() {
        return (
            <GestureRecognizer
                style={{flex: 1}}
                onSwipeLeft={this.props.onPreviousPressed}
                onSwipeRight={this.props.onNextPressed}
            >
                {!this.props.activeStation &&
                <BaseView backgroundColor={COLOR_PRIMARY}>
                    <BigText>No stations to listen to!</BigText>
                </BaseView>}
                {this.props.activeStation && <PlayerErrorDisplay>
                    <BaseView backgroundColor={COLOR_PRIMARY}>
                        <Image
                            style={{
                                width: 350,
                                height: 300,
                            }}
                            defaultSource={require("../../ressources/ebu_logo.png")}
                            resizeMode="contain"
                            source={{uri: getMedia(this.props.activeStation.mediaDescription)}}
                        />
                        <View style={{flex: 0.2}}/>
                        <Text h4 style={{color: COLOR_SECONDARY}}>{this.props.activeStation.mediumName}</Text>
                        <View style={{flex: 0.4}}/>
                        <SoundBar/>
                        <MediaControls/>
                    </BaseView>
                </PlayerErrorDisplay>}
            </GestureRecognizer>
        );
    }
}

export const PlayerView = connect(
    (state: RootReducerState) => ({
        activeStation: state.stations.activeStation,
    }),
    (() => ({
        onNextPressed: () => dispatch(setNextStation()),
        onPreviousPressed: () => dispatch(setPreviousStation()),
    })),
)(PlayerViewContainer);
