import * as React from "react";
import {ActivityIndicator, Image, TouchableOpacity, View} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {COLOR_SECONDARY} from "../../colors";
import {Station} from "../../models/Station";
import {setStationsCurrentlyVisible} from "../../reducers/stations";
import {SPICacheContainer} from "../../services/SPICache";
import {getMedia} from "../../utilities";

interface Props {
    serviceProvider: SPICacheContainer;
    itemSize: number;
    navigationProp: NavigationScreenProps;

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
        this.setState({loading: false})
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
                {!this.state.loading && cacheResponse.serviceProvider && !cacheResponse.error &&
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
                {!this.state.loading && cacheResponse.error &&
                <View style={{width: this.props.itemSize, height: this.props.itemSize}}>
                    <Image
                        resizeMode="cover"
                        style={{flex: 1}}
                        defaultSource={require("../../../ressources/ebu_logo.png")}
                        source={{
                            uri: "https://via.placeholder.com/200x200?text=ERROR",
                        }}
                    />
                </View>}
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
}

export const ServiceProviderRenderer = connect(
    () => ({}),
    ((dispatch) => ({
        loadStations: (stations: Station[]) => dispatch(setStationsCurrentlyVisible(stations)),
    })),
)(ServiceProviderRendererContainer);
