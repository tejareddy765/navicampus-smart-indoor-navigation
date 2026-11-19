package com.indoor.model;

import java.io.Serializable;
import java.util.List;

public class RouteResponse implements Serializable {
    private static final long serialVersionUID = 1L;

    private boolean success;
    private String message;
    private List<String> pathNodeIds;
    private List<NavigationNode> nodes;
    private List<NavigationEdge> edges;
    private double totalDistance;
    private double estimatedMinutes;
    private List<RouteStep> steps;
    private List<Integer> floorsInvolved;
    private boolean isWheelchairAccessible;
    private boolean hasFloorTransfer;

    public RouteResponse() {}

    public static RouteResponse error(String message) {
        RouteResponse res = new RouteResponse();
        res.setSuccess(false);
        res.setMessage(message);
        return res;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<String> getPathNodeIds() { return pathNodeIds; }
    public void setPathNodeIds(List<String> pathNodeIds) { this.pathNodeIds = pathNodeIds; }

    public List<NavigationNode> getNodes() { return nodes; }
    public void setNodes(List<NavigationNode> nodes) { this.nodes = nodes; }

    public List<NavigationEdge> getEdges() { return edges; }
    public void setEdges(List<NavigationEdge> edges) { this.edges = edges; }

    public double getTotalDistance() { return totalDistance; }
    public void setTotalDistance(double totalDistance) { this.totalDistance = totalDistance; }

    public double getEstimatedMinutes() { return estimatedMinutes; }
    public void setEstimatedMinutes(double estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

    public List<RouteStep> getSteps() { return steps; }
    public void setSteps(List<RouteStep> steps) { this.steps = steps; }

    public List<Integer> getFloorsInvolved() { return floorsInvolved; }
    public void setFloorsInvolved(List<Integer> floorsInvolved) { this.floorsInvolved = floorsInvolved; }

    public boolean isWheelchairAccessible() { return isWheelchairAccessible; }
    public void setWheelchairAccessible(boolean wheelchairAccessible) { isWheelchairAccessible = wheelchairAccessible; }

    public boolean isHasFloorTransfer() { return hasFloorTransfer; }
    public void setHasFloorTransfer(boolean hasFloorTransfer) { this.hasFloorTransfer = hasFloorTransfer; }
}
