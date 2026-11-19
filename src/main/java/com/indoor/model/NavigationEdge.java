package com.indoor.model;

import java.io.Serializable;

public class NavigationEdge implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String sourceNodeId;
    private String targetNodeId;
    private double distance;
    private int floorNumber;
    private boolean isAccessible;
    private boolean isClosed;
    private String closureReason;
    private String connectionType; // walkway, stairs, elevator, ramp

    public NavigationEdge() {}

    public NavigationEdge(String id, String sourceNodeId, String targetNodeId, double distance, int floorNumber, boolean isAccessible, boolean isClosed, String connectionType) {
        this.id = id;
        this.sourceNodeId = sourceNodeId;
        this.targetNodeId = targetNodeId;
        this.distance = distance;
        this.floorNumber = floorNumber;
        this.isAccessible = isAccessible;
        this.isClosed = isClosed;
        this.connectionType = connectionType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSourceNodeId() { return sourceNodeId; }
    public void setSourceNodeId(String sourceNodeId) { this.sourceNodeId = sourceNodeId; }

    public String getTargetNodeId() { return targetNodeId; }
    public void setTargetNodeId(String targetNodeId) { this.targetNodeId = targetNodeId; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public int getFloorNumber() { return floorNumber; }
    public void setFloorNumber(int floorNumber) { this.floorNumber = floorNumber; }

    public boolean isAccessible() { return isAccessible; }
    public void setAccessible(boolean accessible) { isAccessible = accessible; }

    public boolean isClosed() { return isClosed; }
    public void setClosed(boolean closed) { isClosed = closed; }

    public String getClosureReason() { return closureReason; }
    public void setClosureReason(String closureReason) { this.closureReason = closureReason; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }
}
