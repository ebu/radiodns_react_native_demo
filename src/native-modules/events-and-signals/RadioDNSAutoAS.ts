export enum Signal {
    /**
     * Signal stating that the media player has finished buffering the media and is now
     * playing content.
     */
    UPDATE_MEDIA_STATE_TO_PLAYING = 100,

    /**
     * Signal stating that the media player has started buffering the media.
     */
    UPDATE_MEDIA_STATE_TO_BUFFERING = 101,

    /**
     * Signal stating that exo player cannot read the current station.
     */
    UPDATE_MEDIA_STATE_TO_ERROR = 102,
}
