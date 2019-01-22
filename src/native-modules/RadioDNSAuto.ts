import {NativeModules} from "react-native";

export interface RadioDNSAuto {
    addNode: (childOf: string, key: string, value: string, imageURI: string, streamURI: string | null) => void;
}

const RadioDNSAuto: RadioDNSAuto = NativeModules.RadioDNSAuto;

export default RadioDNSAuto;
