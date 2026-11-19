package com.indoor.service;

import com.indoor.model.*;
import java.util.*;

public class DijkstraService {

    private static class AdjacencyItem {
        final String targetNodeId;
        final NavigationEdge edge;
        final double weight;

        AdjacencyItem(String targetNodeId, NavigationEdge edge, double weight) {
            this.targetNodeId = targetNodeId;
            this.edge = edge;
            this.weight = weight;
        }
    }

    private static class PathElement implements Comparable<PathElement> {
        final String nodeId;
        final double distance;

        PathElement(String nodeId, double distance) {
            this.nodeId = nodeId;
            this.distance = distance;
        }

        @Override
        public int compareTo(PathElement other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    private static class PreviousStep {
        final String previousNodeId;
        final NavigationEdge edge;

        PreviousStep(String previousNodeId, NavigationEdge edge) {
            this.previousNodeId = previousNodeId;
            this.edge = edge;
        }
    }

    /**
     * Calculates the shortest path between startNodeId and targetNodeId.
     *
     * @param allNodes list of all nodes in the building graph
     * @param allEdges list of all edges (walkways, stairs, elevators)
     * @param startNodeId ID of departure node
     * @param targetNodeId ID of arrival node
     * @param wheelchairAccessible if true, strictly excludes stairs and inaccessible routes
     * @return RouteResponse containing path, distance, ETA, and turn-by-turn guidance
     */
    public RouteResponse findShortestRoute(
            List<NavigationNode> allNodes,
            List<NavigationEdge> allEdges,
            String startNodeId,
            String targetNodeId,
            boolean wheelchairAccessible) {

        Map<String, NavigationNode> nodeMap = new HashMap<>();
        Map<String, List<AdjacencyItem>> adjacency = new HashMap<>();

        for (NavigationNode node : allNodes) {
            nodeMap.put(node.getId(), node);
            adjacency.put(node.getId(), new ArrayList<>());
        }

        if (!nodeMap.containsKey(startNodeId)) {
            return RouteResponse.error("Starting location node does not exist: " + startNodeId);
        }
        if (!nodeMap.containsKey(targetNodeId)) {
            return RouteResponse.error("Destination location node does not exist: " + targetNodeId);
        }

        for (NavigationEdge edge : allEdges) {
            if (edge.isClosed()) {
                continue; // Exclude blocked/closed corridors
            }
            if (wheelchairAccessible && !edge.isAccessible()) {
                continue; // Exclude stairs and inaccessible paths for wheelchair users
            }

            if (nodeMap.containsKey(edge.getSourceNodeId()) && nodeMap.containsKey(edge.getTargetNodeId())) {
                adjacency.get(edge.getSourceNodeId()).add(new AdjacencyItem(edge.getTargetNodeId(), edge, edge.getDistance()));
                adjacency.get(edge.getTargetNodeId()).add(new AdjacencyItem(edge.getSourceNodeId(), edge, edge.getDistance()));
            }
        }

        if (startNodeId.equals(targetNodeId)) {
            NavigationNode node = nodeMap.get(startNodeId);
            RouteResponse same = new RouteResponse();
            same.setSuccess(true);
            same.setPathNodeIds(List.of(startNodeId));
            same.setNodes(List.of(node));
            same.setEdges(Collections.emptyList());
            same.setTotalDistance(0.0);
            same.setEstimatedMinutes(0.5);
            same.setFloorsInvolved(List.of(node.getFloorNumber()));
            same.setWheelchairAccessible(wheelchairAccessible);
            same.setHasFloorTransfer(false);
            same.setSteps(List.of(new RouteStep(1, "You are already at your destination: " + node.getLabel(), 0.0, node.getFloorNumber(), "none", null, "arrive")));
            return same;
        }

        PriorityQueue<PathElement> pq = new PriorityQueue<>();
        Map<String, Double> distances = new HashMap<>();
        Map<String, PreviousStep> previous = new HashMap<>();
        Set<String> visited = new HashSet<>();

        for (String id : nodeMap.keySet()) {
            distances.put(id, Double.MAX_VALUE);
        }
        distances.put(startNodeId, 0.0);
        pq.add(new PathElement(startNodeId, 0.0));

        while (!pq.isEmpty()) {
            PathElement current = pq.poll();
            String u = current.nodeId;

            if (visited.contains(u)) continue;
            visited.add(u);

            if (u.equals(targetNodeId)) {
                break; // Reached target
            }

            List<AdjacencyItem> neighbors = adjacency.getOrDefault(u, Collections.emptyList());
            for (AdjacencyItem item : neighbors) {
                String v = item.targetNodeId;
                if (visited.contains(v)) continue;

                double newDist = distances.get(u) + item.weight;
                if (newDist < distances.get(v)) {
                    distances.put(v, newDist);
                    previous.put(v, new PreviousStep(u, item.edge));
                    pq.add(new PathElement(v, newDist));
                }
            }
        }

        if (!previous.containsKey(targetNodeId)) {
            return RouteResponse.error(wheelchairAccessible
                    ? "No wheelchair-accessible path available. Please check elevator service."
                    : "No navigable route found between the selected locations.");
        }

        LinkedList<String> pathNodeIds = new LinkedList<>();
        LinkedList<NavigationEdge> pathEdges = new LinkedList<>();
        String curr = targetNodeId;

        while (curr != null && !curr.equals(startNodeId)) {
            pathNodeIds.addFirst(curr);
            PreviousStep step = previous.get(curr);
            if (step != null) {
                pathEdges.addFirst(step.edge);
                curr = step.previousNodeId;
            } else {
                break;
            }
        }
        pathNodeIds.addFirst(startNodeId);

        List<NavigationNode> pathNodes = new ArrayList<>();
        Set<Integer> floorsSet = new TreeSet<>();
        for (String id : pathNodeIds) {
            NavigationNode n = nodeMap.get(id);
            pathNodes.add(n);
            floorsSet.add(n.getFloorNumber());
        }

        double totalDist = distances.get(targetNodeId);
        double walkSpeedMpm = 70.0; // 1.2 m/s
        double estMinutes = totalDist / walkSpeedMpm;
        boolean hasFloorTransfer = floorsSet.size() > 1;
        if (hasFloorTransfer) {
            estMinutes += (floorsSet.size() - 1) * 1.5; // floor transfer buffer
        }

        List<RouteStep> steps = generateSteps(pathNodes, pathEdges);

        RouteResponse response = new RouteResponse();
        response.setSuccess(true);
        response.setPathNodeIds(pathNodeIds);
        response.setNodes(pathNodes);
        response.setEdges(pathEdges);
        response.setTotalDistance(Math.round(totalDist * 10.0) / 10.0);
        response.setEstimatedMinutes(Math.max(1.0, Math.round(estMinutes * 10.0) / 10.0));
        response.setFloorsInvolved(new ArrayList<>(floorsSet));
        response.setWheelchairAccessible(wheelchairAccessible);
        response.setHasFloorTransfer(hasFloorTransfer);
        response.setSteps(steps);

        return response;
    }

    private List<RouteStep> generateSteps(List<NavigationNode> nodes, List<NavigationEdge> edges) {
        List<RouteStep> steps = new ArrayList<>();
        if (nodes.isEmpty()) return steps;

        steps.add(new RouteStep(1, "Start at " + nodes.get(0).getLabel() + " (Floor " + nodes.get(0).getFloorNumber() + ")",
                edges.isEmpty() ? 0.0 : edges.get(0).getDistance(), nodes.get(0).getFloorNumber(), "none", null, "straight"));

        for (int i = 0; i < edges.size(); i++) {
            NavigationNode from = nodes.get(i);
            NavigationNode to = nodes.get(i + 1);
            NavigationEdge edge = edges.get(i);

            if ("elevator".equalsIgnoreCase(edge.getConnectionType())) {
                steps.add(new RouteStep(steps.size() + 1,
                        "Take Elevator from Floor " + from.getFloorNumber() + " to Floor " + to.getFloorNumber(),
                        edge.getDistance(), from.getFloorNumber(), "elevator", to.getFloorNumber(), "elevator"));
                continue;
            }

            if ("stairs".equalsIgnoreCase(edge.getConnectionType())) {
                boolean isUp = to.getFloorNumber() > from.getFloorNumber();
                steps.add(new RouteStep(steps.size() + 1,
                        "Take Stairs " + (isUp ? "up" : "down") + " to Floor " + to.getFloorNumber(),
                        edge.getDistance(), from.getFloorNumber(), "stairs", to.getFloorNumber(), isUp ? "stairs-up" : "stairs-down"));
                continue;
            }

            if (i > 0 && i < edges.size() - 1 && from.getFloorNumber() == to.getFloorNumber()) {
                NavigationNode prev = nodes.get(i - 1);
                NavigationNode next = (i + 2 < nodes.size()) ? nodes.get(i + 2) : to;
                double v1x = from.getX() - prev.getX();
                double v1y = from.getY() - prev.getY();
                double v2x = next.getX() - to.getX();
                double v2y = next.getY() - to.getY();
                double cross = v1x * v2y - v1y * v2x;

                if (Math.abs(cross) > 200.0) {
                    boolean isLeft = cross < 0;
                    steps.add(new RouteStep(steps.size() + 1,
                            (isLeft ? "Turn left" : "Turn right") + " toward " + to.getLabel(),
                            edge.getDistance(), to.getFloorNumber(), "none", null, isLeft ? "turn-left" : "turn-right"));
                }
            }
        }

        NavigationNode dest = nodes.get(nodes.size() - 1);
        steps.add(new RouteStep(steps.size() + 1, "Arrive at destination: " + dest.getLabel() + " (Floor " + dest.getFloorNumber() + ")",
                0.0, dest.getFloorNumber(), "none", null, "arrive"));

        return steps;
    }
}
