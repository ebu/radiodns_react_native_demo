import * as React from "react";
import {AppState, AppStateStatus} from "react-native";
// @ts-ignore - createAppContainer does exists in react navigation but typings are not up to date.
import {createAppContainer, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../colors";
import {PlayerErrorBoundary} from "../components/error-boundaries/PlayerErrorBoundary";
import {Player} from "../components/media/Player";
import {RadioDNSNativeModulesSyncComponent} from "../components/RadioDNSNativeModulesSyncComponent";
import {SERVICE_PROVIDERS} from "../constants";
import RadioDNSAuto from "../native-modules/RadioDNSAuto";
import RadioDNSControlNotification from "../native-modules/RadioDNSControlNotification";
import {store} from "../reducers/root-reducer";
import {setServiceProviders} from "../reducers/service-providers";
import {getAllSPIs, SPICacheContainer} from "../services/SPICache";
import {getBearer, getMedia} from "../utilities";
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
        // Subscribe to the app state changes (foreground, background, inactive).
        AppState.addEventListener("change", this.handleAppStateChange);

        // Add SPI files to the app's state.
        const spiCacheResponses = await getAllSPIs(SERVICE_PROVIDERS);

        // Add root nodes to browse by genre and by service provider.
        RadioDNSAuto.addNode(
            "root",
            "byServiceProviderRoot",
            "By service provider",
            "",
            null,
        );

        RadioDNSAuto.addNode(
            "root",
            "byGenreRoot",
            "By genre",
            "",
            null,
        );

        spiCacheResponses.forEach(this.cacheForAndroidAuto);
        this.parseAndCacheGenresForAndroidAuto(spiCacheResponses);

        RadioDNSAuto.refresh();
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
                <RadioDNSNativeModulesSyncComponent/>
            </Provider>
        );
    }

    private handleAppStateChange = (nextAppState: AppStateStatus) => {
        // When user explicitly kills the app, cancel local notification.
        if (nextAppState === "inactive") {
            RadioDNSControlNotification.dismissNotification();
        }
    };

    private parseAndCacheGenresForAndroidAuto = (spiCacheResponses: SPICacheContainer[]) => {
        const genres: { [key: string]: Service[] } = {};
        spiCacheResponses.reduce((acc, spiCache) => acc.concat(spiCache.stations || []), [] as Service[])
            .reduce((acc, station) => acc.concat(
                station.genre.map((genre) => ({genre: genre.text.replace("\"", "").trim(), station})),
            ), [] as Array<{ station: Service, genre: string }>)
            .sort((a, b) => {
                if (a.genre < b.genre) {
                    return -1;
                }
                if (a.genre > b.genre) {
                    return 1;
                }
                return 0;
            })
            .filter((a) => getBearer(a.station.bearer).id)
            .forEach((a) => genres[a.genre] ? genres[a.genre].push(a.station) : genres[a.genre] = [a.station]);

        Object.keys(genres).forEach((genre) => {
            RadioDNSAuto.addNode(
                "byGenreRoot",
                genre,
                genre,
                "",
                null,
            );
            genres[genre].forEach((station) => {
                const mediaUri = getMedia(station.mediaDescription);
                RadioDNSAuto.addNode(
                    genre,
                    genre + getBearer(station.bearer).id,
                    station.shortName || "",
                    mediaUri,
                    getBearer(station.bearer).id,
                );
            });
        });
    };

    /**
     * Sets the provided cache response in the cache of the native Android Auto module. Later when in Auto mode
     * the MediaBrowserService will query this cache for a list of nodes to render for the user.
     * @param cacheResponse: The cache response.
     */
    private cacheForAndroidAuto = (cacheResponse: SPICacheContainer) => {
        if (!cacheResponse.serviceProvider || !cacheResponse.stations) {
            return;
        }
        RadioDNSAuto.addNode(
            "byServiceProviderRoot",
            cacheResponse.spUrl,
            cacheResponse.serviceProvider.shortName ? cacheResponse.serviceProvider.shortName.text : "",
            getMedia(cacheResponse.serviceProvider.mediaDescription),
            null,
        );
        cacheResponse.stations.forEach((station) => {
            const mediaUri = getMedia(station.mediaDescription);

            // ADD CHANNEL
            RadioDNSAuto.addNode(
                cacheResponse.spUrl,
                getBearer(station.bearer).id,
                station.shortName || "",
                mediaUri,
                getBearer(station.bearer).id,
            );
        });
    }
}
