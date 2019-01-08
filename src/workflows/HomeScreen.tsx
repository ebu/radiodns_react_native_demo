import * as React from "react";
import {Button} from "react-native-elements";
import {NavigationScreenDetails, NavigationScreenProps} from "react-navigation";
import {COLOR_SECONDARY_DARK} from "../colors";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {ServiceProviderRenderer} from "../components/renderers/ServiceProviderRenderer";
import {PhotoGrid} from "../components/views/PhotoGrid";
import {SERVICE_PROVIDERS} from "../constants";
import {clearCache} from "../services/SPICache";

interface State {
    serviceProviderUrls: string[];
    reloading: boolean;
}

/**
 * Home screen with the list of service providers.
 */
export class HomeScreen extends React.Component<NavigationScreenProps, State> {

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
        serviceProviderUrls: SERVICE_PROVIDERS,
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
        return (
            <>
                <PhotoGrid
                    data={this.state.serviceProviderUrls}
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
    private renderItem = (item: string, itemSize: number) => (
        <ServiceProviderRenderer
            navigationProp={this.props}
            key={item}
            itemSize={itemSize}
            serviceProviderKey={item}
            onInvalidData={this.removeItemIfBadData(item)}
        />
    );

    /**
     * Callback to remove from the serviceProviderUrls any service provider that has an SPI file that does not have at least one IP station.
     * @param key: The service provider url to remove.
     */
    private removeItemIfBadData = (key: string) => () => {
        this.setState({
            serviceProviderUrls: this.state.serviceProviderUrls.filter((item) => item !== key),
        });
    };

    private handleOnClearCachePress = async () => {
        await clearCache();
        this.setState({reloading: true})
    };
}
