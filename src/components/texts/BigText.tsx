import * as React from "react";
import {Text} from "react-native-elements";

export const BigText: React.FC = (props) =>
    <Text style={{fontWeight: "bold", fontSize: 20}}>{props.children}</Text>;
