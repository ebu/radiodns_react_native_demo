import * as React from "react";
import {ActivityIndicator, FlatList, ListRenderItemInfo} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../colors";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {MediaSearchBar} from "../components/media/MediaSearchBar";
import {StationItemRenderer} from "../components/renderers/StationItemRenderer";
import {BigText} from "../components/texts/BigText";
import {BaseView} from "../components/views/BaseView";
import {Station} from "../models/Station";
import {RootReducerState} from "../reducers/root-reducer";
import {setActiveStation} from "../reducers/stations";

interface Props extends NavigationScreenProps {
    // injected
    loadingStationsState?: "LOADING" | "ERROR" | "SUCCESS";
    stations?: Station[];
    setActiveStation?: (station: Station) => void;
    searchedStation?: string;
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
                {this.props.loadingStationsState === "LOADING" &&
                <>
                    <ActivityIndicator size="large" style={{width: 80, height: 80}} color={COLOR_SECONDARY}/>
                    <BigText>Loading metadata...</BigText>
                </>}
                {this.props.loadingStationsState === "SUCCESS" &&
                <FlatList
                    style={{width: "100%"}}
                    data={this.props.stations ? this.props.stations.filter((station) =>
                        station.mediumName.toLocaleLowerCase().includes(this.props.searchedStation || "")) : []}
                    renderItem={this.renderStation}
                    extraData={this.props.searchedStation}
                />}
                {this.props.loadingStationsState === "ERROR" &&
                <BigText>Failed to load the metadata.</BigText>}
                <FloatingMediaControlsButton/>
            </BaseView>
        );
    }

    private renderStation = ({item, index}: ListRenderItemInfo<Station>) => (
        <StationItemRenderer
            key={index}
            station={item}
            onPress={this.activateAndNavigateToStation(item)}
        />);

    /**
     * Creates a function that can set the current active station and navigate to the player view.
     * @param station: The station that would be active.
     */
    private activateAndNavigateToStation = (station: Station) => () => {
        this.props.setActiveStation!(station);
        this.props.navigation.navigate("PlayerView")
    };
}

export const StationsView = connect(
    (state: RootReducerState) => ({
        loadingStationsState: state.stations.loadingStationsState,
        stations: state.stations.stations,
        searchedStation: state.stations.searchedStation,
    }),
    ((dispatch) => ({
        setActiveStation: (station: Station) => dispatch(setActiveStation(station)),
    })),
)(StationsViewContainer);
