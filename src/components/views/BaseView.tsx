import * as React from "react";
import {View} from "react-native";

interface Props {
    backgroundColor?: string;
}

/**
 * Base View (layout) for the application.
 * @param props: Object containing the background color for the view.
 */
export const BaseView: React.FC<Props> = (props) => (
    <View
        style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
            ...props,
        }}
    >
        {props.children}
    </View>
);
