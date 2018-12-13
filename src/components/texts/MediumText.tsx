import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";

export const MediumText: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), fontSize: 16}}>{props.children}</Text>;
