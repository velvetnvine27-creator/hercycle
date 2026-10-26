import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Droplets,
  Smile,
  Activity,
  Moon,
  Trash2,
  Check,
  Plus,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import {
  PeriodLog,
  SymptomLog,
  MoodLog,
  FlowIntensity
} from '../../types';
import { dbService } from '../../services/db';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
  onSaved: () => void;
}

const DEFAULT_SYMPTOMS = [
  { name: 'Cramps (Pelvic)', category: 'pain' },
  { name: 'Headache', category: 'pain' },
  { name: 'Back Pain', category: 'pain' },
  { name: 'Breast Tenderness', category: 'pain' },
  { name: 'Bloating', category: 'body' },
  { name: 'Fatigue', category: 'body' },
  { name: 'Nausea', category: 'body' },
  { name: 'Acne & Skin Breakouts', category: 'body' },
  { name: 'Food Cravings (Sweet/Salty)', category: 'mental' },
  { name: 'Sleep Changes / Insomnia', category: 'mental' },
  { name: 'Digestive / Diarrhea / Constipation', category: 'digestive' }
];

const DISCHARGE_TYPES = [
  { key: 'dry', label: 'Dry / None', desc: 'Minimal sensation' },
  { key: 'sticky', label: 'Sticky / Tacky', desc: 'Dense, pasty' },
  { key: 'creamy', label: 'Creamy / Smooth', desc: 'Lotion-like' },
  { key: 'watery', label: 'Watery / Moist', desc: 'Liquid, clear' },
  { key: 'eggwhite', label: 'Egg-white (Fertile)', desc: 'Clear, stretchy' },
  { key: 'spotting', label: 'Pink / Brown Spotting', desc: 'Trace blood' }
];

const MOOD_OPTIONS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Energetic', emoji: '⚡' },
  { label: 'Grateful', emoji: '✨' },
  { label: 'Sensitive', emoji: '🥺' },
  { label: 'Anxious', emoji: '😰' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Irritable', emoji: '😠' },
  { label: 'Overwhelmed', emoji: '🤯' },
  { label: 'Low', emoji: '🥀' }
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<'period' | 'symptoms' | 'mood' | 'notes'>('period');

  // Period flow state
  const [flow, setFlow] = useState<FlowIntensity>('none');
  const [periodNotes, setPeriodNotes] = useState('');

  // Symptoms state: map of symptomName -> { severity: number; notes: string }
  const [symptomSelections, setSymptomSelections] = useState<Record<string, { severity: number; notes?: string }>>({});
  const [dischargeSelection, setDischargeSelection] = useState<string>('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');
  const [customSymptomsList, setCustomSymptomsList] = useState<string[]>([]);

  // Mood state
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [moodIntensity, setMoodIntensity] = useState(3);
  const [stressLevel, setStressLevel] = useState(2);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(4);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [journalNote, setJournalNote] = useState('');

  // Loading existing logs for dateStr
  const [isExistingPeriod, setIsExistingPeriod] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !dateStr) return;

    let mounted = true;

    async function loadData() {
      try {
        const [periodLog, symptoms, moodLog] = await Promise.all([
          dbService.getPeriodLogByDate(dateStr),
          dbService.getSymptomLogsByDate(dateStr),
          dbService.getMoodLogByDate(dateStr)
        ]);

        if (!mounted) return;

        if (periodLog) {
          setIsExistingPeriod(true);
          setFlow(periodLog.flow);
          setPeriodNotes(periodLog.notes || '');
        } else {
          setIsExistingPeriod(false);
          setFlow('none');
          setPeriodNotes('');
        }

        const sympMap: Record<string, { severity: number; notes?: string }> = {};
        let foundDischarge = '';
        const customList: string[] = [];

        symptoms.forEach(s => {
          if (s.category === 'discharge' && s.dischargeType) {
            foundDischarge = s.dischargeType;
          } else {
            sympMap[s.name] = { severity: s.severity, notes: s.notes };
            if (!DEFAULT_SYMPTOMS.some(d => d.name === s.name)) {
              customList.push(s.name);
            }
          }
        });

        setSymptomSelections(sympMap);
        setDischargeSelection(foundDischarge);
        setCustomSymptomsList(customList);

        if (moodLog) {
          setSelectedMoods(moodLog.moods || []);
          setMoodIntensity(moodLog.intensity || 3);
          setStressLevel(moodLog.stress || 2);
          setEnergyLevel(moodLog.energy || 3);
          setSleepQuality(moodLog.sleepQuality || 4);
          setSleepHours(moodLog.sleepHours ?? 7.5);
          setJournalNote(moodLog.journalNote || '');
        } else {
          setSelectedMoods([]);
          setMoodIntensity(3);
          setStressLevel(2);
          setEnergyLevel(3);
          setSleepQuality(4);
          setSleepHours(7.5);
          setJournalNote('');
        }
      } catch (err) {
        console.error('Error loading log data for date:', dateStr, err);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [isOpen, dateStr]);

  if (!isOpen) return null;

  const handleToggleSymptom = (name: string) => {
    setSymptomSelections(prev => {
      const copy = { ...prev };
      if (copy[name]) {
        delete copy[name];
      } else {
        copy[name] = { severity: 3, notes: '' };
      }
      return copy;
    });
  };

  const handleSetSymptomSeverity = (name: string, severity: number) => {
    setSymptomSelections(prev => ({
      ...prev,
      [name]: {
        severity,
        notes: prev[name]?.notes || ''
      }
    }));
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptomInput.trim();
    if (!trimmed) return;
    if (!customSymptomsList.includes(trimmed)) {
      setCustomSymptomsList(prev => [...prev, trimmed]);
      setSymptomSelections(prev => ({
        ...prev,
        [trimmed]: { severity: 3 }
      }));
    }
    setCustomSymptomInput('');
  };

  const handleToggleMood = (label: string) => {
    setSelectedMoods(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Period flow
      if (flow !== 'none') {
        const periodRecord: PeriodLog = {
          id: `p-${dateStr}`,
          date: dateStr,
          flow,
          notes: periodNotes.trim() || undefined,
          createdAt: new Date().toISOString()
        };
        await dbService.savePeriodLog(periodRecord);
      } else if (isExistingPeriod) {
        // If user set to 'none' and there was an existing record, remove flow
        await dbService.deletePeriodLog(dateStr);
      }

      // 2. Symptoms
      // Remove previous symptoms for dateStr
      const existingSymptoms = await dbService.getSymptomLogsByDate(dateStr);
      for (const s of existingSymptoms) {
        await dbService.deleteSymptomLog(s.id);
      }

      // Save active symptoms
      for (const [name, val] of Object.entries(symptomSelections)) {
        const defaultDef = DEFAULT_SYMPTOMS.find(d => d.name === name);
        const category = defaultDef ? defaultDef.category : 'custom';
        const symLog: SymptomLog = {
          id: `sym-${dateStr}-${encodeURIComponent(name)}`,
          date: dateStr,
          category: category as any,
          name,
          severity: val.severity,
          notes: val.notes || undefined,
          createdAt: new Date().toISOString()
        };
        await dbService.saveSymptomLog(symLog);
      }

      // Save discharge observation if selected
      if (dischargeSelection) {
        const dischargeLog: SymptomLog = {
          id: `sym-${dateStr}-discharge`,
          date: dateStr,
          category: 'discharge',
          name: 'Cervical Mucus Observation',
          severity: 2,
          dischargeType: dischargeSelection as any,
          createdAt: new Date().toISOString()
        };
        await dbService.saveSymptomLog(dischargeLog);
      }

      // 3. Mood & Journal
      if (selectedMoods.length > 0 || journalNote.trim() || stressLevel > 0) {
        const moodRecord: MoodLog = {
          id: `m-${dateStr}`,
          date: dateStr,
          moods: selectedMoods,
          intensity: moodIntensity,
          stress: stressLevel,
          energy: energyLevel,
          sleepQuality,
          sleepHours,
          journalNote: journalNote.trim() || undefined,
          createdAt: new Date().toISOString()
        };
        await dbService.saveMoodLog(moodRecord);
      }

      // Play soft celebratory confetti
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C62845', '#8F1538', '#F4C2CC', '#FDE4D2']
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save log entry:', err);
      alert('Error saving record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!window.confirm(`Delete all logged entries for ${dateStr}?`)) return;
    try {
      await dbService.deletePeriodLog(dateStr);
      await dbService.deleteMoodLog(dateStr);
      const existing = await dbService.getSymptomLogsByDate(dateStr);
      for (const s of existing) {
        await dbService.deleteSymptomLog(s.id);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Format date readable
  const [y, m, d] = dateStr.split('-').map(Number);
  const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-burgundy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto flex flex-col max-h-[90dvh]">
        {/* Header */}
        <div className="px-6 py-4 bg-blush-50 border-b border-rosepink-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl text-burgundy-900">
                Daily Log
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rosepink-200 text-burgundy-900 border border-rosepink-300">
                {displayDate}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Track your flow, bodily sensations, and emotional patterns</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-burgundy-900 hover:bg-rosepink-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-rosepink-100 bg-white px-6 pt-2 overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('period')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'period'
                ? 'border-cherry-500 text-cherry-600'
                : 'border-transparent text-gray-500 hover:text-burgundy-800'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Bleeding & Flow</span>
            {flow !== 'none' && (
              <span className="w-2 h-2 rounded-full bg-cherry-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('symptoms')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'symptoms'
                ? 'border-cherry-500 text-cherry-600'
                : 'border-transparent text-gray-500 hover:text-burgundy-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Symptoms & Body</span>
            {Object.keys(symptomSelections).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cherry-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mood')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'mood'
                ? 'border-cherry-500 text-cherry-600'
                : 'border-transparent text-gray-500 hover:text-burgundy-800'
            }`}
          >
            <Smile className="w-4 h-4" />
            <span>Mood & Energy</span>
            {selectedMoods.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cherry-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-cherry-500 text-cherry-600'
                : 'border-transparent text-gray-500 hover:text-burgundy-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Private Journal</span>
            {journalNote && (
              <span className="w-2 h-2 rounded-full bg-cherry-500" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 modal-scroll">
          {/* TAB 1: PERIOD & FLOW */}
          {activeTab === 'period' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-3">
                  Menstrual Bleeding Flow
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { key: 'none', label: 'No Bleeding', icon: '⚪', desc: 'Clean' },
                    { key: 'spotting', label: 'Spotting', icon: '💧', desc: 'Few drops' },
                    { key: 'light', label: 'Light', icon: '🩸', desc: 'Pad/tampon 4-6h' },
                    { key: 'medium', label: 'Medium', icon: '🩸🩸', desc: 'Standard flow' },
                    { key: 'heavy', label: 'Heavy', icon: '🩸🩸🩸', desc: 'Frequent changes' }
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setFlow(item.key as FlowIntensity)}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                        flow === item.key
                          ? 'bg-rosepink-100 border-cherry-500 text-burgundy-900 font-bold shadow-xs scale-102'
                          : 'bg-white border-rosepink-200 text-gray-600 hover:border-rosepink-300'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-xs">{item.label}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bleeding note */}
              <div>
                <label className="block text-xs font-semibold text-burgundy-900 mb-1.5">
                  Flow Notes (Optional)
                </label>
                <input
                  type="text"
                  value={periodNotes}
                  onChange={e => setPeriodNotes(e.target.value)}
                  placeholder="e.g. Started at 7am, dark red, required heating pad"
                  className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs focus:outline-none focus:ring-2 focus:ring-cherry-500/20 focus:border-cherry-500 bg-blush-50/20"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-blush-100/60 border border-rosepink-200/80 text-xs text-burgundy-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cherry-500 shrink-0 mt-0.5" />
                <span>
                  Consecutive bleeding days automatically define your period start and end dates. There is no need to manually count cycles.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: SYMPTOMS & DISCHARGE */}
          {activeTab === 'symptoms' && (
            <div className="space-y-6 animate-fade-in">
              {/* Common Symptoms List */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-3">
                  Physical Symptoms & Severity (1 to 5)
                </label>
                <div className="space-y-2">
                  {[...DEFAULT_SYMPTOMS, ...customSymptomsList.map(name => ({ name, category: 'custom' }))].map(s => {
                    const isSelected = Boolean(symptomSelections[s.name]);
                    const currentSev = symptomSelections[s.name]?.severity || 3;

                    return (
                      <div
                        key={s.name}
                        className={`p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-rosepink-50/80 border-cherry-400 shadow-xs'
                            : 'bg-white border-rosepink-100 hover:border-rosepink-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleToggleSymptom(s.name)}
                            className="flex items-center gap-2.5 text-xs font-semibold text-burgundy-900 text-left"
                          >
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] ${
                                isSelected ? 'bg-cherry-500 font-bold' : 'border border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </span>
                            <span>{s.name}</span>
                          </button>

                          {isSelected && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-gray-500 mr-1">Severity:</span>
                              {[1, 2, 3, 4, 5].map(lvl => (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSetSymptomSeverity(s.name, lvl)}
                                  className={`w-6 h-6 rounded-full text-[11px] font-bold transition-all ${
                                    currentSev === lvl
                                      ? 'bg-cherry-500 text-white shadow-xs scale-110'
                                      : 'bg-rosepink-100 text-burgundy-900 hover:bg-rosepink-200'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Symptom */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-burgundy-900 mb-1.5">
                  Add Custom Symptom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSymptomInput}
                    onChange={e => setCustomSymptomInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomSymptom();
                      }
                    }}
                    placeholder="e.g. Migraine with aura, Restless legs"
                    className="flex-1 px-4 py-2 rounded-xl border border-rosepink-200 text-xs focus:outline-none focus:ring-2 focus:ring-cherry-500/20 focus:border-cherry-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSymptom}
                    className="px-4 py-2 rounded-xl bg-rosepink-200 text-burgundy-900 text-xs font-bold hover:bg-rosepink-300 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Discharge / Cervical Mucus Observation */}
              <div className="pt-4 border-t border-rosepink-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2">
                  Cervical Fluid / Discharge Observation
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Natural fluid consistency provides valuable signals about your current hormonal phase and fertility window.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DISCHARGE_TYPES.map(d => (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDischargeSelection(dischargeSelection === d.key ? '' : d.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        dischargeSelection === d.key
                          ? 'bg-rosepink-100 border-cherry-500 text-burgundy-900 font-bold shadow-xs'
                          : 'bg-white border-rosepink-200 text-gray-700 hover:border-rosepink-300'
                      }`}
                    >
                      <p className="text-xs font-bold">{d.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{d.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MOOD, SLEEP & ENERGY */}
          {activeTab === 'mood' && (
            <div className="space-y-6 animate-fade-in">
              {/* Mood Tags */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-2.5">
                  How are you feeling today? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map(m => {
                    const isSelected = selectedMoods.includes(m.label);
                    return (
                      <button
                        key={m.label}
                        type="button"
                        onClick={() => handleToggleMood(m.label)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-cherry-500 text-white shadow-xs scale-105'
                            : 'bg-rosepink-50 border border-rosepink-200 text-burgundy-900 hover:bg-rosepink-100'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Stress, Energy, Sleep */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stress Level */}
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-rosepink-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-burgundy-900">Stress Level</span>
                    <span className="text-xs font-bold text-cherry-600 bg-white px-2.5 py-0.5 rounded-full border border-rosepink-200">
                      {stressLevel} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={stressLevel}
                    onChange={e => setStressLevel(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Zen / Low</span>
                    <span>Moderate</span>
                    <span>High / Tense</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-rosepink-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-burgundy-900">Energy Level</span>
                    <span className="text-xs font-bold text-cherry-600 bg-white px-2.5 py-0.5 rounded-full border border-rosepink-200">
                      {energyLevel} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={e => setEnergyLevel(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Exhausted</span>
                    <span>Steady</span>
                    <span>Vibrant</span>
                  </div>
                </div>

                {/* Sleep Quality */}
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-rosepink-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-burgundy-900">Sleep Quality</span>
                    <span className="text-xs font-bold text-cherry-600 bg-white px-2.5 py-0.5 rounded-full border border-rosepink-200">
                      {sleepQuality} / 5
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sleepQuality}
                    onChange={e => setSleepQuality(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Restless</span>
                    <span>Fair</span>
                    <span>Deep / Restful</span>
                  </div>
                </div>

                {/* Sleep Hours */}
                <div className="p-4 rounded-2xl bg-blush-50/60 border border-rosepink-200">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-burgundy-900 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cherry-500" />
                      Sleep Duration
                    </span>
                    <span className="text-xs font-bold text-cherry-600 bg-white px-2.5 py-0.5 rounded-full border border-rosepink-200">
                      {sleepHours} hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={sleepHours}
                    onChange={e => setSleepHours(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>3 hrs</span>
                    <span>7.5 hrs</span>
                    <span>12 hrs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVATE JOURNAL */}
          {activeTab === 'notes' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy-900 mb-1.5">
                  Private Diary & Reflections
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  A quiet space to write personal notes, triggers, body changes, or gratitude. Stored exclusively in your browser.
                </p>
                <textarea
                  rows={8}
                  value={journalNote}
                  onChange={e => setJournalNote(e.target.value)}
                  placeholder="How did you treat your body today? What brought you comfort or peace?"
                  className="w-full p-4 rounded-2xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-cherry-500/20 focus:border-cherry-500 bg-blush-50/20 leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-blush-50/50 border-t border-rosepink-100 flex items-center justify-between">
          {isExistingPeriod || Object.keys(symptomSelections).length > 0 || selectedMoods.length > 0 ? (
            <button
              type="button"
              onClick={handleDeleteEntry}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Day Entry</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Today'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
