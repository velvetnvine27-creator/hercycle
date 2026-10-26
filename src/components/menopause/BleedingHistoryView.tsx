import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, AlertTriangle, Droplets, CalendarDays, X, Save } from 'lucide-react';
import { BleedingEvent, FlowIntensity } from '../../types';
import { dbService } from '../../services/db';

const FLOW_OPTIONS: { value: FlowIntensity; label: string; color: string }[] = [
  { value: 'spotting', label: 'Spotting', color: 'bg-rosepink-200' },
  { value: 'light', label: 'Light', color: 'bg-cherry-300' },
  { value: 'medium', label: 'Medium', color: 'bg-cherry-500' },
  { value: 'heavy', label: 'Heavy', color: 'bg-burgundy-800' },
];

const TYPE_OPTIONS = [
  { value: 'period', label: 'Period', desc: 'Regular menstrual period' },
  { value: 'perimenopausal', label: 'Perimenopausal', desc: 'Irregular bleeding during transition' },
  { value: 'spotting', label: 'Spotting', desc: 'Light, unexpected spotting' },
  { value: 'postmenopausal', label: 'Postmenopausal', desc: 'Bleeding after 12+ months without period' },
  { value: 'unknown', label: 'Unknown / Unsure', desc: 'Not sure how to classify' },
];

function emptyEvent(): BleedingEvent {
  const d = new Date().toISOString().split('T')[0];
  return {
    id: `be-${Date.now()}`,
    date: d,
    type: 'period',
    flow: 'medium',
    notes: '',
    seekedMedicalAdvice: false,
    createdAt: new Date().toISOString()
  };
}

export const BleedingHistoryView: React.FC = () => {
  const [events, setEvents] = useState<BleedingEvent[]>([]);
  const [editEvent, setEditEvent] = useState<BleedingEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadEvents = async () => {
    const all = await dbService.getAllBleedingEvents();
    setEvents(all);
  };

  useEffect(() => { loadEvents(); }, []);

  const hasPostmenopausal = events.some(e => e.type === 'postmenopausal');

  const handleSave = async () => {
    if (!editEvent) return;
    setIsSaving(true);
    await dbService.saveBleedingEvent(editEvent);
    setIsSaving(false);
    setIsEditing(false);
    loadEvents();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this bleeding record?')) return;
    await dbService.deleteBleedingEvent(id);
    loadEvents();
  };

  if (isEditing && editEvent) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-burgundy-900">
            {editEvent.id.startsWith('be-') && events.find(e => e.id === editEvent.id) ? 'Edit Record' : 'New Record'}
          </h2>
          <button onClick={() => setIsEditing(false)}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-rosepink-200 space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-burgundy-900 block mb-1">Start Date *</label>
              <input type="date" value={editEvent.date}
                onChange={e => setEditEvent(ev => ev ? { ...ev, date: e.target.value } : ev)}
                className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-burgundy-900 block mb-1">End Date</label>
              <input type="date" value={editEvent.endDate || ''}
                onChange={e => setEditEvent(ev => ev ? { ...ev, endDate: e.target.value || undefined } : ev)}
                className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-burgundy-900 block mb-2">Bleeding Type</label>
            <div className="space-y-2">
              {TYPE_OPTIONS.map(t => (
                <label key={t.value} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${editEvent.type === t.value ? 'border-burgundy-800 bg-blush' : 'border-rosepink-200 bg-white hover:bg-blush-50'}`}>
                  <input type="radio" name="type" value={t.value} checked={editEvent.type === t.value}
                    onChange={() => setEditEvent(ev => ev ? { ...ev, type: t.value as BleedingEvent['type'] } : ev)}
                    className="mt-0.5 accent-burgundy-800" />
                  <div>
                    <div className="text-xs font-bold text-burgundy-900">{t.label}</div>
                    <div className="text-[11px] text-gray-500">{t.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Flow */}
          <div>
            <label className="text-xs font-bold text-burgundy-900 block mb-2">Flow Intensity</label>
            <div className="flex gap-2">
              {FLOW_OPTIONS.map(f => (
                <button key={f.value}
                  onClick={() => setEditEvent(ev => ev ? { ...ev, flow: f.value } : ev)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${editEvent.flow === f.value ? 'border-burgundy-800 text-white ' + f.color : 'border-rosepink-200 text-burgundy-900 bg-white'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-burgundy-900 block mb-1">Notes</label>
            <textarea value={editEvent.notes || ''}
              onChange={e => setEditEvent(ev => ev ? { ...ev, notes: e.target.value } : ev)}
              rows={2} placeholder="Associated symptoms, observations..."
              className="w-full px-3 py-2 rounded-xl border border-rosepink-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-burgundy-800/20" />
          </div>

          {/* Sought advice */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editEvent.seekedMedicalAdvice || false}
              onChange={e => setEditEvent(ev => ev ? { ...ev, seekedMedicalAdvice: e.target.checked } : ev)}
              className="accent-burgundy-800" />
            <span className="text-xs text-burgundy-900">I have discussed this with a healthcare provider</span>
          </label>
        </div>

        {editEvent.type === 'postmenopausal' && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800">Seek timely medical assessment</p>
                <p className="text-xs text-red-700 mt-0.5">Any bleeding after 12+ months without a period — including spotting — should be assessed by a healthcare provider. It is usually not serious, but it always needs evaluation.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setIsEditing(false)}
            className="flex-1 py-3 rounded-2xl border border-rosepink-200 text-burgundy-900 font-semibold text-sm">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-burgundy-900">Bleeding History</h2>
          <p className="text-xs text-burgundy-900/60 mt-0.5">Log menstrual and perimenopausal bleeding</p>
        </div>
        <button onClick={() => { setEditEvent(emptyEvent()); setIsEditing(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white text-xs font-bold shadow-sm">
          <Plus className="w-3.5 h-3.5" />
          New Record
        </button>
      </div>

      {/* Postmenopausal alert */}
      {hasPostmenopausal && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-800">Postmenopausal bleeding recorded</p>
              <p className="text-xs text-red-700 mt-0.5">If you have not already done so, please seek a timely medical assessment. Postmenopausal bleeding is usually benign but always requires evaluation.</p>
            </div>
          </div>
        </div>
      )}

      {/* Urgent symptoms notice */}
      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">If you experience very heavy bleeding with weakness, dizziness, fainting, or severe pain — seek urgent medical care immediately.</p>
        </div>
      </div>

      {/* Events list */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-rosepink-200 text-center">
          <Droplets className="w-8 h-8 text-rosepink-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-burgundy-900">No bleeding records yet</p>
          <p className="text-xs text-gray-500 mt-1">Tap "New Record" to log a bleeding event</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const typeColors: Record<string, string> = {
              period: 'bg-cherry-100 text-cherry-800',
              perimenopausal: 'bg-amber-100 text-amber-800',
              spotting: 'bg-rosepink-100 text-rosepink-700',
              postmenopausal: 'bg-red-100 text-red-800',
              unknown: 'bg-gray-100 text-gray-700'
            };
            return (
              <div key={event.id} className={`bg-white rounded-2xl p-4 border ${event.type === 'postmenopausal' ? 'border-red-300' : 'border-rosepink-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-burgundy-900">{event.date}</span>
                      {event.endDate && <span className="text-xs text-gray-500">→ {event.endDate}</span>}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${typeColors[event.type]}`}>
                        {TYPE_OPTIONS.find(t => t.value === event.type)?.label}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rosepink-50 text-burgundy-800 border border-rosepink-200">
                        {event.flow}
                      </span>
                    </div>
                    {event.notes && <p className="text-xs text-gray-600 mt-1">{event.notes}</p>}
                    {event.seekedMedicalAdvice && (
                      <span className="text-[10px] text-green-700 mt-1 block">Discussed with healthcare provider</span>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button onClick={() => { setEditEvent({ ...event }); setIsEditing(true); }}
                      className="p-1.5 rounded-full text-burgundy-800 hover:bg-rosepink-50">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(event.id)}
                      className="p-1.5 rounded-full text-cherry-600 hover:bg-cherry-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-400 text-center">
        Observations are logged as you report them. This app does not diagnose causes of bleeding.
      </p>
    </div>
  );
};
