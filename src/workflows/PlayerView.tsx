import * as React from "react";
import {Image, View} from "react-native";
import {Text} from "react-native-elements";
import GestureRecognizer from "react-native-swipe-gestures";
import {NavigationScreenConfig, NavigationScreenOptions, NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {PlayerErrorDisplay} from "../components/error-boundaries/PlayerErrorDisplay";
import {MediaControls} from "../components/media/MediaControls";
import {SoundBar} from "../components/media/SoundBar";
import {BigText} from "../components/texts/BigText";
import {RadioStationTitle} from "../components/titles/RadioStationTitle";
import {BaseView} from "../components/views/BaseView";
import {Stream} from "../models/Stream";
import {RootReducerState} from "../reducers/root-reducer";
import {setNextStream, setPreviousStream} from "../reducers/streams";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {getMedia, injectedFunctionInvoker} from "../utilities";

interface Props extends NavigationScreenProps {
    // injected
    activeStream?: Stream | null;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
}

/**
 * Player view. Provides sound, navigation and play/pause stream controls.
 */
class PlayerViewContainer extends React.Component<Props> {

    public static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = {
        headerTitle: <RadioStationTitle/>,
    };

    public render() {
        return (
            <GestureRecognizer
                style={{flex: 1}}
                onSwipeLeft={this.onSwipeLeft}
                onSwipeRight={this.onSwipeRight}
            >
                <BaseView backgroundColor={COLOR_PRIMARY}>
                    {!this.props.activeStream &&
                    <BigText>No stations to listen to!</BigText>}
                    {this.props.activeStream && <PlayerErrorDisplay>
                        <Image
                            style={{
                                width: 350,
                                height: 300,
                            }}
                            defaultSource={require("../../ressources/ebu_logo.png")}
                            resizeMode="contain"
                            source={{uri: getMedia(this.props.activeStream.streamLogos)}}
                        />
                        <View style={{flex: 0.2}}/>
                        <Text h4 style={{color: COLOR_SECONDARY}}>{this.props.activeStream.mediumName}</Text>
                        <View style={{flex: 0.4}}/>
                        <SoundBar/>
                        <MediaControls/>

                    </PlayerErrorDisplay>}
                </BaseView>
            </GestureRecognizer>
        );
    }

    private onSwipeLeft = () => injectedFunctionInvoker(this.props.onPreviousPressed);
    private onSwipeRight = () => injectedFunctionInvoker(this.props.onNextPressed);
}

export const PlayerView = connect(
    (state: RootReducerState) => ({
        activeStream: state.streams.activeStream,
    }),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStream()),
        onPreviousPressed: () => dispatch(setPreviousStream()),
    })),
)(PlayerViewContainer);
