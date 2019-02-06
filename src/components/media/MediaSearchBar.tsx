import * as React from "react";
import {SearchBar} from "react-native-elements";
import {connect} from "react-redux";
import {COLOR_SECONDARY} from "../../colors";
import {setStationsVisibility} from "../../kokoro/reducers/stations";
import {dispatch} from "../../native-modules/Kokoro";

interface Props {
    // injected
    setStationsVisibility?: (searchedStation: string) => void;
}

/**
 * Station search bar. Component read to use as it is. Sets the visibility of stations in the station reducer.
 */
class StationSearchBarContainer extends React.Component<Props> {
    public render() {
        return (
            <SearchBar
                lightTheme
                round
                onChangeText={this.onChangeText}
                onClearText={this.onClearText}
                icon={{type: "font-awesome", name: "search"}}
                placeholder="Search a station here..."
                containerStyle={{
                    backgroundColor: COLOR_SECONDARY,
                }}
            />
        );
    }

    private onChangeText = (val: string) => this.props.setStationsVisibility!(val);
    private onClearText = () => this.props.setStationsVisibility!("");
}

export const MediaSearchBar = connect(
    () => ({}),
    (() => ({
        setStationsVisibility: (searchedStation: string) => dispatch(setStationsVisibility(searchedStation)),
    })),
)(StationSearchBarContainer);
