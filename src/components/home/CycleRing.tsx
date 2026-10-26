import React from 'react';
import { Sparkles, Droplets, Moon, Sun, Flame, Edit3 } from 'lucide-react';
import { CurrentPhaseInfo } from '../../types';

interface CycleRingProps {
  phaseInfo: CurrentPhaseInfo;
  onOpenQuickLog: () => void;
}

export const CycleRing: React.FC<CycleRingProps> = ({ phaseInfo, onOpenQuickLog }) => {
  const {
    phase,
    phaseName,
    dayInCycle,
    totalCycleDays,
    daysUntilNextPeriod,
    isPeriodActive,
    activePeriodDay
  } = phaseInfo;

  // SVG parameters
  const size = 300;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Percentage of cycle elapsed
  const progressPercent = Math.min(1, Math.max(0, (dayInCycle - 1) / totalCycleDays));
  const strokeDashoffset = circumference - progressPercent * circumference;

  // Phase icon and color styles
  const getPhaseDetails = () => {
    switch (phase) {
      case 'menstrual':
        return {
          icon: <Droplets className="w-5 h-5 text-cherry-500 animate-pulse" />,
          pillClass: 'bg-cherry-50 text-cherry-600 border-cherry-200',
          gradientId: 'menstrualGrad',
          strokeColor: '#C62845',
          glowClass: 'from-cherry-500/10 to-burgundy-900/5'
        };
      case 'follicular':
        return {
          icon: <Sparkles className="w-5 h-5 text-rose-500" />,
          pillClass: 'bg-rose-50 text-rose-600 border-rose-200',
          gradientId: 'follicularGrad',
          strokeColor: '#E26D87',
          glowClass: 'from-rose-400/10 to-amber-200/5'
        };
      case 'ovulatory':
        return {
          icon: <Sun className="w-5 h-5 text-amber-500" />,
          pillClass: 'bg-amber-50 text-amber-600 border-amber-200',
          gradientId: 'ovulatoryGrad',
          strokeColor: '#F59E0B',
          glowClass: 'from-amber-400/15 to-rose-300/10'
        };
      case 'luteal':
      default:
        return {
          icon: <Moon className="w-5 h-5 text-burgundy-600" />,
          pillClass: 'bg-burgundy-50 text-burgundy-700 border-burgundy-200',
          gradientId: 'lutealGrad',
          strokeColor: '#8F1538',
          glowClass: 'from-burgundy-700/10 to-indigo-900/5'
        };
    }
  };

  const details = getPhaseDetails();

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Background radial glow */}
      <div className={`absolute w-72 h-72 rounded-full bg-gradient-to-tr ${details.glowClass} blur-2xl pointer-events-none`} />

      {/* SVG Ring */}
      <div className="relative w-[280px] h-[280px] sm:w-[310px] sm:h-[310px] flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="ringTrack" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFF0F2" />
              <stop offset="100%" stop-color="#FCDCE3" />
            </linearGradient>

            <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C62845" />
              <stop offset="100%" stop-color="#8F1538" />
            </linearGradient>

            <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#C62845" flood-opacity="0.35"/>
            </filter>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#ringTrack)"
            strokeWidth={strokeWidth}
            className="opacity-70"
          />

          {/* Phase Segments Markers (Subtle background ticks) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F4C2CC"
            strokeWidth={strokeWidth}
            strokeDasharray={`2 ${circumference / totalCycleDays - 2}`}
            className="opacity-40"
          />

          {/* Active Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="url(#activeGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#ringGlow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content Inside Circle */}
        <div
          onClick={onOpenQuickLog}
          className="absolute inset-7 sm:inset-9 rounded-full bg-white/95 backdrop-blur-md shadow-soft flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all group border border-rosepink-200/80"
          title="Click to log today's flow, symptoms, or mood"
        >
          {/* Phase Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1.5 ${details.pillClass} transition-colors`}>
            {details.icon}
            <span>{phaseName}</span>
          </div>

          {/* Cycle Day Number */}
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-serif text-4xl sm:text-5xl font-extrabold text-burgundy-900 tracking-tight">
              Day {dayInCycle}
            </span>
            <span className="text-xs font-semibold text-burgundy-900/50">
              of {totalCycleDays}
            </span>
          </div>

          {/* Period Status or Countdown */}
          <div className="mt-2 text-xs font-medium text-gray-600">
            {isPeriodActive ? (
              <span className="inline-flex items-center gap-1 text-cherry-600 font-bold bg-cherry-50 px-2.5 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5" />
                Period Day {activePeriodDay || dayInCycle}
              </span>
            ) : daysUntilNextPeriod === 0 ? (
              <span className="text-cherry-600 font-bold bg-cherry-50 px-2.5 py-0.5 rounded-full">
                Period expected today
              </span>
            ) : daysUntilNextPeriod === 1 ? (
              <span className="text-gray-700">Period in 1 day</span>
            ) : (
              <span className="text-gray-600">
                Period in <strong className="text-burgundy-900 font-bold">{daysUntilNextPeriod} days</strong>
              </span>
            )}
          </div>

          {/* Subtle tap call-to-action hint */}
          <span className="text-[10px] text-cherry-600/80 group-hover:text-cherry-600 font-semibold mt-3 transition-colors flex items-center justify-center gap-1">
            <span>Tap to Log Today</span>
            <Edit3 className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
