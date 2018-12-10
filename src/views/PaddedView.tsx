import * as React from "react";
import {View} from "react-native";

export const PaddedView: React.FC = (props) => (
    <View
        style={{
            padding: "padding: 10px 10px 10px 10px;",
        }}
    >
        {props.children}
    </View>
);
