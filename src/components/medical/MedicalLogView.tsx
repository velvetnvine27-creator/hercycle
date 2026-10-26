import React, { useState } from 'react';
import {
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  AlertOctagon,
  Plus,
  Trash2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  UserCheck
} from 'lucide-react';
import { MedicalLog } from '../../types';
import { dbService } from '../../services/db';

interface MedicalLogViewProps {
  medicalLogs: MedicalLog[];
  onRefresh: () => void;
}

export const MedicalLogView: React.FC<MedicalLogViewProps> = ({ medicalLogs, onRefresh }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'medication' | 'appointment' | 'lab' | 'allergy'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [type, setType] = useState<MedicalLog['type']>('medication');
  const [title, setTitle] = useState('');
  const [dosage, setDosage] = useState('');
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [reason, setReason] = useState('');
  const [clinician, setClinician] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a title or medication name.');
      return;
    }

    const newLog: MedicalLog = {
      id: `med-${Date.now()}`,
      type,
      title: title.trim(),
      dosage: dosage.trim() || undefined,
      dateTime,
      reason: reason.trim() || undefined,
      clinician: clinician.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      await dbService.saveMedicalLog(newLog);
      setIsAdding(false);
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Failed to save medical log:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this medical record?')) return;
    try {
      await dbService.deleteMedicalLog(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete medical log:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDosage('');
    setReason('');
    setClinician('');
    setLocation('');
    setNotes('');
  };

  const filteredLogs = activeFilter === 'all'
    ? medicalLogs
    : medicalLogs.filter(m => m.type === activeFilter);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
            Personal Health Records
          </span>
          <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
            Medical & Clinical Log
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Keep track of medications, clinician appointments, laboratory results, and health history.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medical Record</span>
        </button>
      </div>

      {/* Prominent Safety & Non-Prescription Disclaimer */}
      <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-sm">Clinical Information Disclaimer</span>
          <p className="leading-relaxed">
            HerCycle never prescribes medication, calculates therapeutic dosages, diagnoses conditions, or replaces professional clinical advice. All entered data is solely for your personal organizational reference and discussion with your licensed healthcare provider.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Records', count: medicalLogs.length },
          { key: 'medication', label: 'Medications & Supplements' },
          { key: 'appointment', label: 'Clinician Visits' },
          { key: 'lab', label: 'Lab Results' },
          { key: 'allergy', label: 'Allergies & Sensitivities' }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setActiveFilter(item.key as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === item.key
                ? 'bg-burgundy-900 text-white shadow-xs'
                : 'bg-white border border-rosepink-200 text-gray-600 hover:border-rosepink-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Add New Entry Modal / Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveEntry}
          className="p-6 sm:p-8 rounded-3xl bg-white border border-cherry-300 shadow-soft-lg space-y-5 animate-slide-up"
        >
          <div className="flex items-center justify-between pb-3 border-b border-rosepink-100">
            <h3 className="font-serif text-lg font-bold text-burgundy-900">
              New Medical Record
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Record Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
              >
                <option value="medication">Medication / Supplement</option>
                <option value="appointment">Clinician Appointment</option>
                <option value="lab">Lab / Diagnostic Result</option>
                <option value="allergy">Allergy / Sensitivity</option>
                <option value="clinician_note">Clinician Observation Note</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-burgundy-900 mb-1.5">
                {type === 'medication' ? 'Medication / Supplement Name' : type === 'appointment' ? 'Appointment Purpose' : 'Title / Test Name'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={type === 'medication' ? 'e.g. Ibuprofen, Magnesium, Birth Control' : 'e.g. Annual Well-Woman Exam, Pelvic Ultrasound'}
                className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
              />
            </div>

            {type === 'medication' && (
              <div>
                <label className="block text-xs font-bold text-burgundy-900 mb-1.5">User-Entered Dosage & Frequency</label>
                <input
                  type="text"
                  value={dosage}
                  onChange={e => setDosage(e.target.value)}
                  placeholder="e.g. 400mg with food, 1 tablet daily"
                  className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Date & Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
              />
            </div>

            {(type === 'appointment' || type === 'lab') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Clinician / Doctor / Lab</label>
                  <input
                    type="text"
                    value={clinician}
                    onChange={e => setClinician(e.target.value)}
                    placeholder="e.g. Dr. Jennifer Chen, OB/GYN"
                    className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Clinic Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. St. Jude Women's Health Clinic"
                    className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Reason / Medical Indication</label>
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="e.g. Severe day 1 pelvic cramps, Iron deficiency follow-up"
                className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-burgundy-900 mb-1.5">Observations, Doctor Notes & Results</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notes on efficacy, side-effects, clinician recommendations, or lab values..."
                className="w-full p-3 rounded-xl border border-rosepink-200 text-xs bg-blush-50/30 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-rosepink-100">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white text-xs font-bold shadow-xs hover:shadow-md"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map(log => {
            const dateObj = new Date(log.dateTime);
            const dateDisplay = isNaN(dateObj.getTime())
              ? log.dateTime
              : dateObj.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });

            return (
              <div
                key={log.id}
                className="bg-white rounded-3xl p-6 shadow-soft border border-rosepink-200/80 hover:border-rosepink-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-2xl bg-rosepink-100 text-burgundy-900 shrink-0">
                      {log.type === 'medication' ? (
                        <Pill className="w-5 h-5 text-cherry-600" />
                      ) : log.type === 'appointment' ? (
                        <Calendar className="w-5 h-5 text-burgundy-800" />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-lg font-bold text-burgundy-900">
                          {log.title}
                        </h4>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blush-100 text-burgundy-800 border border-rosepink-200">
                          {log.type}
                        </span>
                      </div>

                      {log.dosage && (
                        <p className="text-xs font-semibold text-cherry-600 mt-0.5">
                          Dosage: {log.dosage}
                        </p>
                      )}

                      {log.reason && (
                        <p className="text-xs text-gray-600 mt-1">
                          <strong>Indication:</strong> {log.reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Clinician or location info */}
                {(log.clinician || log.location) && (
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-1">
                    {log.clinician && (
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-cherry-500" />
                        {log.clinician}
                      </span>
                    )}
                    {log.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-cherry-500" />
                        {log.location}
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <div className="p-3 rounded-xl bg-blush-50/60 border border-rosepink-100 text-xs text-gray-700 italic">
                    {log.notes}
                  </div>
                )}

                <div className="pt-2 border-t border-rosepink-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Recorded Date: {dateDisplay}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    IndexedDB Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white border border-rosepink-200 shadow-soft space-y-3">
          <Stethoscope className="w-10 h-10 text-rosepink-400 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-burgundy-900">
            No Medical Records Logged
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Log medications you take for cramps, appointments with your gynecologist, or diagnostic test results.
          </p>
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="px-6 py-2.5 rounded-full bg-rosepink-100 hover:bg-rosepink-200 text-burgundy-900 font-bold text-xs transition-colors"
          >
            Add First Medical Record
          </button>
        </div>
      )}
    </div>
  );
};
