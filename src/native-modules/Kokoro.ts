import {NativeModules} from "react-native";
import {Action} from "redux";

export const dispatch: (action: Action<any>) => void = (action) =>
    NativeModules.Kokoro.dispatch(JSON.stringify({
        type: "DISPATCH_ACTION",
        payload: action,
    }));
