import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";

export const BigText: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), fontWeight: "bold", fontSize: 20}}>{props.children}</Text>;
