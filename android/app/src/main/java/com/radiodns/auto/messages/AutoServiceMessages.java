package com.radiodns.auto.messages;

public class AutoServiceMessages {

    // INTERNAL
    /**
     * An activity will bind itself to the MediaService.
     */
    public final static int REGISTER_CLIENT = 1;

    /**
     * An activity will unbind itself to the MediaService.
     */
    public final static int UNREGISTER_CLIENT = 2;

    /**
     * The database will be wiped.
     */
    public final static int RESET_DB = 3;

    /**
     * The contents of Android Auto will be refreshed from the new state that was pushed to the database.
     */
    public final static int REFRESH_FROM_DB = 4;

    /**
     * Send to the JS bundle the new state for the media player.
     */
    public final static int SEND_NEW_PLAYER_STATE_EVENT = 5;

    /**
     * Send to the JS bundle the new search string (string from which a new station shall be picked).
     */
    public final static int SEND_PLAY_FROM_SEARCH_STRING = 6;

    /**
     * Play a random station.
     */
    public final static int SEND_PLAY_RANDOM = 7;


    // SIGNALS
    /**
     * **SIGNAL** Signal stating that the media player has finished buffering the media and is now
     * playing content.
     */
    public final static int UPDATE_MEDIA_STATE_TO_PLAYING = 100;

    /**
     * **SIGNAL** Signal stating that the media player has started buffering the media.
     */
    public final static int UPDATE_MEDIA_STATE_TO_BUFFERING = 101;

    /**
     * **SIGNAL** Signal stating that exo player cannot read the current station
     */
    public final static int UPDATE_MEDIA_STATE_TO_ERROR = 102;

    /**
     * **SIGNAL** Signal to set the current channel id.
     */
    public final static int UPDATE_CURRENT_CHANNEL_ID = 103;
}
