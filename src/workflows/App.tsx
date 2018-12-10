import * as React from "react";
import {StyleSheet, View} from "react-native";
import {getSpi} from "../services/http";
import {AudioPlayer} from "./AudioPlayer";


export default class App extends React.Component {

    public async componentWillMount() {
        this.setState({serviceInformation: await getSpi()});
    }

    public render() {
        return (
            <View style={styles.container}>
                <AudioPlayer/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
