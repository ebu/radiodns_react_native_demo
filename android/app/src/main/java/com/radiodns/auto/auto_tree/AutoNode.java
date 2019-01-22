package com.radiodns.auto.auto_tree;

import java.util.LinkedList;

public class AutoNode {

    private String key;
    private String value;
    private String imageURI;
    private String streamURI;
    private LinkedList<AutoNode> childrens;

    public AutoNode(String key, String value, String imageURI, String streamURI) {
        this.key = key;
        this.value = value;
        this.imageURI = imageURI;
        this.streamURI = streamURI;
        this.childrens = new LinkedList<>();
    }

    public void addChildren(AutoNode autoNode) {
        if (childrens.contains(autoNode)) {
            throw new IllegalArgumentException("Cannot have tow children in the same subtree that have" +
                    "the same key: " + autoNode.key);
        }
        childrens.add(autoNode);
    }

    public LinkedList<AutoNode> getChildrens() {
        return childrens;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getImageURI() {
        return imageURI;
    }

    public void setImageURI(String imageURI) {
        this.imageURI = imageURI;
    }

    public String getStreamURI() {
        return streamURI;
    }

    public void setStreamURI(String streamURI) {
        this.streamURI = streamURI;
    }

    public boolean isPlayable() {
        return this.streamURI != null;
    }
}
