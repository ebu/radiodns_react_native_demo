package com.radiodns.kokoro.database;

import android.arch.persistence.room.ColumnInfo;
import android.arch.persistence.room.Entity;
import android.arch.persistence.room.PrimaryKey;
import android.support.annotation.NonNull;

@Entity(tableName = "kokoro_data")
public class KokoroData {

    @PrimaryKey
    @NonNull
    @ColumnInfo(name = "a_key")
    public String key;

    @NonNull
    @ColumnInfo(name = "data")
    public String data;

    public KokoroData(@NonNull String key, @NonNull String data) {
        this.key = key;
        this.data = data;
    }
}