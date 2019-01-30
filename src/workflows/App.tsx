import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
// @ts-ignore - createAppContainer does exists in react navigation but typings are not up to date.
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../colors";
import {PlayerErrorBoundary} from "../components/error-boundaries/PlayerErrorBoundary";
import {BackgroundController} from "../components/media/BackgroundController";
import {Player} from "../components/media/Player";
import {SERVICE_PROVIDERS} from "../constants";
import * as RadioDNSAuto from "../native-modules/RadioDNSAuto";
import RadioDNSControlNotification from "../native-modules/RadioDNSControlNotification";
import {store} from "../reducers/root-reducer";
import {setServiceProviders} from "../reducers/service-providers";
import {getAllSPIs, SPICacheContainer} from "../services/SPICache";
import {getMedia} from "../utilities";
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

    public async componentWillMount() {
        // Subscribe to the app state changes (forground, background, inactive).
        AppState.addEventListener("change", this.handleAppStateChange);

        // Add SPI files to the app's state.
        const spiCacheResponses = await getAllSPIs(SERVICE_PROVIDERS);
        spiCacheResponses.forEach(this.cacheForAndroidAuto);
        RadioDNSAuto.default.refresh();
        store.dispatch(setServiceProviders(spiCacheResponses));
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
            RadioDNSControlNotification.dismissNotification();
        }
    };

    private cacheForAndroidAuto = (cacheResponse: SPICacheContainer) => {
        if (!cacheResponse.serviceProvider || !cacheResponse.stations) {
            return;
        }
        RadioDNSAuto.default.addNode(
            "root",
            cacheResponse.spUrl,
            cacheResponse.serviceProvider.shortName.text,
            getMedia(cacheResponse.serviceProvider.mediaDescription),
            null,
        );
        cacheResponse.stations.forEach((station) => {
            if (!station.bearer.id) {
                return;
            }
            const mediaUri = getMedia(station.stationLogos);

            // ADD CHANNEL
            RadioDNSAuto.default.addNode(
                cacheResponse.spUrl,
                station.bearer.id,
                station.shortName,
                mediaUri,
                station.bearer.id,
            );
        });
    }
}
