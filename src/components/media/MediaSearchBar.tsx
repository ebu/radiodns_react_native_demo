import * as React from "react";
import {SearchBar} from "react-native-elements";
import {connect} from "react-redux";
import {setStreamsVisibility} from "../../reducers/streams";
import {COLOR_SECONDARY} from "../../styles";
import {injectedFunctionInvoker} from "../../utilities";

interface Props {
    // injected
    setStreamsVisibility?: (searchStream: string) => void;
}

class MediaSearchBarContainer extends React.Component<Props> {
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

    private onChangeText = (val: string) => injectedFunctionInvoker(this.props.setStreamsVisibility, val);
    private onClearText = () => injectedFunctionInvoker(this.props.setStreamsVisibility, "");
}

export const MediaSearchBar = connect(
    () => ({}),
    ((dispatch) => ({
        setStreamsVisibility: (searchedStream: string) => dispatch(setStreamsVisibility(searchedStream)),
    })),
)(MediaSearchBarContainer);
