import * as React from "react";
import {NavigationScreenProps} from "react-navigation";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {ServiceProviderRenderer} from "../components/renderers/ServiceProviderRenderer";
import {PhotoGrid} from "../components/views/PhotoGrid";
import {SERVICE_PROVIDERS} from "../constants";

/**
 * Home screen with the list of service providers.
 */
export class HomeScreen extends React.Component<NavigationScreenProps, { serviceProviderUrls: string[] }> {
    public static navigationOptions = {
        title: "Home",
    };

    public readonly state = {
        serviceProviderUrls: SERVICE_PROVIDERS,
    };

    public render() {
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
    }
}
