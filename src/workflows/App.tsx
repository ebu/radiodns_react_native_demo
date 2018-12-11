import * as React from "react";
import {View} from "react-native";
import PushNotification from "react-native-push-notification";
import {Provider} from "react-redux";
import {createStore} from "redux";
import {MediaPlayerErrorBoundary} from "../components/error-boundaries/MediaPlayerErrorBoundary";
import {PUSH_NOTIFICATION_ID} from "../constants";
import {rootReducer} from "../reducers/root-reducer";
import {loadStreams, setActiveStream} from "../reducers/streams";
import {COLOR_PRIMARY} from "../styles";
import {PlayerView} from "./PlayerView";

const store = createStore(rootReducer);

store.dispatch(loadStreams([
    {
        stationName: "Rouge fm",
        uri: "http://rougefm.ice.infomaniak.ch/rougefm-high.mp3",
        logoUri: "https://upload.wikimedia.org/wikipedia/fr/9/92/Rouge_FM_2011_logo.png",
    },
    {
        stationName: "7radio",
        uri: "http://178.32.107.33/7radio-192k.mp3",
        logoUri: "https://www.7radio.ch/7radio/wp-content/uploads/2014/08/7radio-logo-bleu-sans-texte-1024x905.png",
    },
    {
        stationName: "Unknown radio",
        uri: "http://178.32.107.33/7rasfgsdgsdfhghdio-192k.mp3",
        logoUri: "https://www.7radio.ch/7radio/wp-content/-sans-texte-1024x905.png",
    },
]));

store.dispatch(setActiveStream(
    {
        stationName: "Unknown radio",
        uri: "http://178.32.107.33/7rasfgsdgsdfhghdio-192k.mp3",
        logoUri: "https://www.7radio.ch/7radio/wp-content/-sans-texte-1024x905.png",
    },
));

export default class App extends React.Component {

    public componentWillMount() {
        PushNotification.configure({
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            requestPermissions: true,
        });
    }

    public render() {
        return (
            <Provider store={store}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: COLOR_PRIMARY,
                    }}
                >
                    <MediaPlayerErrorBoundary>
                        <PlayerView/>
                    </MediaPlayerErrorBoundary>
                </View>
            </Provider>
        );
    }

    public componentWillUnmount() {
        PushNotification.cancelLocalNotifications({id: PUSH_NOTIFICATION_ID});
    }
}
