import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
import MusicControl from "react-native-music-control";
// @ts-ignore
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {PlayerErrorBoundary} from "../components/error-boundaries/PlayerErrorBoundary";
import {BackgroundController} from "../components/media/BackgroundController";
import {Player} from "../components/media/Player";
import {DEBUG} from "../constants";
import {store} from "../reducers/root-reducer";
import {clearCache} from "../services/SPICache";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {HomeScreen} from "./HomeScreen";
import {PlayerView} from "./PlayerView";
import {StreamsView} from "./StreamsView";

/**
 * Main component for the application. Hosts axios http client and if the root for the redux
 * provider for streams.
 */
export default class App extends React.Component {

    private AppNavigator = createAppContainer(createStackNavigator(
        {
            Home: {
                screen: HomeScreen,
            },
            StreamsView: {
                screen: StreamsView,
            },
            PlayerView: {
                screen: PlayerView,
            },
        },
        {
            initialRouteName: "Home",
            // @ts-ignore
            defaultNavigationOptions: {
                headerStyle: {
                    backgroundColor: COLOR_SECONDARY,
                },
                headerTintColor: COLOR_PRIMARY,
                headerTitleStyle: {
                    fontWeight: "bold",
                },
            },
        },
    ));

    public async componentWillMount() {
        if (DEBUG) {
            await clearCache();
        }

        // Subscribe to the app state changes (forground, background, inactive).
        AppState.addEventListener("change", this.handleAppStateChange);
    }

    public componentWillUnmount() {
        // Unsubscribe to the app state changes.
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    public render() {
        return (
            <Provider store={store}>
                <PlayerErrorBoundary>
                    <Player/>
                </PlayerErrorBoundary>
                <this.AppNavigator/>
                <BackgroundController/>
            </Provider>
        );
    }

    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        // When user explicitly kills the app, cancel local notification.
        if (nextAppState === "inactive") {
            MusicControl.stopControl()
        }
    }
}
