// Declare LiquidCore capabilities.
import {IncomingMessageType, OutgoingMessageType} from "../messages";

declare class LiquidCore {
    public static on: (eventName: string, handler: (msg: any) => void) => void;
    public static emit: (eventName: string, msg?: any) => void;
}

export const httpRequest: (method: "GET" | "POST" | "PUT" | "PATCH", url: string, body?: any) =>
    Promise<{ status: number, data: string | null } | null>
    = ((method, url, body) => {
    return new Promise((resolve, reject) => {
        const transactionId = uuidv4();
        LiquidCore.on(IncomingMessageType.HTTP_CALL_RESPONSE + transactionId, (res: { status: number, body?: string }) => {
            if (200 <= res.status && res.status < 400) {
                try {
                    console.log("DEBUG: HTTP RESPONSE!", res.status, url, transactionId);
                    resolve({status: res.status, data: res.body || null});
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(res.status);
            }
        });
        // LiquidCore.on(IncomingMessageType.HTTP_CALL_ERROR, reject);
        LiquidCore.emit(OutgoingMessageType.MAKE_HTTP_CALL_INTENT, {
            method,
            url,
            body: body ? JSON.stringify(body) : undefined,
            transactionId,
        });
    });
});

// tslint:disable
const uuidv4 = () => {
    let uuid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i == 8 || i == 12 || i == 16 || i == 20) {
            uuid += "-"
        }
        uuid += (i == 12 ? 4 : (i == 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uuid;
};
