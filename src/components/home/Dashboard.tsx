import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Droplets,
  Heart,
  Plus,
  Coffee,
  CheckCircle2,
  Calendar as CalendarIcon,
  Smile,
  ShieldCheck,
  ChevronRight,
  Clock,
  Apple,
  Dumbbell
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  UserSettings,
  CurrentPhaseInfo,
  HygieneLog
} from '../../types';
import { CycleRing } from './CycleRing';
import { formatDate } from '../../services/cycleEngine';
import { dbService } from '../../services/db';

interface DashboardProps {
  phaseInfo: CurrentPhaseInfo;
  settings: UserSettings;
  todayPeriodLog: PeriodLog | null;
  todaySymptoms: SymptomLog[];
  todayMoodLog: MoodLog | null;
  onOpenQuickLog: (dateStr?: string) => void;
  onNavigateToCalendar: () => void;
  onNavigateToHygiene: () => void;
  onNavigateToEducation: (articleId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  phaseInfo,
  settings,
  todayPeriodLog,
  todaySymptoms,
  todayMoodLog,
  onOpenQuickLog,
  onNavigateToCalendar,
  onNavigateToHygiene,
  onNavigateToEducation
}) => {
  const today = new Date();
  const todayStr = formatDate(today);

  // Water tracking state (persisted in hygiene log)
  const [waterGlasses, setWaterGlasses] = useState(4);

  useEffect(() => {
    async function loadWater() {
      const log = await dbService.getHygieneLogByDate(todayStr);
      if (log && typeof log.waterGlasses === 'number') {
        setWaterGlasses(log.waterGlasses);
      }
    }
    loadWater();
  }, [todayStr]);

  const handleWaterClick = async (newCount: number) => {
    setWaterGlasses(newCount);
    try {
      const existing = await dbService.getHygieneLogByDate(todayStr);
      const updated: HygieneLog = {
        id: existing?.id || `hyg-${todayStr}`,
        date: todayStr,
        waterGlasses: newCount,
        productType: existing?.productType,
        productChangedAt: existing?.productChangedAt,
        periodKitChecked: existing?.periodKitChecked
      };
      await dbService.saveHygieneLog(updated);
    } catch (e) {
      console.warn('Could not save water tracker:', e);
    }
  };

  const displayName = settings.nickname || 'Friend';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-burgundy-900 via-cherry-700 to-burgundy-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-rosepink-300/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rosepink-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-[11px] font-semibold text-rosepink-200">
                • Offline & Secure
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight">
              Hello, {displayName}
            </h1>

            <p className="text-rosepink-100/90 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              You are currently in your <strong className="text-white underline decoration-rosepink-300 underline-offset-4">{phaseInfo.phaseName}</strong>. Listen to your body and honor its natural rhythm today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenQuickLog(todayStr)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-burgundy-900 font-bold text-sm shadow-md hover:bg-rosepink-50 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-cherry-600" />
              <span>Log Today</span>
            </button>
            <button
              onClick={onNavigateToCalendar}
              className="px-4 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors backdrop-blur-xs"
            >
              View Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Cycle Ring & Phase Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Cycle Progress Ring */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 flex flex-col items-center justify-center text-center">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900/70">
              Cycle Status
            </span>
            <span className="text-[11px] font-semibold text-cherry-600 bg-rosepink-100 px-2.5 py-0.5 rounded-full">
              {phaseInfo.chanceOfPregnancy} Fertility
            </span>
          </div>

          <CycleRing phaseInfo={phaseInfo} onOpenQuickLog={() => onOpenQuickLog(todayStr)} />

          {/* Quick Metrics under ring */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-rosepink-100 text-left">
            <div className="p-3 rounded-2xl bg-blush-50 border border-rosepink-200/60">
              <span className="text-[11px] text-gray-500 block">Next Period</span>
              <span className="text-sm font-bold text-burgundy-900">
                {phaseInfo.nextPeriodDate ? new Date(phaseInfo.nextPeriodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Calculating'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-blush-50 border border-rosepink-200/60">
              <span className="text-[11px] text-gray-500 block">Estimated Ovulation</span>
              <span className="text-sm font-bold text-burgundy-900">
                {phaseInfo.ovulationDate ? new Date(phaseInfo.ovulationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Calculating'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Menstrual Phase Intelligence & Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Phase Detailed Guide Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80">
            <div className="flex items-center justify-between pb-4 border-b border-rosepink-100">
              <div>
                <span className="text-xs font-semibold text-cherry-600 uppercase tracking-wider">
                  Hormonal Blueprint
                </span>
                <h3 className="font-serif text-2xl font-bold text-burgundy-900 mt-0.5">
                  {phaseInfo.phaseName}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rosepink-100 text-burgundy-900 border border-rosepink-200">
                {phaseInfo.hormoneSummary}
              </span>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed mt-4">
              {phaseInfo.phaseDescription}
            </p>

            {/* Triad Tips: Self-Care, Nutrition, Movement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
              <div className="p-4 rounded-2xl bg-blush-50/70 border border-rosepink-200/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-burgundy-900 mb-1.5">
                    <Heart className="w-4 h-4 text-cherry-500" />
                    <span>Mind & Self-Care</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {phaseInfo.selfCareTip}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blush-50/70 border border-rosepink-200/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-burgundy-900 mb-1.5">
                    <Apple className="w-4 h-4 text-amber-500" />
                    <span>Nutrition</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {phaseInfo.nutritionTip}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blush-50/70 border border-rosepink-200/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-burgundy-900 mb-1.5">
                    <Dumbbell className="w-4 h-4 text-purple-500" />
                    <span>Movement</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {phaseInfo.movementTip}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => onNavigateToEducation('cycle-phases')}
                className="text-xs font-bold text-cherry-600 hover:text-burgundy-900 flex items-center gap-1 group transition-colors"
              >
                <span>Read in-depth phase guide</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Today's Log Summary & Water Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Today's Log Snapshot */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                    Today's Recorded Log
                  </span>
                  <button
                    onClick={() => onOpenQuickLog(todayStr)}
                    className="text-xs font-semibold text-cherry-600 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {todayPeriodLog || todaySymptoms.length > 0 || todayMoodLog ? (
                  <div className="space-y-2.5 text-xs">
                    {todayPeriodLog && todayPeriodLog.flow !== 'none' && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-cherry-50 text-cherry-900 font-semibold border border-cherry-200">
                        <Droplets className="w-4 h-4 text-cherry-600" />
                        <span>Flow: {todayPeriodLog.flow.toUpperCase()}</span>
                      </div>
                    )}

                    {todayMoodLog && todayMoodLog.moods.length > 0 && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-rosepink-50 text-burgundy-900 border border-rosepink-200">
                        <Smile className="w-4 h-4 text-purple-600" />
                        <span>Mood: {todayMoodLog.moods.join(', ')}</span>
                      </div>
                    )}

                    {todaySymptoms.length > 0 && (
                      <div className="p-2 rounded-xl bg-blush-50 text-gray-700 border border-rosepink-100">
                        <span className="font-semibold block mb-1">Symptoms:</span>
                        <div className="flex flex-wrap gap-1">
                          {todaySymptoms.map(s => (
                            <span key={s.id} className="px-2 py-0.5 rounded-full bg-white border border-rosepink-200 text-[11px]">
                              {s.name} ({s.severity}/5)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-gray-400">
                    <p className="text-xs">No entries recorded yet today.</p>
                    <button
                      onClick={() => onOpenQuickLog(todayStr)}
                      className="mt-3 px-4 py-1.5 rounded-full text-xs font-bold bg-rosepink-100 text-burgundy-900 hover:bg-rosepink-200 transition-colors"
                    >
                      Record Today's Log
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-rosepink-100 mt-4 text-[11px] text-gray-400">
                All records stored securely in browser IndexedDB.
              </div>
            </div>

            {/* Daily Water Hydration Tracker */}
            <div className="bg-white rounded-3xl p-6 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                    Hydration Goal
                  </span>
                  <span className="text-xs font-bold text-cherry-600 bg-rosepink-100 px-2.5 py-0.5 rounded-full">
                    {waterGlasses} / 8 Glasses
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Optimal hydration eases bloating, reduces cramps, and promotes hormonal balance.
                </p>

                {/* 8 Glass Clickable Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const isFilled = i < waterGlasses;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleWaterClick(isFilled && waterGlasses === i + 1 ? i : i + 1)}
                        className={`h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          isFilled
                            ? 'bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-xs scale-102'
                            : 'bg-blush-50 border border-rosepink-200 text-gray-400 hover:border-sky-300'
                        }`}
                        title={`Glass ${i + 1}`}
                      >
                        <Droplets className="w-4 h-4" />
                        <span className="text-[10px] font-bold mt-0.5">{i + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-rosepink-100 mt-4 flex items-center justify-between text-xs text-gray-500">
                <span>Tap a glass to toggle</span>
                <button
                  onClick={onNavigateToHygiene}
                  className="font-semibold text-cherry-600 hover:underline"
                >
                  Product Timer →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
