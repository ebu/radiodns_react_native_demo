import * as React from "react";
import {ActivityIndicator, FlatList, ListRenderItemInfo} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {StreamItemRenderer} from "../components/lists-item-renderers/StreamItemRenderer";
import {BigText} from "../components/texts/BigText";
import {BaseView} from "../components/views/BaseView";
import {Stream} from "../models/Stream";
import {RootReducerState} from "../reducers/root-reducer";
import {setActiveStream} from "../reducers/streams";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";

interface Props extends NavigationScreenProps {
    loadingStreamsState?: "LOADING" | "ERROR" | "SUCCESS";
    streams?: Stream[];
    setActiveStream?: (stream: Stream) => void;
}

export class HomeScreenContainer extends React.Component<Props> {
    public static navigationOptions = {
        title: "Home",
    };

    public render() {
        return (
            <BaseView backgroundColor={COLOR_PRIMARY}>
                {this.props.loadingStreamsState === "LOADING" &&
                <>
                    <ActivityIndicator size="large" style={{width: 80, height: 80}} color={COLOR_SECONDARY}/>
                    <BigText>Loading metadata...</BigText>
                </>}
                {this.props.loadingStreamsState === "SUCCESS" &&
                <FlatList
                    style={{width: "100%"}}
                    data={this.props.streams}
                    renderItem={this.renderStream}
                />}
                {this.props.loadingStreamsState === "ERROR" &&
                <BigText>Failed to load the metadata.</BigText>}
            </BaseView>
        );
    }

    private renderStream = ({item, index}: ListRenderItemInfo<Stream>) => (
        <StreamItemRenderer
            key={index}
            stream={item}
            onPress={this.activateAndNavigateToStream(item)}
        />);

    private activateAndNavigateToStream = (stream: Stream) => () => {
        this.props.setActiveStream(stream);
        this.props.navigation.navigate("PlayerView")
    }
}

export const HomeScreen = connect(
    (state: RootReducerState) => ({
        loadingStreamsState: state.streams.loadingStreamsState,
        streams: state.streams.streams,
    }),
    ((dispatch) => ({
        setActiveStream: (stream: Stream) => dispatch(setActiveStream(stream)),
    })),
)(HomeScreenContainer);
