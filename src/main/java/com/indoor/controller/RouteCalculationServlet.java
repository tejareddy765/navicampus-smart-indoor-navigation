package com.indoor.controller;

import com.indoor.model.NavigationEdge;
import com.indoor.model.NavigationNode;
import com.indoor.model.RouteResponse;
import com.indoor.service.DijkstraService;
import com.indoor.util.JsonUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@WebServlet(name = "RouteCalculationServlet", urlPatterns = {"/api/routes"})
public class RouteCalculationServlet extends HttpServlet {

    private final DijkstraService dijkstraService = new DijkstraService();

    public static class RouteRequest {
        public String buildingId;
        public String startNodeId;
        public String targetNodeId;
        public boolean wheelchairAccessible;
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }

        RouteRequest requestBody = JsonUtil.fromJson(sb.toString(), RouteRequest.class);
        if (requestBody == null || requestBody.startNodeId == null || requestBody.targetNodeId == null) {
            JsonUtil.writeJson(resp, HttpServletResponse.SC_BAD_REQUEST, RouteResponse.error("Missing required startNodeId or targetNodeId parameters."));
            return;
        }

        // Fetch graph topology (Authoritative data from DAO or in-memory graph)
        List<NavigationNode> nodes = getBuildingNodes(requestBody.buildingId);
        List<NavigationEdge> edges = getBuildingEdges(requestBody.buildingId);

        RouteResponse route = dijkstraService.findShortestRoute(
                nodes,
                edges,
                requestBody.startNodeId,
                requestBody.targetNodeId,
                requestBody.wheelchairAccessible
        );

        if (!route.isSuccess()) {
            JsonUtil.writeJson(resp, HttpServletResponse.SC_NOT_FOUND, route);
        } else {
            JsonUtil.writeJson(resp, HttpServletResponse.SC_OK, route);
        }
    }

    // In production, delegates to NavigationDAO.findAllNodesByBuilding(buildingId)
    private List<NavigationNode> getBuildingNodes(String buildingId) {
        List<NavigationNode> list = new ArrayList<>();
        // Floor 1
        list.add(new NavigationNode("node-f1-entrance", "b-tech", 1, 100, 300, "Main Entrance", "entrance", "loc-100"));
        list.add(new NavigationNode("node-f1-lobby", "b-tech", 1, 250, 300, "Central Lobby Junction", "intersection", null));
        list.add(new NavigationNode("node-f1-hall-west", "b-tech", 1, 250, 150, "West Corridor (North)", "corridor", null));
        list.add(new NavigationNode("node-f1-hall-east", "b-tech", 1, 500, 300, "Central Spine Corridor", "corridor", null));
        list.add(new NavigationNode("node-f1-hall-south", "b-tech", 1, 250, 460, "South Corridor (Cafe Wing)", "corridor", null));
        list.add(new NavigationNode("node-f1-audit", "b-tech", 1, 420, 150, "Auditorium 101 Door", "room", "loc-101"));
        list.add(new NavigationNode("node-f1-chemlab", "b-tech", 1, 750, 150, "Chemistry Lab Door", "room", "loc-102"));
        list.add(new NavigationNode("node-f1-cafe", "b-tech", 1, 450, 460, "Campus Bistro Door", "room", "loc-103"));
        list.add(new NavigationNode("node-f1-restroom", "b-tech", 1, 820, 460, "Restrooms 1F Door", "room", "loc-104"));
        list.add(new NavigationNode("node-f1-east-hub", "b-tech", 1, 750, 300, "East Hub Junction", "intersection", null));
        list.add(new NavigationNode("node-f1-elevator", "b-tech", 1, 600, 220, "Elevator Bank A", "elevator", "loc-105"));
        list.add(new NavigationNode("node-f1-stairs", "b-tech", 1, 400, 220, "Central Stairwell", "stairs", "loc-106"));

        // Floor 2
        list.add(new NavigationNode("node-f2-lobby", "b-tech", 2, 250, 300, "Floor 2 West Concourse", "intersection", null));
        list.add(new NavigationNode("node-f2-hall-west", "b-tech", 2, 250, 150, "West Corridor F2", "corridor", null));
        list.add(new NavigationNode("node-f2-hall-east", "b-tech", 2, 500, 300, "Central Corridor F2", "corridor", null));
        list.add(new NavigationNode("node-f2-hall-south", "b-tech", 2, 250, 460, "South Corridor F2", "corridor", null));
        list.add(new NavigationNode("node-f2-lecture", "b-tech", 2, 420, 150, "Lecture Hall 201 Door", "room", "loc-201"));
        list.add(new NavigationNode("node-f2-faculty", "b-tech", 2, 750, 150, "Faculty Lounge 202 Door", "room", "loc-202"));
        list.add(new NavigationNode("node-f2-seminar", "b-tech", 2, 450, 460, "Seminar Room 203 Door", "room", "loc-203"));
        list.add(new NavigationNode("node-f2-robotics", "b-tech", 2, 720, 460, "AI & Robotics Lab Door", "room", "loc-204"));
        list.add(new NavigationNode("node-f2-restroom", "b-tech", 2, 860, 300, "Restrooms 2F Door", "room", "loc-205"));
        list.add(new NavigationNode("node-f2-east-hub", "b-tech", 2, 750, 300, "East Hub F2", "intersection", null));
        list.add(new NavigationNode("node-f2-elevator", "b-tech", 2, 600, 220, "Elevator Bank A (F2)", "elevator", "loc-206"));
        list.add(new NavigationNode("node-f2-stairs", "b-tech", 2, 400, 220, "Central Stairwell (F2)", "stairs", "loc-207"));

        // Floor 3
        list.add(new NavigationNode("node-f3-lobby", "b-tech", 3, 250, 300, "Floor 3 West Concourse", "intersection", null));
        list.add(new NavigationNode("node-f3-hall-west", "b-tech", 3, 250, 150, "West Corridor F3", "corridor", null));
        list.add(new NavigationNode("node-f3-hall-east", "b-tech", 3, 500, 300, "Central Corridor F3", "corridor", null));
        list.add(new NavigationNode("node-f3-hall-south", "b-tech", 3, 250, 460, "South Corridor F3", "corridor", null));
        list.add(new NavigationNode("node-f3-dean", "b-tech", 3, 420, 150, "Dean's Office 301 Door", "room", "loc-301"));
        list.add(new NavigationNode("node-f3-library", "b-tech", 3, 750, 150, "Digital Library 302 Door", "room", "loc-302"));
        list.add(new NavigationNode("node-f3-cyber", "b-tech", 3, 450, 460, "Cyber Security Lab Door", "room", "loc-303"));
        list.add(new NavigationNode("node-f3-boardroom", "b-tech", 3, 720, 460, "Executive Boardroom Door", "room", "loc-304"));
        list.add(new NavigationNode("node-f3-restroom", "b-tech", 3, 860, 300, "Restrooms 3F Door", "room", "loc-305"));
        list.add(new NavigationNode("node-f3-east-hub", "b-tech", 3, 750, 300, "East Hub F3", "intersection", null));
        list.add(new NavigationNode("node-f3-elevator", "b-tech", 3, 600, 220, "Elevator Bank A (F3)", "elevator", "loc-306"));
        list.add(new NavigationNode("node-f3-stairs", "b-tech", 3, 400, 220, "Central Stairwell (F3)", "stairs", "loc-307"));

        return list;
    }

    private List<NavigationEdge> getBuildingEdges(String buildingId) {
        List<NavigationEdge> edges = new ArrayList<>();
        // F1 Walkways
        edges.add(new NavigationEdge("edge-f1-1", "node-f1-entrance", "node-f1-lobby", 15, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-2", "node-f1-lobby", "node-f1-hall-west", 12, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-3", "node-f1-lobby", "node-f1-hall-south", 12, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-4", "node-f1-lobby", "node-f1-hall-east", 20, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-5", "node-f1-hall-west", "node-f1-audit", 14, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-6", "node-f1-audit", "node-f1-stairs", 8, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-7", "node-f1-hall-east", "node-f1-stairs", 10, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-8", "node-f1-hall-east", "node-f1-elevator", 10, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-9", "node-f1-hall-east", "node-f1-east-hub", 18, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-10", "node-f1-east-hub", "node-f1-chemlab", 14, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-11", "node-f1-east-hub", "node-f1-restroom", 12, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-12", "node-f1-east-hub", "node-f1-elevator", 12, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-13", "node-f1-hall-south", "node-f1-cafe", 15, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f1-14", "node-f1-cafe", "node-f1-restroom", 28, 1, true, false, "walkway"));

        // F2 Walkways
        edges.add(new NavigationEdge("edge-f2-1", "node-f2-lobby", "node-f2-hall-west", 12, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-2", "node-f2-lobby", "node-f2-hall-south", 12, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-3", "node-f2-lobby", "node-f2-hall-east", 20, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-4", "node-f2-hall-west", "node-f2-lecture", 14, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-5", "node-f2-lecture", "node-f2-stairs", 8, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-6", "node-f2-hall-east", "node-f2-stairs", 10, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-7", "node-f2-hall-east", "node-f2-elevator", 10, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-8", "node-f2-hall-east", "node-f2-east-hub", 18, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-9", "node-f2-east-hub", "node-f2-faculty", 14, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-10", "node-f2-east-hub", "node-f2-restroom", 10, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-11", "node-f2-east-hub", "node-f2-robotics", 12, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-12", "node-f2-east-hub", "node-f2-elevator", 12, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-13", "node-f2-hall-south", "node-f2-seminar", 15, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f2-14", "node-f2-seminar", "node-f2-robotics", 22, 2, true, false, "walkway"));

        // F3 Walkways
        edges.add(new NavigationEdge("edge-f3-1", "node-f3-lobby", "node-f3-hall-west", 12, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-2", "node-f3-lobby", "node-f3-hall-south", 12, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-3", "node-f3-lobby", "node-f3-hall-east", 20, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-4", "node-f3-hall-west", "node-f3-dean", 14, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-5", "node-f3-dean", "node-f3-stairs", 8, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-6", "node-f3-hall-east", "node-f3-stairs", 10, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-7", "node-f3-hall-east", "node-f3-elevator", 10, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-8", "node-f3-hall-east", "node-f3-east-hub", 18, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-9", "node-f3-east-hub", "node-f3-library", 14, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-10", "node-f3-east-hub", "node-f3-restroom", 10, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-11", "node-f3-east-hub", "node-f3-boardroom", 12, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-12", "node-f3-east-hub", "node-f3-elevator", 12, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-13", "node-f3-hall-south", "node-f3-cyber", 15, 3, true, false, "walkway"));
        edges.add(new NavigationEdge("edge-f3-14", "node-f3-cyber", "node-f3-boardroom", 22, 3, true, false, "walkway"));

        // Vertical Connections: Stairs (isAccessible = false)
        edges.add(new NavigationEdge("edge-vert-stairs-1-2", "node-f1-stairs", "node-f2-stairs", 18, 1, false, false, "stairs"));
        edges.add(new NavigationEdge("edge-vert-stairs-2-3", "node-f2-stairs", "node-f3-stairs", 18, 2, false, false, "stairs"));

        // Vertical Connections: Elevators (isAccessible = true)
        edges.add(new NavigationEdge("edge-vert-elev-1-2", "node-f1-elevator", "node-f2-elevator", 14, 1, true, false, "elevator"));
        edges.add(new NavigationEdge("edge-vert-elev-2-3", "node-f2-elevator", "node-f3-elevator", 14, 2, true, false, "elevator"));
        edges.add(new NavigationEdge("edge-vert-elev-1-3", "node-f1-elevator", "node-f3-elevator", 24, 1, true, false, "elevator"));

        return edges;
    }
}
