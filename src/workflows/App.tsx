import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
import PushNotification from "react-native-push-notification";
// @ts-ignore
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {Player} from "../components/media/Player";
import {store} from "../reducers/root-reducer";
import {getSpi} from "../services/http";
import {cancelAudioPlayerNotifControl} from "../services/LNP";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {HomeScreen} from "./HomeScreen";
import {PlayerView} from "./PlayerView";

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

    public componentWillMount() {
        getSpi();
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            requestPermissions: true,
        });
        AppState.addEventListener("change", this.handleAppStateChange);
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
