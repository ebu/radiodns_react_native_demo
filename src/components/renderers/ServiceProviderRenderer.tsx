import * as React from "react";
import {ActivityIndicator, Image, Text, TouchableOpacity} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {COLOR_SECONDARY} from "../../colors";
import {Station} from "../../models/Station";
import {loadStations, loadStationsFailed, stationsLoading} from "../../reducers/stations";
import {getSPI, SPICacheContainer} from "../../services/SPICache";
import {getMedia} from "../../utilities";

interface Props {
    serviceProviderKey: string;
    itemSize: number;
    navigationProp: NavigationScreenProps;
    onInvalidData: (key: string) => void;

    // injected
    stationsLoading?: () => void;
    loadStations?: (stations: Station[]) => void;
    loadStationsFailed?: () => void;
}

interface State {
    cacheResponse: SPICacheContainer | null;
    loading: boolean;
}

/**
 * Renders the station logo and its medium name. Wrapped in a Touchable opacity for interactivity.
 * @param props: The component props.
 */
class ServiceProviderRendererContainer extends React.Component<Props, State> {

    public readonly state: State = {
        cacheResponse: null,
        loading: true,
    };

    public async componentDidMount() {
        try {
            const cacheResponse = await getSPI(this.props.serviceProviderKey);
            if (!cacheResponse.stations || cacheResponse.stations.length === 0) {
                this.props.onInvalidData(this.props.serviceProviderKey);
                return;
            }
            this.setState({cacheResponse, loading: false})
        } catch (e) {
            console.warn(e);
        }
    }

    public render() {
        return (
            <>
                {this.state.loading &&
                <ActivityIndicator size="large" style={{width: this.props.itemSize, height: this.props.itemSize}} color={COLOR_SECONDARY}/>}
                {!this.state.loading && this.state.cacheResponse && this.state.cacheResponse.serviceProvider && !this.state.cacheResponse.error &&
                <TouchableOpacity
                    style={{width: this.props.itemSize, height: this.props.itemSize}}
                    onPress={this.onPress}
                >
                    <Image
                        resizeMode="cover"
                        style={{flex: 1}}
                        defaultSource={require("../../../ressources/ebu_logo.png")}
                        source={{uri: getMedia(this.state.cacheResponse.serviceProvider.mediaDescription) === ""
                                ? `https://via.placeholder.com/200x200?text=${this.state.cacheResponse.serviceProvider.mediumName.text}`
                                : getMedia(this.state.cacheResponse.serviceProvider.mediaDescription),
                        }}
                    />
                </TouchableOpacity>}
                {!this.state.loading && this.state.cacheResponse && this.state.cacheResponse.error &&
                <Text style={{width: this.props.itemSize, height: this.props.itemSize}}>Failed to load.</Text>}
            </>
        );
    }

    private onPress = () => {
        this.props.stationsLoading!();
        if (this.state.loading || !this.state.cacheResponse || !this.state.cacheResponse.stations) {
            this.props.loadStationsFailed!();
            return;
        }
        this.props.loadStations!(this.state.cacheResponse.stations);
        this.props.navigationProp.navigation.navigate("StationsView");
    }
}

export const ServiceProviderRenderer = connect(
    () => ({}),
    ((dispatch) => ({
        stationsLoading: () => dispatch(stationsLoading()),
        loadStations: (stations: Station[]) => dispatch(loadStations(stations)),
        loadStationsFailed: () => dispatch(loadStationsFailed()),
    })),
)(ServiceProviderRendererContainer);
