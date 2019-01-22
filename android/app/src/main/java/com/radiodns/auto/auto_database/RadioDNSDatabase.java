package com.radiodns.auto.auto_database;

import android.arch.persistence.room.Database;
import android.arch.persistence.room.RoomDatabase;

@Database(entities = {AutoNode.class}, version = 1)
public abstract class RadioDNSDatabase extends RoomDatabase {
    public abstract AutoNodeDAO autoNodeDAO();
}