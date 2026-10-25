import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  Heart,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  User,
  Bell
} from 'lucide-react';
import { UserSettings, CycleRegularity } from '../../types';
import { formatDate } from '../../services/cycleEngine';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: UserSettings) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [nickname, setNickname] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    // Default to roughly 14 days ago
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return formatDate(d);
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [regularity, setRegularity] = useState<CycleRegularity>('regular');
  const [reminderPeriodDue, setReminderPeriodDue] = useState(true);
  const [reminderCheckIn, setReminderCheckIn] = useState(false);
  const [reminderOvulation, setReminderOvulation] = useState(true);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(true);

  if (!isOpen) return null;

  const handleFinish = () => {
    const newSettings: UserSettings = {
      onboardingCompleted: true,
      nickname: nickname.trim() || undefined,
      lastPeriodDate: lastPeriodDate || undefined,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      lutealLength: 14,
      regularity,
      reminderPreferences: {
        periodDue: reminderPeriodDue,
        dailyCheckIn: reminderCheckIn,
        ovulationAlert: reminderOvulation,
        productChange: true,
        checkInTime: '20:00'
      },
      theme: 'burgundy',
      waterGoalGlasses: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onComplete(newSettings);
  };

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-burgundy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-burgundy-800 to-cherry-600 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/10 rounded-full blur-sm pointer-events-none" />
          <div className="w-12 h-12 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-xs">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight">Welcome to Bloom Cycle</h2>
          <p className="text-rosepink-100 text-xs mt-1 max-w-sm mx-auto">
            Your private, non-commercial, offline menstrual sanctuary.
          </p>

          {/* Step Progress Indicators */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === i + 1 ? 'w-8 bg-white' : i + 1 < step ? 'w-4 bg-rosepink-300' : 'w-4 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: Nickname & Last Period */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 1 of 4</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Let's get acquainted</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Tell us a bit about your cycle. Everything stays strictly inside your browser.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-burgundy-900 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cherry-500" />
                    What should we call you? (Optional)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Maya, Elena, Friend"
                    className="w-full px-4 py-3 rounded-2xl border border-rosepink-200 focus:outline-none focus:ring-2 focus:ring-cherry-500/30 focus:border-cherry-500 text-sm bg-blush-50/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-burgundy-900 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cherry-500" />
                    When did your last period begin? (Optional)
                  </label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-rosepink-200 focus:outline-none focus:ring-2 focus:ring-cherry-500/30 focus:border-cherry-500 text-sm bg-blush-50/30"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    If you're not sure, you can estimate or skip and log whenever your next period starts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cycle & Period Lengths */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 2 of 4</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Your Cycle Timing</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Typical menstrual cycles range from 21 to 35 days. We will adjust automatically as you log real periods.
                </p>
              </div>

              <div className="space-y-5">
                {/* Average Cycle Length */}
                <div className="bg-blush-50/50 p-4 rounded-2xl border border-rosepink-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-burgundy-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cherry-500" />
                      Average Cycle Length
                    </label>
                    <span className="text-sm font-bold text-burgundy-800 bg-white px-3 py-1 rounded-full shadow-xs border border-rosepink-200">
                      {cycleLength} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>20 days (Shorter)</span>
                    <span>28 days (Average)</span>
                    <span>45 days (Longer)</span>
                  </div>
                </div>

                {/* Period Duration */}
                <div className="bg-blush-50/50 p-4 rounded-2xl border border-rosepink-200">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-burgundy-900 flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-cherry-500" />
                      Bleeding Duration
                    </label>
                    <span className="text-sm font-bold text-burgundy-800 bg-white px-3 py-1 rounded-full shadow-xs border border-rosepink-200">
                      {periodDuration} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={periodDuration}
                    onChange={(e) => setPeriodDuration(Number(e.target.value))}
                    className="w-full accent-cherry-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>2 days</span>
                    <span>5 days (Standard)</span>
                    <span>10 days</span>
                  </div>
                </div>

                {/* Regularity */}
                <div>
                  <label className="block text-xs font-semibold text-burgundy-900 mb-2">
                    How regular are your cycles typically?
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'regular', label: 'Regular (± 2 days)' },
                      { key: 'somewhat_irregular', label: 'Somewhat Irregular' },
                      { key: 'very_irregular', label: 'Very Irregular' },
                      { key: 'not_sure', label: 'Not Sure / Tracking' }
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setRegularity(item.key as CycleRegularity)}
                        className={`p-3 rounded-xl border text-left font-medium transition-all ${
                          regularity === item.key
                            ? 'bg-rosepink-100 border-cherry-500 text-burgundy-900 font-bold shadow-xs'
                            : 'bg-white border-rosepink-200 text-gray-600 hover:border-rosepink-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Reminder Preferences */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 3 of 4</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Reminders & Alerts</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose optional in-app and browser notifications. You can change these anytime in Profile.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-rosepink-200 bg-white hover:bg-blush-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-burgundy-900">Period Prediction Alert</p>
                      <p className="text-xs text-gray-500">Notifies you 2 days before your expected period starts.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderPeriodDue}
                    onChange={(e) => setReminderPeriodDue(e.target.checked)}
                    className="w-5 h-5 accent-cherry-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-rosepink-200 bg-white hover:bg-blush-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-burgundy-900">Fertile Window & Ovulation</p>
                      <p className="text-xs text-gray-500">Estimates peak fertility days for body awareness.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderOvulation}
                    onChange={(e) => setReminderOvulation(e.target.checked)}
                    className="w-5 h-5 accent-cherry-500 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border border-rosepink-200 bg-white hover:bg-blush-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-burgundy-900">Daily Evening Check-in</p>
                      <p className="text-xs text-gray-500">Gentle prompt to log daily moods, symptoms, and self-care.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderCheckIn}
                    onChange={(e) => setReminderCheckIn(e.target.checked)}
                    className="w-5 h-5 accent-cherry-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Privacy & Medical Limitations */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 4 of 4</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Privacy & Medical Notice</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our core commitment to your dignity, digital autonomy, and health safety.
                </p>
              </div>

              <div className="space-y-3.5">
                {/* Privacy Card */}
                <div className="p-4 rounded-2xl bg-rosepink-50 border border-rosepink-200 flex gap-3.5">
                  <ShieldCheck className="w-6 h-6 text-cherry-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-burgundy-900 leading-relaxed">
                    <p className="font-bold text-sm text-burgundy-950 mb-1">100% Local Device Storage</p>
                    Your health observations, moods, and notes are stored strictly in your browser's local IndexedDB. No cloud databases, no analytics trackers, and no data sales. Ever.
                  </div>
                </div>

                {/* Medical Disclaimer Card */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3.5">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <p className="font-bold text-sm text-amber-900 mb-1">Educational Predictions Only</p>
                    Cycle phases and fertile windows are statistical estimates. <strong>Never rely on Bloom Cycle predictions as contraception</strong> or as a guarantee against pregnancy. This app does not diagnose conditions or replace professional gynecological care.
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-rosepink-200 bg-blush-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="w-5 h-5 accent-cherry-500 rounded mt-0.5 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-gray-700 leading-tight">
                    I understand that predictions are statistical estimates and not medical or contraception advice, and that my data resides exclusively on my device.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-rosepink-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-burgundy-900/70 hover:text-burgundy-900 hover:bg-rosepink-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-4"
              >
                Skip setup with defaults
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white font-medium text-xs shadow-md shadow-cherry-500/25 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!acceptedDisclaimer}
                onClick={handleFinish}
                className={`flex items-center gap-2 px-7 py-3 rounded-full text-white font-medium text-sm shadow-md transition-all ml-auto ${
                  acceptedDisclaimer
                    ? 'bg-gradient-to-r from-cherry-500 to-burgundy-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Start Bloom Cycle</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
