export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type CycleRegularity = 'regular' | 'somewhat_irregular' | 'very_irregular' | 'not_sure';

export interface UserSettings {
  id?: string;
  onboardingCompleted: boolean;
  nickname?: string;
  lastPeriodDate?: string; // YYYY-MM-DD
  cycleLength: number; // default 28
  periodDuration: number; // default 5
  lutealLength: number; // default 14
  regularity: CycleRegularity;
  reminderPreferences: {
    periodDue: boolean;
    dailyCheckIn: boolean;
    ovulationAlert: boolean;
    productChange: boolean;
    checkInTime?: string; // e.g. "20:00"
  };
  theme: 'burgundy' | 'cherry' | 'rose' | 'blush';
  waterGoalGlasses: number; // default 8
  createdAt: string;
  updatedAt: string;
}

export interface PeriodLog {
  id: string;
  date: string; // YYYY-MM-DD
  flow: FlowIntensity;
  isStart?: boolean;
  isEnd?: boolean;
  spotting?: boolean;
  notes?: string;
  createdAt: string;
}

export interface SymptomLog {
  id: string;
  date: string; // YYYY-MM-DD
  category: 'pain' | 'body' | 'mental' | 'digestive' | 'discharge' | 'custom';
  name: string;
  severity: number; // 1 to 5
  dischargeType?: 'dry' | 'sticky' | 'creamy' | 'watery' | 'eggwhite' | 'spotting';
  notes?: string;
  time?: string;
  createdAt: string;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  moods: string[]; // e.g. ['Calm', 'Energetic', 'Sensitive']
  intensity: number; // 1 to 5
  stress: number; // 1 to 5
  energy: number; // 1 to 5
  sleepQuality: number; // 1 to 5
  sleepHours?: number;
  journalNote?: string;
  createdAt: string;
}

export interface MedicalLog {
  id: string;
  type: 'medication' | 'appointment' | 'lab' | 'allergy' | 'clinician_note';
  title: string;
  dosage?: string;
  dateTime: string; // ISO or YYYY-MM-DDTHH:mm
  reason?: string;
  clinician?: string;
  location?: string;
  notes?: string;
  createdAt: string;
}

export interface HygieneLog {
  id: string;
  date: string; // YYYY-MM-DD
  productType?: 'tampon' | 'pad' | 'cup' | 'disc' | 'underwear';
  productChangedAt?: string; // ISO string
  nextChangeDue?: string; // ISO string
  waterGlasses: number;
  periodKitChecked?: boolean;
  selfCareActivities?: string[];
}

export interface CycleStats {
  averageCycleLength: number;
  averagePeriodDuration: number;
  minCycleLength: number;
  maxCycleLength: number;
  cycleCount: number;
  regularityScore: string; // "Highly Regular", "Normal Variance", "Irregular"
  isSampleSmall: boolean;
  disclaimer: string;
}

export interface CurrentPhaseInfo {
  phase: MenstrualPhase;
  phaseName: string;
  dayInCycle: number;
  totalCycleDays: number;
  daysUntilNextPeriod: number;
  nextPeriodDate: string;
  isPeriodActive: boolean;
  activePeriodDay?: number;
  ovulationDate: string;
  fertileStart: string;
  fertileEnd: string;
  chanceOfPregnancy: 'Low' | 'Medium' | 'High' | 'Peak';
  phaseDescription: string;
  hormoneSummary: string;
  selfCareTip: string;
  nutritionTip: string;
  movementTip: string;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: 'basics' | 'phases' | 'pain' | 'conditions' | 'doctor' | 'warning';
  readTime: string;
  badge: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  isWarning?: boolean;
}

export interface ProductTimerState {
  isActive: boolean;
  productType: 'tampon' | 'pad' | 'cup' | 'disc' | 'underwear';
  startedAt: string;
  durationMinutes: number;
  dueAt: string;
}
