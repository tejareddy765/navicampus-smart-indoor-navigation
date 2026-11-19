import React, { useState } from 'react';
import { UserFavorite, LocationItem } from '../types/navigation';
import { 
  Bookmark, 
  Trash2, 
  Navigation, 
  Cloud, 
  Plus, 
  Clock, 
  Sparkles, 
  Check, 
  Building2,
  Tag
} from 'lucide-react';

interface SavedViewProps {
  favorites: UserFavorite[];
  onRemoveFavorite: (favoriteId: string) => void;
  onNavigateToFavorite: (locationId: string) => void;
  locations: LocationItem[];
  onAddFavorite: (loc: LocationItem, notes?: string) => void;
  isCloudSynced: boolean;
  userEmail: string | null;
}

export const SavedView: React.FC<SavedViewProps> = ({
  favorites,
  onRemoveFavorite,
  onNavigateToFavorite,
  locations,
  onAddFavorite,
  isCloudSynced,
  userEmail
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  const handleSaveNew = () => {
    const loc = locations.find(l => l.id === selectedLocId);
    if (!loc) return;
    onAddFavorite(loc, customNote);
    setShowAddModal(false);
    setSelectedLocId('');
    setCustomNote('');
  };

  return (
    <div className="space-y-5 pb-24 max-w-lg mx-auto">
      
      {/* Header & Cloud Sync Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Saved Places</h1>
          <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-500">
            <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-blue-600' : 'text-slate-400'}`} />
            <span>
              {isCloudSynced ? 'Synced via Cloud Firestore' : 'Synced locally with Firebase client ready'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-2xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto text-2xl shadow-sm">
            ⭐
          </div>
          <p className="text-base font-bold text-slate-900">No saved destinations yet</p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Star frequently visited classrooms, laboratories, or library zones to quickly navigate to them anytime.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Save a Location</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map(fav => (
            <div
              key={fav.id}
              className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {fav.locationName}
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      Floor {fav.floorNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {fav.buildingName}
                  </p>
                  {fav.notes && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-xl mt-2 border border-slate-100">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{fav.notes}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="p-2 text-slate-300 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="Remove from Saved"
                    aria-label={`Remove ${fav.locationName} from saved`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigateToFavorite(fav.locationId)}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-sm transition-all"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-white" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Favorite Modal Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Save a Campus Place</h3>
            <p className="text-xs text-slate-500">
              Select a room to bookmark for fast one-tap navigation.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Choose Room or Facility
                </label>
                <select
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  className="w-full text-xs font-semibold p-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select a location...</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} (Floor {l.floorNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Personal Note or Tag (Optional)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. My Thursday afternoon lab, Best study spot"
                  className="w-full text-xs p-3 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNew}
                disabled={!selectedLocId}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
