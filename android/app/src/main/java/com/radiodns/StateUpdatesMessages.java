package com.radiodns;

/**
 * Messages from RadioDNS native modules to the JS side of the app.
 * Theses messages types are used to update the playback state of the app.
 */
public class StateUpdatesMessages {
    /**
     * Updates the playback state to "PLAYING". If this message comes with a station id it means
     * to set this stations as the one being played. Otherwise it just instructs to resume playing
     * the current station.
     */
    public static final String PLAY = "PLAYING";

    /**
     * Updates the playback state to "PAUSED".
     */
    public static final String PAUSE = "PAUSED";

    /**
     * Updates the playback state to "NEXT". Instructs to play the next station in the current playlist
     * if any.
     */
    public static final String NEXT = "NEXT";

    /**
     * Updates the playback state to "PREVIOUS". Instructs to play the previous station in the
     * current playlist if any.
     */
    public static final String PREVIOUS = "PREVIOUS";

    /**
     * Updates the playback state to "STOP". Kills the app.
     */
    public static final String STOP = "STOPPED";
}
