import * as React from "react";
import {TouchableOpacity, TouchableOpacityProps} from "react-native";
import {Icon} from "react-native-elements";

interface Props extends TouchableOpacityProps {
    // The name of the icon (from font awesome).
    iconName: string;
    // The color of the icon.
    color: string;
    // The background color of the components.
    backgroundColor: string;
    // The width of the border.
    withBorder?: boolean;
    // If true, the button will have a width and height of 80 px. 40 otherwise.
    big?: boolean;
}

/**
 * Configurable icon button (icon name from font awesome).
 * @param props: The component props.
 */
export const IconButton: React.FC<Props> = (props) => (
    <TouchableOpacity
        {...props}
        style={{
            borderWidth: props.withBorder ? 1 : 0,
            borderColor: props.color,
            alignItems: "center",
            justifyContent: "center",
            width: props.big ? 80 : 40,
            height: props.big ? 80 : 40,
            borderRadius: 100,
        }}
    >
        <Icon name={props.iconName} size={props.big ? 70 : 30} color={props.color}/>
    </TouchableOpacity>
);
