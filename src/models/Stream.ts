import {ParsedService} from "./SPIModel";

export interface Stream extends ParsedService {
    bearer: {
        _attributes: {
            id: string;
            cost: string;
            offset?: string;
            mimeValue: "audio/aacp" | "audio/mpeg";
        },
    },
}
