export type LocationType = 
  | 'classroom' 
  | 'laboratory' 
  | 'office' 
  | 'washroom' 
  | 'stairs' 
  | 'elevator' 
  | 'entrance' 
  | 'cafeteria' 
  | 'library'
  | 'auditorium'
  | 'service';

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'academic' | 'hospital' | 'library' | 'administration' | 'mall';
  floorsCount: number;
  totalRooms: number;
  iconName: string;
}

export interface BuildingFloor {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  label: string;
  description: string;
  svgViewBox: string;
}

export interface LocationItem {
  id: string;
  buildingId: string;
  floorId: string;
  floorNumber: number;
  nodeId: string;
  name: string;
  roomNumber?: string;
  type: LocationType;
  description?: string;
  keywords: string[];
  isAccessible: boolean;
  isOpen: boolean;
  operatingHours?: string;
}

export interface GraphNode {
  id: string;
  buildingId: string;
  floorNumber: number;
  x: number;
  y: number;
  label: string;
  type: 'room' | 'corridor' | 'intersection' | 'stairs' | 'elevator' | 'entrance';
  locationId?: string;
}

export interface GraphEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  distance: number; // in meters
  floorNumber: number;
  isAccessible: boolean; // false for stairs, true for corridors/elevators/ramps
  isClosed: boolean; // if blocked for maintenance
  closureReason?: string;
  connectionType: 'walkway' | 'stairs' | 'elevator' | 'ramp';
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distance: number; // meters
  floorNumber: number;
  transitionType?: 'elevator' | 'stairs' | 'none';
  targetFloor?: number;
  icon: 'straight' | 'turn-left' | 'turn-right' | 'stairs-up' | 'stairs-down' | 'elevator' | 'arrive';
}

export interface ComputedRoute {
  pathNodeIds: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalDistance: number; // meters
  estimatedMinutes: number; // based on 1.2 m/s walk speed + transfer times
  steps: RouteStep[];
  floorsInvolved: number[];
  isWheelchairAccessible: boolean;
  hasFloorTransfer: boolean;
}

export interface UserFavorite {
  id: string;
  userId: string;
  locationId: string;
  locationName: string;
  buildingName: string;
  floorNumber: number;
  type: LocationType;
  savedAt: number;
  notes?: string;
}

export interface CampusAnnouncement {
  id: string;
  buildingId?: string;
  title: string;
  content: string;
  priority: 'info' | 'warning' | 'alert';
  timestamp: string;
  active: boolean;
  affectedFloor?: number;
}
