import React, { useState, useMemo } from 'react';
import { LocationItem, CampusBuilding, CampusAnnouncement, LocationType } from '../types/navigation';
import { 
  Search, 
  MapPin, 
  Navigation, 
  Bookmark, 
  BookmarkCheck, 
  Bell, 
  ChevronRight, 
  Sparkles,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Coffee,
  Building2,
  Stethoscope,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ExploreViewProps {
  buildings: CampusBuilding[];
  selectedBuilding: CampusBuilding;
  onSelectBuilding: (building: CampusBuilding) => void;
  locations: LocationItem[];
  announcements: CampusAnnouncement[];
  onStartRouteTo: (location: LocationItem) => void;
  onToggleFavorite: (location: LocationItem) => void;
  favoriteLocationIds: Set<string>;
  recentDestinations: any[];
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  buildings,
  selectedBuilding,
  onSelectBuilding,
  locations,
  announcements,
  onStartRouteTo,
  onToggleFavorite,
  favoriteLocationIds,
  recentDestinations
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<LocationType | 'all'>('all');

  const categories: { id: LocationType | 'all'; label: string; icon: string }[] = [
    { id: 'all', label: 'All Places', icon: '🏛️' },
    { id: 'laboratory', label: 'Labs', icon: '🔬' },
    { id: 'classroom', label: 'Classrooms', icon: '🎓' },
    { id: 'office', label: 'Offices', icon: '💼' },
    { id: 'library', label: 'Library', icon: '📚' },
    { id: 'cafeteria', label: 'Cafe & Food', icon: '☕' },
    { id: 'washroom', label: 'Restrooms', icon: '🚻' },
    { id: 'elevator', label: 'Lifts', icon: '🛗' },
    { id: 'stairs', label: 'Stairs', icon: '🪜' },
    { id: 'entrance', label: 'Gates', icon: '🚪' }
  ];

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // Category filter
      if (activeCategory !== 'all' && loc.type !== activeCategory) {
        return false;
      }
      // Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = loc.name.toLowerCase().includes(q);
      const matchRoom = loc.roomNumber?.toLowerCase().includes(q);
      const matchKeywords = loc.keywords.some(k => k.toLowerCase().includes(q));
      const matchDesc = loc.description?.toLowerCase().includes(q);
      return matchName || matchRoom || matchKeywords || matchDesc;
    });
  }, [locations, activeCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      
      {/* Apple-style Top Bar Greeting & Building Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-blue-600 uppercase">Smart Campus Guide</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Explore Indoor</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm">
            NC
          </div>
        </div>

        {/* Building selector dropdown pill */}
        <div className="flex items-center space-x-2 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <label htmlFor="building-select" className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Current Facility
            </label>
            <select
              id="building-select"
              value={selectedBuilding.id}
              onChange={(e) => {
                const b = buildings.find(item => item.id === e.target.value);
                if (b) onSelectBuilding(b);
              }}
              className="w-full text-sm font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer truncate"
            >
              {buildings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.floorsCount} Floors)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Prominent Search Field with Autocomplete Style */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rooms, labs, professor offices, cafe..."
          className="w-full pl-10 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Campus Announcements Banner */}
      {announcements.length > 0 && !searchQuery && (
        <div className="space-y-2">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className={`p-3.5 rounded-2xl border flex items-start space-x-3 transition-all ${
                ann.priority === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-blue-50/80 border-blue-200 text-blue-900'
              }`}
            >
              <Bell className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">{ann.title}</p>
                <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{ann.content}</p>
                <p className="text-[10px] opacity-60 mt-1">{ann.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Horizontal Category Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h2>
          <span className="text-xs text-slate-400">{filteredLocations.length} locations</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recently Navigated Destinations Carousel (When not actively searching) */}
      {!searchQuery && recentDestinations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Places</h2>
          </div>
          <div className="flex space-x-3 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
            {recentDestinations.slice(0, 4).map((rec: any) => {
              const loc = locations.find(l => l.id === rec.locationId);
              return (
                <div
                  key={rec.id}
                  onClick={() => loc && onStartRouteTo(loc)}
                  className="w-44 shrink-0 bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      Floor {rec.floorNumber}
                    </span>
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 mt-2 truncate group-hover:text-blue-600 transition-colors">
                    {rec.locationName}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[11px] text-blue-600 font-semibold">
                    <span>Route</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Location Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {searchQuery ? `Search Results (${filteredLocations.length})` : 'Popular Destinations'}
          </h2>
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200 p-6">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm font-semibold text-slate-800">No rooms found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              We couldn't find any locations matching "{searchQuery}". Try searching for "Lab", "101", or "Restroom".
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLocations.map(loc => {
              const isFav = favoriteLocationIds.has(loc.id);

              return (
                <div
                  key={loc.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-200 shadow-sm transition-all flex items-center justify-between group"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-lg group-hover:bg-blue-50 transition-colors">
                      {loc.type === 'laboratory' && '🔬'}
                      {loc.type === 'classroom' && '🎓'}
                      {loc.type === 'office' && '💼'}
                      {loc.type === 'library' && '📚'}
                      {loc.type === 'cafeteria' && '☕'}
                      {loc.type === 'washroom' && '🚻'}
                      {loc.type === 'elevator' && '🛗'}
                      {loc.type === 'stairs' && '🪜'}
                      {loc.type === 'entrance' && '🚪'}
                      {loc.type === 'auditorium' && '🎭'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {loc.name}
                        </span>
                        {loc.roomNumber && (
                          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                            #{loc.roomNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {loc.description || `Located on Floor ${loc.floorNumber}`}
                      </p>
                      <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-slate-400">
                        <span className="font-medium text-blue-600">Floor {loc.floorNumber}</span>
                        <span>•</span>
                        <span>{loc.isAccessible ? 'Wheelchair Accessible' : 'Standard Access'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => onToggleFavorite(loc)}
                      className={`p-2.5 rounded-xl transition-colors ${
                        isFav ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                      title={isFav ? 'Saved to Favorites' : 'Save to Favorites'}
                      aria-label={`Toggle favorite for ${loc.name}`}
                    >
                      {isFav ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onStartRouteTo(loc)}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
                      aria-label={`Navigate to ${loc.name}`}
                    >
                      <Navigation className="w-3.5 h-3.5 fill-white" />
                      <span>Go</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
