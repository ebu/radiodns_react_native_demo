package com.radiodns.auto.auto_tree;

public class AutoTree {
    private AutoNode root;

    public AutoTree() {
        root = new AutoNode("root", "root", "", null);
    }

    private void _addNode(AutoNode node, String childOf, AutoNode newNode) {
        if (node.getKey().equals(childOf)) {
            node.addChildren(newNode);
        } else if (!node.isPlayable() && node.getChildrens().size() > 0) {
            for (AutoNode autoNode : node.getChildrens()) {
                _addNode(autoNode, childOf, newNode);
            }
        }
    }

    public void addNode(AutoNode newNode, String childOf) {
        if (getNode(childOf) == null) {
            throw new IllegalArgumentException("The parent node you want to attach a node does not" +
                    "exists: " + childOf);
        }
        _addNode(root, childOf, newNode);
    }

    private AutoNode _getNode(AutoNode node, String key) {
        if (node.getKey().equals(key)) {
            return node;
        } else if (node.getChildrens().size() > 0) {
            for (AutoNode autoNode : node.getChildrens()) {
                AutoNode n = _getNode(node, key);
                if (n != null) {
                    return n;
                }
            }
        }
        return null;
    }

    public AutoNode getNode(String key) {
        return _getNode(root, key);
    }
}
