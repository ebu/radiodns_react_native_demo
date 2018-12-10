interface BearerAttributes {
    _attributes: {
        id?: string;
        cost: number;
        offset?: number;
        mimeValue?: string;
        bitrate?: number;
    };
}

interface Service {
    shortName: { _text: string; };
    longName: { _text: string; };
    bearer: BearerAttributes | BearerAttributes[];
}

interface ServiceInformation {
    services: {
        service: Service[],
        serviceProvider: any,
    };
}
