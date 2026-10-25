import React from 'react';
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
  AlertTriangle
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  UserSettings
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
}

export const DoctorReportModal: React.FC<DoctorReportModalProps> = ({
  isOpen,
  onClose,
  periodLogs,
  symptomLogs,
  moodLogs,
  medicalLogs,
  settings
}) => {
  if (!isOpen) return null;

  const stats = calculateCycleStats(periodLogs, settings);
  const detectedPeriods = detectPeriodsFromLogs(periodLogs);

  // Group historical cycles
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

  // Symptom statistics
  const symMap: Record<string, { count: number; totalSev: number }> = {};
  symptomLogs.forEach(s => {
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

  const handlePrint = () => {
    window.print();
  };

  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-burgundy-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Header - Screen only */}
        <div className="px-6 py-4 bg-gradient-to-r from-burgundy-900 to-cherry-700 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-rosepink-200" />
            <h3 className="font-serif text-lg font-bold">Doctor Visit Health Summary Report</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-burgundy-900 font-bold text-xs hover:bg-rosepink-50 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:p-0 print:overflow-visible text-gray-800">
          {/* Document Title Header */}
          <div className="border-b-2 border-burgundy-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="font-serif text-2xl font-bold text-burgundy-950">
                BLOOM CYCLE • CLINICAL MENSTRUAL LOG
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                Patient-reported menstrual cycle and symptom history for clinical evaluation
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-gray-900 block">Date of Report: {reportDate}</span>
              <span className="text-gray-500">Patient Identifier: {settings.nickname || 'Anonymous'}</span>
            </div>
          </div>

          {/* Statistical Overview Grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
              1. Cycle Statistics & Baseline Health
            </h2>
            <div className="grid grid-cols-4 gap-3 text-xs border border-gray-200 rounded-xl p-3 bg-gray-50/50 print:bg-white">
              <div>
                <span className="text-gray-500 block">Average Cycle</span>
                <span className="font-bold text-base text-gray-900">{stats.averageCycleLength} days</span>
              </div>
              <div>
                <span className="text-gray-500 block">Bleeding Duration</span>
                <span className="font-bold text-base text-gray-900">{stats.averagePeriodDuration} days</span>
              </div>
              <div>
                <span className="text-gray-500 block">Cycle Range</span>
                <span className="font-bold text-base text-gray-900">{stats.minCycleLength}–{stats.maxCycleLength} days</span>
              </div>
              <div>
                <span className="text-gray-500 block">Total Recorded</span>
                <span className="font-bold text-base text-gray-900">{stats.cycleCount} cycles</span>
              </div>
            </div>
          </div>

          {/* Recorded Cycles Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
              2. Consecutive Menstrual Cycles
            </h2>
            {cyclesData.length > 0 ? (
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 print:bg-gray-200 font-bold text-gray-700">
                  <tr>
                    <th className="p-2.5">Cycle #</th>
                    <th className="p-2.5">Period Start Date</th>
                    <th className="p-2.5">Bleeding Duration</th>
                    <th className="p-2.5">Observed Cycle Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cyclesData.map(c => (
                    <tr key={c.cycleNum} className="hover:bg-gray-50">
                      <td className="p-2.5 font-semibold text-gray-900">Cycle {c.cycleNum}</td>
                      <td className="p-2.5">{c.startDate}</td>
                      <td className="p-2.5">{c.duration} days</td>
                      <td className="p-2.5 font-bold">
                        {c.cycleLength ? `${c.cycleLength} days` : 'Current / In-Progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-500 italic">No historical cycles recorded yet.</p>
            )}
          </div>

          {/* Symptom Frequency & Severity Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
              3. Most Prevalent Symptoms (Severity 1–5 Scale)
            </h2>
            {topSymptoms.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {topSymptoms.map(s => (
                  <div key={s.name} className="p-2.5 rounded-lg border border-gray-200 bg-white">
                    <span className="font-bold text-gray-900 block truncate">{s.name}</span>
                    <span className="text-gray-500 text-[11px] block">{s.count} episodes</span>
                    <span className="font-semibold text-cherry-600 text-[11px]">Avg: {s.avgSeverity} / 5</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No symptoms recorded.</p>
            )}
          </div>

          {/* Medications & Supplements */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
              4. Active Medications & Supplements
            </h2>
            {medicalLogs.filter(m => m.type === 'medication').length > 0 ? (
              <div className="space-y-1.5 text-xs">
                {medicalLogs
                  .filter(m => m.type === 'medication')
                  .map(m => (
                    <div key={m.id} className="p-2 rounded-lg border border-gray-200 flex justify-between">
                      <div>
                        <span className="font-bold text-gray-900">{m.title}</span>
                        {m.dosage && <span className="text-gray-600 ml-2">({m.dosage})</span>}
                        {m.reason && <p className="text-gray-500 text-[11px]">Indication: {m.reason}</p>}
                      </div>
                      <span className="text-gray-400 text-[11px]">{m.dateTime.slice(0, 10)}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No medications recorded.</p>
            )}
          </div>

          {/* Clinician Notes Box */}
          <div className="pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1">
              5. Clinician Examination Notes & Assessment
            </h2>
            <div className="h-28 border-2 border-dashed border-gray-300 rounded-xl p-3 text-xs text-gray-400 italic">
              Space reserved for physician observations, examination findings, and follow-up plan...
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="pt-4 border-t border-gray-200 text-[10px] text-gray-400 flex justify-between items-center">
            <span>Bloom Cycle • Offline IndexedDB Verified • Zero Cloud Transmission</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
