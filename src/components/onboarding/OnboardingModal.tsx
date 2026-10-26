import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Heart,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  User,
  Bell,
  Thermometer,
  Moon,
  Brain,
  Activity,
  Sparkles
} from 'lucide-react';
import { UserSettings, CycleRegularity, MenopauseStage } from '../../types';
import { formatDate } from '../../services/cycleEngine';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: UserSettings) => void;
}

const STAGE_OPTIONS: Array<{
  key: MenopauseStage;
  title: string;
  desc: string;
  badge: string;
}> = [
  {
    key: 'menstrual',
    title: 'Menstrual Cycle Tracking',
    desc: 'Track menstrual phases, flow, fertile window, ovulation, and monthly bodily rhythms.',
    badge: 'Cycles & Fertility'
  },
  {
    key: 'perimenopause',
    title: 'Perimenopause',
    desc: 'Navigate changing cycles, hot flashes, night sweats, sleep changes, and hormonal fluctuations.',
    badge: 'Transition'
  },
  {
    key: 'menopause',
    title: 'Menopause',
    desc: '12+ consecutive months since your last period. Track symptoms, sleep, and long-term vitality.',
    badge: '12+ Months No Period'
  },
  {
    key: 'postmenopause',
    title: 'Postmenopause',
    desc: 'Ongoing wellness beyond menopause: bone density, heart health, intimate comfort, and vitality.',
    badge: 'Long-term Health'
  },
  {
    key: 'combined',
    title: 'Combined Women\'s Health Tracking',
    desc: 'Comprehensive tracking across periods, transition symptoms, mental wellness, and clinical logs.',
    badge: 'Holistic'
  },
  {
    key: 'not_sure',
    title: 'Not Sure Yet',
    desc: 'Discover your bodily patterns and log what you experience without committing to a specific label.',
    badge: 'Exploration'
  }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [stage, setStage] = useState<MenopauseStage>('menstrual');
  const [nickname, setNickname] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return formatDate(d);
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [regularity, setRegularity] = useState<CycleRegularity>('regular');
  const [cycleChanges, setCycleChanges] = useState<string>('regular');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'hot_flashes',
    'sleep',
    'mood'
  ]);
  const [reminderPeriodDue, setReminderPeriodDue] = useState(true);
  const [reminderCheckIn, setReminderCheckIn] = useState(true);
  const [reminderOvulation, setReminderOvulation] = useState(true);
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(true);

  if (!isOpen) return null;

  const isMenopauseTrack = stage !== 'menstrual';
  const totalSteps = 5;

  const toggleConcern = (key: string) => {
    setSelectedConcerns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleFinish = () => {
    const newSettings: UserSettings = {
      onboardingCompleted: true,
      nickname: nickname.trim() || undefined,
      lastPeriodDate: lastPeriodDate || undefined,
      cycleLength: Number(cycleLength) || 28,
      periodDuration: Number(periodDuration) || 5,
      lutealLength: 14,
      regularity,
      menopauseStage: stage,
      menopauseOnboardingCompleted: true,
      lastMenstrualPeriod: lastPeriodDate || undefined,
      reminderPreferences: {
        periodDue: reminderPeriodDue,
        dailyCheckIn: reminderCheckIn,
        ovulationAlert: stage === 'menstrual' ? reminderOvulation : false,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-burgundy-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-soft-lg border border-rosepink-200 overflow-hidden animate-slide-up my-auto flex flex-col max-h-[92dvh]">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-burgundy-800 to-cherry-600 px-6 py-5 text-white text-center relative overflow-hidden shrink-0">
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <img
              src="/hercycle-logo.png"
              alt="HER CYCLE"
              className="w-10 h-10 object-contain drop-shadow"
            />
            <h2 className="font-serif text-2xl font-bold tracking-tight">Welcome to HER CYCLE</h2>
          </div>
          <p className="text-rosepink-100 text-xs max-w-sm mx-auto">
            Your private, non-commercial, offline health sanctuary.
          </p>

          {/* Step Progress Indicators */}
          <div className="flex justify-center items-center gap-2 mt-3">
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
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 modal-scroll">
          {/* STEP 1: Life Stage Selection */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 1 of 5</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Choose Your Journey</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Select your current health focus. You can freely change this anytime in Profile settings. We never determine your stage from age or symptoms alone.
                </p>
              </div>

              <div className="space-y-2.5">
                {STAGE_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStage(opt.key)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                      stage === opt.key
                        ? 'bg-rosepink-100/90 border-cherry-500 shadow-xs'
                        : 'bg-white border-rosepink-200/90 hover:border-rosepink-300 hover:bg-blush-50/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-burgundy-900">{opt.title}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white text-burgundy-800 border border-rosepink-200">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      stage === opt.key ? 'border-cherry-600 bg-cherry-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {stage === opt.key && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Name & Period Date */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 2 of 5</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Profile & Baseline Date</h3>
                <p className="text-xs text-gray-600 mt-1">
                  All details are optional. Stored strictly in your browser's local IndexedDB.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-burgundy-900 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cherry-500" />
                    Preferred Name / Nickname (Optional)
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
                    {isMenopauseTrack ? 'Approximate Date of Last Menstrual Period (Optional)' : 'When did your last period begin? (Optional)'}
                  </label>
                  <input
                    type="date"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-rosepink-200 focus:outline-none focus:ring-2 focus:ring-cherry-500/30 focus:border-cherry-500 text-sm bg-blush-50/30"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    {isMenopauseTrack
                      ? 'Helpful for estimating transition milestones. You can leave blank if you do not recall.'
                      : 'If not sure, estimate or skip — you can log anytime.'}
                  </p>
                </div>

                {isMenopauseTrack && (
                  <div>
                    <label className="block text-xs font-semibold text-burgundy-900 mb-1.5">
                      Recent Menstrual Bleeding Changes (Optional)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'regular', label: 'Still regular or mostly predictable' },
                        { key: 'irregular', label: 'Skipping months or spacing out' },
                        { key: 'flow_changes', label: 'Noticeably heavier or lighter' },
                        { key: 'stopped', label: 'No bleeding for over 12 months' }
                      ].map(item => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setCycleChanges(item.key)}
                          className={`p-3 rounded-xl border text-left font-medium transition-all ${
                            cycleChanges === item.key
                              ? 'bg-rosepink-100 border-cherry-500 text-burgundy-900 font-bold'
                              : 'bg-white border-rosepink-200 text-gray-700 hover:border-rosepink-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Cycle Timing OR Menopause Focus */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 3 of 5</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">
                  {isMenopauseTrack ? 'Key Health Concerns to Monitor' : 'Your Cycle Baseline'}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {isMenopauseTrack
                    ? 'Select the primary sensations and patterns you wish to focus on. All can be edited anytime.'
                    : 'Typical menstrual cycles range from 21 to 35 days. We calibrate automatically with each log.'}
                </p>
              </div>

              {!isMenopauseTrack ? (
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
                      <span>20 days</span>
                      <span>28 days (Average)</span>
                      <span>45 days</span>
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
                      Cycle Regularity
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
              ) : (
                <div className="space-y-2.5">
                  {[
                    { key: 'hot_flashes', label: 'Hot Flashes & Night Sweats', icon: <Thermometer className="w-4 h-4 text-cherry-600" /> },
                    { key: 'sleep', label: 'Sleep Disturbances & Night Awakenings', icon: <Moon className="w-4 h-4 text-indigo-500" /> },
                    { key: 'mood', label: 'Mood Shifts, Irritability & Anxiety', icon: <Heart className="w-4 h-4 text-rose-500" /> },
                    { key: 'brain_fog', label: 'Brain Fog & Concentration Changes', icon: <Brain className="w-4 h-4 text-purple-500" /> },
                    { key: 'joints', label: 'Joint Aches & Muscle Fatigue', icon: <Activity className="w-4 h-4 text-amber-600" /> },
                    { key: 'urogenital', label: 'Vaginal Dryness & Intimate Comfort', icon: <Sparkles className="w-4 h-4 text-cherry-500" /> }
                  ].map(item => {
                    const active = selectedConcerns.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleConcern(item.key)}
                        className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
                          active
                            ? 'bg-rosepink-100/80 border-cherry-500 font-bold text-burgundy-900 shadow-xs'
                            : 'bg-white border-rosepink-200 text-gray-700 hover:border-rosepink-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          active ? 'bg-cherry-600 border-cherry-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {active && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Reminder Preferences */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 4 of 5</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Reminders & Check-ins</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Optional reminders to support your daily wellness. You can edit or disable them anytime.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border border-rosepink-200 bg-white hover:bg-blush-50/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800">
                      <Bell className="w-5 h-5 text-cherry-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-burgundy-900">Daily Evening Check-in</p>
                      <p className="text-xs text-gray-500">A gentle prompt to log symptoms, sleep, and private reflections.</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminderCheckIn}
                    onChange={(e) => setReminderCheckIn(e.target.checked)}
                    className="w-5 h-5 accent-cherry-500 rounded cursor-pointer"
                  />
                </label>

                {!isMenopauseTrack && (
                  <>
                    <label className="flex items-center justify-between p-4 rounded-2xl border border-rosepink-200 bg-white hover:bg-blush-50/50 cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-rosepink-100 text-burgundy-800">
                          <Calendar className="w-5 h-5 text-cherry-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-burgundy-900">Period Prediction Alert</p>
                          <p className="text-xs text-gray-500">Notifies you 2 days prior to expected bleeding start.</p>
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
                          <Heart className="w-5 h-5 text-cherry-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-burgundy-900">Fertile Window & Ovulation Estimate</p>
                          <p className="text-xs text-gray-500">Estimates hormonal shifts and peak fertility for body literacy.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={reminderOvulation}
                        onChange={(e) => setReminderOvulation(e.target.checked)}
                        className="w-5 h-5 accent-cherry-500 rounded cursor-pointer"
                      />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Privacy & Medical Safeguards */}
          {step === 5 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-cherry-600">Step 5 of 5</span>
                <h3 className="font-serif text-xl font-bold text-burgundy-900 mt-0.5">Privacy & Medical Safeguards</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Our core commitment to your dignity, medical transparency, and digital autonomy.
                </p>
              </div>

              <div className="space-y-3">
                {/* 100% Local Device Storage */}
                <div className="p-4 rounded-2xl bg-rosepink-50 border border-rosepink-200 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-cherry-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-burgundy-900 leading-relaxed">
                    <p className="font-bold text-sm text-burgundy-950 mb-0.5">100% Local Device Storage</p>
                    All health entries, logs, and reflections reside solely on this device in IndexedDB. Zero cloud uploads, no tracking pixels, and no data sales.
                  </div>
                </div>

                {/* Educational Notice */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <p className="font-bold text-sm text-amber-900 mb-0.5">Clinical Disclaimer</p>
                    HER CYCLE does not provide clinical diagnoses, prescribe medications, or offer contraceptive guarantees. Menopause stage is user-selected, never diagnosed from age or symptoms alone.
                  </div>
                </div>

                {/* Postmenopausal Bleeding Alert */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-950 leading-relaxed">
                    <p className="font-bold text-sm text-rose-900 mb-0.5">Postmenopausal Bleeding Alert</p>
                    Any vaginal bleeding or spotting occurring after 12 consecutive months without a period warrants prompt medical assessment by a healthcare clinician.
                  </div>
                </div>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-rosepink-200 bg-blush-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedDisclaimer}
                    onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                    className="w-4 h-4 accent-cherry-600 rounded mt-0.5 cursor-pointer"
                  />
                  <span className="text-xs text-gray-700">
                    I understand that HER CYCLE is a personal tracking tool and that medical decisions must be guided by a qualified healthcare professional.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 bg-blush-50 border-t border-rosepink-100 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-rosepink-200 text-burgundy-900 text-xs font-semibold hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!acceptedDisclaimer}
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cherry-500 to-burgundy-800 text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Start HER CYCLE</span>
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
