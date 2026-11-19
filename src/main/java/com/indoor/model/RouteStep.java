package com.indoor.model;

import java.io.Serializable;

public class RouteStep implements Serializable {
    private static final long serialVersionUID = 1L;

    private int stepNumber;
    private String instruction;
    private double distance;
    private int floorNumber;
    private String transitionType; // elevator, stairs, none
    private Integer targetFloor;
    private String icon; // straight, turn-left, turn-right, stairs-up, stairs-down, elevator, arrive

    public RouteStep() {}

    public RouteStep(int stepNumber, String instruction, double distance, int floorNumber, String transitionType, Integer targetFloor, String icon) {
        this.stepNumber = stepNumber;
        this.instruction = instruction;
        this.distance = distance;
        this.floorNumber = floorNumber;
        this.transitionType = transitionType;
        this.targetFloor = targetFloor;
        this.icon = icon;
    }

    public int getStepNumber() { return stepNumber; }
    public void setStepNumber(int stepNumber) { this.stepNumber = stepNumber; }

    public String getInstruction() { return instruction; }
    public void setInstruction(String instruction) { this.instruction = instruction; }

    public double getDistance() { return distance; }
    public void setDistance(double distance) { this.distance = distance; }

    public int getFloorNumber() { return floorNumber; }
    public void setFloorNumber(int floorNumber) { this.floorNumber = floorNumber; }

    public String getTransitionType() { return transitionType; }
    public void setTransitionType(String transitionType) { this.transitionType = transitionType; }

    public Integer getTargetFloor() { return targetFloor; }
    public void setTargetFloor(Integer targetFloor) { this.targetFloor = targetFloor; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
