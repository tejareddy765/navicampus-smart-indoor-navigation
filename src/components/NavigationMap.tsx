import React, { useState, useRef, useEffect } from 'react';
import { LocationItem, GraphNode, GraphEdge, ComputedRoute } from '../types/navigation';
import { ZoomIn, ZoomOut, RotateCcw, Compass, ArrowUpRight, Accessibility, Layers } from 'lucide-react';

interface NavigationMapProps {
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  locations: LocationItem[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  activeRoute: ComputedRoute | null;
  onSelectLocation: (location: LocationItem) => void;
  selectedLocation: LocationItem | null;
  startLocationId?: string;
  targetLocationId?: string;
  highContrast?: boolean;
}

export const NavigationMap: React.FC<NavigationMapProps> = ({
  currentFloor,
  onFloorChange,
  locations,
  nodes,
  edges,
  activeRoute,
  onSelectLocation,
  selectedLocation,
  startLocationId,
  targetLocationId,
  highContrast = false
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter items for current floor
  const floorLocations = locations.filter(l => l.floorNumber === currentFloor);
  const floorNodes = nodes.filter(n => n.floorNumber === currentFloor);
  const floorEdges = edges.filter(e => e.floorNumber === currentFloor && e.connectionType === 'walkway');

  // Route elements on current floor
  const routeNodesOnFloor: GraphNode[] = [];
  const routeEdgesOnFloor: GraphEdge[] = [];

  if (activeRoute) {
    activeRoute.nodes.forEach(node => {
      if (node.floorNumber === currentFloor) {
        routeNodesOnFloor.push(node);
      }
    });

    for (let i = 0; i < activeRoute.nodes.length - 1; i++) {
      const u = activeRoute.nodes[i];
      const v = activeRoute.nodes[i + 1];
      if (u.floorNumber === currentFloor && v.floorNumber === currentFloor) {
        // find matching edge
        const edge = activeRoute.edges[i];
        if (edge) routeEdgesOnFloor.push(edge);
      }
    }
  }

  // Check if start or end are on this floor
  const startNode = nodes.find(n => n.locationId === startLocationId);
  const targetNode = nodes.find(n => n.locationId === targetLocationId);
  const isStartOnFloor = startNode && startNode.floorNumber === currentFloor;
  const isTargetOnFloor = targetNode && targetNode.floorNumber === currentFloor;

  // Check if floor transfer occurs from/to this floor
  let transferPoint: { node: GraphNode; type: 'elevator' | 'stairs'; targetFloor: number; isUp: boolean } | null = null;
  if (activeRoute && activeRoute.hasFloorTransfer) {
    for (let i = 0; i < activeRoute.nodes.length - 1; i++) {
      const from = activeRoute.nodes[i];
      const to = activeRoute.nodes[i + 1];
      if (from.floorNumber === currentFloor && to.floorNumber !== currentFloor) {
        const edge = activeRoute.edges[i];
        transferPoint = {
          node: from,
          type: edge.connectionType === 'elevator' ? 'elevator' : 'stairs',
          targetFloor: to.floorNumber,
          isUp: to.floorNumber > from.floorNumber
        };
        break;
      }
    }
  }

  // Pan controls
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Color theme
  const bgFill = highContrast ? '#0F172A' : '#FFFFFF';
  const wallStroke = highContrast ? '#94A3B8' : '#CBD5E1';
  const corridorFill = highContrast ? '#1E293B' : '#F8FAFC';
  const roomFill = highContrast ? '#1E293B' : '#FFFFFF';
  const roomStroke = highContrast ? '#475569' : '#E2E8F0';
  const textFill = highContrast ? '#F8FAFC' : '#1E293B';

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm select-none">
      
      {/* Top Floating Floor Switcher Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center space-x-1 bg-white/90 backdrop-blur-md px-1.5 py-1 rounded-2xl shadow-sm border border-slate-200/80">
          {[1, 2, 3].map(floorNum => {
            const hasRoute = activeRoute?.floorsInvolved.includes(floorNum);
            const isCurrent = currentFloor === floorNum;
            return (
              <button
                key={floorNum}
                onClick={() => onFloorChange(floorNum)}
                className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label={`Switch to Floor ${floorNum}`}
              >
                Floor {floorNum}
                {hasRoute && !isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Accessibility & Zoom Indicators */}
        <div className="pointer-events-auto flex items-center space-x-1.5">
          {activeRoute?.isWheelchairAccessible && (
            <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2.5 py-1.5 rounded-xl border border-blue-200 text-xs font-medium backdrop-blur-md">
              <Accessibility className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Accessible Path</span>
            </div>
          )}
          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-slate-200/80">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.75))}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors"
              title="Reset View"
              aria-label="Reset map view"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full transition-transform duration-75"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Defs for gradients, patterns and arrow markers */}
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2563EB" floodOpacity="0.4" />
            </filter>
            
            <filter id="shadow-pin" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
            </filter>

            {/* Subtle architectural floor grid */}
            <pattern id="floorGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={highContrast ? '#1E293B' : '#F1F5F9'} strokeWidth="1" />
            </pattern>
          </defs>

          {/* Building Outer Perimeter Base */}
          <rect x="40" y="40" width="920" height="520" rx="36" fill={bgFill} stroke={wallStroke} strokeWidth="5" />
          <rect x="40" y="40" width="920" height="520" rx="36" fill="url(#floorGrid)" />

          {/* Walkway Corridors Floor Overlay */}
          <path
            d="M 100 300 L 900 300 M 250 150 L 250 460 M 750 150 L 750 460 M 420 150 L 750 150 M 420 460 L 750 460"
            fill="none"
            stroke={corridorFill}
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Corridor Guide Lines */}
          <path
            d="M 100 300 L 900 300 M 250 150 L 250 460 M 750 150 L 750 460 M 420 150 L 750 150 M 420 460 L 750 460"
            fill="none"
            stroke={highContrast ? '#334155' : '#E2E8F0'}
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Architectural Rooms on Current Floor */}
          {currentFloor === 1 && (
            <g id="rooms-floor-1">
              {/* Grand Auditorium 101 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-101');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="340" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-101' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-101' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="420" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Grand Auditorium</text>
                <text x="420" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Hall 101 • 500 Seats</text>
              </g>

              {/* Chemistry Lab 102 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-102');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="670" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-102' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-102' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="750" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Chemistry Lab</text>
                <text x="750" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Room 102 • Research</text>
              </g>

              {/* Campus Bistro & Cafe 103 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-103');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="360" y="380" width="180" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-103' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-103' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="450" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Campus Bistro & Cafe</text>
                <text x="450" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Coffee & Meals • 103</text>
              </g>

              {/* Restrooms 1F */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-104');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="740" y="380" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-104' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-104' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="820" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Restrooms 1F</text>
                <text x="820" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Accessible / WC</text>
              </g>

              {/* Main Entrance Beacon */}
              <g className="cursor-pointer" onClick={() => {
                const loc = locations.find(l => l.id === 'loc-100');
                if (loc) onSelectLocation(loc);
              }}>
                <circle cx="100" cy="300" r="26" fill="#10B981" fillOpacity="0.15" />
                <circle cx="100" cy="300" r="14" fill="#10B981" />
                <text x="100" y="340" textAnchor="middle" fill={textFill} fontSize="13" fontWeight="600">Main Entrance</text>
              </g>
            </g>
          )}

          {currentFloor === 2 && (
            <g id="rooms-floor-2">
              {/* Lecture Hall 201 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-201');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="340" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-201' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-201' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="420" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Lecture Hall 201</text>
                <text x="420" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Computer Science</text>
              </g>

              {/* Faculty Lounge 202 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-202');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="670" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-202' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-202' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="750" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Faculty Lounge 202</text>
                <text x="750" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Department Office</text>
              </g>

              {/* Seminar Room 203 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-203');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="360" y="380" width="180" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-203' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-203' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="450" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Collaborative Seminar</text>
                <text x="450" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Room 203 • Study</text>
              </g>

              {/* AI & Robotics Lab 204 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-204');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="650" y="380" width="180" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-204' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-204' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="740" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">AI & Robotics Lab</text>
                <text x="740" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Room 204 • GPU Cluster</text>
              </g>
            </g>
          )}

          {currentFloor === 3 && (
            <g id="rooms-floor-3">
              {/* Dean's Office 301 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-301');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="340" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-301' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-301' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="420" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Dean's Suite 301</text>
                <text x="420" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Academic Affairs</text>
              </g>

              {/* Digital Reference Library 302 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-302');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="670" y="70" width="160" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-302' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-302' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="750" y="130" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Digital Library 302</text>
                <text x="750" y="152" textAnchor="middle" fill="#64748B" fontSize="12">Silent Study Commons</text>
              </g>

              {/* Cyber Security Lab 303 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-303');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="360" y="380" width="180" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-303' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-303' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="450" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Cyber SOC Lab</text>
                <text x="450" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Room 303 • Operations</text>
              </g>

              {/* Executive Boardroom 304 */}
              <g
                onClick={() => {
                  const loc = locations.find(l => l.id === 'loc-304');
                  if (loc) onSelectLocation(loc);
                }}
                className="cursor-pointer group"
              >
                <rect x="650" y="380" width="180" height="150" rx="16" fill={roomFill} stroke={selectedLocation?.id === 'loc-304' ? '#2563EB' : roomStroke} strokeWidth={selectedLocation?.id === 'loc-304' ? '3' : '2'} className="group-hover:stroke-blue-400 transition-colors" />
                <text x="740" y="440" textAnchor="middle" fill={textFill} fontSize="14" fontWeight="600">Executive Boardroom</text>
                <text x="740" y="462" textAnchor="middle" fill="#64748B" fontSize="12">Room 304 • Conference</text>
              </g>
            </g>
          )}

          {/* Central Vertical Transit Points (Shared across all floors) */}
          {/* Elevator Bank A */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const loc = locations.find(l => l.floorNumber === currentFloor && l.type === 'elevator');
              if (loc) onSelectLocation(loc);
            }}
          >
            <rect x="560" y="180" width="80" height="80" rx="12" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="2" />
            <text x="600" y="215" textAnchor="middle" fill="#1D4ED8" fontSize="20">🛗</text>
            <text x="600" y="242" textAnchor="middle" fill="#1E40AF" fontSize="11" fontWeight="600">Elevator A</text>
          </g>

          {/* Central Stairwell */}
          <g
            className="cursor-pointer group"
            onClick={() => {
              const loc = locations.find(l => l.floorNumber === currentFloor && l.type === 'stairs');
              if (loc) onSelectLocation(loc);
            }}
          >
            <rect x="360" y="180" width="80" height="80" rx="12" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2" />
            {/* Stair lines */}
            <path d="M 375 240 L 425 240 M 380 230 L 425 230 M 385 220 L 425 220 M 390 210 L 425 210 M 395 200 L 425 200" stroke="#64748B" strokeWidth="2" />
            <text x="400" y="255" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">Stairs</text>
          </g>

          {/* Active Navigation Route Path On This Floor */}
          {routeNodesOnFloor.length >= 2 && (
            <g id="active-route-layer">
              {/* Glow background stroke */}
              <polyline
                points={routeNodesOnFloor.map(n => `${n.x},${n.y}`).join(' ')}
                fill="none"
                stroke="#60A5FA"
                strokeWidth="10"
                strokeOpacity="0.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated active path */}
              <polyline
                points={routeNodesOnFloor.map(n => `${n.x},${n.y}`).join(' ')}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-route-dash"
              />

              {/* Waypoint beads */}
              {routeNodesOnFloor.map((n, idx) => (
                <circle
                  key={idx}
                  cx={n.x}
                  cy={n.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#2563EB"
                  strokeWidth="2"
                />
              ))}
            </g>
          )}

          {/* Floor Transfer Pulse (Take stairs/elevator to another floor) */}
          {transferPoint && (
            <g transform={`translate(${transferPoint.node.x}, ${transferPoint.node.y})`}>
              <circle r="28" fill="#3B82F6" fillOpacity="0.2" className="animate-ping" />
              <circle r="16" fill="#2563EB" />
              <text y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                {transferPoint.isUp ? '↑' : '↓'}
              </text>
              <rect x="-65" y="-45" width="130" height="24" rx="6" fill="#1E293B" />
              <text y="-29" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="500">
                To Floor {transferPoint.targetFloor} ({transferPoint.type})
              </text>
            </g>
          )}

          {/* Start Marker Pin (If on this floor) */}
          {isStartOnFloor && startNode && (
            <g transform={`translate(${startNode.x}, ${startNode.y})`} filter="url(#shadow-pin)">
              <circle r="18" fill="#10B981" fillOpacity="0.25" className="animate-pulse" />
              <circle r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="-24" y="-36" width="48" height="20" rx="6" fill="#10B981" />
              <text y="-23" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">START</text>
            </g>
          )}

          {/* Destination Marker Pin (If on this floor) */}
          {isTargetOnFloor && targetNode && (
            <g transform={`translate(${targetNode.x}, ${targetNode.y})`} filter="url(#shadow-pin)">
              <circle r="22" fill="#EF4444" fillOpacity="0.25" className="animate-ping" />
              <circle r="12" fill="#EF4444" stroke="#FFFFFF" strokeWidth="3" />
              <rect x="-28" y="-40" width="56" height="22" rx="6" fill="#EF4444" />
              <text y="-25" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">FINISH</text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Floating Legend / Floor info */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-xs text-slate-500 bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/80 shadow-sm pointer-events-none">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-700">Turing Complex • Floor {currentFloor}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Start</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Destination</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Elevator</span>
          </span>
        </div>
      </div>
    </div>
  );
};
