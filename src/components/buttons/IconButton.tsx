import * as React from "react";
import {TouchableOpacity, TouchableOpacityProps} from "react-native";
import {Icon} from "react-native-elements";

interface Props extends TouchableOpacityProps {
    iconName: string;
    color: string;
    backgroundColor: string;
    withBorder?: boolean;
    big?: boolean;
}

export const IconButton: React.FC<Props> = (props) => (
    <TouchableOpacity
        style={{
            borderWidth: props.withBorder ? 1 : 0,
            borderColor: props.color,
            alignItems: "center",
            justifyContent: "center",
            width: props.big ? 80 : 40,
            height: props.big ? 80 : 40,
            borderRadius: 100,
        }}
        {...props}
    >
        <Icon name={props.iconName} size={props.big ? 70 : 30} color={props.color}/>
    </TouchableOpacity>
);
