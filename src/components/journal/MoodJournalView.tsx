import React, { useState } from 'react';
import {
  Smile,
  BookOpen,
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Heart,
  Edit3
} from 'lucide-react';
import { MoodLog } from '../../types';
import { formatDate } from '../../services/cycleEngine';

interface MoodJournalViewProps {
  moodLogs: MoodLog[];
  onOpenLogModal: (dateStr?: string) => void;
  onDeleteMoodLog: (dateStr: string) => void;
}

export const MoodJournalView: React.FC<MoodJournalViewProps> = ({
  moodLogs,
  onOpenLogModal,
  onDeleteMoodLog
}) => {
  const todayStr = formatDate(new Date());
  const [filterMood, setFilterMood] = useState<string>('all');

  // Sorted latest first
  const sortedLogs = [...moodLogs].sort((a, b) => b.date.localeCompare(a.date));

  const filteredLogs = filterMood === 'all'
    ? sortedLogs
    : sortedLogs.filter(l => l.moods.includes(filterMood));

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
            Inner Sanctuary
          </span>
          <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
            Mood & Reflection Journal
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Capture emotional patterns, stress levels, sleep, and private thoughts across your cycle.
          </p>
        </div>

        <button
          onClick={() => onOpenLogModal(todayStr)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterMood('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filterMood === 'all'
              ? 'bg-burgundy-900 text-white shadow-xs'
              : 'bg-white border border-rosepink-200 text-gray-600 hover:border-rosepink-300'
          }`}
        >
          All Entries ({moodLogs.length})
        </button>

        {['Calm', 'Happy', 'Energetic', 'Sensitive', 'Anxious', 'Irritable', 'Overwhelmed', 'Low'].map(m => (
          <button
            key={m}
            onClick={() => setFilterMood(m)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterMood === m
                ? 'bg-cherry-500 text-white shadow-xs'
                : 'bg-white border border-rosepink-200 text-gray-600 hover:border-rosepink-300'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Timeline of Mood Entries */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map(log => {
            const [y, m, d] = log.date.split('-').map(Number);
            const dateDisplay = new Date(y, m - 1, d).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div
                key={log.id}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-rosepink-200/80 hover:border-rosepink-300 transition-all space-y-4"
              >
                {/* Entry Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-rosepink-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cherry-500" />
                    <span className="font-serif font-bold text-base text-burgundy-900">
                      {dateDisplay}
                    </span>
                    {log.date === todayStr && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cherry-50 text-cherry-600 border border-cherry-200">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenLogModal(log.date)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-burgundy-900 hover:bg-rosepink-100 transition-colors"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteMoodLog(log.date)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mood Tags */}
                {log.moods && log.moods.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {log.moods.map(mood => (
                      <span
                        key={mood}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-rosepink-50 text-burgundy-900 border border-rosepink-200 shadow-2xs"
                      >
                        {mood}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics Badges: Stress, Energy, Sleep */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-blush-50/70 border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Stress</span>
                    <span className="font-bold text-burgundy-900">{log.stress || 2} / 5</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blush-50/70 border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Energy</span>
                    <span className="font-bold text-burgundy-900">{log.energy || 3} / 5</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blush-50/70 border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Sleep Quality</span>
                    <span className="font-bold text-burgundy-900">{log.sleepQuality || 4} / 5</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blush-50/70 border border-rosepink-100">
                    <span className="text-[10px] text-gray-400 block font-semibold">Sleep Hours</span>
                    <span className="font-bold text-burgundy-900">{log.sleepHours ?? 7.5} hrs</span>
                  </div>
                </div>

                {/* Private Journal Text */}
                {log.journalNote && (
                  <div className="pt-2">
                    <div className="p-4 rounded-2xl bg-cream border border-rosepink-100 text-sm text-gray-700 leading-relaxed font-sans italic">
                      "{log.journalNote}"
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-rosepink-200 shadow-soft space-y-3">
          <BookOpen className="w-10 h-10 text-rosepink-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-burgundy-900">
            Your Journal is Empty
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Take a moment to record your emotional wellness, sleep quality, and reflections today.
          </p>
          <button
            onClick={() => onOpenLogModal(todayStr)}
            className="px-6 py-2.5 rounded-full bg-rosepink-100 hover:bg-rosepink-200 text-burgundy-900 font-bold text-xs transition-colors"
          >
            Create First Journal Entry
          </button>
        </div>
      )}
    </div>
  );
};
