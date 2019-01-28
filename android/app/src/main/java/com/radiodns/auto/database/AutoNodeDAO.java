package com.radiodns.auto.database;

import android.arch.persistence.room.Dao;
import android.arch.persistence.room.Insert;
import android.arch.persistence.room.OnConflictStrategy;
import android.arch.persistence.room.Query;

import java.util.List;

/**
 * Data Access Object (DAO) for the RadioDNS android auto tree nodes.
 */
@Dao
public interface AutoNodeDAO {

    /**
     * Loads the children of a node.
     * @param nodeKey: The key of the node.
     * @return A list of children matching this criteria.
     */
    @Query("SELECT * FROM auto_node WHERE child_of = :nodeKey")
    List<AutoNode> loadChildren(String nodeKey);

    /**
     * Inserts the given nodes into the database. Overrides existing values.
     * @param nodes: The nodes to be inserted.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertAll(AutoNode... nodes);

    /**
     * Removes all elements from this table.
     */
    @Query("DELETE FROM auto_node")
    void nukeTable();
}