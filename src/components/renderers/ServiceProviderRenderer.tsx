import * as React from "react";
import {ActivityIndicator, Image, Text, TouchableOpacity} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {Stream} from "../../models/Stream";
import {loadStreams, loadStreamsFailed, streamsLoading} from "../../reducers/streams";
import {getFromSPICache, SPICacheContainer} from "../../services/SPICache";
import {COLOR_SECONDARY} from "../../styles";
import {getMedia, injectedFunctionInvoker} from "../../utilities";

interface Props {
    serviceProviderKey: string;
    itemSize: number;
    navigationProp: NavigationScreenProps;
    onInvalidData: (key: string) => void;

    // injected
    streamsLoading?: () => void;
    loadStreams?: (streams: Stream[]) => void;
    loadStreamsFailed?: () => void;
}

interface State {
    cacheResponse: SPICacheContainer | null;
    loading: boolean;
}

/**
 * Renders the stream logo and its medium name. Wrapped in a Touchable opacity for interactivity.
 * @param props: The component props.
 * @constructor
 */
class ServiceProviderRendererContainer extends React.Component<Props, State> {

    public readonly state: State = {
        cacheResponse: null,
        loading: true,
    };

    public async componentDidMount() {
        try {
            const cacheResponse = await getFromSPICache(this.props.serviceProviderKey);
            if (!cacheResponse.streams || cacheResponse.streams.length === 0) {
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
        injectedFunctionInvoker(this.props.streamsLoading);
        if (this.state.loading || !this.state.cacheResponse || !this.state.cacheResponse.streams) {
            injectedFunctionInvoker(this.props.loadStreamsFailed);
            return;
        }
        injectedFunctionInvoker(this.props.loadStreams, this.state.cacheResponse.streams);
        this.props.navigationProp.navigation.navigate("StreamsView");
    }
}

export const ServiceProviderRenderer = connect(
    () => ({}),
    ((dispatch) => ({
        streamsLoading: () => dispatch(streamsLoading()),
        loadStreams: (streams: Stream[]) => dispatch(loadStreams(streams)),
        loadStreamsFailed: () => dispatch(loadStreamsFailed()),
    })),
)(ServiceProviderRendererContainer);
