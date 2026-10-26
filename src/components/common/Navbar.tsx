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
  Sparkles,
  HeartHandshake
} from 'lucide-react';

export type NavTab = 'home' | 'calendar' | 'insights' | 'journal' | 'profile' | 'medical' | 'hygiene' | 'education';

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
  return (
    <>
      {/* Desktop Top Header Bar */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rosepink-200/60 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onTabChange('home')}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-500 flex items-center justify-center text-white shadow-sm shadow-burgundy-800/30 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-burgundy-900">
                  HERCYCLE
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rosepink-100 text-burgundy-800 border border-rosepink-200">
                  100% Offline & Private
                </span>
              </div>
              <p className="text-xs text-burgundy-900/60">Feminine Health & Menstrual Literacy</p>
            </div>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex items-center gap-1 bg-blush-100/60 p-1.5 rounded-full border border-rosepink-200/50">
            <button
              onClick={() => onTabChange('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'home'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Today</span>
            </button>

            <button
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => onTabChange('insights')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'insights'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => onTabChange('journal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'journal'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mood Journal</span>
            </button>

            <button
              onClick={() => onTabChange('profile')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-burgundy-800 text-white shadow-sm'
                  : 'text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white/60'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Quick Hub: Medical, Hygiene, Education, Notifications & Log button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTabChange('medical')}
              title="Medical Log & Medications"
              className={`p-2.5 rounded-full transition-colors ${
                activeTab === 'medical'
                  ? 'bg-rosepink-200 text-burgundy-900'
                  : 'text-burgundy-800 hover:bg-blush-200/80'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('hygiene')}
              title="Hygiene & Self-Care"
              className={`p-2.5 rounded-full transition-colors ${
                activeTab === 'hygiene'
                  ? 'bg-rosepink-200 text-burgundy-900'
                  : 'text-burgundy-800 hover:bg-blush-200/80'
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
            </button>

            <button
              onClick={() => onTabChange('education')}
              title="Menstrual Health Education"
              className={`px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'education'
                  ? 'bg-rosepink-300 text-burgundy-900'
                  : 'bg-blush text-burgundy-900 hover:bg-rosepink-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cherry-500 animate-pulse"></span>
              Health Library
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-full text-burgundy-800 hover:bg-blush-200/80 transition-colors"
              title="Reminders & Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cherry-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Quick Log Action */}
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-sm shadow-md shadow-cherry-500/25 hover:shadow-lg hover:shadow-cherry-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Today</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top App Bar (Header) */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-rosepink-200/60 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5"
          onClick={() => onTabChange('home')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-500 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-burgundy-900">
              HerCycle
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onTabChange('education')}
            className={`p-2 rounded-full text-xs font-semibold ${
              activeTab === 'education' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800'
            }`}
            title="Education"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <button
            onClick={() => onTabChange('hygiene')}
            className={`p-2 rounded-full ${
              activeTab === 'hygiene' ? 'bg-rosepink-200 text-burgundy-900' : 'text-burgundy-800'
            }`}
            title="Hygiene & Product Timer"
          >
            <HeartHandshake className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full text-burgundy-800"
            title="Reminders"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-cherry-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rosepink-200 px-3 pt-1.5 pb-1.5 safe-bottom flex items-center justify-around shadow-lg">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400 font-normal'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Today</span>
        </button>

        <button
          onClick={() => onTabChange('calendar')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'calendar' ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400 font-normal'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Calendar</span>
        </button>

        {/* Center Floating Plus / Quick Log Button */}
        <button
          onClick={onOpenQuickLog}
          className="relative -top-4 w-12 h-12 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-500 text-white flex items-center justify-center shadow-lg shadow-cherry-500/35 hover:scale-110 active:scale-95 transition-all"
          title="Quick Log"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => onTabChange('insights')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'insights' ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400 font-normal'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Insights</span>
        </button>

        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-burgundy-800 font-bold scale-105' : 'text-gray-400 font-normal'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </nav>
    </>
  );
};
