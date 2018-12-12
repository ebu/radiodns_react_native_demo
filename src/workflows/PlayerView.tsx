import * as React from "react";
import {Image, View} from "react-native";
import {Text} from "react-native-elements";
import {NavigationScreenConfig, NavigationScreenOptions, NavigationScreenProps} from "react-navigation";
import {connect, Provider} from "react-redux";
import {MediaPlayerErrorBoundary} from "../components/error-boundaries/MediaPlayerErrorBoundary";
import {MediaControls} from "../components/media/MediaControls";
import {SoundBar} from "../components/media/SoundBar";
import {RadioStationTitle} from "../components/titles/RadioStationTitle";
import {BaseView} from "../components/views/BaseView";
import {AudioStreamData} from "../models/streams-models";
import {RootReducerState, store} from "../reducers/root-reducer";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";

interface Props extends NavigationScreenProps {
    // injected props
    activeStream?: AudioStreamData;
}

class PlayerViewContainer extends React.Component<Props> {

    public static navigationOptions: NavigationScreenConfig<NavigationScreenOptions> = {
        headerTitle: <RadioStationTitle/>,
    };

    public render() {
        return (
            <Provider store={store}>
                <MediaPlayerErrorBoundary>
                        <BaseView backgroundColor={COLOR_PRIMARY}>
                            <Image
                                style={{
                                    width: 350,
                                    height: 300,
                                }}
                                defaultSource={require("../../ressources/ebu_logo.png")}
                                resizeMode="contain"
                                source={{uri: this.props.activeStream.logoUri}}
                            />
                            <View style={{flex: 0.2}}/>
                            <Text h4 style={{color: COLOR_SECONDARY}}>{this.props.activeStream.stationName}</Text>
                            <View style={{flex: 0.4}}/>
                            <SoundBar/>
                            <MediaControls/>
                        </BaseView>
                </MediaPlayerErrorBoundary>
            </Provider>
        );
    }
}

export const PlayerView = connect(
    (state: RootReducerState) => ({
        activeStream: state.streams.activeStream,
    }),
)(PlayerViewContainer);
