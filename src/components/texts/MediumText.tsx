import * as React from "react";
import {TextProps} from "react-native";
import {Text} from "react-native-elements";

/**
 * Renders a "medium sized text".
 * @param props: Standard react native TextProps.
 */
export const MediumText: React.FC<TextProps> = (props) =>
    <Text {...props} style={{...(props.style as object), fontSize: 16}}>{props.children}</Text>;
