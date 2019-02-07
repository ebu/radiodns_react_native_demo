package com.radiodns.kokoro.database;

import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

@Dao
public interface KokoroDataDAO {

    @Query("SELECT * FROM kokoro_data WHERE a_key = :key")
    KokoroData find(String key);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAll(KokoroData... data);

    @Query("DELETE FROM kokoro_data WHERE a_key = :key")
    void delete(String key);

    @Query("DELETE FROM kokoro_data")
    void nukeTable();
}