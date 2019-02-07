package com.radiodns.kokoro.database;

import android.arch.persistence.room.Database;
import android.arch.persistence.room.RoomDatabase;

@Database(entities = {KokoroData.class}, version = 1)
public abstract class KokoroDatabase extends RoomDatabase {
    public abstract KokoroDataDAO kokoroDataDAO();
}