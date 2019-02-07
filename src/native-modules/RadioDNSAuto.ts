import {NativeModules} from "react-native";

/**
 * RadioDNS Android Auto module. This module handle the android auto music playback capabilities of
 * the demonstrator. It provides an easy way to build the android auto layout + bindings to the media
 * controls.
 */
export interface RadioDNSAuto {
    /**
     * Adds a node for the RadioDNS Android Auto module. Theses nodes are the representation of the
     * interface of the RadioDNS demonstrator in the Android Auto mode.
     *
     * Nodes behave as "browsable" or "playable" elements that form a tree. So each element has a parent.
     *
     * It look something like this:
     *
     *              root
     *             /   \
     *    Browsable1   Song 2
     *          /
     *       Song 1
     *
     * You can add a node anywhere on the tree as long as its parent is of type "browsable".
     *
     * The root node of the tree has as key "root".
     *
     * @param childOf:   The parent of this node. Use "root" for the top level elements.
     * @param key:       The key of the node. Should be unique in its subtree.
     * @param value:     The value of the node. It will be the title for browsable and playable elements.
     * @param imageURI:  Image uri for this node. Will be the folder icon for browsable elements and the art cover for
     * playable elements.
     * @param streamURI: If not null, the node will be considered as a playable node by android auto.
     *                   Otherwise it will be browsable.
     */
    addNode: (childOf: string, key: string, value: string, imageURI: string, streamURI: string | null) => void;

    /**
     * Refreshes the contents of android auto.
     */
    refresh: () => void;

    /**
     * Sends an signal to the AutoService. A signal is just a number that has a certain meaning for
     * the application. Refer to the [Signal] enum for a list of integers that can be used as signals.
     */
    sendSignal: (signal: number) => void;

    /**
     * Updates the current channel id. Note that this method will only set the metadata for this channel,
     * not play it.
     * @param channelId: The channel id.
     */
    updateChannelId: (channelId: string) => void;
}

const RadioDNSAuto: RadioDNSAuto = NativeModules.RadioDNSAuto;

export default RadioDNSAuto;
