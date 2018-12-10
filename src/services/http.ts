import {xml2json} from "xml-js";
import {ZZEBU_API_URL} from "../constants";

export const getSpi: () => Promise<ServiceInformation> = async () => {
    const serviceInformation: ServiceInformation = JSON.parse(await fetch(ZZEBU_API_URL)
        .then((response) => response.text())
        .then((responseText) => xml2json(responseText, {compact: true}))
        .catch((error) => {
            console.error(error);
            return "";
        })).serviceInformation;
    serviceInformation.services.service = serviceInformation.services.service.filter(
        (service) => !!service.bearer &&
            (Array.isArray(service.bearer)
                ? service.bearer.some((attrib) => !!attrib._attributes.bitrate)
                : !!(service.bearer as BearerAttributes)._attributes.bitrate));
    return serviceInformation;
};
