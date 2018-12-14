import * as React from "react";
import {ErrorInfo} from "react";
import {connect} from "react-redux";
import {RootReducerState} from "../../reducers/root-reducer";

interface Props {
    // injected
    error?: boolean;
}

// TODO verify that we are on the player screen to display this error.
/**
 * Player error display. Will display an error message if the player failed to load the stream.
 */
class PlayerErrorBoundaryContainer extends React.Component<Props> {

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service
        // TODO Upload this into some sort of monitoring service.
        console.warn(error, errorInfo);
    }

    public render() {
        if (this.props.error) {
            return null;
        }
        return this.props.children;
    }
}

export const PlayerErrorBoundary = connect(
    (state: RootReducerState) => ({error: state.streams.error}),
)(PlayerErrorBoundaryContainer);
