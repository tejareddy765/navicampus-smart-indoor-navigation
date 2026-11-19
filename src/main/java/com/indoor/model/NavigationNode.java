package com.indoor.model;

import java.io.Serializable;

public class NavigationNode implements Serializable {
    private static final long serialVersionUID = 1L;

    private String id;
    private String buildingId;
    private int floorNumber;
    private double x;
    private double y;
    private String label;
    private String nodeType; // room, corridor, intersection, stairs, elevator, entrance
    private String locationId;

    public NavigationNode() {}

    public NavigationNode(String id, String buildingId, int floorNumber, double x, double y, String label, String nodeType, String locationId) {
        this.id = id;
        this.buildingId = buildingId;
        this.floorNumber = floorNumber;
        this.x = x;
        this.y = y;
        this.label = label;
        this.nodeType = nodeType;
        this.locationId = locationId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }

    public int getFloorNumber() { return floorNumber; }
    public void setFloorNumber(int floorNumber) { this.floorNumber = floorNumber; }

    public double getX() { return x; }
    public void setX(double x) { this.x = x; }

    public double getY() { return y; }
    public void setY(double y) { this.y = y; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getNodeType() { return nodeType; }
    public void setNodeType(String nodeType) { this.nodeType = nodeType; }

    public String getLocationId() { return locationId; }
    public void setLocationId(String locationId) { this.locationId = locationId; }
}
