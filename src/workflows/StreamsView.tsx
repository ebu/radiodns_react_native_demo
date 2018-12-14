import * as React from "react";
import {ActivityIndicator, FlatList, ListRenderItemInfo} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {connect} from "react-redux";
import {FloatingMediaControlsButton} from "../components/media/FloatingMediaPausePlayButton";
import {MediaSearchBar} from "../components/media/MediaSearchBar";
import {StreamItemRenderer} from "../components/renderers/StreamItemRenderer";
import {BigText} from "../components/texts/BigText";
import {BaseView} from "../components/views/BaseView";
import {Stream} from "../models/Stream";
import {RootReducerState} from "../reducers/root-reducer";
import {setActiveStream, setStreamsVisibility} from "../reducers/streams";
import {COLOR_PRIMARY, COLOR_SECONDARY} from "../styles";
import {injectedFunctionInvoker} from "../utilities";

interface Props extends NavigationScreenProps {
    // injected
    loadingStreamsState?: "LOADING" | "ERROR" | "SUCCESS";
    streams?: Stream[];
    setActiveStream?: (stream: Stream) => void;
}

/**
 * Streams view screen with the list of ip stations from a service provider.
 */
export class StreamsViewContainer extends React.Component<Props> {
    public static navigationOptions = {
        title: "Streams",
        headerRight: <MediaSearchBar/>,
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
                    data={this.props.streams ? this.props.streams.filter((s) => s.visible) : []}
                    renderItem={this.renderStream}
                />}
                {this.props.loadingStreamsState === "ERROR" &&
                <BigText>Failed to load the metadata.</BigText>}
                <FloatingMediaControlsButton/>
            </BaseView>
        );
    }

    private renderStream = ({item, index}: ListRenderItemInfo<Stream>) => (
        <StreamItemRenderer
            key={index}
            stream={item}
            onPress={this.activateAndNavigateToStream(item)}
        />);

    /**
     * Creates a function that can set the current active stream and navigate to the player view.
     * @param stream: The stream that would be active.
     */
    private activateAndNavigateToStream = (stream: Stream) => () => {
        injectedFunctionInvoker(this.props.setActiveStream, stream);
        this.props.navigation.navigate("PlayerView")
    };
}

export const StreamsView = connect(
    (state: RootReducerState) => ({
        loadingStreamsState: state.streams.loadingStreamsState,
        streams: state.streams.streams,
        searchedStream: state.streams.searchedStream,
    }),
    ((dispatch) => ({
        setActiveStream: (stream: Stream) => dispatch(setActiveStream(stream)),
        setStreamsVisibility: (searchedStream: string) => dispatch(setStreamsVisibility(searchedStream)),
    })),
)(StreamsViewContainer);
