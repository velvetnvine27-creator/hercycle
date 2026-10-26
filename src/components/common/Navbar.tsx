import React from 'react';
import {
  Home,
  Calendar as CalendarIcon,
  BarChart3,
  BookOpen,
  User,
  Plus,
  Bell,
  Stethoscope,
  HeartHandshake,
  Thermometer,
  Droplets,
  MessageCircle
} from 'lucide-react';

export type NavTab = 'home' | 'calendar' | 'insights' | 'journal' | 'profile' | 'medical' | 'hygiene' | 'education' | 'menopause' | 'bleeding' | 'askher';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenQuickLog: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickLog,
  unreadNotificationsCount,
  onOpenNotifications,
}) => {
  const primaryTabs = [
    { id: 'home' as NavTab, label: 'Today', icon: <Home className="w-5 h-5" /> },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: <CalendarIcon className="w-5 h-5" /> },
    { id: 'insights' as NavTab, label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'profile' as NavTab, label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* ── Desktop Top Header ── */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rosepink-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('home')}
          >
            <img
              src="/hercycle-logo.png"
              alt="HER CYCLE"
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-burgundy-900">
                  HER CYCLE
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rosepink-100 text-burgundy-800 border border-rosepink-200">
                  100% Private
                </span>
              </div>
              <p className="text-xs text-burgundy-900/60">Women's Health Tracker</p>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="flex items-center gap-1 bg-blush-100/60 p-1.5 rounded-full border border-rosepink-200/50">
            {[
              { id: 'home' as NavTab, label: 'Today', icon: <Home className="w-4 h-4" /> },
              { id: 'calendar' as NavTab, label: 'Calendar', icon: <CalendarIcon className="w-4 h-4" /> },
              { id: 'insights' as NavTab, label: 'Insights', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'journal' as NavTab, label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'menopause' as NavTab, label: 'Symptoms', icon: <Thermometer className="w-4 h-4" /> },
              { id: 'bleeding' as NavTab, label: 'Bleeding', icon: <Droplets className="w-4 h-4" /> },
              { id: 'profile' as NavTab, label: 'Profile', icon: <User className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-burgundy-800 text-white shadow-sm'
                    : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => onTabChange('medical')} title="Medical Log"
              className={`p-2.5 rounded-full transition-colors ${activeTab === 'medical' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800 hover:bg-blush-200/80'}`}>
              <Stethoscope className="w-5 h-5" />
            </button>
            <button onClick={() => onTabChange('hygiene')} title="Hygiene & Self-Care"
              className={`p-2.5 rounded-full transition-colors ${activeTab === 'hygiene' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800 hover:bg-blush-200/80'}`}>
              <HeartHandshake className="w-5 h-5" />
            </button>
            <button onClick={() => onTabChange('education')} title="Health Library"
              className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${activeTab === 'education' ? 'bg-rosepink-300 text-burgundy-900' : 'bg-blush text-burgundy-900 hover:bg-rosepink-200'}`}>
              <span className="w-2 h-2 rounded-full bg-cherry-500 animate-pulse" />
              Library
            </button>
            <button onClick={() => onTabChange('askher')} title="Ask HER Assistant"
              className={`p-2.5 rounded-full transition-colors ${activeTab === 'askher' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800 hover:bg-blush-200/80'}`}>
              <MessageCircle className="w-5 h-5" />
            </button>
            <button onClick={onOpenNotifications} className="relative p-2.5 rounded-full text-burgundy-800 hover:bg-blush-200/80 transition-colors" title="Reminders">
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cherry-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-sm shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Top App Bar ── */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-rosepink-200/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onTabChange('home')}>
          <img src="/hercycle-logo.png" alt="HER CYCLE" className="w-8 h-8 object-contain" />
          <span className="font-serif font-bold text-lg tracking-tight text-burgundy-900">HER CYCLE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => onTabChange('education')} title="Library"
            className={`p-2 rounded-full ${activeTab === 'education' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800'}`}>
            <BookOpen className="w-5 h-5" />
          </button>
          <button onClick={() => onTabChange('askher')} title="Ask HER"
            className={`p-2 rounded-full ${activeTab === 'askher' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800'}`}>
            <MessageCircle className="w-5 h-5" />
          </button>
          <button onClick={() => onTabChange('hygiene')} title="Self-Care"
            className={`p-2 rounded-full ${activeTab === 'hygiene' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800'}`}>
            <HeartHandshake className="w-5 h-5" />
          </button>
          <button onClick={onOpenNotifications} className="relative p-2 rounded-full text-burgundy-800">
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cherry-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rosepink-200 px-1 pt-1.5 pb-1.5 safe-bottom flex items-center justify-around shadow-lg">
        {primaryTabs.slice(0, 2).map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400'}`}>
            {tab.icon}
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}

        {/* Center FAB */}
        <button onClick={onOpenQuickLog}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-500 text-white flex items-center justify-center shadow-lg shadow-cherry-500/35 hover:scale-110 active:scale-95 transition-all"
          title="Quick Log">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button onClick={() => onTabChange('menopause')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${activeTab === 'menopause' ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400'}`}>
          <Thermometer className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Symptoms</span>
        </button>

        {primaryTabs.slice(2).map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${activeTab === tab.id ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400'}`}>
            {tab.icon}
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
