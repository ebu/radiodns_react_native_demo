import * as React from "react";
import {View} from "react-native";
import {COLOR_PRIMARY} from "../styles";
import {AudioPlayer} from "./AudioPlayer";

export default class App extends React.Component {

    // public async componentWillMount() {
    //     this.setState({serviceInformation: await getSpi()});
    // }

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
