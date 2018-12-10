import * as React from "react";
import {View} from "react-native";

export const PaddedView: React.FC = (props) => (
    <View
        style={{
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 10,
            paddingStart: 10,
        }}
    >
        {props.children}
    </View>
);
