import React, { useState } from 'react';
import {
  User,
  Settings,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Bell,
  Palette,
  Check,
  AlertTriangle,
  Info,
  Heart
} from 'lucide-react';
import { UserSettings } from '../../types';
import { dbService } from '../../services/db';
import { notificationService } from '../../services/notificationService';
import { generateSampleData } from '../../services/demoData';

interface ProfileViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onDataReload: () => void;
  onOpenDoctorReport: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReload,
  onOpenDoctorReport
}) => {
  // Local form state
  const [nickname, setNickname] = useState(settings.nickname || '');
  const [cycleLength, setCycleLength] = useState(settings.cycleLength || 28);
  const [periodDuration, setPeriodDuration] = useState(settings.periodDuration || 5);
  const [lutealLength, setLutealLength] = useState(settings.lutealLength || 14);
  const [theme, setTheme] = useState(settings.theme || 'burgundy');

  // Reminders
  const [periodDueAlert, setPeriodDueAlert] = useState(settings.reminderPreferences?.periodDue ?? true);
  const [dailyCheckIn, setDailyCheckIn] = useState(settings.reminderPreferences?.dailyCheckIn ?? false);
  const [ovulationAlert, setOvulationAlert] = useState(settings.reminderPreferences?.ovulationAlert ?? true);
  const [productChangeAlert, setProductChangeAlert] = useState(settings.reminderPreferences?.productChange ?? true);

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserSettings = {
      ...settings,
      nickname: nickname.trim() || undefined,
      cycleLength: Number(cycleLength),
      periodDuration: Number(periodDuration),
      lutealLength: Number(lutealLength),
      theme: theme as any,
      reminderPreferences: {
        periodDue: periodDueAlert,
        dailyCheckIn,
        ovulationAlert,
        productChange: productChangeAlert
      },
      updatedAt: new Date().toISOString()
    };

    await dbService.saveSettings(updated);
    onUpdateSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Export JSON
  const handleExportData = async () => {
    try {
      const jsonStr = await dbService.exportAllDataJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `hercycle-backup-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data.');
    }
  };

  // Import JSON
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const content = event.target?.result as string;
        const result = await dbService.importDataJSON(content);
        if (result.success) {
          setImportStatus(`Success! ${result.message}`);
          onDataReload();
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus(`Import Failed: ${result.message}`);
        }
      } catch (err: any) {
        setImportStatus(`Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Load Demo Data
  const handleLoadDemo = async () => {
    if (!window.confirm('Load 3 months of realistic sample demo data (cycles, symptoms, moods, medications)? This will merge with your existing records.')) {
      return;
    }

    try {
      const sample = generateSampleData();
      await dbService.saveSettings(sample.settings);

      for (const p of sample.periodLogs) {
        await dbService.savePeriodLog(p);
      }
      for (const s of sample.symptomLogs) {
        await dbService.saveSymptomLog(s);
      }
      for (const m of sample.moodLogs) {
        await dbService.saveMoodLog(m);
      }
      for (const med of sample.medicalLogs) {
        await dbService.saveMedicalLog(med);
      }

      onDataReload();
      alert('Demo data loaded successfully! Explore the Calendar, Insights, and Dashboard.');
    } catch (err) {
      console.error('Error loading demo data:', err);
    }
  };

  // Wipe All Data
  const handleWipeAll = async () => {
    const confirmed = window.confirm(
      'Are you completely sure you want to permanently delete all personal data, cycle history, and notes from this browser? This cannot be undone.'
    );
    if (!confirmed) return;

    try {
      await dbService.clearAllData();
      onDataReload();
      alert('All local HerCycle records have been permanently cleared.');
    } catch (err) {
      console.error('Failed to wipe data:', err);
    }
  };

  const handleTestNotification = async () => {
    await notificationService.requestPermission();
    notificationService.sendNotification(
      'HerCycle Test Notification 🌸',
      'Reminders and in-app alerts are active and functioning!',
      'info'
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">
          Preferences & Data Governance
        </span>
        <h1 className="font-serif text-3xl font-bold text-burgundy-900 mt-1">
          Profile & Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your cycle baseline, privacy preferences, local backups, and data export.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-rosepink-100">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-cherry-600" />
            <h2 className="font-serif text-xl font-bold text-burgundy-900">
              Cycle Parameters
            </h2>
          </div>

          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Check className="w-4 h-4" />
              Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-burgundy-900 mb-1.5">
              Preferred Name / Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="e.g. Maya"
              className="w-full px-4 py-2.5 rounded-xl border border-rosepink-200 text-xs bg-blush-50/20 focus:outline-none focus:ring-2 focus:ring-cherry-500/20"
            />
          </div>

          {/* Average Cycle Length */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-burgundy-900">Average Cycle Length</label>
              <span className="text-xs font-bold text-cherry-600">{cycleLength} days</span>
            </div>
            <input
              type="range"
              min="20"
              max="45"
              value={cycleLength}
              onChange={e => setCycleLength(Number(e.target.value))}
              className="w-full accent-cherry-500 cursor-pointer"
            />
          </div>

          {/* Period Duration */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-burgundy-900">Bleeding Duration</label>
              <span className="text-xs font-bold text-cherry-600">{periodDuration} days</span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={periodDuration}
              onChange={e => setPeriodDuration(Number(e.target.value))}
              className="w-full accent-cherry-500 cursor-pointer"
            />
          </div>

          {/* Luteal Phase Length */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-burgundy-900">
                Luteal Phase Duration (Days before period)
              </label>
              <span className="text-xs font-bold text-cherry-600">{lutealLength} days</span>
            </div>
            <input
              type="range"
              min="10"
              max="18"
              value={lutealLength}
              onChange={e => setLutealLength(Number(e.target.value))}
              className="w-full accent-cherry-500 cursor-pointer"
            />
            <span className="text-[10px] text-gray-400 block mt-1">
              Standard clinical default is 14 days (ovulation = cycle length − luteal length).
            </span>
          </div>
        </div>

        {/* Reminders section */}
        <div className="pt-6 border-t border-rosepink-100 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-base font-bold text-burgundy-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-cherry-600" />
              <span>Reminder Preferences</span>
            </h3>
            <button
              type="button"
              onClick={handleTestNotification}
              className="text-xs text-cherry-600 hover:underline font-semibold"
            >
              Test Notification Sound
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="p-3 rounded-2xl border border-rosepink-100 flex items-center justify-between cursor-pointer hover:bg-blush-50/50">
              <div>
                <span className="font-bold text-burgundy-900 block">Period Due Alert</span>
                <span className="text-gray-500 text-[11px]">Notice 2 days before predicted start</span>
              </div>
              <input
                type="checkbox"
                checked={periodDueAlert}
                onChange={e => setPeriodDueAlert(e.target.checked)}
                className="w-4 h-4 accent-cherry-500 rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl border border-rosepink-100 flex items-center justify-between cursor-pointer hover:bg-blush-50/50">
              <div>
                <span className="font-bold text-burgundy-900 block">Daily Evening Check-in</span>
                <span className="text-gray-500 text-[11px]">Prompt to log mood and symptoms</span>
              </div>
              <input
                type="checkbox"
                checked={dailyCheckIn}
                onChange={e => setDailyCheckIn(e.target.checked)}
                className="w-4 h-4 accent-cherry-500 rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl border border-rosepink-100 flex items-center justify-between cursor-pointer hover:bg-blush-50/50">
              <div>
                <span className="font-bold text-burgundy-900 block">Fertile Window Notification</span>
                <span className="text-gray-500 text-[11px]">Estimated ovulation & fertile days</span>
              </div>
              <input
                type="checkbox"
                checked={ovulationAlert}
                onChange={e => setOvulationAlert(e.target.checked)}
                className="w-4 h-4 accent-cherry-500 rounded cursor-pointer"
              />
            </label>

            <label className="p-3 rounded-2xl border border-rosepink-100 flex items-center justify-between cursor-pointer hover:bg-blush-50/50">
              <div>
                <span className="font-bold text-burgundy-900 block">Product Change Reminder</span>
                <span className="text-gray-500 text-[11px]">Alerts for tampon/pad/cup timer</span>
              </div>
              <input
                type="checkbox"
                checked={productChangeAlert}
                onChange={e => setProductChangeAlert(e.target.checked)}
                className="w-4 h-4 accent-cherry-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-rosepink-100">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-bold text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Doctor Visit Clinical Report Card */}
      <div className="bg-gradient-to-r from-rosepink-100 to-blush-100 rounded-3xl p-6 sm:p-7 border border-rosepink-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-white text-burgundy-900 shadow-xs shrink-0">
            <Heart className="w-6 h-6 text-cherry-600" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-burgundy-900">
              Doctor Visit Summary Report
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 max-w-lg">
              Generate a clean, printable clinical summary sheet of your cycle intervals, symptoms, and medications formatted for your OB/GYN appointment.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenDoctorReport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          <span>View & Print Report</span>
        </button>
      </div>

      {/* Local Data Management & Backups */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-rosepink-200/80 space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-burgundy-900">
            Local Data Governance & Portability
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            You own 100% of your data. Backup or restore anytime without cloud lock-in.
          </p>
        </div>

        {importStatus && (
          <div className="p-3 rounded-2xl bg-blush text-burgundy-900 text-xs font-semibold border border-rosepink-200">
            {importStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportData}
            className="p-4 rounded-2xl border border-rosepink-200 hover:border-cherry-500 hover:bg-blush-50/50 transition-all text-left space-y-1.5 flex flex-col justify-between"
          >
            <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800 w-fit">
              <Download className="w-5 h-5 text-cherry-600" />
            </div>
            <div>
              <span className="font-bold text-xs text-burgundy-900 block">Export Backup JSON</span>
              <span className="text-[11px] text-gray-500">Download formatted JSON backup to your device</span>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl border border-rosepink-200 hover:border-cherry-500 hover:bg-blush-50/50 transition-all text-left space-y-1.5 flex flex-col justify-between cursor-pointer">
            <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800 w-fit">
              <Upload className="w-5 h-5 text-cherry-600" />
            </div>
            <div>
              <span className="font-bold text-xs text-burgundy-900 block">Import Backup JSON</span>
              <span className="text-[11px] text-gray-500">Restore your previously saved JSON file</span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Load Sample Demo Data */}
          <button
            type="button"
            onClick={handleLoadDemo}
            className="p-4 rounded-2xl border border-rosepink-200 hover:border-cherry-500 hover:bg-blush-50/50 transition-all text-left space-y-1.5 flex flex-col justify-between"
          >
            <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800 w-fit">
              <RefreshCw className="w-5 h-5 text-cherry-600" />
            </div>
            <div>
              <span className="font-bold text-xs text-burgundy-900 block">Load Demo Data</span>
              <span className="text-[11px] text-gray-500">Populate realistic 3-month cycle sample</span>
            </div>
          </button>
        </div>

        {/* Clear All Data */}
        <div className="pt-4 border-t border-rosepink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-rose-700 block">Danger Zone</span>
            <span className="text-[11px] text-gray-500">Erase all IndexedDB tables, period logs, moods, and settings</span>
          </div>

          <button
            type="button"
            onClick={handleWipeAll}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-50 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Personal Data</span>
          </button>
        </div>
      </div>

      {/* Privacy Architecture Declaration */}
      <div className="p-6 rounded-3xl bg-blush-50/60 border border-rosepink-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-serif text-base font-bold text-burgundy-900">
            Privacy & Technical Storage Architecture
          </h3>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          HerCycle is an offline Progressive Web Application (PWA). All calculations, phase predictions, symptom records, and private journals are processed and stored exclusively inside your browser's persistent <strong>IndexedDB</strong> storage.
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Important storage disclaimer:</strong> Browser IndexedDB is retained locally on your computer/phone. It does not synchronize automatically across devices, and clearing your browser cache/site data will remove it unless you export a JSON backup. Browser storage is not equivalent to HIPAA-compliant encrypted hospital cloud storage; we encourage you to keep your personal device passcode-protected.
        </p>
      </div>
    </div>
  );
};
