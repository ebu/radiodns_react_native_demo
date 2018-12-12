import * as React from "react";
import {ErrorInfo} from "react";
import {StyleSheet, Text, View} from "react-native";
import {Icon} from "react-native-elements";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {RootReducerState} from "../../reducers/root-reducer";
import {setNextStream, setPreviousStream} from "../../reducers/streams";
import {COLOR_DANGER, COLOR_PRIMARY} from "../../styles";
import {MediaPlayNextButton} from "../buttons/MediaPlayNextButton";
import {MediaPlayPreviousButton} from "../buttons/MediaPlayPreviousButton";
import {BaseView} from "../views/BaseView";

interface Props {
    // injected
    error?: boolean;
    onNextPressed?: () => void;
    onPreviousPressed?: () => void;
    closeModal?: () => void;
}

interface State {
    hasError: boolean;
}

class MediaPlayerErrorContainer extends React.Component<Props, State> {

    public static getDerivedStateFromError(_: any) {
        return {hasError: true};
    }

    public readonly state = {
        hasError: false,
    };

    public componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(error, info);
    }

    public render() {
        if (this.state.hasError || this.props.error) {
            return (
                <BaseView backgroundColor={COLOR_DANGER}>
                    <Icon name="error-outline" color={COLOR_PRIMARY} size={200}/>
                    <View style={{flex: 0.3}}/>
                    <Text style={styles.textDanger}>
                        An error has occurred and this application cannot listen to this ip station.
                    </Text>
                    <View style={{flex: 0.3}}/>
                    <View style={{flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <MediaPlayNextButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                        <View style={{flex: 0.2}}/>
                        <Text style={styles.textDanger}>
                            Try an other station
                        </Text>
                        <View style={{flex: 0.2}}/>
                        <MediaPlayPreviousButton color={COLOR_PRIMARY} backgroundColor={COLOR_DANGER}/>
                    </View>
                </BaseView>
            );
        }
        return this.props.children;
    }
}

export const MediaPlayerErrorBoundary = connect(
    (state: RootReducerState) => ({error: state.streams.error}),
    ((dispatch: Dispatch) => ({
        onNextPressed: () => dispatch(setNextStream()),
        onPreviousPressed: () => dispatch(setPreviousStream()),
    })),
)(MediaPlayerErrorContainer);

const styles = StyleSheet.create({
    textDanger: {
        textAlign: "center",
        color: COLOR_PRIMARY,
        fontSize: 20,
    },
});
