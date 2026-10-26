import React, { useState, useEffect, useCallback } from 'react';
import {
  UserSettings,
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  CurrentPhaseInfo
} from './types';
import { dbService } from './services/db';
import {
  formatDate,
  getCurrentPhaseInfo
} from './services/cycleEngine';
import { notificationService, InAppNotification } from './services/notificationService';
import { Navbar, NavTab } from './components/common/Navbar';
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

export const App: React.FC = () => {
  const todayStr = formatDate(new Date());

  // Navigation State
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

  // App Data State
  const [settings, setSettings] = useState<UserSettings>({
    onboardingCompleted: false,
    cycleLength: 28,
    periodDuration: 5,
    lutealLength: 14,
    regularity: 'regular',
    reminderPreferences: {
      periodDue: true,
      dailyCheckIn: false,
      ovulationAlert: true,
      productChange: true
    },
    theme: 'burgundy',
    waterGoalGlasses: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [periodLogs, setPeriodLogs] = useState<PeriodLog[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [medicalLogs, setMedicalLogs] = useState<MedicalLog[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from IndexedDB
  const reloadData = useCallback(async () => {
    try {
      const [savedSettings, pLogs, sLogs, mLogs, medLogs] = await Promise.all([
        dbService.getSettings(),
        dbService.getAllPeriodLogs(),
        dbService.getAllSymptomLogs(),
        dbService.getAllMoodLogs(),
        dbService.getAllMedicalLogs()
      ]);

      if (savedSettings) {
        setSettings(savedSettings);
        if (!savedSettings.onboardingCompleted) {
          setIsOnboardingOpen(true);
        }
      } else {
        setIsOnboardingOpen(true);
      }

      setPeriodLogs(pLogs);
      setSymptomLogs(sLogs);
      setMoodLogs(mLogs);
      setMedicalLogs(medLogs);
    } catch (err) {
      console.error('Error loading data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();

    // Subscribe to notification service
    const unsubscribe = notificationService.subscribe(notifs => {
      setNotifications(notifs);
    });

    return () => {
      unsubscribe();
    };
  }, [reloadData]);

  // Handle Onboarding Completion
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
      'Welcome to HerCycle 🌸',
      'Your cycle health sanctuary is ready. All data remains 100% offline and private on your device.',
      'info'
    );

    reloadData();
  };

  // Current Phase Information
  const phaseInfo: CurrentPhaseInfo = getCurrentPhaseInfo(todayStr, periodLogs, settings);

  // Today specific logs
  const todayPeriodLog = periodLogs.find(p => p.date === todayStr) || null;
  const todaySymptoms = symptomLogs.filter(s => s.date === todayStr);
  const todayMoodLog = moodLogs.find(m => m.date === todayStr) || null;

  // Open Quick Log for given date or today
  const handleOpenQuickLog = (dateStr?: string) => {
    setQuickLogDate(dateStr || todayStr);
    setIsQuickLogOpen(true);
  };

  // Calendar date tap opens DayDetailModal
  const handleCalendarSelectDate = (dateStr: string) => {
    setDetailDate(dateStr);
    setIsDayDetailOpen(true);
  };

  // Delete day handler
  const handleDeleteDay = async (dateStr: string) => {
    if (!window.confirm(`Delete all entries for ${dateStr}?`)) return;
    await dbService.deletePeriodLog(dateStr);
    await dbService.deleteMoodLog(dateStr);
    const syms = await dbService.getSymptomLogsByDate(dateStr);
    for (const s of syms) {
      await dbService.deleteSymptomLog(s.id);
    }
    reloadData();
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-burgundy-800 to-cherry-500 animate-spin flex items-center justify-center text-white mb-4 shadow-soft">
          <div className="w-8 h-8 rounded-full bg-cream" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-burgundy-900">HerCycle</h2>
        <p className="text-xs text-burgundy-900/60 mt-1">Preparing your private local health store...</p>
      </div>
    );
  }

  // Selected date logs for DayDetailModal
  const detailPeriodLog = periodLogs.find(p => p.date === detailDate) || null;
  const detailSymptoms = symptomLogs.filter(s => s.date === detailDate);
  const detailMoodLog = moodLogs.find(m => m.date === detailDate) || null;
  const detailMedicalLogs = medicalLogs.filter(m => m.dateTime.startsWith(detailDate));

  return (
    <div className="min-h-screen bg-cream text-gray-800 flex flex-col selection:bg-rosepink-200">
      {/* Top Header / Mobile Bar / Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenQuickLog={() => handleOpenQuickLog(todayStr)}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsReminderModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pb-12">
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
            onNavigateToEducation={(artId) => {
              setEducationInitialArticle(artId);
              setActiveTab('education');
            }}
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
          />
        )}

        {activeTab === 'journal' && (
          <MoodJournalView
            moodLogs={moodLogs}
            onOpenLogModal={handleOpenQuickLog}
            onDeleteMoodLog={handleDeleteDay}
          />
        )}

        {activeTab === 'medical' && (
          <MedicalLogView
            medicalLogs={medicalLogs}
            onRefresh={reloadData}
          />
        )}

        {activeTab === 'hygiene' && (
          <HygieneView />
        )}

        {activeTab === 'education' && (
          <EducationView initialArticleId={educationInitialArticle} />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            settings={settings}
            onUpdateSettings={(newSet) => setSettings(newSet)}
            onDataReload={reloadData}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
          />
        )}
      </main>

      {/* Day Detail Sheet Modal (Opens on calendar date click) */}
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

      {/* Quick Log Modal */}
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        dateStr={quickLogDate}
        onSaved={reloadData}
      />

      {/* Reminders & Notifications Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        notifications={notifications}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {/* Doctor Summary Report Modal */}
      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        periodLogs={periodLogs}
        symptomLogs={symptomLogs}
        moodLogs={moodLogs}
        medicalLogs={medicalLogs}
        settings={settings}
      />
    </div>
  );
};

export default App;
