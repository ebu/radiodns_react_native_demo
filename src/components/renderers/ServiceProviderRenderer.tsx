import * as React from "react";
import {ActivityIndicator, Image, Text, TouchableOpacity} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {COLOR_SECONDARY} from "../../colors";
import {Station} from "../../models/Station";
import * as RadioDNSAuto from "../../native-modules/RadioDNSAuto";
import {setStationsCurrentlyVisible} from "../../reducers/stations";
import {SPICacheContainer} from "../../services/SPICache";
import {getMedia} from "../../utilities";

interface Props {
    serviceProvider: SPICacheContainer;
    itemSize: number;
    navigationProp: NavigationScreenProps;
    onInvalidData: (key: string) => void;

    // injected
    loadStations?: (stations: Station[]) => void;
}

interface State {
    loading: boolean;
}

/**
 * Renders the station logo and its medium name. Wrapped in a Touchable opacity for interactivity.
 * @param props: The component props.
 */
class ServiceProviderRendererContainer extends React.Component<Props, State> {

    public readonly state: State = {
        loading: true,
    };

    public async componentDidMount() {
        const cacheResponse = this.props.serviceProvider!;
        try {
            if (!cacheResponse.stations || cacheResponse.stations.length === 0) {
                this.props.onInvalidData(cacheResponse.spUrl);
                return;
            }
            this.cacheForAndroidAuto(cacheResponse);
            this.setState({loading: false})
        } catch (e) {
            console.warn(e);
        }
    }

    public render() {
        const cacheResponse = this.props.serviceProvider!;
        return (
            <>
                {this.state.loading &&
                <ActivityIndicator
                    size="large"
                    style={{width: this.props.itemSize, height: this.props.itemSize}}
                    color={COLOR_SECONDARY}
                />}
                {!this.state.loading && cacheResponse && cacheResponse.serviceProvider && !cacheResponse.error &&
                <TouchableOpacity
                    style={{width: this.props.itemSize, height: this.props.itemSize}}
                    onPress={this.onPress}
                >
                    <Image
                        resizeMode="cover"
                        style={{flex: 1}}
                        defaultSource={require("../../../ressources/ebu_logo.png")}
                        source={{
                            uri: getMedia(cacheResponse.serviceProvider.mediaDescription) === ""
                                ? `https://via.placeholder.com/200x200?text=${cacheResponse.serviceProvider.mediumName.text}`
                                : getMedia(cacheResponse.serviceProvider.mediaDescription),
                        }}
                    />
                </TouchableOpacity>}
                {!this.state.loading && cacheResponse && cacheResponse.error &&
                <Text style={{width: this.props.itemSize, height: this.props.itemSize}}>Failed to load.</Text>}
            </>
        );
    }

    private onPress = () => {
        const cacheResponse = this.props.serviceProvider!;
        if (this.state.loading || !cacheResponse || !cacheResponse.stations) {
            return;
        }
        this.props.loadStations!(cacheResponse.stations);
        this.props.navigationProp.navigation.navigate("StationsView");
    };

    private cacheForAndroidAuto = async (cacheResponse: SPICacheContainer) => {
        if (!cacheResponse.serviceProvider || !cacheResponse.stations) {
            return;
        }
        RadioDNSAuto.default.addNode(
            "root",
            this.props.serviceProvider.spUrl,
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
                this.props.serviceProvider.spUrl,
                station.bearer.id,
                station.shortName,
                mediaUri,
                station.bearer.id,
            );
        });
    }
}

export const ServiceProviderRenderer = connect(
    () => ({}),
    ((dispatch) => ({
        loadStations: (stations: Station[]) => dispatch(setStationsCurrentlyVisible(stations)),
    })),
)(ServiceProviderRendererContainer);
