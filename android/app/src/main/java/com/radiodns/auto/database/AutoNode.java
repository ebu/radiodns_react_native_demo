package com.radiodns.auto.database;

import android.arch.persistence.room.ColumnInfo;
import android.arch.persistence.room.Entity;
import android.arch.persistence.room.PrimaryKey;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

/**
 * Entity for android Room. Describes a node as it will be represented in the android auto item tree.
 */
@Entity(tableName = "auto_node")
public class AutoNode {

    /**
     * Key of the current node. Should be unique in its subtree.
     */
    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "a_key")
    public String key;

    /**
     * Key of the parent of this node. Use "root" for the top level elements.
     */
    @NonNull
    @ColumnInfo(name = "child_of")
    public String childOf;

    /**
     * Value of the node. It will be the title for browsable and playable elements.
     */
    @NonNull
    @ColumnInfo(name = "value")
    public String value;

    /**
     * Image uri for this node. Will be the folder icon for browsable elements and the art cover for
     * playable elements.
     */
    @NonNull
    @ColumnInfo(name = "image_uri")
    public String imageURI;


    /**
     * Stream uri. Can be null or String. A null value will indicate that this node is a browsable element.
     * A String value indicate that this node is a playable element.
     */
    @Nullable
    @ColumnInfo(name = "stream_uri")
    public String streamURI;
}