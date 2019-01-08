import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
import MusicControl from "react-native-music-control";
// @ts-ignore - createAppContainer does exists in react navigation but typings are not up to date.
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../colors";
import {PlayerErrorBoundary} from "../components/error-boundaries/PlayerErrorBoundary";
import {BackgroundController} from "../components/media/BackgroundController";
import {Player} from "../components/media/Player";
import {store} from "../reducers/root-reducer";
import {HomeScreen} from "./HomeScreen";
import {PlayerView} from "./PlayerView";
import {StationsView} from "./StationsView";

/**
 * Main component for the application.
 */
export default class App extends React.Component {

    private AppNavigator = createAppContainer(createStackNavigator(
        {
            Home: {
                screen: HomeScreen,
            },
            StationsView: {
                screen: StationsView,
            },
            PlayerView: {
                screen: PlayerView,
            },
        },
        {
            initialRouteName: "Home",
            // @ts-ignore - typings are not up to date.
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

    public componentWillMount() {
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
