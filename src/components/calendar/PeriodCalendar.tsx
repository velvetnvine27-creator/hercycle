import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Droplets,
  Calendar as CalendarIcon,
  Plus,
  Info,
  Clock,
  Star
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  UserSettings
} from '../../types';
import {
  formatDate,
  buildMonthCalendarMap
} from '../../services/cycleEngine';

interface PeriodCalendarProps {
  periodLogs: PeriodLog[];
  symptomLogs: SymptomLog[];
  moodLogs: MoodLog[];
  settings: UserSettings;
  onSelectDate: (dateStr: string) => void;
}

export const PeriodCalendar: React.FC<PeriodCalendarProps> = ({
  periodLogs,
  symptomLogs,
  moodLogs,
  settings,
  onSelectDate
}) => {
  const today = new Date();
  const todayStr = formatDate(today);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0 - 11

  // Maps of symptoms and moods by date
  const symptomCountByDate = useMemo(() => {
    const map: Record<string, number> = {};
    symptomLogs.forEach(s => {
      map[s.date] = (map[s.date] || 0) + 1;
    });
    return map;
  }, [symptomLogs]);

  const moodPresentByDate = useMemo(() => {
    const map: Record<string, boolean> = {};
    moodLogs.forEach(m => {
      map[m.date] = true;
    });
    return map;
  }, [moodLogs]);

  // Calendar map for current month
  const calendarMap = useMemo(() => {
    return buildMonthCalendarMap(
      currentYear,
      currentMonth,
      periodLogs,
      symptomCountByDate,
      moodPresentByDate,
      settings
    );
  }, [currentYear, currentMonth, periodLogs, symptomCountByDate, moodPresentByDate, settings]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Month grid calculations
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Days array for grid
  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true
    });
  }

  // Next month leading days to complete 35 or 42 grid cells
  const remainingCells = 7 - (calendarDays.length % 7);
  if (remainingCells < 7) {
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarDays.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false
      });
    }
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdaysMobile = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-soft border border-rosepink-200/80">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rosepink-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cherry-600">Cycle Overview</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-burgundy-900 mt-0.5">
            {monthName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold text-burgundy-900 bg-rosepink-100 hover:bg-rosepink-200 border border-rosepink-200 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-blush-50 rounded-full border border-rosepink-200 p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="p-2 rounded-full text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="p-2 rounded-full text-burgundy-900/70 hover:text-burgundy-900 hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 my-4 text-center">
        {weekdays.map((w, i) => (
          <div key={w} className="text-[11px] font-bold uppercase tracking-wider text-burgundy-900/60 py-1">
            <span className="hidden sm:inline">{w}</span>
            <span className="sm:hidden">{weekdaysMobile[i]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Month Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map(({ dateStr, dayNum, isCurrentMonth }) => {
          const status = calendarMap.get(dateStr);
          const isToday = dateStr === todayStr;

          // Determine day styles
          let dayStyle = 'bg-white border-transparent text-gray-700 hover:border-rosepink-300';
          let indicatorBadge = null;

          if (!isCurrentMonth) {
            dayStyle = 'bg-gray-50/40 text-gray-300 border-transparent cursor-pointer';
          } else if (status?.isPeriod) {
            // Real logged period
            dayStyle = 'bg-gradient-to-tr from-burgundy-800 to-cherry-600 text-white font-bold shadow-xs hover:scale-105';
            indicatorBadge = (
              <span className="text-[10px] tracking-tight text-rosepink-100 uppercase">
                {status.flow === 'spotting' ? 'Spot' : 'Period'}
              </span>
            );
          } else if (status?.isOvulation) {
            // Ovulation day
            dayStyle = 'bg-amber-100/80 border-amber-400 text-amber-950 font-bold hover:bg-amber-200/70';
            indicatorBadge = (
              <span className="text-[9px] font-bold text-amber-800 uppercase flex items-center gap-1">
                <Star className="w-2.5 h-2.5 text-amber-600 fill-amber-500" />
                Ovulation
              </span>
            );
          } else if (status?.isFertile) {
            // Fertile window
            dayStyle = 'bg-rosepink-50 border-rosepink-300 text-burgundy-900 font-semibold hover:bg-rosepink-100';
            indicatorBadge = (
              <span className="text-[9px] font-medium text-cherry-600">Fertile</span>
            );
          } else if (status?.isPredictedPeriod) {
            // Predicted future period
            dayStyle = 'bg-blush border-2 border-dashed border-cherry-300 text-cherry-800 font-semibold hover:bg-rosepink-100';
            indicatorBadge = (
              <span className="text-[9px] text-cherry-600 font-medium">Predicted</span>
            );
          }

          return (
            <div
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`min-h-[52px] sm:min-h-[82px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative group ${dayStyle} ${
                isToday ? 'ring-2 ring-burgundy-800 ring-offset-2' : ''
              }`}
              title={`Click to view or edit details for ${dateStr}`}
            >
              {/* Day Number and Today Marker */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-[11px] sm:text-sm ${isToday ? 'underline font-extrabold' : ''}`}>
                  {dayNum}
                </span>

                {isToday && (
                  <span className="w-2 h-2 rounded-full bg-cherry-500 animate-pulse" title="Today" />
                )}
              </div>

              {/* Status Tag */}
              <div className="my-auto hidden sm:block">
                {indicatorBadge}
              </div>

              {/* Observation indicator dots (Symptoms, Mood, Notes) */}
              <div className="flex items-center gap-1 justify-center sm:justify-start mt-1">
                {status?.hasSymptoms && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isPeriod ? 'bg-white' : 'bg-cherry-500'
                    }`}
                    title="Symptoms logged"
                  />
                )}
                {status?.hasMood && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isPeriod ? 'bg-rosepink-200' : 'bg-purple-500'
                    }`}
                    title="Mood/Journal logged"
                  />
                )}
                {status?.hasNotes && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      status.isPeriod ? 'bg-amber-200' : 'bg-amber-500'
                    }`}
                    title="Notes logged"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend & Fertility Disclaimer */}
      <div className="mt-8 pt-6 border-t border-rosepink-100">
        <div className="flex flex-wrap items-center gap-4 text-xs text-burgundy-900/80 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-600 shadow-xs" />
            <span className="font-semibold">Logged Period</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blush border-2 border-dashed border-cherry-400" />
            <span className="font-semibold">Predicted Period</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-rosepink-100 border border-rosepink-300" />
            <span className="font-semibold">Fertile Window (Est.)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-200 border border-amber-400" />
            <span className="font-semibold">Ovulation Day (Est.)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cherry-500" />
            <span>Symptoms</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Mood / Diary</span>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 flex items-center gap-1.5 italic">
          <Info className="w-3.5 h-3.5 text-cherry-500 shrink-0" />
          Tap any date above to log flow, symptoms, or private reflections. Ovulation and fertile windows are statistical estimates and never a guarantee.
        </p>
      </div>
    </div>
  );
};
