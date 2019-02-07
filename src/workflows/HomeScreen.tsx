import * as React from "react";
import {ActivityIndicator} from "react-native";
import {Button, Text} from "react-native-elements";
import {NavigationScreenDetails, NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {COLOR_SECONDARY_DARK} from "../colors";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {ServiceProviderRenderer} from "../components/renderers/ServiceProviderRenderer";
import {BaseView} from "../components/views/BaseView";
import {PhotoGrid} from "../components/views/PhotoGrid";
import {SPICacheContainer} from "../kokoro/services/SPICache";
import {RootReducerState} from "../reducers/slave-reducer";

interface Props extends NavigationScreenProps {
    // injected
    serviceProviders?: SPICacheContainer[];
}

interface State {
    reloading: boolean;
}

/**
 * Home screen with the list of service providers.
 */
export class HomeScreenContainer extends React.Component<Props, State> {

    public static navigationOptions = (navigationScreenDetails: NavigationScreenDetails<{}>) => ({
        title: "Home",
        headerRight: (
            <Button
                title={"clear cache"}
                icon={{name: "cached"}}
                onPress={navigationScreenDetails.navigation.getParam("handleOnClearCachePress")}
                backgroundColor={COLOR_SECONDARY_DARK}
                buttonStyle={{borderRadius: 50, paddingTop: 5, paddingBottom: 5, paddingRight: -5}}
            />
        ),
    });

    public readonly state = {
        reloading: false,
    };

    public componentDidMount() {
        this.props.navigation.setParams({ handleOnClearCachePress: this.handleOnClearCachePress });
    }

    public componentDidUpdate() {
        if (this.state.reloading) {
            this.setState({reloading: false});
        }
    }

    public render() {
        if (this.state.reloading) {
            return null;
        }

        if (this.props.serviceProviders!.length === 0) {
            return (
                <BaseView>
                    <Text h3>Retrieving metadata...</Text>
                    <ActivityIndicator size="large" color={COLOR_SECONDARY_DARK}/>
                </BaseView>
            )
        }
        return (
            <>
                <PhotoGrid
                    data={this.props.serviceProviders!}
                    itemsPerRow={4}
                    renderItem={this.renderItem}
                />
                <FloatingMediaControlsButton/>
            </>
        );
    }

    /**
     * Renders an SPI file representation.
     * @param item: The url to the SPI file.
     * @param itemSize: The width and height of the component.
     */
    private renderItem = (item: SPICacheContainer, itemSize: number) => (
        <ServiceProviderRenderer
            navigationProp={this.props}
            key={item.spUrl}
            itemSize={itemSize}
            serviceProvider={item}
        />
    );

    private handleOnClearCachePress = async () => {
        // TODO move clear cache to kokoro
        // await clearCache();
        this.setState({reloading: true})
    };
}

export const HomeScreen = connect(
    (state: RootReducerState) => ({
        serviceProviders: state.serviceProviders.serviceProviders,
    }),
)(HomeScreenContainer);
