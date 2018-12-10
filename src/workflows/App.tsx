import * as React from "react";
import {View} from "react-native";
import PushNotification from "react-native-push-notification";
import {COLOR_PRIMARY} from "../styles";
import {AudioPlayer} from "./AudioPlayer";

export default class App extends React.Component {

    // public async componentWillMount() {
    //     this.setState({serviceInformation: await getSpi()});
    // }

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
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLOR_PRIMARY,
                }}
            >
                <AudioPlayer/>
            </View>
        );
    }
}
