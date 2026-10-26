import React, { useState, useEffect, useCallback } from 'react';
import {
  UserSettings,
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  CurrentPhaseInfo,
  MenopauseSymptomEntry,
  BleedingEvent
} from './types';
import { dbService } from './services/db';
import { authService } from './services/authService';
import { formatDate, getCurrentPhaseInfo } from './services/cycleEngine';
import { notificationService, InAppNotification } from './services/notificationService';
import { Navbar, NavTab } from './components/common/Navbar';
import { AuthScreen } from './components/auth/AuthScreen';
import { Dashboard } from './components/home/Dashboard';
import { PeriodCalendar } from './components/calendar/PeriodCalendar';
import { DayDetailModal } from './components/calendar/DayDetailModal';
import { InsightsView } from './components/insights/InsightsView';
import { MoodJournalView } from './components/journal/MoodJournalView';
import { MedicalLogView } from './components/medical/MedicalLogView';
import { HygieneView } from './components/hygiene/HygieneView';
import { EducationView } from './components/education/EducationView';
import { ProfileView } from './components/profile/ProfileView';
import { DoctorReportModal } from './components/profile/DoctorReportModal';
import { QuickLogModal } from './components/tracker/QuickLogModal';
import { ReminderModal } from './components/reminders/ReminderModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { MenopauseSymptomView } from './components/menopause/MenopauseSymptomView';
import { BleedingHistoryView } from './components/menopause/BleedingHistoryView';
import { AskHerAssistant } from './components/menopause/AskHerAssistant';
import { IOSInstallBanner } from './components/common/IOSInstallBanner';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const todayStr = formatDate(new Date());

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [educationInitialArticle, setEducationInitialArticle] = useState<string | undefined>();

  // Modals
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickLogDate, setQuickLogDate] = useState(todayStr);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
  const [detailDate, setDetailDate] = useState<string>(todayStr);
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState(false);

  // App Data
  const [settings, setSettings] = useState<UserSettings>({
    onboardingCompleted: false,
    cycleLength: 28,
    periodDuration: 5,
    lutealLength: 14,
    regularity: 'regular',
    reminderPreferences: { periodDue: true, dailyCheckIn: false, ovulationAlert: true, productChange: true },
    theme: 'burgundy',
    waterGoalGlasses: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [medicalLogs, setMedicalLogs] = useState<MedicalLog[]>([]);
  const [menopauseSymptoms, setMenopauseSymptoms] = useState<MenopauseSymptomEntry[]>([]);
  const [bleedingEvents, setBleedingEvents] = useState<BleedingEvent[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    authService.isRegistered().then(registered => {
      if (!registered) {
        // First time user — go directly to register (no PIN gate yet)
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(authService.isSessionAuthenticated());
      }
      setIsCheckingAuth(false);
    });
  }, []);

  const reloadData = useCallback(async () => {
    try {
      const [savedSettings, pLogs, sLogs, mLogs, medLogs, msLogs, beLogs] = await Promise.all([
        dbService.getSettings(),
        dbService.getAllPeriodLogs(),
        dbService.getAllSymptomLogs(),
        dbService.getAllMoodLogs(),
        dbService.getAllMedicalLogs(),
        dbService.getAllMenopauseSymptoms(),
        dbService.getAllBleedingEvents()
      ]);

      if (savedSettings) {
        setSettings(savedSettings);
        if (!savedSettings.onboardingCompleted) setIsOnboardingOpen(true);
      } else {
        setIsOnboardingOpen(true);
      }

      setPeriodLogs(pLogs);
      setSymptomLogs(sLogs);
      setMoodLogs(mLogs);
      setMedicalLogs(medLogs);
      setMenopauseSymptoms(msLogs);
      setBleedingEvents(beLogs);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      reloadData();
      const unsubscribe = notificationService.subscribe(n => setNotifications(n));
      return () => unsubscribe();
    }
  }, [isAuthenticated, reloadData]);

  const handleOnboardingComplete = async (newSettings: UserSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
    setIsOnboardingOpen(false);
    if (newSettings.lastPeriodDate) {
      const initialLog: PeriodLog = {
        id: `p-${newSettings.lastPeriodDate}`,
        date: newSettings.lastPeriodDate,
        flow: 'medium',
        isStart: true,
        createdAt: new Date().toISOString()
      };
      await dbService.savePeriodLog(initialLog);
    }
    notificationService.sendNotification(
      'Welcome to HER CYCLE',
      'Your health sanctuary is ready. All data stays 100% private on your device.',
      'info'
    );
    reloadData();
  };

  const phaseInfo: CurrentPhaseInfo = getCurrentPhaseInfo(todayStr, periodLogs, settings);
  const todayPeriodLog = periodLogs.find(p => p.date === todayStr) || null;
  const todaySymptoms = symptomLogs.filter(s => s.date === todayStr);
  const todayMoodLog = moodLogs.find(m => m.date === todayStr) || null;

  const handleOpenQuickLog = (dateStr?: string) => {
    setQuickLogDate(dateStr || todayStr);
    setIsQuickLogOpen(true);
  };

  const handleCalendarSelectDate = (dateStr: string) => {
    setDetailDate(dateStr);
    setIsDayDetailOpen(true);
  };

  const handleDeleteDay = async (dateStr: string) => {
    if (!window.confirm(`Delete all entries for ${dateStr}?`)) return;
    await dbService.deletePeriodLog(dateStr);
    await dbService.deleteMoodLog(dateStr);
    const syms = await dbService.getSymptomLogsByDate(dateStr);
    for (const s of syms) await dbService.deleteSymptomLog(s.id);
    reloadData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // ── Loading / Auth screens ──────────────────────────────────────────────
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-burgundy-800 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4">
          <img src="/hercycle-logo.png" alt="HER CYCLE" className="w-16 h-16 object-contain mx-auto animate-pulse" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-burgundy-900">HER CYCLE</h2>
        <p className="text-xs text-burgundy-900/60 mt-1">Preparing your private health store...</p>
      </div>
    );
  }

  const detailPeriodLog = periodLogs.find(p => p.date === detailDate) || null;
  const detailSymptoms = symptomLogs.filter(s => s.date === detailDate);
  const detailMoodLog = moodLogs.find(m => m.date === detailDate) || null;
  const detailMedicalLogs = medicalLogs.filter(m => m.dateTime.startsWith(detailDate));

  return (
    <div className="min-h-screen bg-cream text-gray-800 flex flex-col selection:bg-rosepink-200">
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onOpenQuickLog={() => handleOpenQuickLog(todayStr)}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsReminderModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 content-safe-bottom md:pb-12">
        {activeTab === 'home' && (
          <Dashboard
            phaseInfo={phaseInfo}
            settings={settings}
            todayPeriodLog={todayPeriodLog}
            todaySymptoms={todaySymptoms}
            todayMoodLog={todayMoodLog}
            onOpenQuickLog={handleOpenQuickLog}
            onNavigateToCalendar={() => setActiveTab('calendar')}
            onNavigateToHygiene={() => setActiveTab('hygiene')}
            onNavigateToEducation={(artId) => { setEducationInitialArticle(artId); setActiveTab('education'); }}
          />
        )}
        {activeTab === 'calendar' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <PeriodCalendar
              periodLogs={periodLogs}
              symptomLogs={symptomLogs}
              moodLogs={moodLogs}
              settings={settings}
              onSelectDate={handleCalendarSelectDate}
            />
          </div>
        )}
        {activeTab === 'insights' && (
          <InsightsView
            periodLogs={periodLogs}
            symptomLogs={symptomLogs}
            moodLogs={moodLogs}
            settings={settings}
            menopauseSymptoms={menopauseSymptoms}
            bleedingEvents={bleedingEvents}
          />
        )}
        {activeTab === 'journal' && (
          <MoodJournalView moodLogs={moodLogs} onOpenLogModal={handleOpenQuickLog} onDeleteMoodLog={handleDeleteDay} />
        )}
        {activeTab === 'medical' && (
          <MedicalLogView medicalLogs={medicalLogs} onRefresh={reloadData} />
        )}
        {activeTab === 'hygiene' && <HygieneView />}
        {activeTab === 'education' && <EducationView initialArticleId={educationInitialArticle} />}
        {activeTab === 'menopause' && <MenopauseSymptomView />}
        {activeTab === 'bleeding' && <BleedingHistoryView />}
        {activeTab === 'askher' && (
          <AskHerAssistant
            menopauseSymptoms={menopauseSymptoms}
            moodLogs={moodLogs}
            medicalLogs={medicalLogs}
            settings={settings}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView
            settings={settings}
            onUpdateSettings={setSettings}
            onDataReload={reloadData}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <DayDetailModal
        isOpen={isDayDetailOpen}
        onClose={() => setIsDayDetailOpen(false)}
        dateStr={detailDate}
        periodLog={detailPeriodLog}
        symptoms={detailSymptoms}
        moodLog={detailMoodLog}
        medicalLogs={detailMedicalLogs}
        allPeriodLogs={periodLogs}
        settings={settings}
        onOpenEdit={(d) => handleOpenQuickLog(d)}
        onDeleteDay={handleDeleteDay}
      />
      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} dateStr={quickLogDate} onSaved={reloadData} />
      <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} notifications={notifications} />
      <OnboardingModal isOpen={isOnboardingOpen} onComplete={handleOnboardingComplete} />
      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        periodLogs={periodLogs}
        symptomLogs={symptomLogs}
        moodLogs={moodLogs}
        medicalLogs={medicalLogs}
        settings={settings}
        menopauseSymptoms={menopauseSymptoms}
        bleedingEvents={bleedingEvents}
      />
      <IOSInstallBanner />
    </div>
  );
};

export default App;
