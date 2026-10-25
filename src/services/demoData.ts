import {
  UserSettings,
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog
} from '../types';
import { formatDate, addDays } from './cycleEngine';

export function generateSampleData() {
  const today = new Date();
  const todayStr = formatDate(today);

  // We'll create a 28-day cycle model where today is roughly Day 14 (Ovulatory) or Day 20 (Luteal)
  // Let's set the last period to start 12 days ago:
  const lastPeriodStart = addDays(todayStr, -12);
  const cycle2Start = addDays(lastPeriodStart, -28);
  const cycle1Start = addDays(cycle2Start, -29);

  const sampleSettings: UserSettings = {
    onboardingCompleted: true,
    nickname: 'Maya',
    lastPeriodDate: lastPeriodStart,
    cycleLength: 28,
    periodDuration: 5,
    lutealLength: 14,
    regularity: 'regular',
    reminderPreferences: {
      periodDue: true,
      dailyCheckIn: true,
      ovulationAlert: true,
      productChange: true,
      checkInTime: '20:30'
    },
    theme: 'burgundy',
    waterGoalGlasses: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const samplePeriodLogs: PeriodLog[] = [];

  // Cycle 1 bleeding (5 days)
  samplePeriodLogs.push(
    { id: 'p1-1', date: cycle1Start, flow: 'medium', isStart: true, createdAt: new Date().toISOString(), notes: 'Cramps started early morning.' },
    { id: 'p1-2', date: addDays(cycle1Start, 1), flow: 'heavy', createdAt: new Date().toISOString() },
    { id: 'p1-3', date: addDays(cycle1Start, 2), flow: 'heavy', createdAt: new Date().toISOString() },
    { id: 'p1-4', date: addDays(cycle1Start, 3), flow: 'medium', createdAt: new Date().toISOString() },
    { id: 'p1-5', date: addDays(cycle1Start, 4), flow: 'light', isEnd: true, createdAt: new Date().toISOString() }
  );

  // Cycle 2 bleeding (5 days)
  samplePeriodLogs.push(
    { id: 'p2-1', date: cycle2Start, flow: 'medium', isStart: true, createdAt: new Date().toISOString(), notes: 'Arrived right on schedule!' },
    { id: 'p2-2', date: addDays(cycle2Start, 1), flow: 'heavy', createdAt: new Date().toISOString() },
    { id: 'p2-3', date: addDays(cycle2Start, 2), flow: 'medium', createdAt: new Date().toISOString() },
    { id: 'p2-4', date: addDays(cycle2Start, 3), flow: 'medium', createdAt: new Date().toISOString() },
    { id: 'p2-5', date: addDays(cycle2Start, 4), flow: 'light', isEnd: true, createdAt: new Date().toISOString() }
  );

  // Cycle 3 (Recent) bleeding (5 days)
  samplePeriodLogs.push(
    { id: 'p3-1', date: lastPeriodStart, flow: 'light', isStart: true, createdAt: new Date().toISOString(), notes: 'Mild start with spotting.' },
    { id: 'p3-2', date: addDays(lastPeriodStart, 1), flow: 'heavy', createdAt: new Date().toISOString() },
    { id: 'p3-3', date: addDays(lastPeriodStart, 2), flow: 'heavy', createdAt: new Date().toISOString() },
    { id: 'p3-4', date: addDays(lastPeriodStart, 3), flow: 'medium', createdAt: new Date().toISOString() },
    { id: 'p3-5', date: addDays(lastPeriodStart, 4), flow: 'light', isEnd: true, createdAt: new Date().toISOString() }
  );

  // Sample Symptoms across cycles
  const sampleSymptomLogs: SymptomLog[] = [
    { id: 's1', date: cycle1Start, category: 'pain', name: 'Pelvic Cramps', severity: 4, notes: 'Needed hot water bottle', createdAt: new Date().toISOString() },
    { id: 's2', date: cycle1Start, category: 'body', name: 'Fatigue', severity: 3, createdAt: new Date().toISOString() },
    { id: 's3', date: addDays(cycle1Start, 1), category: 'pain', name: 'Headache', severity: 3, createdAt: new Date().toISOString() },
    { id: 's4', date: addDays(cycle1Start, 13), category: 'discharge', name: 'Discharge Observation', severity: 2, dischargeType: 'eggwhite', notes: 'Clear, stretchy fertile mucus', createdAt: new Date().toISOString() },
    { id: 's5', date: addDays(cycle1Start, 24), category: 'mental', name: 'Cravings (Sweet)', severity: 4, notes: 'Dark chocolate cravings', createdAt: new Date().toISOString() },
    { id: 's6', date: addDays(cycle1Start, 26), category: 'body', name: 'Bloating', severity: 3, createdAt: new Date().toISOString() },

    { id: 's7', date: cycle2Start, category: 'pain', name: 'Pelvic Cramps', severity: 3, createdAt: new Date().toISOString() },
    { id: 's8', date: addDays(cycle2Start, 14), category: 'discharge', name: 'Discharge Observation', severity: 2, dischargeType: 'eggwhite', createdAt: new Date().toISOString() },
    { id: 's9', date: addDays(cycle2Start, 25), category: 'pain', name: 'Breast Tenderness', severity: 4, createdAt: new Date().toISOString() },
    { id: 's10', date: addDays(cycle2Start, 26), category: 'mental', name: 'Sleep Changes', severity: 3, notes: 'Woke up multiple times', createdAt: new Date().toISOString() },

    { id: 's11', date: lastPeriodStart, category: 'pain', name: 'Pelvic Cramps', severity: 4, notes: 'Lower back ache as well', createdAt: new Date().toISOString() },
    { id: 's12', date: addDays(lastPeriodStart, 1), category: 'pain', name: 'Back Pain', severity: 3, createdAt: new Date().toISOString() },
    { id: 's13', date: addDays(lastPeriodStart, 2), category: 'body', name: 'Bloating', severity: 2, createdAt: new Date().toISOString() },
    { id: 's14', date: todayStr, category: 'discharge', name: 'Discharge Observation', severity: 2, dischargeType: 'eggwhite', notes: 'High fertile phase observation', createdAt: new Date().toISOString() }
  ];

  // Sample Moods
  const sampleMoodLogs: MoodLog[] = [
    {
      id: 'm1',
      date: cycle1Start,
      moods: ['Low', 'Sensitive'],
      intensity: 3,
      stress: 4,
      energy: 2,
      sleepQuality: 3,
      sleepHours: 7,
      journalNote: 'First day exhaustion, stayed curled up with chamomile tea.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm2',
      date: addDays(cycle1Start, 8),
      moods: ['Energetic', 'Happy'],
      intensity: 4,
      stress: 2,
      energy: 5,
      sleepQuality: 5,
      sleepHours: 8.5,
      journalNote: 'Follicular energy is so refreshing! Productive run this morning.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm3',
      date: addDays(cycle1Start, 25),
      moods: ['Irritable', 'Overwhelmed'],
      intensity: 4,
      stress: 4,
      energy: 2,
      sleepQuality: 2,
      sleepHours: 6,
      journalNote: 'Late luteal PMS tension. Reminded myself to take deep breaths.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm4',
      date: lastPeriodStart,
      moods: ['Calm', 'Low'],
      intensity: 3,
      stress: 3,
      energy: 2,
      sleepQuality: 3,
      sleepHours: 7.5,
      journalNote: 'Restful start to the cycle.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'm5',
      date: todayStr,
      moods: ['Energetic', 'Happy', 'Calm'],
      intensity: 5,
      stress: 1,
      energy: 4,
      sleepQuality: 4,
      sleepHours: 8,
      journalNote: 'Felt vibrant today during team discussion and self-care yoga.',
      createdAt: new Date().toISOString()
    }
  ];

  // Sample Medical logs
  const sampleMedicalLogs: MedicalLog[] = [
    {
      id: 'med-1',
      type: 'medication',
      title: 'Ibuprofen',
      dosage: '400mg',
      dateTime: `${lastPeriodStart}T09:00`,
      reason: 'Relief for day 1 menstrual cramps',
      notes: 'Taken after breakfast. Worked within 40 minutes.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'med-2',
      type: 'medication',
      title: 'Magnesium Glycinate',
      dosage: '250mg',
      dateTime: `${todayStr}T21:00`,
      reason: 'Muscle relaxation & restful sleep support',
      notes: 'Nightly supplement.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'med-3',
      type: 'appointment',
      title: 'Annual Well-Woman Exam',
      clinician: 'Dr. Elena Rostova, OB/GYN',
      location: 'Westside Women’s Clinic',
      dateTime: `${addDays(todayStr, 14)}T14:30`,
      reason: 'Routine Pap smear & cycle review',
      notes: 'Discussed luteal phase mood tracking; doctor recommended keeping menstrual log handy.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'med-4',
      type: 'lab',
      title: 'Complete Blood Count & Ferritin',
      clinician: 'Quest Diagnostics',
      dateTime: `${addDays(lastPeriodStart, -10)}T10:00`,
      reason: 'Check iron levels due to heavy flow days',
      notes: 'Ferritin 48 ng/mL (Normal range: 20-200). Hemoglobin optimal at 13.5 g/dL.',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    settings: sampleSettings,
    periodLogs: samplePeriodLogs,
    symptomLogs: sampleSymptomLogs,
    moodLogs: sampleMoodLogs,
    medicalLogs: sampleMedicalLogs
  };
}
