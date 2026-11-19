import test from 'node:test';
import assert from 'node:assert/strict';
import { DijkstraNavigationEngine } from './dijkstra.ts';
import { INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES } from '../data/mockBuildingData.ts';

test('Dijkstra finds direct single-floor route correctly', () => {
  const engine = new DijkstraNavigationEngine(INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES);
  
  // From Main Entrance (F1) to Chemistry Lab (F1)
  const route = engine.calculateRoute('node-f1-entrance', 'node-f1-chemlab');
  
  assert.ok(route);
  assert.ok(route.totalDistance > 0);
  assert.equal(route.pathNodeIds[0], 'node-f1-entrance');
  assert.equal(route.pathNodeIds[route.pathNodeIds.length - 1], 'node-f1-chemlab');
  assert.deepEqual(route.floorsInvolved, [1]);
  assert.equal(route.hasFloorTransfer, false);
});

test('Dijkstra finds multi-floor route with floor transition', () => {
  const engine = new DijkstraNavigationEngine(INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES);

  // From Main Entrance (F1) to AI Lab (F2)
  const route = engine.calculateRoute('node-f1-entrance', 'node-f2-robotics');

  assert.ok(route);
  assert.equal(route.pathNodeIds[0], 'node-f1-entrance');
  assert.equal(route.pathNodeIds[route.pathNodeIds.length - 1], 'node-f2-robotics');
  assert.ok(route.hasFloorTransfer);
  assert.ok(route.floorsInvolved.includes(1) && route.floorsInvolved.includes(2));
  assert.ok(route.steps.length >= 3);
});

test('Wheelchair-accessible route strictly excludes stairs and uses elevators', () => {
  const engine = new DijkstraNavigationEngine(INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES);

  // From Main Entrance (F1) to Dean's Office (F3) with wheelchair accessibility enabled
  const route = engine.calculateRoute('node-f1-entrance', 'node-f3-dean', {
    wheelchairAccessible: true
  });

  assert.ok(route);
  assert.equal(route.isWheelchairAccessible, true);
  
  // Ensure NO stairs edges are present in the chosen route
  const usedStairs = route.edges.some(e => e.connectionType === 'stairs');
  assert.equal(usedStairs, false, 'Wheelchair route must not contain stairs');

  // Ensure elevator is used
  const usedElevator = route.edges.some(e => e.connectionType === 'elevator');
  assert.equal(usedElevator, true, 'Wheelchair route must use elevator');
});

test('Dijkstra respects closed corridors and finds alternative route', () => {
  const engine = new DijkstraNavigationEngine(INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES);

  // If central spine is closed
  const closedEdgeId = 'edge-f1-4'; // lobby to central spine
  const route = engine.calculateRoute('node-f1-entrance', 'node-f1-chemlab', {
    excludedEdgeIds: [closedEdgeId]
  });

  assert.ok(route);
  assert.ok(!route.edges.some(e => e.id === closedEdgeId), 'Route must not include the closed edge');
});
