import * as React from "react";
import {NavigationScreenProps} from "react-navigation";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {PhotoGrid} from "../components/PhotoGrid";
import {ServiceProviderRenderer} from "../components/renderers/ServiceProviderRenderer";
import {SERVICE_PROVIDERS} from "../constants";

interface State {
    data: string[];
}

/**
 * Home screen with the list of service providers.
 */
export class HomeScreen extends React.Component<NavigationScreenProps, State> {
    public static navigationOptions = {
        title: "Home",
    };

    public readonly state = {
        data: SERVICE_PROVIDERS,
    };

    public render() {
        return (
            <>
                <PhotoGrid
                    data={this.state.data}
                    itemsPerRow={4}
                    renderItem={this.renderItem}
                />
                <FloatingMediaControlsButton/>
            </>
        );
    }

    private renderItem = (item: string, itemSize: number) => (
        <ServiceProviderRenderer
            navigationProp={this.props}
            key={item}
            itemSize={itemSize}
            serviceProviderKey={item}
            onInvalidData={this.removeItemIfBadData(item)}
        />
    );

    private removeItemIfBadData = (key: string) => () => {
        this.setState({
                data: Array.from(this.state.data
                    .filter((item) => item !== key)),
            },
        );
    }
}
