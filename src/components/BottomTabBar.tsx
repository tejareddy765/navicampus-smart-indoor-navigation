import React from 'react';
import { Compass, Navigation, Bookmark, User } from 'lucide-react';

export type TabType = 'explore' | 'navigate' | 'saved' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  savedCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  savedCount = 0
}) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'navigate', label: 'Navigate', icon: Navigation },
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav 
      aria-label="Main Navigation" 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-t border-slate-200/80 safe-bottom transition-all"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-blue-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
              role="tab"
            >
              <div className="relative">
                <Icon className={`w-6 h-6 transition-transform ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 font-medium tracking-tight ${isActive ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
