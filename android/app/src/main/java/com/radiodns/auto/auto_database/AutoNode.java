package com.radiodns.auto.auto_database;

import android.arch.persistence.room.ColumnInfo;
import android.arch.persistence.room.Entity;
import android.arch.persistence.room.PrimaryKey;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

@Entity(tableName = "auto_node")
public class AutoNode {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "a_key")
    public String key;

    @NonNull
    @ColumnInfo(name = "child_of")
    public String childOf;

    @NonNull
    @ColumnInfo(name = "value")
    public String value;

    @NonNull
    @ColumnInfo(name = "image_uri")
    public String imageURI;

    @Nullable
    @ColumnInfo(name = "stream_uri")
    public String streamURI;
}