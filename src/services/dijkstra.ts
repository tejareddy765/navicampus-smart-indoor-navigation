import { GraphNode, GraphEdge, ComputedRoute, RouteStep } from '../types/navigation';

export interface RouteCalculationOptions {
  wheelchairAccessible?: boolean;
  excludedEdgeIds?: string[];
}

interface AdjacencyEdge {
  targetNodeId: string;
  edge: GraphEdge;
  effectiveDistance: number;
}

export class DijkstraNavigationEngine {
  private nodes: Map<string, GraphNode> = new Map();
  private adjacency: Map<string, AdjacencyEdge[]> = new Map();

  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    this.updateGraph(nodes, edges);
  }

  public updateGraph(nodes: GraphNode[], edges: GraphEdge[]) {
    this.nodes.clear();
    this.adjacency.clear();

    nodes.forEach(node => {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, []);
    });

    edges.forEach(edge => {
      // Bi-directional walking paths
      this.addEdgeToAdjacency(edge.sourceNodeId, edge.targetNodeId, edge);
      this.addEdgeToAdjacency(edge.targetNodeId, edge.sourceNodeId, edge);
    });
  }

  private addEdgeToAdjacency(u: string, v: string, edge: GraphEdge) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) return;
    const list = this.adjacency.get(u) || [];
    list.push({
      targetNodeId: v,
      edge,
      effectiveDistance: edge.distance
    });
    this.adjacency.set(u, list);
  }

  public calculateRoute(
    startNodeId: string,
    targetNodeId: string,
    options: RouteCalculationOptions = {}
  ): ComputedRoute {
    const { wheelchairAccessible = false, excludedEdgeIds = [] } = options;

    if (!this.nodes.has(startNodeId)) {
      throw new Error(`Start location node '${startNodeId}' does not exist.`);
    }
    if (!this.nodes.has(targetNodeId)) {
      throw new Error(`Destination location node '${targetNodeId}' does not exist.`);
    }

    if (startNodeId === targetNodeId) {
      const node = this.nodes.get(startNodeId)!;
      return {
        pathNodeIds: [startNodeId],
        nodes: [node],
        edges: [],
        totalDistance: 0,
        estimatedMinutes: 0.2,
        steps: [{
          stepNumber: 1,
          instruction: `You are already at ${node.label}.`,
          distance: 0,
          floorNumber: node.floorNumber,
          icon: 'arrive'
        }],
        floorsInvolved: [node.floorNumber],
        isWheelchairAccessible: true,
        hasFloorTransfer: false
      };
    }

    // Dijkstra Algorithm with Priority Queue (Min-Heap simulation)
    const distances = new Map<string, number>();
    const previous = new Map<string, { nodeId: string; edge: GraphEdge }>();
    const unvisited = new Set<string>();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }
    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let currentId: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const d = distances.get(nodeId)!;
        if (d < minDistance) {
          minDistance = d;
          currentId = nodeId;
        }
      }

      if (!currentId || minDistance === Infinity) {
        break; // Remaining nodes are unreachable
      }

      if (currentId === targetNodeId) {
        break; // Destination reached!
      }

      unvisited.delete(currentId);

      const neighbors = this.adjacency.get(currentId) || [];
      for (const { targetNodeId: nextId, edge, effectiveDistance } of neighbors) {
        if (!unvisited.has(nextId)) continue;

        // Constraint 1: Check if edge is closed for maintenance
        if (edge.isClosed || excludedEdgeIds.includes(edge.id)) {
          continue;
        }

        // Constraint 2: Check wheelchair accessibility
        if (wheelchairAccessible && !edge.isAccessible) {
          // Skip non-accessible connections like stairs
          continue;
        }

        const altDistance = distances.get(currentId)! + effectiveDistance;
        if (altDistance < distances.get(nextId)!) {
          distances.set(nextId, altDistance);
          previous.set(nextId, { nodeId: currentId, edge });
        }
      }
    }

    // Reconstruct path
    if (!previous.has(targetNodeId)) {
      throw new Error(
        wheelchairAccessible
          ? 'No wheelchair-accessible route found. Please check elevator availability or try standard routing.'
          : 'No navigable route found between the selected locations due to closed corridors or partitions.'
      );
    }

    const pathNodeIds: string[] = [];
    const pathEdges: GraphEdge[] = [];
    let curr: string | undefined = targetNodeId;

    while (curr && curr !== startNodeId) {
      pathNodeIds.unshift(curr);
      const prevEntry = previous.get(curr);
      if (prevEntry) {
        pathEdges.unshift(prevEntry.edge);
        curr = prevEntry.nodeId;
      } else {
        break;
      }
    }
    pathNodeIds.unshift(startNodeId);

    const pathNodes = pathNodeIds.map(id => this.nodes.get(id)!);
    const totalDistance = Math.round(distances.get(targetNodeId)!);

    // Calculate time: 1.2 m/s walk speed (72 m/min) + floor transfer delays
    let baseMinutes = totalDistance / 70;
    const floorsInvolved = Array.from(new Set(pathNodes.map(n => n.floorNumber))).sort((a, b) => a - b);
    const hasFloorTransfer = floorsInvolved.length > 1;

    // Add 1.5 min per floor transfer for elevator wait or stairs climbing
    if (hasFloorTransfer) {
      baseMinutes += (floorsInvolved.length - 1) * 1.5;
    }
    const estimatedMinutes = Math.max(1, Math.round(baseMinutes * 10) / 10);

    // Generate human-friendly step-by-step turn-by-turn instructions
    const steps = this.generateTurnByTurnSteps(pathNodes, pathEdges);

    return {
      pathNodeIds,
      nodes: pathNodes,
      edges: pathEdges,
      totalDistance,
      estimatedMinutes,
      steps,
      floorsInvolved,
      isWheelchairAccessible: wheelchairAccessible,
      hasFloorTransfer
    };
  }

  private generateTurnByTurnSteps(nodes: GraphNode[], edges: GraphEdge[]): RouteStep[] {
    const steps: RouteStep[] = [];
    if (nodes.length <= 1) return steps;

    // First step: Departure
    steps.push({
      stepNumber: 1,
      instruction: `Start at ${nodes[0].label} (Floor ${nodes[0].floorNumber})`,
      distance: edges[0]?.distance || 0,
      floorNumber: nodes[0].floorNumber,
      icon: 'straight'
    });

    let currentSegmentDist = 0;

    for (let i = 0; i < edges.length; i++) {
      const fromNode = nodes[i];
      const toNode = nodes[i + 1];
      const edge = edges[i];

      currentSegmentDist += edge.distance;

      // Check if vertical floor transfer
      if (edge.connectionType === 'elevator') {
        steps.push({
          stepNumber: steps.length + 1,
          instruction: `Take Elevator Bank A from Floor ${fromNode.floorNumber} to Floor ${toNode.floorNumber}`,
          distance: edge.distance,
          floorNumber: fromNode.floorNumber,
          transitionType: 'elevator',
          targetFloor: toNode.floorNumber,
          icon: 'elevator'
        });
        currentSegmentDist = 0;
        continue;
      }

      if (edge.connectionType === 'stairs') {
        const isUp = toNode.floorNumber > fromNode.floorNumber;
        steps.push({
          stepNumber: steps.length + 1,
          instruction: `Take the Central Stairwell ${isUp ? 'up' : 'down'} to Floor ${toNode.floorNumber}`,
          distance: edge.distance,
          floorNumber: fromNode.floorNumber,
          transitionType: 'stairs',
          targetFloor: toNode.floorNumber,
          icon: isUp ? 'stairs-up' : 'stairs-down'
        });
        currentSegmentDist = 0;
        continue;
      }

      // Check turns based on 2D coordinates if on same floor
      if (i > 0 && i < edges.length - 1 && fromNode.floorNumber === toNode.floorNumber) {
        const prevNode = nodes[i - 1];
        const nextNode = nodes[i + 2] || toNode;

        const v1x = fromNode.x - prevNode.x;
        const v1y = fromNode.y - prevNode.y;
        const v2x = nextNode.x - toNode.x;
        const v2y = nextNode.y - toNode.y;

        // Cross product to detect left vs right turn
        const cross = v1x * v2y - v1y * v2x;
        if (Math.abs(cross) > 200) {
          const isLeft = cross < 0;
          steps.push({
            stepNumber: steps.length + 1,
            instruction: `${isLeft ? 'Turn left' : 'Turn right'} toward ${toNode.label}`,
            distance: edge.distance,
            floorNumber: toNode.floorNumber,
            icon: isLeft ? 'turn-left' : 'turn-right'
          });
          currentSegmentDist = 0;
        }
      }
    }

    // Destination arrival
    const lastNode = nodes[nodes.length - 1];
    steps.push({
      stepNumber: steps.length + 1,
      instruction: `Arrive at destination: ${lastNode.label} (Floor ${lastNode.floorNumber})`,
      distance: 0,
      floorNumber: lastNode.floorNumber,
      icon: 'arrive'
    });

    return steps;
  }
}
