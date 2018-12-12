import * as React from "react";
import {Button, Text} from "react-native";
import {NavigationScreenProps} from "react-navigation";
import {BaseView} from "../components/views/BaseView";
import {COLOR_PRIMARY} from "../styles";

export class HomeScreen extends React.Component<NavigationScreenProps> {
    public static navigationOptions = {
        title: "Home",
    };

    public render() {
        return (
            <BaseView backgroundColor={COLOR_PRIMARY}>
                <Text> Main Screen </Text>
                <Button
                    title="Go to player"
                    onPress={this.handleClick}
                />
            </BaseView>
        );
    }

    private handleClick = () => this.props.navigation.navigate("PlayerView");
}
