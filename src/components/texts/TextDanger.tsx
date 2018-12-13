import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";
import {COLOR_PRIMARY} from "../../styles";

export const TextDanger: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), textAlign: "center", color: COLOR_PRIMARY, fontSize: 20}}>{props.children}</Text>;
