import React, { useState, useEffect } from 'react';
import {
  Thermometer, Moon, Brain, Heart, Activity, Plus, Trash2,
  ChevronDown, ChevronUp, Save, AlertTriangle, CalendarDays, Clock
} from 'lucide-react';
import { MenopauseSymptomEntry } from '../../types';
import { dbService } from '../../services/db';

const today = () => new Date().toISOString().split('T')[0];

const SLIDER_FIELDS: Array<{ key: keyof MenopauseSymptomEntry; label: string; icon: React.ReactNode; group: string }> = [
  { key: 'hotFlashSeverity', label: 'Hot Flash Severity', icon: <Thermometer className="w-4 h-4" />, group: 'Vasomotor' },
  { key: 'nightSweats', label: 'Night Sweats', icon: <Moon className="w-4 h-4" />, group: 'Vasomotor' },
  { key: 'sleepQuality', label: 'Sleep Quality (1=Poor, 5=Excellent)', icon: <Moon className="w-4 h-4" />, group: 'Sleep' },
  { key: 'moodRating', label: 'Mood (1=Very Low, 5=Great)', icon: <Heart className="w-4 h-4" />, group: 'Mood & Cognitive' },
  { key: 'anxietyLevel', label: 'Anxiety Level', icon: <Brain className="w-4 h-4" />, group: 'Mood & Cognitive' },
  { key: 'irritability', label: 'Irritability', icon: <Activity className="w-4 h-4" />, group: 'Mood & Cognitive' },
  { key: 'brainFog', label: 'Brain Fog / Forgetfulness', icon: <Brain className="w-4 h-4" />, group: 'Mood & Cognitive' },
  { key: 'concentration', label: 'Concentration Difficulty', icon: <Brain className="w-4 h-4" />, group: 'Mood & Cognitive' },
  { key: 'fatigue', label: 'Fatigue & Low Stamina', icon: <Activity className="w-4 h-4" />, group: 'Physical' },
  { key: 'headache', label: 'Headaches & Migraines', icon: <Activity className="w-4 h-4" />, group: 'Physical' },
  { key: 'jointPain', label: 'Joint Aches & Stiffness', icon: <Activity className="w-4 h-4" />, group: 'Physical' },
  { key: 'musclePain', label: 'Muscle Aches & Tension', icon: <Activity className="w-4 h-4" />, group: 'Physical' },
  { key: 'vaginalDryness', label: 'Vaginal Dryness / Discomfort', icon: <Activity className="w-4 h-4" />, group: 'Urogenital' },
  { key: 'urinarySymptoms', label: 'Urinary Frequency / Urgency', icon: <Activity className="w-4 h-4" />, group: 'Urogenital' },
  { key: 'libidoChange', label: 'Libido Shift (1=Low, 3=Normal, 5=High)', icon: <Heart className="w-4 h-4" />, group: 'Urogenital' },
  { key: 'palpitations', label: 'Heart Palpitations / Racing', icon: <Heart className="w-4 h-4" />, group: 'Other' },
  { key: 'skinHairChanges', label: 'Skin & Hair Changes (Dryness/Thinning)', icon: <Activity className="w-4 h-4" />, group: 'Other' },
  { key: 'stressLevel', label: 'Stress Level', icon: <Brain className="w-4 h-4" />, group: 'Context' },
  { key: 'energyLevel', label: 'Energy Level', icon: <Activity className="w-4 h-4" />, group: 'Context' },
];

function emptyEntry(date: string): MenopauseSymptomEntry {
  return {
    id: `ms-${date}-${Date.now()}`,
    date,
    hotFlashes: 0,
    hotFlashSeverity: 1,
    nightSweats: 1,
    sleepHours: 7,
    sleepQuality: 3,
    nightAwakenings: 0,
    moodRating: 3,
    anxietyLevel: 1,
    irritability: 1,
    brainFog: 1,
    concentration: 3,
    fatigue: 1,
    headache: 1,
    jointPain: 1,
    musclePain: 1,
    vaginalDryness: 1,
    urinarySymptoms: 1,
    libidoChange: 3,
    palpitations: 1,
    skinHairChanges: 1,
    stressLevel: 1,
    energyLevel: 3,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

const SeveritySlider: React.FC<{ value: number; onChange: (v: number) => void; min?: number; max?: number }> = ({ value, onChange, min = 1, max = 5 }) => {
  const colors = ['bg-green-400', 'bg-lime-400', 'bg-yellow-400', 'bg-orange-400', 'bg-cherry-500'];
  const labels = ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'];
  return (
    <div className="flex items-center gap-2 mt-1">
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 rounded-full accent-burgundy-800 cursor-pointer" />
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${colors[value - 1] || 'bg-gray-300'}`}>
        {max === 5 ? labels[value - 1] : value}
      </span>
    </div>
  );
};

export const MenopauseSymptomView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(today());
  const [entries, setEntries] = useState<MenopauseSymptomEntry[]>([]);
  const [editEntry, setEditEntry] = useState<MenopauseSymptomEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Vasomotor', 'Sleep', 'Mood & Cognitive']));

  const loadEntries = async () => {
    const all = await dbService.getAllMenopauseSymptoms();
    setEntries(all);
  };

  useEffect(() => { loadEntries(); }, []);

  const todayEntries = entries.filter(e => e.date === selectedDate);

  const handleNew = () => {
    setEditEntry(emptyEntry(selectedDate));
    setIsEditing(true);
  };

  const handleEdit = (entry: MenopauseSymptomEntry) => {
    setEditEntry({ ...entry });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this check-in?')) return;
    await dbService.deleteMenopauseSymptom(id);
    loadEntries();
  };

  const handleSave = async () => {
    if (!editEntry) return;
    setIsSaving(true);
    await dbService.saveMenopauseSymptom({ ...editEntry, updatedAt: new Date().toISOString() });
    setIsSaving(false);
    setIsEditing(false);
    setSavedMsg('Saved!');
    setTimeout(() => setSavedMsg(''), 2000);
    loadEntries();
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const groups = Array.from(new Set(SLIDER_FIELDS.map(f => f.group)));

  if (isEditing && editEntry) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-burgundy-900">Daily Check-in</h2>
          <span className="text-xs font-semibold text-burgundy-900/60 bg-rosepink-100 px-2 py-1 rounded-full">{selectedDate}</span>
        </div>

        {/* Hot flash count */}
        <div className="bg-white rounded-2xl p-4 border border-rosepink-200">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="w-4 h-4 text-cherry-600" />
            <span className="text-sm font-bold text-burgundy-900">Hot Flashes Today</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setEditEntry(e => e ? { ...e, hotFlashes: Math.max(0, e.hotFlashes - 1) } : e)}
              className="w-8 h-8 rounded-full bg-rosepink-100 text-burgundy-900 font-bold flex items-center justify-center">−</button>
            <span className="text-2xl font-bold text-burgundy-900 w-10 text-center">{editEntry.hotFlashes}</span>
            <button onClick={() => setEditEntry(e => e ? { ...e, hotFlashes: Math.min(20, e.hotFlashes + 1) } : e)}
              className="w-8 h-8 rounded-full bg-rosepink-100 text-burgundy-900 font-bold flex items-center justify-center">+</button>
            <span className="text-xs text-gray-500">flashes</span>
          </div>
        </div>

        {/* Sleep */}
        <div className="bg-white rounded-2xl p-4 border border-rosepink-200">
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-burgundy-900">Sleep</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Hours slept</label>
              <input type="number" min={0} max={14} step={0.5} value={editEntry.sleepHours || 7}
                onChange={e => setEditEntry(e2 => e2 ? { ...e2, sleepHours: Number(e.target.value) } : e2)}
                className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Night awakenings</label>
              <input type="number" min={0} max={10} value={editEntry.nightAwakenings}
                onChange={e => setEditEntry(e2 => e2 ? { ...e2, nightAwakenings: Number(e.target.value) } : e2)}
                className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
            </div>
          </div>
        </div>

        {/* Grouped symptom sliders */}
        {groups.map(group => (
          <div key={group} className="bg-white rounded-2xl border border-rosepink-200 overflow-hidden">
            <button onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blush-50 border-b border-rosepink-100">
              <span className="text-sm font-bold text-burgundy-900">{group}</span>
              {expandedGroups.has(group) ? <ChevronUp className="w-4 h-4 text-burgundy-900/50" /> : <ChevronDown className="w-4 h-4 text-burgundy-900/50" />}
            </button>
            {expandedGroups.has(group) && (
              <div className="p-4 space-y-4">
                {SLIDER_FIELDS.filter(f => f.group === group).map(field => (
                  <div key={field.key as string}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-burgundy-900/60">{field.icon}</span>
                      <span className="text-xs font-semibold text-burgundy-900">{field.label}</span>
                    </div>
                    <SeveritySlider
                      value={editEntry[field.key] as number}
                      onChange={v => setEditEntry(e => e ? { ...e, [field.key]: v } : e)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Custom Symptoms */}
        <div className="bg-white rounded-2xl p-4 border border-rosepink-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-burgundy-900 block">Custom Symptoms</span>
              <span className="text-[10px] text-gray-500">Track any unique sensation not listed above</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const name = window.prompt('Enter custom symptom name (e.g. Tingling extremities, Restless legs):');
                if (name && name.trim()) {
                  setEditEntry(e => e ? {
                    ...e,
                    customSymptoms: [...(e.customSymptoms || []), { name: name.trim(), severity: 3 }]
                  } : e);
                }
              }}
              className="text-xs text-cherry-600 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom</span>
            </button>
          </div>
          {editEntry.customSymptoms && editEntry.customSymptoms.length > 0 && (
            <div className="space-y-3 pt-1">
              {editEntry.customSymptoms.map((cs, cIdx) => (
                <div key={cIdx} className="p-3 rounded-xl bg-blush-50 border border-rosepink-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-burgundy-900">{cs.name}</span>
                    <button
                      type="button"
                      onClick={() => setEditEntry(e => e ? {
                        ...e,
                        customSymptoms: (e.customSymptoms || []).filter((_, i) => i !== cIdx)
                      } : e)}
                      className="text-cherry-600 hover:text-cherry-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <SeveritySlider
                    value={cs.severity}
                    onChange={v => setEditEntry(e => e ? {
                      ...e,
                      customSymptoms: (e.customSymptoms || []).map((item, i) => i === cIdx ? { ...item, severity: v } : item)
                    } : e)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Triggers & Notes */}
        <div className="bg-white rounded-2xl p-4 border border-rosepink-200 space-y-3">
          <div>
            <label className="text-xs font-bold text-burgundy-900 block mb-1">Possible Triggers (optional)</label>
            <input type="text" value={editEntry.possibleTriggers || ''}
              onChange={e => setEditEntry(e2 => e2 ? { ...e2, possibleTriggers: e.target.value } : e2)}
              placeholder="e.g. caffeine, stress, alcohol..."
              className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
          </div>
          <div>
            <label className="text-xs font-bold text-burgundy-900 block mb-1">Notes (optional)</label>
            <textarea value={editEntry.notes || ''}
              onChange={e => setEditEntry(e2 => e2 ? { ...e2, notes: e.target.value } : e2)}
              rows={2} placeholder="Any additional observations..."
              className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setIsEditing(false)}
            className="flex-1 py-3 rounded-2xl border border-rosepink-200 text-burgundy-900 font-semibold text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Check-in'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-burgundy-900">Symptom Tracker</h2>
          <p className="text-xs text-burgundy-900/60 mt-0.5">Track your daily menopause symptoms</p>
        </div>
        {savedMsg && <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">{savedMsg}</span>}
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-rosepink-200">
        <CalendarDays className="w-4 h-4 text-burgundy-800" />
        <input type="date" value={selectedDate} max={today()}
          onChange={e => setSelectedDate(e.target.value)}
          className="flex-1 text-sm text-burgundy-900 bg-transparent focus:outline-none" />
        <button onClick={handleNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white text-xs font-bold shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          Check-in
        </button>
      </div>

      {/* Today's entries */}
      {todayEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-rosepink-200 text-center">
          <Thermometer className="w-8 h-8 text-rosepink-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-burgundy-900">No check-in yet for {selectedDate}</p>
          <p className="text-xs text-gray-500 mt-1">Tap "Check-in" to log today's symptoms</p>
        </div>
      ) : (
        todayEntries.map(entry => (
          <div key={entry.id} className="bg-white rounded-2xl p-4 border border-rosepink-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-burgundy-900/40" />
                <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(entry)} className="text-xs text-burgundy-800 font-semibold hover:underline">Edit</button>
                <button onClick={() => handleDelete(entry.id)} className="text-cherry-600 hover:text-cherry-800">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Hot flashes', value: `${entry.hotFlashes}×`, highlight: entry.hotFlashes >= 5 },
                { label: 'Sleep', value: `${entry.sleepHours || '?'}h`, highlight: (entry.sleepHours || 7) < 5 },
                { label: 'Mood', value: `${entry.moodRating}/5`, highlight: entry.moodRating <= 2 },
                { label: 'Anxiety', value: `${entry.anxietyLevel}/5`, highlight: entry.anxietyLevel >= 4 },
                { label: 'Fatigue', value: `${entry.fatigue}/5`, highlight: entry.fatigue >= 4 },
                { label: 'Night sweats', value: `${entry.nightSweats}/5`, highlight: entry.nightSweats >= 4 },
              ].map(item => (
                <div key={item.label} className={`rounded-xl p-2 text-center ${item.highlight ? 'bg-cherry-50 border border-cherry-200' : 'bg-blush-50'}`}>
                  <div className={`text-sm font-bold ${item.highlight ? 'text-cherry-700' : 'text-burgundy-900'}`}>{item.value}</div>
                  <div className="text-[10px] text-gray-500">{item.label}</div>
                </div>
              ))}
            </div>
            {entry.notes && <p className="text-xs text-gray-600 mt-2 italic">"{entry.notes}"</p>}
          </div>
        ))
      )}

      {/* Recent history */}
      {entries.filter(e => e.date !== selectedDate).slice(0, 7).length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-rosepink-200">
          <h3 className="text-sm font-bold text-burgundy-900 mb-3">Recent History</h3>
          <div className="space-y-2">
            {entries.filter(e => e.date !== selectedDate).slice(0, 7).map(entry => (
              <div key={entry.id} className="flex items-center justify-between text-xs py-2 border-b border-rosepink-50 last:border-0">
                <span className="text-burgundy-900/70 font-medium">{entry.date}</span>
                <div className="flex gap-3 text-gray-500">
                  <span>{entry.hotFlashes} flashes</span>
                  <span>Sleep {entry.sleepHours || '?'}h</span>
                  <span>Mood {entry.moodRating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">Tracking symptoms helps you and your healthcare provider understand your patterns. This app does not diagnose conditions or prescribe treatments.</p>
        </div>
      </div>
    </div>
  );
};
