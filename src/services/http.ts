import {xml2js} from "xml-js";
import {API_URL} from "../constants";

export const getSpi: () => Promise<any> = async () => {
    const serviceInformation = await fetch(API_URL)
        .then((response) => response.text())
        .then((responseText) => xml2js(responseText, {compact: true}));
    console.log(serviceInformation);
};
