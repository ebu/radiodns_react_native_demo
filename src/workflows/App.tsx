import axios from "axios";
import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
import PushNotification from "react-native-push-notification";
// @ts-ignore
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {xml2js} from "xml-js";
import {Player} from "../components/media/Player";
import {BASE_URL, SPI_3_1} from "../constants";
import {store} from "../reducers/root-reducer";
import {loadStreams, loadStreamsFailed} from "../reducers/streams";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {cancelAudioPlayerNotifControl} from "../utilities";
import {HomeScreen} from "./HomeScreen";
import {PlayerView} from "./PlayerView";

export const client = axios.create({
    baseURL: BASE_URL,
});

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
        // [IOS ONLY] ask permissions to display local notifications.
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            requestPermissions: true,
        });

        // Subscribe to the app state changes (forground, background, inactive).
        AppState.addEventListener("change", this.handleAppStateChange);

        // Get metadata.
        // TODO determine some mechanism to refresh them from time to time.
        const res = await client.get(SPI_3_1);
        if (res.status !== 200 || !res.data) {
            store.dispatch(loadStreamsFailed())
        } else {
            const streams = xml2js(res.data, {compact: true}) as any;
            store.dispatch(loadStreams(streams));
        }
    }

    public componentWillUnmount() {
        // Unsubscribe to the app state changes.
        AppState.removeEventListener("change", this.handleAppStateChange);
    }

    public render() {
        return (
            <Provider store={store}>
                <Player/>
                <this.AppNavigator/>
            </Provider>
        );
    }

    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        // When user explicitly kills the app, cancel local notification.
        if (nextAppState === "inactive") {
            cancelAudioPlayerNotifControl();
        }
    }
}
