import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Heart,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Calendar,
  Activity,
  Smile,
  Droplets,
  CheckCircle2,
  Thermometer,
  Moon,
  Info
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  UserSettings,
  MenopauseSymptomEntry,
  BleedingEvent
} from '../../types';
import {
  calculateCycleStats,
  detectPeriodsFromLogs,
  daysBetween
} from '../../services/cycleEngine';

interface InsightsViewProps {
  periodLogs: PeriodLog[];
  symptomLogs: SymptomLog[];
  moodLogs: MoodLog[];
  settings: UserSettings;
  menopauseSymptoms?: MenopauseSymptomEntry[];
  bleedingEvents?: BleedingEvent[];
}

export const InsightsView: React.FC<InsightsViewProps> = ({
  periodLogs,
  symptomLogs,
  moodLogs,
  settings,
  menopauseSymptoms = [],
  bleedingEvents = []
}) => {
  const [rangeFilter, setRangeFilter] = React.useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const cutoff = React.useMemo(() => {
    if (rangeFilter === 'all') return null;
    const d = new Date();
    d.setDate(d.getDate() - (rangeFilter === '7d' ? 7 : rangeFilter === '30d' ? 30 : 90));
    return d.toISOString().slice(0, 10);
  }, [rangeFilter]);

  const filteredMeno = React.useMemo(() => {
    if (!cutoff) return menopauseSymptoms;
    return menopauseSymptoms.filter(m => m.date >= cutoff);
  }, [menopauseSymptoms, cutoff]);

  const filteredMoodsList = React.useMemo(() => {
    if (!cutoff) return moodLogs;
    return moodLogs.filter(m => m.date >= cutoff);
  }, [moodLogs, cutoff]);

  const filteredSymsList = React.useMemo(() => {
    if (!cutoff) return symptomLogs;
    return symptomLogs.filter(s => s.date >= cutoff);
  }, [symptomLogs, cutoff]);
  const stats = calculateCycleStats(periodLogs, settings);
  const detectedPeriods = detectPeriodsFromLogs(periodLogs);

  // 1. Calculate past cycle intervals
  const cycleIntervals: Array<{ cycleNum: number; startDate: string; lengthDays: number }> = [];
  for (let i = 1; i < detectedPeriods.length; i++) {
    const len = daysBetween(detectedPeriods[i].startDate, detectedPeriods[i - 1].startDate);
    if (len >= 18 && len <= 65) {
      cycleIntervals.push({
        cycleNum: i,
        startDate: detectedPeriods[i].startDate,
        lengthDays: len
      });
    }
  }

  // 2. Period bleeding durations history
  const periodDurations = detectedPeriods.map((p, idx) => ({
    cycleNum: idx + 1,
    startDate: p.startDate,
    durationDays: p.durationDays
  }));

  // 3. Flow Intensity Distribution
  const flowCounts = {
    spotting: 0,
    light: 0,
    medium: 0,
    heavy: 0
  };
  periodLogs.forEach(l => {
    if (l.flow && l.flow !== 'none' && flowCounts[l.flow] !== undefined) {
      flowCounts[l.flow]++;
    }
  });
  const totalFlowDays = Object.values(flowCounts).reduce((a, b) => a + b, 0);

  // 4. Monthly & Weekly summaries
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const periodsThisMonth = periodLogs.filter(p => p.date.startsWith(currentMonthPrefix) && p.flow !== 'none').length;
  const symptomsThisMonth = symptomLogs.filter(s => s.date.startsWith(currentMonthPrefix)).length;
  const moodsThisMonth = moodLogs.filter(m => m.date.startsWith(currentMonthPrefix)).length;

  // 5. Symptom counts and average severity
  const symptomStatsMap: Record<string, { count: number; totalSev: number }> = {};
  symptomLogs.forEach(s => {
    if (s.category !== 'discharge') {
      if (!symptomStatsMap[s.name]) {
        symptomStatsMap[s.name] = { count: 0, totalSev: 0 };
      }
      symptomStatsMap[s.name].count++;
      symptomStatsMap[s.name].totalSev += s.severity;
    }
  });

  const topSymptoms = Object.entries(symptomStatsMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgSeverity: (data.totalSev / data.count).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 6. Mood counts and averages
  const moodCountsMap: Record<string, number> = {};
  let totalStress = 0;
  let totalEnergy = 0;
  let totalSleep = 0;
  let validMoodsCount = 0;

  moodLogs.forEach(m => {
    m.moods.forEach(mood => {
      moodCountsMap[mood] = (moodCountsMap[mood] || 0) + 1;
    });
    if (m.stress) totalStress += m.stress;
    if (m.energy) totalEnergy += m.energy;
    if (m.sleepQuality) totalSleep += m.sleepQuality;
    validMoodsCount++;
  });

  const topMoods = Object.entries(moodCountsMap)
    .map(([mood, count]) => ({ mood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const avgStress = validMoodsCount > 0 ? (totalStress / validMoodsCount).toFixed(1) : '2.5';
  const avgEnergy = validMoodsCount > 0 ? (totalEnergy / validMoodsCount).toFixed(1) : '3.0';
  const avgSleep = validMoodsCount > 0 ? (totalSleep / validMoodsCount).toFixed(1) : '4.0';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
          Cycle Intelligence & Trends
        </span>
        <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
          Health Insights
        </h1>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Objective statistical analysis based exclusively on your logged menstrual dates and health entries.
        </p>
      </div>

      {/* Small Sample Size Warning / Baseline Notice */}
      {stats.isSampleSmall && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-950">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block text-sm">Preliminary Sample Size Notice</span>
            <p className="leading-relaxed">
              {stats.disclaimer} As you continue tracking over consecutive months, statistical confidence intervals and variance trends will become significantly more accurate.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Avg Cycle Length */}
        <div className="p-5 rounded-3xl bg-white shadow-soft border border-rosepink-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900/60 uppercase">
            <Clock className="w-4 h-4 text-cherry-500" />
            <span>Avg Cycle</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-3xl font-extrabold text-burgundy-900">
              {stats.averageCycleLength}
            </span>
            <span className="text-xs text-gray-500">days</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Normal adult baseline: 21–35 days
          </span>
        </div>

        {/* Avg Period Bleeding Duration */}
        <div className="p-5 rounded-3xl bg-white shadow-soft border border-rosepink-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900/60 uppercase">
            <Heart className="w-4 h-4 text-cherry-500" />
            <span>Avg Duration</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-3xl font-extrabold text-burgundy-900">
              {stats.averagePeriodDuration}
            </span>
            <span className="text-xs text-gray-500">days</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Normal adult baseline: 3–7 days
          </span>
        </div>

        {/* Regularity Score */}
        <div className="p-5 rounded-3xl bg-white shadow-soft border border-rosepink-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900/60 uppercase">
            <TrendingUp className="w-4 h-4 text-cherry-500" />
            <span>Regularity</span>
          </div>
          <div className="mt-2">
            <span className="font-serif text-xl sm:text-2xl font-extrabold text-burgundy-900 line-clamp-1">
              {stats.regularityScore}
            </span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            Variation range: {stats.minCycleLength}–{stats.maxCycleLength} days
          </span>
        </div>

        {/* Total Verified Periods */}
        <div className="p-5 rounded-3xl bg-white shadow-soft border border-rosepink-200/80">
          <div className="flex items-center gap-2 text-xs font-bold text-burgundy-900/60 uppercase">
            <Calendar className="w-4 h-4 text-cherry-500" />
            <span>Logged Cycles</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-3xl font-extrabold text-burgundy-900">
              {stats.cycleCount}
            </span>
            <span className="text-xs text-gray-500">cycles</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">
            {detectedPeriods.length} total bleeding spans
          </span>
        </div>
      </div>

      {/* Monthly Summary Banner */}
      <div className="p-6 rounded-3xl bg-blush-50/70 border border-rosepink-200 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cherry-600 block">
              Monthly Activity Snapshot
            </span>
            <h3 className="font-serif text-lg font-bold text-burgundy-900 mt-0.5">
              {now.toLocaleString('en-US', { month: 'long', year: 'numeric' })} Logs
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3.5 py-2 rounded-2xl bg-white border border-rosepink-200 text-burgundy-900 font-semibold shadow-2xs flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cherry-600" />
              <span><strong className="text-cherry-600">{periodsThisMonth}</strong> Bleeding Days</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white border border-rosepink-200 text-burgundy-900 font-semibold shadow-2xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span><strong className="text-cherry-600">{symptomsThisMonth}</strong> Symptoms Logged</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-white border border-rosepink-200 text-burgundy-900 font-semibold shadow-2xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rosepink-400" />
              <span><strong className="text-cherry-600">{moodsThisMonth}</strong> Mood Entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Charts: Cycle Length History & Period Duration History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Length History Visualizer (SVG Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-burgundy-900">Cycle Length History</h2>
                <p className="text-xs text-gray-500">Days between consecutive period starts</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rosepink-100 text-burgundy-900 border border-rosepink-200 self-start sm:self-auto">
                Normal: 21–35d
              </span>
            </div>

            {cycleIntervals.length > 0 ? (
              <div className="space-y-3">
                <div className="h-40 w-full flex items-end justify-around gap-2 pt-6 pb-2 border-b border-rosepink-200">
                  {cycleIntervals.map((cycle, idx) => {
                    const heightPercent = Math.min(100, Math.max(15, (cycle.lengthDays / 45) * 100));
                    const isNormal = cycle.lengthDays >= 21 && cycle.lengthDays <= 35;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-bold text-burgundy-900 mb-1 group-hover:scale-110 transition-transform">
                          {cycle.lengthDays}d
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                            isNormal
                              ? 'bg-gradient-to-t from-burgundy-800 to-cherry-500'
                              : 'bg-gradient-to-t from-amber-600 to-amber-400'
                          } group-hover:opacity-90 shadow-xs`}
                        />
                        <span className="text-[9px] text-gray-400 mt-1 whitespace-nowrap">
                          C{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Height corresponds to total days between period starts.
                </p>
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 bg-blush-50/50 rounded-2xl border border-dashed border-rosepink-200">
                <Clock className="w-7 h-7 text-rosepink-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-burgundy-900">Awaiting Interval Data</p>
                <p className="text-[11px] text-gray-500 mt-0.5 max-w-xs mx-auto">
                  Log at least 2 consecutive period start dates to calculate cycle interval bars.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Period Bleeding Duration Trend (SVG Bar Chart) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-burgundy-900">Period Duration History</h2>
                <p className="text-xs text-gray-500">Bleeding duration in days per period</p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rosepink-100 text-burgundy-900 border border-rosepink-200 self-start sm:self-auto">
                Normal: 3–7d
              </span>
            </div>

            {periodDurations.length > 0 ? (
              <div className="space-y-3">
                <div className="h-40 w-full flex items-end justify-around gap-2 pt-6 pb-2 border-b border-rosepink-200">
                  {periodDurations.map((p, idx) => {
                    const heightPercent = Math.min(100, Math.max(20, (p.durationDays / 10) * 100));
                    const isNormal = p.durationDays >= 3 && p.durationDays <= 7;

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <span className="text-[10px] font-bold text-burgundy-900 mb-1 group-hover:scale-110 transition-transform">
                          {p.durationDays}d
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[36px] rounded-t-xl transition-all duration-500 ${
                            isNormal
                              ? 'bg-gradient-to-t from-cherry-600 to-rosepink-400'
                              : 'bg-gradient-to-t from-amber-600 to-rosepink-300'
                          } group-hover:opacity-90 shadow-xs`}
                        />
                        <span className="text-[9px] text-gray-400 mt-1 whitespace-nowrap">
                          P{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Height shows consecutive days of logged bleeding.
                </p>
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 bg-blush-50/50 rounded-2xl border border-dashed border-rosepink-200">
                <Droplets className="w-7 h-7 text-rosepink-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-burgundy-900">No Period Records</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Record your period days to chart bleeding duration trends.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flow Intensity Distribution Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-rosepink-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-burgundy-900">
              Flow Intensity Breakdown
            </h3>
            <p className="text-xs text-gray-500">Distribution of logged bleeding volume</p>
          </div>
          <span className="text-xs font-bold text-burgundy-900 bg-blush px-3 py-1 rounded-full border border-rosepink-200">
            {totalFlowDays} Total Flow Days Logged
          </span>
        </div>

        {totalFlowDays > 0 ? (
          <div className="space-y-3">
            {/* Multi-segment horizontal bar */}
            <div className="h-6 w-full rounded-full overflow-hidden flex bg-gray-100 shadow-inner">
              {flowCounts.spotting > 0 && (
                <div
                  style={{ width: `${(flowCounts.spotting / totalFlowDays) * 100}%` }}
                  className="bg-rosepink-300 hover:opacity-90 transition-all"
                  title={`Spotting: ${flowCounts.spotting} days`}
                />
              )}
              {flowCounts.light > 0 && (
                <div
                  style={{ width: `${(flowCounts.light / totalFlowDays) * 100}%` }}
                  className="bg-cherry-400 hover:opacity-90 transition-all"
                  title={`Light: ${flowCounts.light} days`}
                />
              )}
              {flowCounts.medium > 0 && (
                <div
                  style={{ width: `${(flowCounts.medium / totalFlowDays) * 100}%` }}
                  className="bg-cherry-600 hover:opacity-90 transition-all"
                  title={`Medium: ${flowCounts.medium} days`}
                />
              )}
              {flowCounts.heavy > 0 && (
                <div
                  style={{ width: `${(flowCounts.heavy / totalFlowDays) * 100}%` }}
                  className="bg-burgundy-900 hover:opacity-90 transition-all"
                  title={`Heavy: ${flowCounts.heavy} days`}
                />
              )}
            </div>

            {/* Legend with percentages */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-rosepink-300" />
                <span className="text-gray-700">
                  Spotting: <strong>{flowCounts.spotting}d</strong> ({Math.round((flowCounts.spotting / totalFlowDays) * 100 || 0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-cherry-400" />
                <span className="text-gray-700">
                  Light: <strong>{flowCounts.light}d</strong> ({Math.round((flowCounts.light / totalFlowDays) * 100 || 0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-cherry-600" />
                <span className="text-gray-700">
                  Medium: <strong>{flowCounts.medium}d</strong> ({Math.round((flowCounts.medium / totalFlowDays) * 100 || 0)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-burgundy-900" />
                <span className="text-gray-700">
                  Heavy: <strong>{flowCounts.heavy}d</strong> ({Math.round((flowCounts.heavy / totalFlowDays) * 100 || 0)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-3 text-center">
            Log your daily flow in the quick log sheet to visualize your bleeding intensity profile.
          </p>
        )}
      </div>

      {/* Two Columns: Top Symptoms & Mood Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Symptoms */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-burgundy-900">
                  Most Frequent Symptoms
                </h3>
                <p className="text-xs text-gray-500">Occurrences & average severity</p>
              </div>
              <Activity className="w-5 h-5 text-cherry-500" />
            </div>

            {topSymptoms.length > 0 ? (
              <div className="space-y-3 mt-4">
                {topSymptoms.map(sym => (
                  <div key={sym.name} className="p-3 rounded-2xl bg-blush-50/70 border border-rosepink-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-burgundy-900 block">
                        {sym.name}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Reported {sym.count} time{sym.count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-cherry-600 bg-white px-2.5 py-0.5 rounded-full border border-rosepink-200 shadow-xs">
                        {sym.avgSeverity} / 5
                      </span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Avg Severity</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-8 text-center">
                No physical symptoms recorded yet. Tap "Log Today" to track cramps, headaches, or fatigue.
              </p>
            )}
          </div>
        </div>

        {/* Mood & Emotional Balance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-burgundy-900">
                  Emotional Trends & Energy
                </h3>
                <p className="text-xs text-gray-500">Averages across your logged entries</p>
              </div>
              <Smile className="w-5 h-5 text-cherry-500" />
            </div>

            {/* Averages Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-3 rounded-2xl bg-blush-50 border border-rosepink-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Avg Stress</span>
                <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                  {avgStress}/5
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blush-50 border border-rosepink-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Avg Energy</span>
                <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                  {avgEnergy}/5
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blush-50 border border-rosepink-100">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Avg Sleep</span>
                <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                  {avgSleep}/5
                </span>
              </div>
            </div>

            {/* Frequent Mood Badges */}
            <div className="mt-5">
              <span className="text-xs font-bold text-burgundy-900 block mb-2">
                Frequently Felt:
              </span>
              {topMoods.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topMoods.map(m => (
                    <span
                      key={m.mood}
                      className="px-3 py-1.5 rounded-full bg-rosepink-100 text-burgundy-900 text-xs font-semibold border border-rosepink-200"
                    >
                      {m.mood} ({m.count})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Log your daily emotions in the Mood Journal to discover phase correlations.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-rosepink-100 mt-4 text-[11px] text-gray-400">
            Insights do not constitute medical diagnoses. Discuss recurring patterns with your doctor.
          </div>
        </div>
      </div>

      {/* Menopause & Sleep Trends (if user is tracking or has logged entries) */}
      {(filteredMeno.length > 0 || settings.menopauseStage !== 'menstrual') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-rosepink-100">
            <div className="flex items-center gap-2.5">
              <Thermometer className="w-5 h-5 text-cherry-600" />
              <div>
                <h3 className="font-serif text-lg font-bold text-burgundy-900">
                  Menopause & Vasomotor Patterns
                </h3>
                <p className="text-xs text-gray-500">
                  Daily hot flash frequency, night sweats, and sleep duration logs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', 'all'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setRangeFilter(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    rangeFilter === r
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-blush-50 text-gray-600 border border-rosepink-200 hover:bg-rosepink-100'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {filteredMeno.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-blush-50/70 border border-rosepink-100">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Days Recorded</span>
                  <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                    {filteredMeno.length} days
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">In selected range</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blush-50/70 border border-rosepink-100">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Total Hot Flashes</span>
                  <span className="font-serif text-xl font-bold text-cherry-700 mt-1 block">
                    {filteredMeno.reduce((acc, cur) => acc + cur.hotFlashes, 0)}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Avg {(filteredMeno.reduce((acc, cur) => acc + cur.hotFlashes, 0) / filteredMeno.length).toFixed(1)} / day
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blush-50/70 border border-rosepink-100">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Avg Sleep</span>
                  <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                    {filteredMeno.filter(m => m.sleepHours).length > 0
                      ? `${(filteredMeno.reduce((acc, cur) => acc + (cur.sleepHours || 0), 0) / filteredMeno.filter(m => m.sleepHours).length).toFixed(1)} hrs`
                      : 'N/A'}
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Self-reported sleep</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blush-50/70 border border-rosepink-100">
                  <span className="text-gray-500 block text-[10px] font-bold uppercase">Avg Severity</span>
                  <span className="font-serif text-xl font-bold text-burgundy-900 mt-1 block">
                    {(filteredMeno.reduce((acc, cur) => acc + cur.hotFlashSeverity, 0) / filteredMeno.length).toFixed(1)} / 5
                  </span>
                  <span className="text-[10px] text-gray-400 block mt-0.5">Vasomotor intensity</span>
                </div>
              </div>

              {/* Hot Flashes Bar Chart */}
              <div className="p-4 rounded-2xl bg-blush-50/40 border border-rosepink-100">
                <span className="text-xs font-bold text-burgundy-900 block mb-3">
                  Recent Daily Hot Flash Counts
                </span>
                <div className="flex items-end gap-2 h-28 pt-4">
                  {filteredMeno.slice(-14).map((entry, idx) => {
                    const heightPercent = Math.min(100, (entry.hotFlashes / 12) * 100);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                        <span className="text-[9px] font-bold text-cherry-700">{entry.hotFlashes > 0 ? entry.hotFlashes : ''}</span>
                        <div
                          className="w-full bg-gradient-to-t from-burgundy-800 to-cherry-500 rounded-t-md transition-all"
                          style={{ height: `${Math.max(4, heightPercent)}%` }}
                          title={`${entry.date}: ${entry.hotFlashes} flashes`}
                        />
                        <span className="text-[8px] text-gray-400 truncate w-full text-center">
                          {entry.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-6 text-center">
              No daily check-ins recorded in this time range. Use the Symptoms tab to log daily observations.
            </p>
          )}

          {/* Sample Size & Non-Causal Associations Disclaimer */}
          <div className="p-4 rounded-2xl bg-rosepink-50/60 border border-rosepink-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-cherry-600 shrink-0 mt-0.5" />
            <div className="text-xs text-burgundy-900 space-y-1">
              <p className="font-bold">Understanding Data Associations & Sample Size</p>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                HER CYCLE displays observational patterns based solely on the data you log. Small sample sizes or unrecorded days may skew visible trends. Observed correlations (e.g. higher stress on days with more hot flashes) describe co-occurrence in your diary and do not prove direct causation or substitute for clinical diagnostics.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
