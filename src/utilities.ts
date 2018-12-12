import {MediaDescription} from "./models/SPIModel";

export const getMedia = (medias: MediaDescription[]) => medias.reduce(
    (best, current) =>
        parseInt(current.multimedia._attributes.width, 10) > parseInt(best.multimedia._attributes.width, 10)
            ? current
            : best).multimedia._attributes.url;

export const isWebScheme = (url: string) =>
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(url);
