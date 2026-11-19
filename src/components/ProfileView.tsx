import React from 'react';
import { AppUserProfile } from '../services/firebase';
import { 
  User, 
  LogIn, 
  LogOut, 
  Accessibility, 
  ShieldCheck, 
  Code2, 
  Database, 
  Layers, 
  Volume2, 
  SunMedium, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

interface ProfileViewProps {
  user: AppUserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  wheelchairDefault: boolean;
  onToggleWheelchairDefault: (enabled: boolean) => void;
  highContrastMap: boolean;
  onToggleHighContrast: (enabled: boolean) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  onOpenAdmin: () => void;
  onOpenJavaExplorer: () => void;
  isFirebaseConfigured: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onSignIn,
  onSignOut,
  wheelchairDefault,
  onToggleWheelchairDefault,
  highContrastMap,
  onToggleHighContrast,
  soundEnabled,
  onToggleSound,
  onOpenAdmin,
  onOpenJavaExplorer,
  isFirebaseConfigured
}) => {
  return (
    <div className="space-y-6 pb-24 max-w-lg mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Preferences, identity and system architecture</p>
      </div>

      {/* User Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5 min-w-0 pr-2">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-100 shadow-xs"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
              <User className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {user ? user.displayName : 'Guest User'}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'Signed out (Local mode)'}
            </p>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-400">
                {isFirebaseConfigured ? 'Firebase Auth Connected' : 'Demo Profile Active'}
              </span>
            </div>
          </div>
        </div>

        {user ? (
          <button
            onClick={onSignOut}
            className="flex items-center space-x-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onSignIn}
            className="flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2.5 rounded-xl shadow-sm transition-all shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Accessibility & Navigation Settings Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation & Accessibility
          </p>
        </div>

        {/* Wheelchair Default */}
        <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Accessibility className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Always Prefer Wheelchair Routes</p>
              <p className="text-[11px] text-slate-500">Excludes staircases and prioritizes elevators & ramps</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={wheelchairDefault}
            onChange={(e) => onToggleWheelchairDefault(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </label>

        {/* High Contrast Map */}
        <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <SunMedium className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">High-Contrast Map Colors</p>
              <p className="text-[11px] text-slate-500">Enhance visual contrast for low-vision navigation</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={highContrastMap}
            onChange={(e) => onToggleHighContrast(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </label>

        {/* Sound / Chimes */}
        <label className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Audio Maneuver Prompts</p>
              <p className="text-[11px] text-slate-500">Play subtle cues on arrival and floor change</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onToggleSound(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Developer & Administrator Tools */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        <div className="p-4 bg-slate-50/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Enterprise Management & Java Architecture
          </p>
        </div>

        {/* Admin Dashboard */}
        <div
          onClick={onOpenAdmin}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Administrator Dashboard
              </p>
              <p className="text-[11px] text-slate-500">Manage corridor closures & publish announcements</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Java 21 & MySQL Backend Explorer */}
        <div
          onClick={onOpenJavaExplorer}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Java 21 & MySQL Architecture Explorer
              </p>
              <p className="text-[11px] text-slate-500">Inspect DijkstraRouter.java, schema.sql & API Tester</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-slate-100 text-slate-600 text-[11px] space-y-1">
        <p className="font-semibold text-slate-800">NaviCampus v1.0.0 (Enterprise Edition)</p>
        <p>Built with Java 21, Tomcat 11, Dijkstra Graph Routing, and Google Firebase.</p>
      </div>

    </div>
  );
};
