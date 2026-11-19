package com.indoor;

import com.indoor.model.NavigationEdge;
import com.indoor.model.NavigationNode;
import com.indoor.model.RouteResponse;
import com.indoor.service.DijkstraService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DijkstraServiceTest {

    private DijkstraService service;
    private List<NavigationNode> nodes;
    private List<NavigationEdge> edges;

    @BeforeEach
    public void setup() {
        service = new DijkstraService();
        nodes = new ArrayList<>();
        edges = new ArrayList<>();

        // Floor 1
        nodes.add(new NavigationNode("f1-entrance", "b-tech", 1, 100, 300, "Main Entrance", "entrance", null));
        nodes.add(new NavigationNode("f1-lobby", "b-tech", 1, 250, 300, "Lobby", "intersection", null));
        nodes.add(new NavigationNode("f1-stairs", "b-tech", 1, 400, 220, "Stairs", "stairs", null));
        nodes.add(new NavigationNode("f1-elevator", "b-tech", 1, 600, 220, "Elevator", "elevator", null));

        // Floor 2
        nodes.add(new NavigationNode("f2-stairs", "b-tech", 2, 400, 220, "Stairs F2", "stairs", null));
        nodes.add(new NavigationNode("f2-elevator", "b-tech", 2, 600, 220, "Elevator F2", "elevator", null));
        nodes.add(new NavigationNode("f2-lab", "b-tech", 2, 750, 460, "AI Lab 204", "room", null));

        // F1 Walkways
        edges.add(new NavigationEdge("e1", "f1-entrance", "f1-lobby", 15, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("e2", "f1-lobby", "f1-stairs", 15, 1, true, false, "walkway"));
        edges.add(new NavigationEdge("e3", "f1-lobby", "f1-elevator", 35, 1, true, false, "walkway"));

        // F2 Walkways
        edges.add(new NavigationEdge("e4", "f2-stairs", "f2-lab", 30, 2, true, false, "walkway"));
        edges.add(new NavigationEdge("e5", "f2-elevator", "f2-lab", 20, 2, true, false, "walkway"));

        // Vertical Edges
        // Stairs: 10m distance, inaccessible for wheelchairs
        edges.add(new NavigationEdge("e-stairs", "f1-stairs", "f2-stairs", 10, 1, false, false, "stairs"));
        // Elevator: 20m distance, accessible for wheelchairs
        edges.add(new NavigationEdge("e-elevator", "f1-elevator", "f2-elevator", 20, 1, true, false, "elevator"));
    }

    @Test
    public void testStandardRoutePrefersShortestStaircase() {
        RouteResponse route = service.findShortestRoute(nodes, edges, "f1-entrance", "f2-lab", false);
        assertTrue(route.isSuccess());
        // F1 Entrance -> Lobby (15) -> Stairs (15) -> F2 Stairs (10) -> Lab (30) = 70m
        // vs Elevator: 15 + 35 + 20 + 20 = 90m
        assertTrue(route.getPathNodeIds().contains("f1-stairs"));
        assertEquals(70.0, route.getTotalDistance());
    }

    @Test
    public void testWheelchairRouteStrictlyExcludesStairsAndUsesElevator() {
        RouteResponse route = service.findShortestRoute(nodes, edges, "f1-entrance", "f2-lab", true);
        assertTrue(route.isSuccess());
        assertTrue(route.isWheelchairAccessible());
        assertFalse(route.getPathNodeIds().contains("f1-stairs"), "Wheelchair route must NEVER contain stairs!");
        assertTrue(route.getPathNodeIds().contains("f1-elevator"), "Wheelchair route must utilize elevators!");
        assertEquals(90.0, route.getTotalDistance());
    }

    @Test
    public void testClosedCorridorRerouting() {
        // Mark entrance-lobby edge as closed
        edges.get(0).setClosed(true);
        RouteResponse route = service.findShortestRoute(nodes, edges, "f1-entrance", "f2-lab", false);
        assertFalse(route.isSuccess());
        assertTrue(route.getMessage().contains("No navigable route"));
    }
}
