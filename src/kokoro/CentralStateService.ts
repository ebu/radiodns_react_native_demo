import {store} from "./reducers/root-reducer";

// Types
enum MessageType {
    DISPATCH_ACTION = "DISPATCH_ACTION",
}

interface ParsedEmittedMessage {
    type: MessageType;
    payload: any;
}

// Declare LiquidCore capabilities.
declare class LiquidCore {
    public static on: (eventName: string, handler: (msg: string) => void) => void;
    public static emit: (eventName: string, msg?: { msg: string }) => void;
}

// redux listener + Native listener.
store.subscribe(() => {
    LiquidCore.emit("UPDATE_STATE", {msg: JSON.stringify(store.getState())});
    console.log("OUIIII ON A RECUT LE SUBSCRIBE");
    // TODO: emit also other events based on what has changed.
});

LiquidCore.on("EMIT_MESSAGE", (rawMsg) => {
    const msg: ParsedEmittedMessage = JSON.parse(rawMsg);
    console.log("YOU GOT MESSAGE!", rawMsg);
    switch (msg.type) {
        case MessageType.DISPATCH_ACTION:
            store.dispatch(msg.payload);
            break;
        default:
            console.warn("Unknown message type:", msg.type);
    }
});

console.log("READY!!!!!!", LiquidCore);
LiquidCore.emit("READY");

const theShowNeverEnds = () => setTimeout(theShowNeverEnds, 1000);
theShowNeverEnds();
