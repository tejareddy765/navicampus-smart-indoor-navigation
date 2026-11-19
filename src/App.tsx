import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CampusBuilding, 
  LocationItem, 
  GraphNode, 
  GraphEdge, 
  ComputedRoute, 
  UserFavorite, 
  CampusAnnouncement 
} from './types/navigation';
import { 
  SAMPLE_BUILDINGS, 
  SAMPLE_FLOORS, 
  SAMPLE_LOCATIONS, 
  INITIAL_GRAPH_NODES, 
  INITIAL_GRAPH_EDGES, 
  SAMPLE_ANNOUNCEMENTS 
} from './data/mockBuildingData';
import { DijkstraNavigationEngine } from './services/dijkstra';
import { firebaseService, AppUserProfile } from './services/firebase';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { ExploreView } from './components/ExploreView';
import { NavigateView } from './components/NavigateView';
import { SavedView } from './components/SavedView';
import { ProfileView } from './components/ProfileView';
import { AdminModal } from './components/AdminModal';
import { JavaExplorerModal } from './components/JavaExplorerModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding>(SAMPLE_BUILDINGS[0]);
  const [locations, setLocations] = useState<LocationItem[]>(SAMPLE_LOCATIONS);
  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_GRAPH_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_GRAPH_EDGES);
  const [announcements, setAnnouncements] = useState<CampusAnnouncement[]>(SAMPLE_ANNOUNCEMENTS);

  // Routing State
  const [startLocation, setStartLocation] = useState<LocationItem | null>(SAMPLE_LOCATIONS[0]); // Main Entrance
  const [targetLocation, setTargetLocation] = useState<LocationItem | null>(SAMPLE_LOCATIONS[7]); // AI & Robotics Lab 204
  const [wheelchairAccessible, setWheelchairAccessible] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(1);
  const [activeRoute, setActiveRoute] = useState<ComputedRoute | null>(null);

  // User & Firebase State
  const [user, setUser] = useState<AppUserProfile | null>(null);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [recentDestinations, setRecentDestinations] = useState<any[]>([]);

  // Preferences & Modals
  const [highContrastMap, setHighContrastMap] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isJavaExplorerOpen, setIsJavaExplorerOpen] = useState<boolean>(false);

  // Initialize Dijkstra Engine
  const dijkstraEngine = useMemo(() => {
    return new DijkstraNavigationEngine(nodes, edges);
  }, [nodes, edges]);

  // Load User & Favorites on mount
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeAuth((u) => {
      setUser(u);
    });

    firebaseService.getFavorites().then(setFavorites);
    firebaseService.getRecentDestinations().then(setRecentDestinations);

    return () => unsubscribe();
  }, []);

  // Compute Route using Dijkstra
  const calculateRoute = useCallback((
    startLoc: LocationItem, 
    destLoc: LocationItem, 
    wheelchair: boolean
  ) => {
    try {
      const computed = dijkstraEngine.calculateRoute(startLoc.nodeId, destLoc.nodeId, {
        wheelchairAccessible: wheelchair
      });
      setActiveRoute(computed);
      setCurrentFloor(startLoc.floorNumber);

      // Record in recent destinations
      firebaseService.addRecentDestination(
        destLoc.id,
        destLoc.name,
        destLoc.floorNumber,
        selectedBuilding.name
      ).then(() => {
        firebaseService.getRecentDestinations().then(setRecentDestinations);
      });
    } catch (err: any) {
      console.warn('Navigation engine route warning:', err);
      setActiveRoute(null);
    }
  }, [dijkstraEngine, selectedBuilding]);

  // Initial calculation so route is instantly visible on load
  useEffect(() => {
    if (startLocation && targetLocation) {
      calculateRoute(startLocation, targetLocation, wheelchairAccessible);
    }
  }, []);

  // Action: Start route to a chosen location from Explore or Saved
  const handleStartRouteTo = (loc: LocationItem) => {
    if (!startLocation || startLocation.id === loc.id) {
      // Default start to Main Entrance if same as destination
      const entrance = locations.find(l => l.type === 'entrance') || locations[0];
      setStartLocation(entrance);
    }
    setTargetLocation(loc);
    calculateRoute(startLocation || locations[0], loc, wheelchairAccessible);
    setActiveTab('navigate');
  };

  // Action: Toggle Favorite
  const handleToggleFavorite = async (loc: LocationItem) => {
    const existing = favorites.find(f => f.locationId === loc.id);
    if (existing) {
      await firebaseService.removeFavorite(existing.id);
    } else {
      await firebaseService.saveFavorite({
        locationId: loc.id,
        locationName: loc.name,
        buildingName: selectedBuilding.name,
        floorNumber: loc.floorNumber,
        type: loc.type
      });
    }
    const updated = await firebaseService.getFavorites();
    setFavorites(updated);
  };

  // Action: Add custom favorite with note
  const handleAddFavoriteWithNote = async (loc: LocationItem, notes?: string) => {
    await firebaseService.saveFavorite({
      locationId: loc.id,
      locationName: loc.name,
      buildingName: selectedBuilding.name,
      floorNumber: loc.floorNumber,
      type: loc.type,
      notes
    });
    const updated = await firebaseService.getFavorites();
    setFavorites(updated);
  };

  // Action: Remove favorite
  const handleRemoveFavorite = async (id: string) => {
    await firebaseService.removeFavorite(id);
    const updated = await firebaseService.getFavorites();
    setFavorites(updated);
  };

  // Action: Toggle Corridor/Edge closure in Admin Console
  const handleToggleEdgeClosure = (edgeId: string, isClosed: boolean, reason?: string) => {
    setEdges(prev => prev.map(e => {
      if (e.id === edgeId) {
        return { ...e, isClosed, closureReason: isClosed ? (reason || 'Closed') : undefined };
      }
      return e;
    }));

    // If currently computed route uses this edge, recalculate!
    setTimeout(() => {
      if (startLocation && targetLocation) {
        calculateRoute(startLocation, targetLocation, wheelchairAccessible);
      }
    }, 50);
  };

  // Action: Publish Campus Announcement
  const handlePublishAnnouncement = (annData: Omit<CampusAnnouncement, 'id' | 'timestamp' | 'active'>) => {
    const newAnn: CampusAnnouncement = {
      ...annData,
      id: 'ann-' + Date.now(),
      timestamp: 'Just now',
      active: true
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  // Simulation runner for Java API Explorer
  const handleSimulateApiRoute = (startId: string, targetId: string, wheelchair: boolean) => {
    try {
      return dijkstraEngine.calculateRoute(startId, targetId, {
        wheelchairAccessible: wheelchair
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const favoriteLocationIds = useMemo(() => {
    return new Set(favorites.map(f => f.locationId));
  }, [favorites]);

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] antialiased">
      {/* Top Mobile Status Header */}
      <header className="sticky top-0 z-40 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-slate-200/60 safe-top">
        <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse-subtle" />
            <span className="text-xs font-bold tracking-tight text-slate-800">
              NaviCampus • {selectedBuilding.code}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsJavaExplorerOpen(true)}
              className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-1 rounded-xl transition-colors"
            >
              Java & API
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-xl transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Screen Container */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {activeTab === 'explore' && (
          <ExploreView
            buildings={SAMPLE_BUILDINGS}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={(b) => setSelectedBuilding(b)}
            locations={locations}
            announcements={announcements}
            onStartRouteTo={handleStartRouteTo}
            onToggleFavorite={handleToggleFavorite}
            favoriteLocationIds={favoriteLocationIds}
            recentDestinations={recentDestinations}
          />
        )}

        {activeTab === 'navigate' && (
          <NavigateView
            locations={locations}
            nodes={nodes}
            edges={edges}
            startLocation={startLocation}
            targetLocation={targetLocation}
            onSelectStartLocation={(loc) => setStartLocation(loc)}
            onSelectTargetLocation={(loc) => setTargetLocation(loc)}
            activeRoute={activeRoute}
            onCalculateRoute={calculateRoute}
            onClearRoute={() => setActiveRoute(null)}
            wheelchairAccessible={wheelchairAccessible}
            onToggleWheelchair={(enabled) => setWheelchairAccessible(enabled)}
            currentFloor={currentFloor}
            onFloorChange={(f) => setCurrentFloor(f)}
            highContrastMap={highContrastMap}
          />
        )}

        {activeTab === 'saved' && (
          <SavedView
            favorites={favorites}
            onRemoveFavorite={handleRemoveFavorite}
            onNavigateToFavorite={(locId) => {
              const loc = locations.find(l => l.id === locId);
              if (loc) handleStartRouteTo(loc);
            }}
            locations={locations}
            onAddFavorite={handleAddFavoriteWithNote}
            isCloudSynced={firebaseService.isConfigured}
            userEmail={user?.email || null}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onSignIn={() => firebaseService.signInWithGoogle()}
            onSignOut={() => firebaseService.signOut()}
            wheelchairDefault={wheelchairAccessible}
            onToggleWheelchairDefault={(val) => setWheelchairAccessible(val)}
            highContrastMap={highContrastMap}
            onToggleHighContrast={(val) => setHighContrastMap(val)}
            soundEnabled={soundEnabled}
            onToggleSound={(val) => setSoundEnabled(val)}
            onOpenAdmin={() => setIsAdminOpen(true)}
            onOpenJavaExplorer={() => setIsJavaExplorerOpen(true)}
            isFirebaseConfigured={firebaseService.isConfigured}
          />
        )}
      </main>

      {/* iPhone Bottom Navigation Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        savedCount={favorites.length}
      />

      {/* Admin Console Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        edges={edges}
        onToggleEdgeClosure={handleToggleEdgeClosure}
        announcements={announcements}
        onPublishAnnouncement={handlePublishAnnouncement}
        totalNodes={nodes.length}
        totalLocations={locations.length}
      />

      {/* Java 21 Backend & Architecture Explorer Modal */}
      <JavaExplorerModal
        isOpen={isJavaExplorerOpen}
        onClose={() => setIsJavaExplorerOpen(false)}
        onSimulateApiRoute={handleSimulateApiRoute}
      />
    </div>
  );
}
