import axios from "axios";
import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
import PushNotification from "react-native-push-notification";
// @ts-ignore
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {xml2js} from "xml-js";
import {Player} from "../components/media/Player";
import {SPI_3_1} from "../constants";
import {store} from "../reducers/root-reducer";
import {loadStreams, loadStreamsFailed} from "../reducers/streams";
import {cancelAudioPlayerNotifControl} from "../services/LNP";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {HomeScreen} from "./HomeScreen";
import {PlayerView} from "./PlayerView";

export const client = axios.create({
    baseURL: "https://nonrk.spi.radio.ebu.io",
});

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
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            requestPermissions: true,
        });
        AppState.addEventListener("change", this.handleAppStateChange);
        const res = await client.get(SPI_3_1);
        console.log("RES IS", res);
        if (res.status !== 200 || !res.data) {
            store.dispatch(loadStreamsFailed())
        } else {
            const streams = xml2js(res.data, {compact: true}) as any;
            store.dispatch(loadStreams(streams));
        }
    }

    public componentWillUnmount() {
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
        if (nextAppState === "inactive") {
            cancelAudioPlayerNotifControl();
        }
    }
}
