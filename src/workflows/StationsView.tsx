import * as React from "react";
import {FlatList, ListRenderItemInfo} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {Service} from "spi_xml_file_parser/artifacts/src/models/parsed-si-file";
import {COLOR_PRIMARY} from "../colors";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {MediaSearchBar} from "../components/media/MediaSearchBar";
import {StationItemRenderer} from "../components/renderers/StationItemRenderer";
import {BaseView} from "../components/views/BaseView";
import {setActiveStation, setStationPlaylist} from "../kokoro/reducers/stations";
import {dispatch} from "../native-modules/Kokoro";
import {RootReducerState} from "../reducers/slave-reducer";

interface Props extends NavigationScreenProps {
    // injected
    stations?: Service[];
    searchedStation?: string;
    setActiveStation?: (station: Service) => void;
    setStationPlaylist?: (stations: Service[]) => void;
}

/**
 * Station view screen with the list of ip stations from a service provider.
 */
export class StationsViewContainer extends React.Component<Props> {
    public static navigationOptions = {
        title: "Stations",
        headerRight: <MediaSearchBar/>,
    };

    public render() {
        return (
            <BaseView backgroundColor={COLOR_PRIMARY}>
                <FlatList
                    style={{width: "100%"}}
                    data={this.props.stations ? this.props.stations.filter((station) =>
                        (station.mediumName || "").toLocaleLowerCase().includes(this.props.searchedStation || "")) : []}
                    renderItem={this.renderStation}
                    extraData={this.props.searchedStation}
                />
                <FloatingMediaControlsButton/>
            </BaseView>
        );
    }

    private renderStation = ({item, index}: ListRenderItemInfo<Service>) => (
        <StationItemRenderer
            key={index}
            station={item}
            onPress={this.activateAndNavigateToStation(item)}
        />);

    /**
     * Creates a function that can set the current active station and navigate to the player view.
     * @param station: The station that would be active.
     */
    private activateAndNavigateToStation = (station: Service) => () => {
        this.props.setStationPlaylist!(this.props.stations!);
        this.props.setActiveStation!(station);
        this.props.navigation.navigate("PlayerView")
    };
}

export const StationsView = connect(
    (state: RootReducerState) => ({
        stations: state.stations.stations_currently_visible,
        searchedStation: state.stations.searchedStation,
    }),
    (() => ({
        setActiveStation: (station: Service) => dispatch(setActiveStation(station)),
        setStationPlaylist: (stations: Service[]) => dispatch(setStationPlaylist(stations)),
    })),
)(StationsViewContainer);
