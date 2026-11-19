import React, { useState, useEffect } from 'react';
import { LocationItem, GraphNode, GraphEdge, ComputedRoute, RouteStep } from '../types/navigation';
import { NavigationMap } from './NavigationMap';
import confetti from 'canvas-confetti';
import { 
  ArrowUpDown, 
  Accessibility, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Footprints, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Compass, 
  ArrowUp, 
  CornerUpLeft, 
  CornerUpRight,
  Sparkles,
  Info
} from 'lucide-react';

interface NavigateViewProps {
  locations: LocationItem[];
  nodes: GraphNode[];
  edges: GraphEdge[];
  startLocation: LocationItem | null;
  targetLocation: LocationItem | null;
  onSelectStartLocation: (loc: LocationItem | null) => void;
  onSelectTargetLocation: (loc: LocationItem | null) => void;
  activeRoute: ComputedRoute | null;
  onCalculateRoute: (startLoc: LocationItem, targetLoc: LocationItem, wheelchair: boolean) => void;
  onClearRoute: () => void;
  wheelchairAccessible: boolean;
  onToggleWheelchair: (enabled: boolean) => void;
  currentFloor: number;
  onFloorChange: (floor: number) => void;
  highContrastMap: boolean;
}

export const NavigateView: React.FC<NavigateViewProps> = ({
  locations,
  nodes,
  edges,
  startLocation,
  targetLocation,
  onSelectStartLocation,
  onSelectTargetLocation,
  activeRoute,
  onCalculateRoute,
  onClearRoute,
  wheelchairAccessible,
  onToggleWheelchair,
  currentFloor,
  onFloorChange,
  highContrastMap
}) => {
  const [selectedMapLocation, setSelectedMapLocation] = useState<LocationItem | null>(null);
  const [isNavigatingLive, setIsNavigatingLive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Trigger calculation when start, target or wheelchair changes
  useEffect(() => {
    if (startLocation && targetLocation && startLocation.id !== targetLocation.id) {
      onCalculateRoute(startLocation, targetLocation, wheelchairAccessible);
    }
  }, [startLocation, targetLocation, wheelchairAccessible]);

  // Sync floor view with current active step if in live guidance mode
  useEffect(() => {
    if (isNavigatingLive && activeRoute && activeRoute.steps[currentStepIndex]) {
      const stepFloor = activeRoute.steps[currentStepIndex].floorNumber;
      if (stepFloor !== currentFloor) {
        onFloorChange(stepFloor);
      }
    }
  }, [isNavigatingLive, currentStepIndex]);

  // Swap start & destination
  const handleSwap = () => {
    const temp = startLocation;
    onSelectStartLocation(targetLocation);
    onSelectTargetLocation(temp);
  };

  // Start live guidance
  const handleStartLiveGuidance = () => {
    if (!activeRoute) return;
    setIsNavigatingLive(true);
    setCurrentStepIndex(0);
  };

  // Stop live guidance
  const handleStopLiveGuidance = () => {
    setIsNavigatingLive(false);
    setCurrentStepIndex(0);
  };

  // Step advancement
  const handleNextStep = () => {
    if (!activeRoute) return;
    if (currentStepIndex < activeRoute.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);

      // If arrived at final step, fire confetti
      if (nextIdx === activeRoute.steps.length - 1) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const currentStep = activeRoute?.steps[currentStepIndex];

  return (
    <div className="space-y-4 pb-24 max-w-lg mx-auto">
      
      {/* Route Inputs Card (Hidden during Live Guidance Mode to maximize map focus) */}
      {!isNavigatingLive ? (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center space-x-3">
            {/* Origin & Destination inputs */}
            <div className="flex-1 space-y-2.5">
              {/* Start Location Input */}
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/70">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label htmlFor="start-location-select" className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Start Location
                  </label>
                  <select
                    id="start-location-select"
                    value={startLocation?.id || ''}
                    onChange={(e) => {
                      const found = locations.find(l => l.id === e.target.value);
                      onSelectStartLocation(found || null);
                    }}
                    className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <option value="">Select departure point...</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} (Floor {loc.floorNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination Input */}
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200/70">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <label htmlFor="target-location-select" className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Destination
                  </label>
                  <select
                    id="target-location-select"
                    value={targetLocation?.id || ''}
                    onChange={(e) => {
                      const found = locations.find(l => l.id === e.target.value);
                      onSelectTargetLocation(found || null);
                    }}
                    className="w-full text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
                  >
                    <option value="">Select destination...</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} (Floor {loc.floorNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors shrink-0"
              title="Swap Start and Destination"
              aria-label="Swap Start and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Controls Bar: Wheelchair Toggle & Quick Clear */}
          <div className="flex items-center justify-between pt-1 text-xs">
            {/* Wheelchair accessible routing toggle */}
            <label className="flex items-center space-x-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wheelchairAccessible}
                onChange={(e) => onToggleWheelchair(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-9 h-5 rounded-full transition-colors relative ${wheelchairAccessible ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 ${wheelchairAccessible ? 'translate-x-4' : ''}`} />
              </div>
              <div className="flex items-center space-x-1 font-medium text-slate-700">
                <Accessibility className="w-3.5 h-3.5 text-blue-600" />
                <span>Wheelchair (No Stairs)</span>
              </div>
            </label>

            {activeRoute && (
              <button
                onClick={onClearRoute}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Clear Route
              </button>
            )}
          </div>
        </div>
      ) : (
        /* LIVE GUIDANCE HUD BANNER (iPhone Maps Inspired) */
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-lg space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 text-xl font-bold">
                {currentStep?.icon === 'turn-left' && '↰'}
                {currentStep?.icon === 'turn-right' && '↱'}
                {currentStep?.icon === 'straight' && '↑'}
                {currentStep?.icon === 'elevator' && '🛗'}
                {currentStep?.icon === 'stairs-up' && '🪜↑'}
                {currentStep?.icon === 'stairs-down' && '🪜↓'}
                {currentStep?.icon === 'arrive' && '🎯'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  Step {currentStepIndex + 1} of {activeRoute?.steps.length} • Floor {currentStep?.floorNumber}
                </span>
                <p className="text-sm sm:text-base font-bold leading-snug mt-0.5">
                  {currentStep?.instruction}
                </p>
                {currentStep && currentStep.distance > 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    Walk straight for {Math.round(currentStep.distance)} meters
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleStopLiveGuidance}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors shrink-0"
              title="Exit Guidance"
              aria-label="Exit Guidance"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Controls: Prev, Next Step */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl font-semibold transition-all ${
                currentStepIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStepIndex === (activeRoute?.steps.length || 0) - 1 ? (
              <button
                onClick={handleStopLiveGuidance}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish Route</span>
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interactive SVG Floor Map */}
      <NavigationMap
        currentFloor={currentFloor}
        onFloorChange={onFloorChange}
        locations={locations}
        nodes={nodes}
        edges={edges}
        activeRoute={activeRoute}
        onSelectLocation={(loc) => {
          setSelectedMapLocation(loc);
          if (!startLocation) {
            onSelectStartLocation(loc);
          } else if (!targetLocation && loc.id !== startLocation.id) {
            onSelectTargetLocation(loc);
          }
        }}
        selectedLocation={selectedMapLocation}
        startLocationId={startLocation?.id}
        targetLocationId={targetLocation?.id}
        highContrast={highContrastMap}
      />

      {/* Route Summary Card (When route is active and not in live HUD mode) */}
      {activeRoute && !isNavigatingLive && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Route Summary</p>
              <div className="flex items-center space-x-3 mt-1">
                <div className="flex items-center space-x-1 text-slate-900 font-bold text-base">
                  <Footprints className="w-4 h-4 text-blue-600" />
                  <span>{activeRoute.totalDistance}m</span>
                </div>
                <span className="text-slate-300">•</span>
                <div className="flex items-center space-x-1 text-slate-900 font-bold text-base">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>~{activeRoute.estimatedMinutes} min</span>
                </div>
                {activeRoute.hasFloorTransfer && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {activeRoute.floorsInvolved.length} Floors
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleStartLiveGuidance}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Navigation</span>
            </button>
          </div>

          {/* Turn-by-turn instruction accordion preview */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Turn-by-turn guidance</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeRoute.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (step.floorNumber !== currentFloor) {
                      onFloorChange(step.floorNumber);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                    step.floorNumber === currentFloor
                      ? 'bg-blue-50/60 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <span className="w-5 h-5 rounded-full bg-white text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                      {step.stepNumber}
                    </span>
                    <span className="truncate">{step.instruction}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">Floor {step.floorNumber}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Room Bottom Popover Drawer (when user taps a room on the map) */}
      {selectedMapLocation && !activeRoute && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="min-w-0 pr-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-900 truncate">
                {selectedMapLocation.name}
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                Floor {selectedMapLocation.floorNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {selectedMapLocation.description || 'Tap to set as starting point or destination'}
            </p>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => {
                onSelectStartLocation(selectedMapLocation);
                setSelectedMapLocation(null);
              }}
              className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              Set Start
            </button>
            <button
              onClick={() => {
                onSelectTargetLocation(selectedMapLocation);
                setSelectedMapLocation(null);
              }}
              className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-sm transition-colors"
            >
              Set Destination
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
