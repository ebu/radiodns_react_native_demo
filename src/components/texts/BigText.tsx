import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";

/**
 * Renders a "big sized text".
 * @param props: Standard react native TextProps.
 */
export const BigText: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), fontWeight: "bold", fontSize: 20}}>{props.children}</Text>;
