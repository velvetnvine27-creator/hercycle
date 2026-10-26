export type FlowIntensity = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type CycleRegularity = 'regular' | 'somewhat_irregular' | 'very_irregular' | 'not_sure';

export type MenopauseStage =
  | 'menstrual'       // still having regular cycles
  | 'perimenopause'   // irregular cycles, transitioning
  | 'menopause'       // 12+ months since last period
  | 'postmenopause'   // beyond menopause
  | 'combined'        // tracking multiple aspects
  | 'not_sure';       // user unsure

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
  // Menopause fields
  menopauseStage?: MenopauseStage;
  menopauseOnboardingCompleted?: boolean;
  lastMenstrualPeriod?: string; // YYYY-MM-DD
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
  category: 'pain' | 'body' | 'mental' | 'digestive' | 'discharge' | 'custom' | 'menopause';
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
  type: 'medication' | 'appointment' | 'lab' | 'allergy' | 'clinician_note' | 'hormone_therapy';
  title: string;
  dosage?: string;
  dateTime: string; // ISO or YYYY-MM-DDTHH:mm
  reason?: string;
  clinician?: string;
  location?: string;
  notes?: string;
  sideEffects?: string;
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
  category: 'basics' | 'phases' | 'pain' | 'conditions' | 'doctor' | 'warning' | 'menopause';
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

// ── Auth ──────────────────────────────────────────────────────────────────
export interface AuthRecord {
  id: 'pin_auth';
  phoneNumberHash: string;  // SHA-256 of normalized phone number
  pinHash: string;           // SHA-256(salt + pin)
  salt: string;              // random 32-char hex
  failedAttempts: number;
  lockedUntil: string | null; // ISO string or null
  createdAt: string;
  updatedAt: string;
}

// ── Menopause Symptom Entry ───────────────────────────────────────────────
export interface MenopauseSymptomEntry {
  id: string;
  date: string;          // YYYY-MM-DD
  time?: string;         // HH:mm
  // Vasomotor
  hotFlashes: number;        // count per day 0-20
  hotFlashSeverity: number;  // 1-5
  nightSweats: number;       // 1-5
  // Sleep
  sleepHours?: number;
  sleepQuality: number;      // 1-5
  nightAwakenings: number;   // 0-10
  // Mood & cognitive
  moodRating: number;        // 1-5
  anxietyLevel: number;      // 1-5
  irritability: number;      // 1-5
  brainFog: number;          // 1-5
  concentration: number;     // 1-5
  // Physical
  fatigue: number;           // 1-5
  headache: number;          // 1-5
  jointPain: number;         // 1-5
  musclePain: number;        // 1-5
  // Urogenital
  vaginalDryness: number;    // 1-5
  urinarySymptoms: number;   // 1-5
  libidoChange: number;      // 1-5 (1=very low, 3=no change, 5=increased)
  // Other
  palpitations: number;      // 1-5
  skinHairChanges: number;   // 1-5
  // Custom
  customSymptoms?: Array<{ name: string; severity: number }>;
  // Context
  stressLevel: number;       // 1-5
  energyLevel: number;       // 1-5
  possibleTriggers?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Bleeding Event (menopause-aware) ─────────────────────────────────────
export interface BleedingEvent {
  id: string;
  date: string;           // YYYY-MM-DD start
  endDate?: string;       // YYYY-MM-DD end (optional)
  type: 'period' | 'perimenopausal' | 'spotting' | 'postmenopausal' | 'unknown';
  flow: FlowIntensity;
  associatedSymptoms?: string[];
  notes?: string;
  seekedMedicalAdvice?: boolean;
  createdAt: string;
}
