import { CampusBuilding, BuildingFloor, LocationItem, GraphNode, GraphEdge, CampusAnnouncement } from '../types/navigation';

export const SAMPLE_BUILDINGS: CampusBuilding[] = [
  {
    id: 'b-tech',
    name: 'Turing Science & Tech Complex',
    code: 'TST-01',
    description: 'Main academic center housing computer science labs, engineering wings, and faculty offices.',
    category: 'academic',
    floorsCount: 3,
    totalRooms: 24,
    iconName: 'GraduationCap'
  },
  {
    id: 'b-hospital',
    name: 'Memorial Medical Center',
    code: 'MMC-02',
    description: 'Specialty outpatient clinic, diagnostic laboratories, and medical consultation wings.',
    category: 'hospital',
    floorsCount: 3,
    totalRooms: 32,
    iconName: 'Stethoscope'
  },
  {
    id: 'b-library',
    name: 'Central Information Commons',
    code: 'CIC-03',
    description: 'Quiet study areas, digital archives, printing services, and research carrels.',
    category: 'library',
    floorsCount: 2,
    totalRooms: 16,
    iconName: 'BookOpen'
  }
];

export const SAMPLE_FLOORS: BuildingFloor[] = [
  {
    id: 'f-1',
    buildingId: 'b-tech',
    floorNumber: 1,
    name: 'Ground Floor',
    label: 'Floor 1 (Ground)',
    description: 'Main Reception, Auditorium, Chemistry Lab, Cafeteria & Restrooms',
    svgViewBox: '0 0 1000 600'
  },
  {
    id: 'f-2',
    buildingId: 'b-tech',
    floorNumber: 2,
    name: 'Second Floor',
    label: 'Floor 2 (Labs & Lecture)',
    description: 'AI & Robotics Lab, Lecture Hall 201, Faculty Lounge & Restrooms',
    svgViewBox: '0 0 1000 600'
  },
  {
    id: 'f-3',
    buildingId: 'b-tech',
    floorNumber: 3,
    name: 'Third Floor',
    label: 'Floor 3 (Executive & Library)',
    description: "Dean's Office, Digital Library, Cyber Security Lab & Conference Room",
    svgViewBox: '0 0 1000 600'
  }
];

export const SAMPLE_LOCATIONS: LocationItem[] = [
  // --- FLOOR 1 ---
  {
    id: 'loc-100',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-entrance',
    name: 'Main Campus Entrance',
    type: 'entrance',
    description: 'Primary accessible entrance with automatic sliding doors and ramp',
    keywords: ['entrance', 'gate', 'exit', 'lobby', 'in'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-101',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-audit',
    name: 'Grand Auditorium',
    roomNumber: '101',
    type: 'auditorium',
    description: '500-seat amphitheater for lectures, guest keynotes, and ceremonies',
    keywords: ['auditorium', 'hall', 'event', 'keynote', 'theater'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-102',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-chemlab',
    name: 'Chemistry Research Lab',
    roomNumber: '102',
    type: 'laboratory',
    description: 'Wet lab facilities with fume hoods and analytical equipment',
    keywords: ['chemistry', 'lab', 'science', 'research', 'experiment'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-103',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-cafe',
    name: 'Campus Bistro & Cafe',
    roomNumber: '103',
    type: 'cafeteria',
    description: 'Fresh coffee, snacks, hot meals, and open seating lounge',
    keywords: ['cafe', 'food', 'coffee', 'canteen', 'bistro', 'lunch'],
    isAccessible: true,
    isOpen: true,
    operatingHours: '08:00 - 18:00'
  },
  {
    id: 'loc-104',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-restroom',
    name: 'Restrooms & Washrooms 1F',
    roomNumber: '104',
    type: 'washroom',
    description: 'Wheelchair-accessible gender-neutral and multi-stall restrooms',
    keywords: ['restroom', 'washroom', 'toilet', 'bathroom', 'wc'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-105',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-elevator',
    name: 'Elevator Bank A (Floor 1)',
    type: 'elevator',
    description: 'ADA-compliant high-speed elevator serving Floors 1, 2, and 3',
    keywords: ['elevator', 'lift', 'accessible', 'ada'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-106',
    buildingId: 'b-tech',
    floorId: 'f-1',
    floorNumber: 1,
    nodeId: 'node-f1-stairs',
    name: 'Central Stairwell (Floor 1)',
    type: 'stairs',
    description: 'Wide architectural staircase connecting ground floor to higher levels',
    keywords: ['stairs', 'staircase', 'steps'],
    isAccessible: false,
    isOpen: true
  },

  // --- FLOOR 2 ---
  {
    id: 'loc-201',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-lecture',
    name: 'Turing Lecture Hall 201',
    roomNumber: '201',
    type: 'classroom',
    description: 'Smart multimedia classroom with dual laser projection and tiered seating',
    keywords: ['class', 'lecture', '201', 'computer science'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-202',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-faculty',
    name: 'Faculty Lounge & Helpdesk',
    roomNumber: '202',
    type: 'office',
    description: 'Faculty consultation room, student advisors, and department office',
    keywords: ['faculty', 'professors', 'advisor', 'office', '202'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-203',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-seminar',
    name: 'Collaborative Seminar 203',
    roomNumber: '203',
    type: 'classroom',
    description: 'Modular workshop room with electronic whiteboards for group study',
    keywords: ['seminar', 'room', 'meeting', '203'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-204',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-robotics',
    name: 'AI & Robotics Innovation Lab',
    roomNumber: '204',
    type: 'laboratory',
    description: 'Autonomous robotics arena, GPU deep learning clusters, and 3D printing bay',
    keywords: ['ai', 'robotics', 'lab', '204', 'innovation', 'autonomous'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-205',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-restroom',
    name: 'Restrooms & Washrooms 2F',
    roomNumber: '205',
    type: 'washroom',
    description: 'ADA-compliant restrooms and water refilling fountain',
    keywords: ['restroom', 'washroom', 'toilet', 'wc'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-206',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-elevator',
    name: 'Elevator Bank A (Floor 2)',
    type: 'elevator',
    description: 'Elevator access point on the second floor',
    keywords: ['elevator', 'lift'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-207',
    buildingId: 'b-tech',
    floorId: 'f-2',
    floorNumber: 2,
    nodeId: 'node-f2-stairs',
    name: 'Central Stairwell (Floor 2)',
    type: 'stairs',
    description: 'Stair landing connecting Floor 1, 2, and 3',
    keywords: ['stairs', 'steps'],
    isAccessible: false,
    isOpen: true
  },

  // --- FLOOR 3 ---
  {
    id: 'loc-301',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-dean',
    name: "Dean's Executive Suite",
    roomNumber: '301',
    type: 'office',
    description: 'Dean of Engineering and Academic Affairs leadership reception',
    keywords: ['dean', 'head', 'principal', 'office', '301', 'executive'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-302',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-library',
    name: 'Digital Reference Library',
    roomNumber: '302',
    type: 'library',
    description: 'Silent study zone with high-resolution digital terminals and monographs',
    keywords: ['library', 'books', 'silent', 'study', '302', 'research'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-303',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-cyber',
    name: 'Cyber Security Operations Center',
    roomNumber: '303',
    type: 'laboratory',
    description: 'Secure network lab and defensive testing war room',
    keywords: ['cyber', 'security', 'lab', '303', 'soc', 'network'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-304',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-boardroom',
    name: 'Executive Boardroom 304',
    roomNumber: '304',
    type: 'office',
    description: 'Video conference suite with telepresence display for academic senate',
    keywords: ['boardroom', 'conference', 'meeting', '304'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-305',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-restroom',
    name: 'Restrooms & Washrooms 3F',
    roomNumber: '305',
    type: 'washroom',
    description: 'Restroom facilities on Floor 3',
    keywords: ['restroom', 'toilet', 'wc'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-306',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-elevator',
    name: 'Elevator Bank A (Floor 3)',
    type: 'elevator',
    description: 'Elevator access point on the third floor',
    keywords: ['elevator', 'lift'],
    isAccessible: true,
    isOpen: true
  },
  {
    id: 'loc-307',
    buildingId: 'b-tech',
    floorId: 'f-3',
    floorNumber: 3,
    nodeId: 'node-f3-stairs',
    name: 'Central Stairwell (Floor 3)',
    type: 'stairs',
    description: 'Stair landing for the top floor',
    keywords: ['stairs', 'steps'],
    isAccessible: false,
    isOpen: true
  }
];

export const INITIAL_GRAPH_NODES: GraphNode[] = [
  // --- FLOOR 1 NODES ---
  { id: 'node-f1-entrance', buildingId: 'b-tech', floorNumber: 1, x: 100, y: 300, label: 'Main Entrance', type: 'entrance', locationId: 'loc-100' },
  { id: 'node-f1-lobby', buildingId: 'b-tech', floorNumber: 1, x: 250, y: 300, label: 'Central Lobby Junction', type: 'intersection' },
  { id: 'node-f1-hall-west', buildingId: 'b-tech', floorNumber: 1, x: 250, y: 150, label: 'West Corridor (North)', type: 'corridor' },
  { id: 'node-f1-hall-east', buildingId: 'b-tech', floorNumber: 1, x: 500, y: 300, label: 'Central Spine Corridor', type: 'corridor' },
  { id: 'node-f1-hall-south', buildingId: 'b-tech', floorNumber: 1, x: 250, y: 460, label: 'South Corridor (Cafe Wing)', type: 'corridor' },
  
  { id: 'node-f1-audit', buildingId: 'b-tech', floorNumber: 1, x: 420, y: 150, label: 'Auditorium 101 Door', type: 'room', locationId: 'loc-101' },
  { id: 'node-f1-chemlab', buildingId: 'b-tech', floorNumber: 1, x: 750, y: 150, label: 'Chemistry Lab Door', type: 'room', locationId: 'loc-102' },
  { id: 'node-f1-cafe', buildingId: 'b-tech', floorNumber: 1, x: 450, y: 460, label: 'Campus Bistro Door', type: 'room', locationId: 'loc-103' },
  { id: 'node-f1-restroom', buildingId: 'b-tech', floorNumber: 1, x: 820, y: 460, label: 'Restrooms 1F Door', type: 'room', locationId: 'loc-104' },
  
  { id: 'node-f1-east-hub', buildingId: 'b-tech', floorNumber: 1, x: 750, y: 300, label: 'East Hub Junction', type: 'intersection' },
  { id: 'node-f1-elevator', buildingId: 'b-tech', floorNumber: 1, x: 600, y: 220, label: 'Elevator Bank A', type: 'elevator', locationId: 'loc-105' },
  { id: 'node-f1-stairs', buildingId: 'b-tech', floorNumber: 1, x: 400, y: 220, label: 'Central Stairwell', type: 'stairs', locationId: 'loc-106' },

  // --- FLOOR 2 NODES ---
  { id: 'node-f2-lobby', buildingId: 'b-tech', floorNumber: 2, x: 250, y: 300, label: 'Floor 2 West Concourse', type: 'intersection' },
  { id: 'node-f2-hall-west', buildingId: 'b-tech', floorNumber: 2, x: 250, y: 150, label: 'West Corridor F2', type: 'corridor' },
  { id: 'node-f2-hall-east', buildingId: 'b-tech', floorNumber: 2, x: 500, y: 300, label: 'Central Corridor F2', type: 'corridor' },
  { id: 'node-f2-hall-south', buildingId: 'b-tech', floorNumber: 2, x: 250, y: 460, label: 'South Corridor F2', type: 'corridor' },

  { id: 'node-f2-lecture', buildingId: 'b-tech', floorNumber: 2, x: 420, y: 150, label: 'Lecture Hall 201 Door', type: 'room', locationId: 'loc-201' },
  { id: 'node-f2-faculty', buildingId: 'b-tech', floorNumber: 2, x: 750, y: 150, label: 'Faculty Lounge 202 Door', type: 'room', locationId: 'loc-202' },
  { id: 'node-f2-seminar', buildingId: 'b-tech', floorNumber: 2, x: 450, y: 460, label: 'Seminar Room 203 Door', type: 'room', locationId: 'loc-203' },
  { id: 'node-f2-robotics', buildingId: 'b-tech', floorNumber: 2, x: 720, y: 460, label: 'AI & Robotics Lab Door', type: 'room', locationId: 'loc-204' },
  { id: 'node-f2-restroom', buildingId: 'b-tech', floorNumber: 2, x: 860, y: 300, label: 'Restrooms 2F Door', type: 'room', locationId: 'loc-205' },

  { id: 'node-f2-east-hub', buildingId: 'b-tech', floorNumber: 2, x: 750, y: 300, label: 'East Hub F2', type: 'intersection' },
  { id: 'node-f2-elevator', buildingId: 'b-tech', floorNumber: 2, x: 600, y: 220, label: 'Elevator Bank A (F2)', type: 'elevator', locationId: 'loc-206' },
  { id: 'node-f2-stairs', buildingId: 'b-tech', floorNumber: 2, x: 400, y: 220, label: 'Central Stairwell (F2)', type: 'stairs', locationId: 'loc-207' },

  // --- FLOOR 3 NODES ---
  { id: 'node-f3-lobby', buildingId: 'b-tech', floorNumber: 3, x: 250, y: 300, label: 'Floor 3 West Concourse', type: 'intersection' },
  { id: 'node-f3-hall-west', buildingId: 'b-tech', floorNumber: 3, x: 250, y: 150, label: 'West Corridor F3', type: 'corridor' },
  { id: 'node-f3-hall-east', buildingId: 'b-tech', floorNumber: 3, x: 500, y: 300, label: 'Central Corridor F3', type: 'corridor' },
  { id: 'node-f3-hall-south', buildingId: 'b-tech', floorNumber: 3, x: 250, y: 460, label: 'South Corridor F3', type: 'corridor' },

  { id: 'node-f3-dean', buildingId: 'b-tech', floorNumber: 3, x: 420, y: 150, label: "Dean's Office 301 Door", type: 'room', locationId: 'loc-301' },
  { id: 'node-f3-library', buildingId: 'b-tech', floorNumber: 3, x: 750, y: 150, label: 'Digital Library 302 Door', type: 'room', locationId: 'loc-302' },
  { id: 'node-f3-cyber', buildingId: 'b-tech', floorNumber: 3, x: 450, y: 460, label: 'Cyber Security Lab Door', type: 'room', locationId: 'loc-303' },
  { id: 'node-f3-boardroom', buildingId: 'b-tech', floorNumber: 3, x: 720, y: 460, label: 'Executive Boardroom Door', type: 'room', locationId: 'loc-304' },
  { id: 'node-f3-restroom', buildingId: 'b-tech', floorNumber: 3, x: 860, y: 300, label: 'Restrooms 3F Door', type: 'room', locationId: 'loc-305' },

  { id: 'node-f3-east-hub', buildingId: 'b-tech', floorNumber: 3, x: 750, y: 300, label: 'East Hub F3', type: 'intersection' },
  { id: 'node-f3-elevator', buildingId: 'b-tech', floorNumber: 3, x: 600, y: 220, label: 'Elevator Bank A (F3)', type: 'elevator', locationId: 'loc-306' },
  { id: 'node-f3-stairs', buildingId: 'b-tech', floorNumber: 3, x: 400, y: 220, label: 'Central Stairwell (F3)', type: 'stairs', locationId: 'loc-307' }
];

export const INITIAL_GRAPH_EDGES: GraphEdge[] = [
  // ===================== FLOOR 1 INTERNAL EDGES =====================
  { id: 'edge-f1-1', sourceNodeId: 'node-f1-entrance', targetNodeId: 'node-f1-lobby', distance: 15, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-2', sourceNodeId: 'node-f1-lobby', targetNodeId: 'node-f1-hall-west', distance: 12, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-3', sourceNodeId: 'node-f1-lobby', targetNodeId: 'node-f1-hall-south', distance: 12, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-4', sourceNodeId: 'node-f1-lobby', targetNodeId: 'node-f1-hall-east', distance: 20, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f1-5', sourceNodeId: 'node-f1-hall-west', targetNodeId: 'node-f1-audit', distance: 14, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-6', sourceNodeId: 'node-f1-audit', targetNodeId: 'node-f1-stairs', distance: 8, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f1-7', sourceNodeId: 'node-f1-hall-east', targetNodeId: 'node-f1-stairs', distance: 10, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-8', sourceNodeId: 'node-f1-hall-east', targetNodeId: 'node-f1-elevator', distance: 10, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-9', sourceNodeId: 'node-f1-hall-east', targetNodeId: 'node-f1-east-hub', distance: 18, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f1-10', sourceNodeId: 'node-f1-east-hub', targetNodeId: 'node-f1-chemlab', distance: 14, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-11', sourceNodeId: 'node-f1-east-hub', targetNodeId: 'node-f1-restroom', distance: 12, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-12', sourceNodeId: 'node-f1-east-hub', targetNodeId: 'node-f1-elevator', distance: 12, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f1-13', sourceNodeId: 'node-f1-hall-south', targetNodeId: 'node-f1-cafe', distance: 15, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f1-14', sourceNodeId: 'node-f1-cafe', targetNodeId: 'node-f1-restroom', distance: 28, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  // ===================== FLOOR 2 INTERNAL EDGES =====================
  { id: 'edge-f2-1', sourceNodeId: 'node-f2-lobby', targetNodeId: 'node-f2-hall-west', distance: 12, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-2', sourceNodeId: 'node-f2-lobby', targetNodeId: 'node-f2-hall-south', distance: 12, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-3', sourceNodeId: 'node-f2-lobby', targetNodeId: 'node-f2-hall-east', distance: 20, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f2-4', sourceNodeId: 'node-f2-hall-west', targetNodeId: 'node-f2-lecture', distance: 14, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-5', sourceNodeId: 'node-f2-lecture', targetNodeId: 'node-f2-stairs', distance: 8, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f2-6', sourceNodeId: 'node-f2-hall-east', targetNodeId: 'node-f2-stairs', distance: 10, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-7', sourceNodeId: 'node-f2-hall-east', targetNodeId: 'node-f2-elevator', distance: 10, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-8', sourceNodeId: 'node-f2-hall-east', targetNodeId: 'node-f2-east-hub', distance: 18, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  
  { id: 'edge-f2-9', sourceNodeId: 'node-f2-east-hub', targetNodeId: 'node-f2-faculty', distance: 14, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-10', sourceNodeId: 'node-f2-east-hub', targetNodeId: 'node-f2-restroom', distance: 10, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-11', sourceNodeId: 'node-f2-east-hub', targetNodeId: 'node-f2-robotics', distance: 12, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-12', sourceNodeId: 'node-f2-east-hub', targetNodeId: 'node-f2-elevator', distance: 12, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f2-13', sourceNodeId: 'node-f2-hall-south', targetNodeId: 'node-f2-seminar', distance: 15, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f2-14', sourceNodeId: 'node-f2-seminar', targetNodeId: 'node-f2-robotics', distance: 22, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  // ===================== FLOOR 3 INTERNAL EDGES =====================
  { id: 'edge-f3-1', sourceNodeId: 'node-f3-lobby', targetNodeId: 'node-f3-hall-west', distance: 12, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-2', sourceNodeId: 'node-f3-lobby', targetNodeId: 'node-f3-hall-south', distance: 12, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-3', sourceNodeId: 'node-f3-lobby', targetNodeId: 'node-f3-hall-east', distance: 20, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f3-4', sourceNodeId: 'node-f3-hall-west', targetNodeId: 'node-f3-dean', distance: 14, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-5', sourceNodeId: 'node-f3-dean', targetNodeId: 'node-f3-stairs', distance: 8, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f3-6', sourceNodeId: 'node-f3-hall-east', targetNodeId: 'node-f3-stairs', distance: 10, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-7', sourceNodeId: 'node-f3-hall-east', targetNodeId: 'node-f3-elevator', distance: 10, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-8', sourceNodeId: 'node-f3-hall-east', targetNodeId: 'node-f3-east-hub', distance: 18, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f3-9', sourceNodeId: 'node-f3-east-hub', targetNodeId: 'node-f3-library', distance: 14, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-10', sourceNodeId: 'node-f3-east-hub', targetNodeId: 'node-f3-restroom', distance: 10, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-11', sourceNodeId: 'node-f3-east-hub', targetNodeId: 'node-f3-boardroom', distance: 12, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-12', sourceNodeId: 'node-f3-east-hub', targetNodeId: 'node-f3-elevator', distance: 12, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  { id: 'edge-f3-13', sourceNodeId: 'node-f3-hall-south', targetNodeId: 'node-f3-cyber', distance: 15, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },
  { id: 'edge-f3-14', sourceNodeId: 'node-f3-cyber', targetNodeId: 'node-f3-boardroom', distance: 22, floorNumber: 3, isAccessible: true, isClosed: false, connectionType: 'walkway' },

  // ===================== VERTICAL TRANSIT: STAIRS (Inaccessible to Wheelchairs) =====================
  { id: 'edge-vert-stairs-1-2', sourceNodeId: 'node-f1-stairs', targetNodeId: 'node-f2-stairs', distance: 18, floorNumber: 1, isAccessible: false, isClosed: false, connectionType: 'stairs' },
  { id: 'edge-vert-stairs-2-3', sourceNodeId: 'node-f2-stairs', targetNodeId: 'node-f3-stairs', distance: 18, floorNumber: 2, isAccessible: false, isClosed: false, connectionType: 'stairs' },

  // ===================== VERTICAL TRANSIT: ELEVATORS (Accessible to Wheelchairs) =====================
  { id: 'edge-vert-elev-1-2', sourceNodeId: 'node-f1-elevator', targetNodeId: 'node-f2-elevator', distance: 14, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'elevator' },
  { id: 'edge-vert-elev-2-3', sourceNodeId: 'node-f2-elevator', targetNodeId: 'node-f3-elevator', distance: 14, floorNumber: 2, isAccessible: true, isClosed: false, connectionType: 'elevator' },
  { id: 'edge-vert-elev-1-3', sourceNodeId: 'node-f1-elevator', targetNodeId: 'node-f3-elevator', distance: 24, floorNumber: 1, isAccessible: true, isClosed: false, connectionType: 'elevator' }
];

export const SAMPLE_ANNOUNCEMENTS: CampusAnnouncement[] = [
  {
    id: 'ann-1',
    buildingId: 'b-tech',
    title: 'Robotics Demo & Open Lab Day',
    content: 'Live autonomous rover demonstrations today in AI Lab 204 from 14:00 to 16:30.',
    priority: 'info',
    timestamp: 'Today at 09:15 AM',
    active: true
  },
  {
    id: 'ann-2',
    buildingId: 'b-tech',
    title: 'North Stairwell Maintenance Notice',
    content: 'Elevator Bank A is fully operational. Wheelchair users and visitors please use East Elevator for Floors 2 and 3.',
    priority: 'warning',
    timestamp: 'Today at 08:00 AM',
    active: true
  }
];
