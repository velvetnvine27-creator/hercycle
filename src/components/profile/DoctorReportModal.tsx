import React, { useState, useMemo } from 'react';
import {
  Printer,
  X,
  FileText,
  Calendar,
  Heart,
  Clock,
  Activity,
  Pill,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Thermometer,
  Moon
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  UserSettings,
  MenopauseSymptomEntry,
  BleedingEvent
} from '../../types';
import {
  calculateCycleStats,
  detectPeriodsFromLogs,
  daysBetween
} from '../../services/cycleEngine';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodLogs: PeriodLog[];
  symptomLogs: SymptomLog[];
  moodLogs: MoodLog[];
  medicalLogs: MedicalLog[];
  settings: UserSettings;
  menopauseSymptoms?: MenopauseSymptomEntry[];
  bleedingEvents?: BleedingEvent[];
}

type DateRangeFilter = '30d' | '90d' | '180d' | '365d' | 'all';

export const DoctorReportModal: React.FC<DoctorReportModalProps> = ({
  isOpen,
  onClose,
  periodLogs,
  symptomLogs,
  moodLogs,
  medicalLogs,
  settings,
  menopauseSymptoms = [],
  bleedingEvents = []
}) => {
  // Configurable Sections
  const [includeCycles, setIncludeCycles] = useState(true);
  const [includeSymptoms, setIncludeSymptoms] = useState(true);
  const [includeMenopause, setIncludeMenopause] = useState(true);
  const [includeMoodSleep, setIncludeMoodSleep] = useState(true);
  const [includeBleedingHistory, setIncludeBleedingHistory] = useState(true);
  const [includeMeds, setIncludeMeds] = useState(true);
  const [includeLabsAppointments, setIncludeLabsAppointments] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(true);

  // Time Range
  const [timeRange, setTimeRange] = useState<DateRangeFilter>('90d');

  // Custom Questions for Clinician
  const [questions, setQuestions] = useState<string[]>([
    'Are my current symptom patterns and frequency within typical expectations?',
    'Should we evaluate hormone therapy (MHT / HRT) options, non-hormonal alternatives, or adjust my current regimen?',
    'What preventive bone density (DEXA) or cardiovascular health screenings do you recommend at this stage?'
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');

  // Cutoff date for filtering
  const cutoffDate = useMemo(() => {
    if (timeRange === 'all') return null;
    const now = new Date();
    const days = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === '180d' ? 180 : 365;
    now.setDate(now.getDate() - days);
    return now.toISOString().slice(0, 10);
  }, [timeRange]);

  // Filtered data sets
  const filteredPeriods = useMemo(() => {
    if (!cutoffDate) return periodLogs;
    return periodLogs.filter(p => p.date >= cutoffDate);
  }, [periodLogs, cutoffDate]);

  const filteredSymptoms = useMemo(() => {
    if (!cutoffDate) return symptomLogs;
    return symptomLogs.filter(s => s.date >= cutoffDate);
  }, [symptomLogs, cutoffDate]);

  const filteredMoods = useMemo(() => {
    if (!cutoffDate) return moodLogs;
    return moodLogs.filter(m => m.date >= cutoffDate);
  }, [moodLogs, cutoffDate]);

  const filteredMedical = useMemo(() => {
    if (!cutoffDate) return medicalLogs;
    return medicalLogs.filter(m => m.dateTime.slice(0, 10) >= cutoffDate);
  }, [medicalLogs, cutoffDate]);

  const filteredMenopause = useMemo(() => {
    if (!cutoffDate) return menopauseSymptoms;
    return menopauseSymptoms.filter(ms => ms.date >= cutoffDate);
  }, [menopauseSymptoms, cutoffDate]);

  const filteredBleedingEvents = useMemo(() => {
    if (!cutoffDate) return bleedingEvents;
    return bleedingEvents.filter(b => b.date >= cutoffDate);
  }, [bleedingEvents, cutoffDate]);

  if (!isOpen) return null;

  const stats = calculateCycleStats(filteredPeriods, settings);
  const detectedPeriods = detectPeriodsFromLogs(filteredPeriods);

  // Cycles
  const cyclesData: Array<{ cycleNum: number; startDate: string; duration: number; cycleLength?: number }> = [];
  for (let i = 0; i < detectedPeriods.length; i++) {
    const p = detectedPeriods[i];
    let len: number | undefined;
    if (i < detectedPeriods.length - 1) {
      len = daysBetween(detectedPeriods[i + 1].startDate, p.startDate);
    }
    cyclesData.push({
      cycleNum: i + 1,
      startDate: p.startDate,
      duration: p.durationDays,
      cycleLength: len
    });
  }

  // Symptom stats
  const symMap: Record<string, { count: number; totalSev: number }> = {};
  filteredSymptoms.forEach(s => {
    if (!symMap[s.name]) symMap[s.name] = { count: 0, totalSev: 0 };
    symMap[s.name].count++;
    symMap[s.name].totalSev += s.severity;
  });

  const topSymptoms = Object.entries(symMap)
    .map(([name, d]) => ({
      name,
      count: d.count,
      avgSeverity: (d.totalSev / d.count).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Menopause calculations
  const totalHotFlashes = filteredMenopause.reduce((acc, cur) => acc + (cur.hotFlashes || 0), 0);
  const avgSleepHours = filteredMenopause.filter(m => m.sleepHours).length > 0
    ? (filteredMenopause.reduce((acc, cur) => acc + (cur.sleepHours || 0), 0) / filteredMenopause.filter(m => m.sleepHours).length).toFixed(1)
    : filteredMoods.filter(m => m.sleepHours).length > 0
      ? (filteredMoods.reduce((acc, cur) => acc + (cur.sleepHours || 0), 0) / filteredMoods.filter(m => m.sleepHours).length).toFixed(1)
      : null;

  const avgStress = filteredMoods.length > 0
    ? (filteredMoods.reduce((acc, cur) => acc + cur.stress, 0) / filteredMoods.length).toFixed(1)
    : null;

  const handlePrint = () => {
    window.print();
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions(prev => [...prev, newQuestionText.trim()]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const rangeLabelMap: Record<DateRangeFilter, string> = {
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '180d': 'Last 6 Months',
    '365d': 'Last 12 Months',
    all: 'All Recorded Data'
  };

  const stageDisplayMap: Record<string, string> = {
    menstrual: 'Menstrual Cycle Tracking',
    perimenopause: 'Perimenopause Transition',
    menopause: 'Menopause (12+ Months)',
    postmenopause: 'Postmenopause',
    combined: 'Combined Health Tracking',
    not_sure: 'Under Evaluation / Not Sure'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-burgundy-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Screen Controls Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-burgundy-900 to-cherry-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <img src="/hercycle-logo.png" alt="" className="w-8 h-8 object-contain" />
            <div>
              <h3 className="font-serif text-lg font-bold">Doctor Visit Health Summary Report</h3>
              <p className="text-[11px] text-rosepink-200">Patient-prepared, confidential clinical summary</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-burgundy-900 font-bold text-xs hover:bg-rosepink-50 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Screen Options Bar (Hidden in Print) */}
        <div className="p-4 bg-blush-50 border-b border-rosepink-100 print:hidden space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-burgundy-900">Reporting Range:</span>
              {(['30d', '90d', '180d', '365d', 'all'] as DateRangeFilter[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    timeRange === r
                      ? 'bg-burgundy-900 text-white'
                      : 'bg-white border border-rosepink-200 text-gray-700 hover:bg-rosepink-50'
                  }`}
                >
                  {rangeLabelMap[r]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-rosepink-200/50">
            <span className="font-bold text-burgundy-900">Include Sections:</span>
            {[
              { id: 'cycles', label: 'Cycles', checked: includeCycles, set: setIncludeCycles },
              { id: 'symptoms', label: 'Symptoms', checked: includeSymptoms, set: setIncludeSymptoms },
              { id: 'menopause', label: 'Menopause Trends', checked: includeMenopause, set: setIncludeMenopause },
              { id: 'mood', label: 'Mood & Sleep', checked: includeMoodSleep, set: setIncludeMoodSleep },
              { id: 'bleeding', label: 'Bleeding History', checked: includeBleedingHistory, set: setIncludeBleedingHistory },
              { id: 'meds', label: 'Meds & HRT', checked: includeMeds, set: setIncludeMeds },
              { id: 'labs', label: 'Labs & Appts', checked: includeLabsAppointments, set: setIncludeLabsAppointments },
              { id: 'questions', label: 'Questions', checked: includeQuestions, set: setIncludeQuestions }
            ].map(sec => (
              <label key={sec.id} className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={sec.checked}
                  onChange={e => sec.set(e.target.checked)}
                  className="rounded accent-cherry-600"
                />
                <span>{sec.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-6 modal-body-height-lg overflow-y-auto modal-scroll print:max-h-none print:p-0 print:overflow-visible text-gray-800 bg-white">
          {/* Document Title Header */}
          <div className="border-b-2 border-burgundy-900 pb-4 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <img src="/hercycle-logo.png" alt="HER CYCLE" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="font-serif text-2xl font-bold text-burgundy-950">
                  HER CYCLE • CLINICAL HEALTH SUMMARY
                </h1>
                <p className="text-xs text-gray-600 mt-0.5">
                  Patient-reported menstrual cycle, menopause symptom trends, and health log
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-gray-900 block">Report Date: {reportDate}</span>
              <span className="text-gray-600 block">Period: {rangeLabelMap[timeRange]}</span>
              <span className="text-gray-500">Patient: {settings.nickname || 'Anonymous'}</span>
            </div>
          </div>

          {/* Patient Baseline & Self-Selected Stage Banner */}
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                Menopause / Cycle Stage (User-Selected)
              </span>
              <span className="font-bold text-sm text-burgundy-900">
                {stageDisplayMap[settings.menopauseStage || 'menstrual'] || 'Menstrual Cycle Tracking'}
              </span>
            </div>
            {settings.lastPeriodDate && (
              <div>
                <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                  Last Period / LMP
                </span>
                <span className="font-semibold text-gray-900">{settings.lastPeriodDate}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                Average Baseline
              </span>
              <span className="font-semibold text-gray-900">
                {settings.cycleLength}d cycle · {settings.periodDuration}d flow
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px] uppercase font-bold tracking-wider">
                Data Source
              </span>
              <span className="text-emerald-700 font-semibold">100% Local Device Storage</span>
            </div>
          </div>

          {/* Section 1: Cycle Statistics & Timeline */}
          {includeCycles && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2 flex items-center justify-between">
                <span>1. Cycle Statistics & Historical Patterns</span>
                <span className="text-[10px] font-normal text-gray-400 capitalize">Calculated from user-logged dates</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-gray-200 rounded-xl p-3 bg-gray-50/50 mb-3">
                <div>
                  <span className="text-gray-500 block">Observed Avg Cycle</span>
                  <span className="font-bold text-base text-gray-900">{stats.averageCycleLength} days</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Observed Bleeding</span>
                  <span className="font-bold text-base text-gray-900">{stats.averagePeriodDuration} days</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Cycle Range</span>
                  <span className="font-bold text-base text-gray-900">{stats.minCycleLength}–{stats.maxCycleLength} days</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Recorded Periods</span>
                  <span className="font-bold text-base text-gray-900">{stats.cycleCount} periods</span>
                </div>
              </div>

              {cyclesData.length > 0 && (
                <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th className="p-2">Cycle #</th>
                      <th className="p-2">Period Start Date</th>
                      <th className="p-2">Bleeding Duration</th>
                      <th className="p-2">Observed Cycle Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cyclesData.slice(0, 6).map(c => (
                      <tr key={c.cycleNum}>
                        <td className="p-2 font-semibold text-gray-900">Cycle {c.cycleNum}</td>
                        <td className="p-2">{c.startDate}</td>
                        <td className="p-2">{c.duration} days</td>
                        <td className="p-2 font-bold text-gray-900">
                          {c.cycleLength ? `${c.cycleLength} days` : 'Current / In-Progress'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Section 2: Menopause & Vasomotor Symptom Trends */}
          {includeMenopause && (filteredMenopause.length > 0 || settings.menopauseStage !== 'menstrual') && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2 flex items-center justify-between">
                <span>2. Menopause & Vasomotor Check-in Summaries</span>
                <span className="text-[10px] font-normal text-gray-400">Self-reported daily observations</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                <div>
                  <span className="text-gray-500 block">Total Hot Flashes</span>
                  <span className="font-bold text-base text-cherry-700">{totalHotFlashes} episodes</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Daily Check-ins</span>
                  <span className="font-bold text-base text-gray-900">{filteredMenopause.length} days logged</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Avg Sleep Recorded</span>
                  <span className="font-bold text-base text-gray-900">{avgSleepHours ? `${avgSleepHours} hrs` : 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Reported Triggers</span>
                  <span className="font-semibold text-xs text-gray-900 truncate block">
                    {Array.from(new Set(filteredMenopause.map(m => m.possibleTriggers).filter(Boolean))).slice(0, 3).join(', ') || 'None noted'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Physical & Menstrual Symptoms Frequency */}
          {includeSymptoms && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                3. Prevalent Physical & Cognitive Symptoms (Severity 1–5 Scale)
              </h2>
              {topSymptoms.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {topSymptoms.map(s => (
                    <div key={s.name} className="p-2.5 rounded-lg border border-gray-200 bg-white">
                      <span className="font-bold text-gray-900 block truncate">{s.name}</span>
                      <span className="text-gray-500 text-[11px] block">{s.count} episodes</span>
                      <span className="font-semibold text-cherry-600 text-[11px]">Avg Severity: {s.avgSeverity} / 5</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No symptoms recorded during this time range.</p>
              )}
            </div>
          )}

          {/* Section 4: Bleeding History (Perimenopausal / Spotting / Postmenopausal) */}
          {includeBleedingHistory && filteredBleedingEvents.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                4. Bleeding Observations & History
              </h2>
              <div className="space-y-1.5 text-xs">
                {filteredBleedingEvents.map(b => (
                  <div
                    key={b.id}
                    className={`p-2.5 rounded-lg border flex justify-between items-center ${
                      b.type === 'postmenopausal' ? 'border-red-300 bg-red-50/50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{b.date}</span>
                        {b.endDate && <span className="text-gray-500">→ {b.endDate}</span>}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.type === 'postmenopausal' ? 'bg-red-200 text-red-900' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {b.type}
                        </span>
                        <span className="text-gray-500 font-medium">Flow: {b.flow}</span>
                      </div>
                      {b.notes && <p className="text-gray-600 text-[11px] mt-0.5 italic">"{b.notes}"</p>}
                    </div>
                    {b.seekedMedicalAdvice && (
                      <span className="text-[10px] text-green-700 font-semibold">Discussed with provider</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Medications, Hormone Therapy & Supplements */}
          {includeMeds && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                5. Medications, Hormone Therapy (MHT / HRT) & Supplements
              </h2>
              {filteredMedical.filter(m => m.type === 'medication' || m.type === 'hormone_therapy').length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {filteredMedical
                    .filter(m => m.type === 'medication' || m.type === 'hormone_therapy')
                    .map(m => (
                      <div key={m.id} className="p-2.5 rounded-lg border border-gray-200 flex justify-between items-start bg-white">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{m.title}</span>
                            {m.dosage && <span className="text-gray-600 font-medium">({m.dosage})</span>}
                            {m.type === 'hormone_therapy' && (
                              <span className="px-2 py-0.5 rounded-full bg-rosepink-100 text-burgundy-900 text-[10px] font-bold">
                                Hormone Therapy
                              </span>
                            )}
                          </div>
                          {m.reason && <p className="text-gray-500 text-[11px] mt-0.5">Indication: {m.reason}</p>}
                          {m.sideEffects && <p className="text-cherry-700 text-[11px] mt-0.5">Reported side effects: {m.sideEffects}</p>}
                        </div>
                        <span className="text-gray-400 text-[11px] shrink-0">{m.dateTime.slice(0, 10)}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No medications or hormone therapy entries recorded in this range.</p>
              )}
            </div>
          )}

          {/* Section 6: Clinical Appointments, Lab Results & Notes */}
          {includeLabsAppointments && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                6. Laboratory Results, Consultations & Health Observations
              </h2>
              {filteredMedical.filter(m => m.type !== 'medication' && m.type !== 'hormone_therapy').length > 0 ? (
                <div className="space-y-1.5 text-xs">
                  {filteredMedical
                    .filter(m => m.type !== 'medication' && m.type !== 'hormone_therapy')
                    .map(m => (
                      <div key={m.id} className="p-2.5 rounded-lg border border-gray-200 bg-white">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{m.title}</span>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                              {m.type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span className="text-gray-400 text-[11px]">{m.dateTime.slice(0, 10)}</span>
                        </div>
                        {m.clinician && <p className="text-gray-600 text-[11px] mt-0.5">Clinician / Facility: {m.clinician} {m.location ? `(${m.location})` : ''}</p>}
                        {m.notes && <p className="text-gray-600 text-[11px] mt-0.5 italic">{m.notes}</p>}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No recent laboratory tests or appointment records logged.</p>
              )}
            </div>
          )}

          {/* Section 7: Questions for the Healthcare Professional */}
          {includeQuestions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900">
                  7. Questions Prepared for Healthcare Provider
                </h2>
              </div>
              <ul className="space-y-1.5 text-xs border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                {questions.map((q, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2 group">
                    <span className="text-gray-800 font-medium">• {q}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(idx)}
                      className="text-gray-400 hover:text-red-500 print:hidden opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add question form (hidden in print) */}
              <div className="flex gap-2 mt-2 print:hidden">
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddQuestion(); } }}
                  placeholder="Add another question to bring to your appointment..."
                  className="flex-1 px-3 py-1.5 rounded-xl border border-rosepink-200 text-xs focus:outline-none focus:ring-1 focus:ring-burgundy-800"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={!newQuestionText.trim()}
                  className="px-3 py-1.5 rounded-xl bg-burgundy-900 text-white text-xs font-bold disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Clinician Examination & Assessment Notes */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1">
              8. Clinician Examination Notes & Assessment
            </h2>
            <div className="h-24 border-2 border-dashed border-gray-300 rounded-xl p-3 text-xs text-gray-400 italic">
              Space reserved for physician observations, examination findings, differential diagnosis, and recommended plan...
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-400 flex flex-col sm:flex-row justify-between items-center gap-1">
            <span>HER CYCLE • Offline IndexedDB Verified • Zero Cloud Transmission • Patient-Reported Data</span>
            <span>Generated on {reportDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
