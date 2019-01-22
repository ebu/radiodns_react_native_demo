package com.radiodns.auto.auto_database;

import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

import java.util.List;

@Dao
public interface AutoNodeDAO {

    @Query("SELECT * FROM auto_node WHERE child_of = :nodeKey")
    List<AutoNode> loadChildrens(String nodeKey);

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAll(AutoNode... nodes);

    @Query("DELETE FROM auto_node")
    void nukeTable();
}