import * as React from "react";
import PhotoGrid from "react-native-photo-grid";
import {NavigationScreenProps} from "react-navigation";
import {ServiceProviderRenderer} from "../components/renderers/ServiceProviderRenderer";
import {SERVICE_PROVIDERS} from "../constants";

/**
 * Home screen with the list of service providers.
 */
export class HomeScreen extends React.Component<NavigationScreenProps, Array<{ id: number, key: string }>> {
    public static navigationOptions = {
        title: "Home",
    };

    public readonly state = SERVICE_PROVIDERS.map((key, i) => {
        return {id: i, key};
    });

    public render() {
        return (
            <PhotoGrid
                data={this.state}
                itemsPerRow={4}
                renderItem={this.renderItem}
            />
        );
    }

    private renderItem = (item: { id: number, key: string }, itemSize: number) => (
        <ServiceProviderRenderer
            navigationProp={this.props}
            key={item.id}
            itemSize={itemSize}
            serviceProviderKey={item.key}
        />
    );
}
