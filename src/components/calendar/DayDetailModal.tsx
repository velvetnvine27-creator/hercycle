import React from 'react';
import {
  Calendar,
  Droplets,
  Activity,
  Smile,
  Pill,
  BookOpen,
  Edit3,
  Trash2,
  X,
  Sparkles,
  Heart,
  Clock
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  UserSettings
} from '../../types';
import { getCurrentPhaseInfo } from '../../services/cycleEngine';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  periodLog: PeriodLog | null;
  symptoms: SymptomLog[];
  moodLog: MoodLog | null;
  medicalLogs: MedicalLog[];
  allPeriodLogs: PeriodLog[];
  settings: UserSettings;
  onOpenEdit: (dateStr: string) => void;
  onDeleteDay: (dateStr: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  periodLog,
  symptoms,
  moodLog,
  medicalLogs,
  allPeriodLogs,
  settings,
  onOpenEdit,
  onDeleteDay
}) => {
  if (!isOpen || !dateStr) return null;

  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const displayDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const phaseInfo = getCurrentPhaseInfo(dateStr, allPeriodLogs, settings);

  // Check if anything was logged on this date
  const hasRecords = Boolean(
    (periodLog && periodLog.flow !== 'none') ||
    symptoms.length > 0 ||
    moodLog ||
    medicalLogs.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-burgundy-950/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto">
        {/* Modal Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-burgundy-900 to-cherry-700 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rosepink-200 block">
              Day Overview & Logs
            </span>
            <h3 className="font-serif text-xl font-bold tracking-tight mt-0.5">
              {displayDate}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 modal-body-height-day overflow-y-auto modal-scroll">
          {/* Estimated Phase Badge */}
          <div className="p-4 rounded-2xl bg-blush-50/70 border border-rosepink-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-cherry-600" />
              <div>
                <span className="text-xs font-bold text-burgundy-900 block">
                  {phaseInfo.phaseName} • Day {phaseInfo.dayInCycle} of cycle
                </span>
                <span className="text-[11px] text-gray-500">
                  {phaseInfo.chanceOfPregnancy} chance of conception
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-white text-burgundy-800 border border-rosepink-200">
              {phaseInfo.phase}
            </span>
          </div>

          {/* Bleeding Flow Record */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cherry-600" />
              Menstrual Flow
            </span>
            {periodLog && periodLog.flow !== 'none' ? (
              <div className="p-3.5 rounded-2xl bg-cherry-50/70 border border-cherry-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-cherry-900 capitalize block text-sm">
                    {periodLog.flow} Flow
                  </span>
                  {periodLog.notes && (
                    <span className="text-gray-600 italic block mt-0.5">"{periodLog.notes}"</span>
                  )}
                </div>
                <div className="flex items-center gap-1" title={`${periodLog.flow} flow`}>
                  {Array.from({
                    length: periodLog.flow === 'spotting' ? 1 : periodLog.flow === 'light' ? 2 : periodLog.flow === 'medium' ? 3 : 4
                  }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-2.5 h-2.5 rounded-full ${periodLog.flow === 'spotting' ? 'bg-rosepink-300' : 'bg-cherry-600'}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400">
                No menstrual bleeding recorded on this day.
              </div>
            )}
          </div>

          {/* Physical Symptoms */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cherry-600" />
              Symptoms & Body Sensations
            </span>
            {symptoms.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptoms.map(s => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-rosepink-50/60 border border-rosepink-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-burgundy-900 block">{s.name}</span>
                      {s.dischargeType && (
                        <span className="text-[10px] text-gray-500 capitalize">Type: {s.dischargeType}</span>
                      )}
                    </div>
                    <span className="font-bold text-cherry-600 bg-white px-2 py-0.5 rounded-full border border-rosepink-200 text-[11px]">
                      {s.severity}/5
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400">
                No symptoms recorded on this date.
              </div>
            )}
          </div>

          {/* Mood & Sleep */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-cherry-600" />
              Mood, Sleep & Energy
            </span>
            {moodLog ? (
              <div className="p-3.5 rounded-2xl bg-blush-50/70 border border-rosepink-200 space-y-2 text-xs">
                {moodLog.moods.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {moodLog.moods.map(m => (
                      <span key={m} className="px-2.5 py-0.5 rounded-full bg-white text-burgundy-900 font-semibold border border-rosepink-200">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2 rounded-lg bg-white border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Stress</span>
                    <span className="font-bold text-burgundy-900">{moodLog.stress}/5</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Energy</span>
                    <span className="font-bold text-burgundy-900">{moodLog.energy}/5</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Sleep</span>
                    <span className="font-bold text-burgundy-900">{moodLog.sleepQuality}/5 ({moodLog.sleepHours ?? 7.5}h)</span>
                  </div>
                </div>
                {moodLog.journalNote && (
                  <p className="p-2.5 rounded-xl bg-white border border-rosepink-100 text-gray-700 italic">
                    "{moodLog.journalNote}"
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-400">
                No mood or sleep notes recorded.
              </div>
            )}
          </div>

          {/* Medical Records for Date */}
          {medicalLogs.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-burgundy-900 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-cherry-600" />
                Medications & Clinical Notes
              </span>
              <div className="space-y-2">
                {medicalLogs.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-purple-900">
                      <span>{m.title}</span>
                      <span className="text-[10px] uppercase">{m.type}</span>
                    </div>
                    {m.dosage && <p className="text-gray-600 mt-0.5">Dosage: {m.dosage}</p>}
                    {m.reason && <p className="text-gray-500 mt-0.5">Indication: {m.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-blush-50/50 border-t border-rosepink-100 flex items-center justify-between">
          {hasRecords ? (
            <button
              onClick={() => {
                onDeleteDay(dateStr);
                onClose();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Entry</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={() => {
                onOpenEdit(dateStr);
                onClose();
              }}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>{hasRecords ? 'Edit Records' : 'Log This Day'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
