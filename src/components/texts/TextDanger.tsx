import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";
import {COLOR_PRIMARY} from "../../colors";

/**
 * Renders a "Danger text". It consists of a white text over a red background.
 * @param props: Standard react native TextProps.
 */
export const TextDanger: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), textAlign: "center", color: COLOR_PRIMARY, fontSize: 20}}>{props.children}</Text>;
