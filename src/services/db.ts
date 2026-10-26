import {
  UserSettings,
  PeriodLog,
  SymptomLog,
  MoodLog,
  MedicalLog,
  HygieneLog,
  AuthRecord,
  MenopauseSymptomEntry,
  BleedingEvent
} from '../types';

const DB_NAME = 'hercycle_db';
const DB_VERSION = 2;

interface HerCycleExportData {
  version: number;
  exportedAt: string;
  source: string;
  settings: UserSettings;
  periodLogs: PeriodLog[];
  symptomLogs: SymptomLog[];
  moodLogs: MoodLog[];
  medicalLogs: MedicalLog[];
  hygieneLogs: HygieneLog[];
  menopauseSymptoms?: MenopauseSymptomEntry[];
  bleedingEvents?: BleedingEvent[];
}

export class HerCycleDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // v1 stores (safe to re-run due to contains checks)
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('period_logs')) {
          const store = db.createObjectStore('period_logs', { keyPath: 'date' });
          store.createIndex('flow', 'flow', { unique: false });
        }
        if (!db.objectStoreNames.contains('symptom_logs')) {
          const store = db.createObjectStore('symptom_logs', { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
          store.createIndex('category', 'category', { unique: false });
        }
        if (!db.objectStoreNames.contains('mood_logs')) {
          db.createObjectStore('mood_logs', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('medical_logs')) {
          const store = db.createObjectStore('medical_logs', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('dateTime', 'dateTime', { unique: false });
        }
        if (!db.objectStoreNames.contains('hygiene_logs')) {
          db.createObjectStore('hygiene_logs', { keyPath: 'date' });
        }

        // v2 stores
        if (oldVersion < 2) {
          if (!db.objectStoreNames.contains('auth')) {
            db.createObjectStore('auth');
          }
          if (!db.objectStoreNames.contains('menopause_symptoms')) {
            const ms = db.createObjectStore('menopause_symptoms', { keyPath: 'id' });
            ms.createIndex('date', 'date', { unique: false });
          }
          if (!db.objectStoreNames.contains('bleeding_events')) {
            const be = db.createObjectStore('bleeding_events', { keyPath: 'id' });
            be.createIndex('date', 'date', { unique: false });
            be.createIndex('type', 'type', { unique: false });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Settings ---
  async getSettings(): Promise<UserSettings | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('user_settings');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ ...settings, updatedAt: new Date().toISOString() }, 'user_settings');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Auth ---
  async getAuth(): Promise<AuthRecord | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('auth', 'readonly');
      const req = tx.objectStore('auth').get('pin_auth');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveAuth(record: AuthRecord): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('auth', 'readwrite');
      const req = tx.objectStore('auth').put(record, 'pin_auth');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearAuth(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('auth', 'readwrite');
      const req = tx.objectStore('auth').clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Period Logs ---
  async getAllPeriodLogs(): Promise<PeriodLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('period_logs', 'readonly');
      const store = tx.objectStore('period_logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result as PeriodLog[]).sort((a, b) => a.date.localeCompare(b.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getPeriodLogByDate(date: string): Promise<PeriodLog | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('period_logs', 'readonly');
      const store = tx.objectStore('period_logs');
      const req = store.get(date);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async savePeriodLog(log: PeriodLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('period_logs', 'readwrite');
      const store = tx.objectStore('period_logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deletePeriodLog(date: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('period_logs', 'readwrite');
      const store = tx.objectStore('period_logs');
      const req = store.delete(date);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Symptom Logs ---
  async getAllSymptomLogs(): Promise<SymptomLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('symptom_logs', 'readonly');
      const store = tx.objectStore('symptom_logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result as SymptomLog[]).sort((a, b) => a.date.localeCompare(b.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getSymptomLogsByDate(date: string): Promise<SymptomLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('symptom_logs', 'readonly');
      const store = tx.objectStore('symptom_logs');
      const index = store.index('date');
      const req = index.getAll(date);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveSymptomLog(log: SymptomLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('symptom_logs', 'readwrite');
      const store = tx.objectStore('symptom_logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSymptomLog(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('symptom_logs', 'readwrite');
      const store = tx.objectStore('symptom_logs');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Mood Logs ---
  async getAllMoodLogs(): Promise<MoodLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mood_logs', 'readonly');
      const store = tx.objectStore('mood_logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result as MoodLog[]).sort((a, b) => a.date.localeCompare(b.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getMoodLogByDate(date: string): Promise<MoodLog | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mood_logs', 'readonly');
      const store = tx.objectStore('mood_logs');
      const req = store.get(date);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMoodLog(log: MoodLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mood_logs', 'readwrite');
      const store = tx.objectStore('mood_logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteMoodLog(date: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mood_logs', 'readwrite');
      const store = tx.objectStore('mood_logs');
      const req = store.delete(date);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Medical Logs ---
  async getAllMedicalLogs(): Promise<MedicalLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('medical_logs', 'readonly');
      const store = tx.objectStore('medical_logs');
      const req = store.getAll();
      req.onsuccess = () => {
        const sorted = (req.result as MedicalLog[]).sort((a, b) => b.dateTime.localeCompare(a.dateTime));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveMedicalLog(log: MedicalLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('medical_logs', 'readwrite');
      const store = tx.objectStore('medical_logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteMedicalLog(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('medical_logs', 'readwrite');
      const store = tx.objectStore('medical_logs');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Hygiene Logs ---
  async getHygieneLogByDate(date: string): Promise<HygieneLog | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('hygiene_logs', 'readonly');
      const store = tx.objectStore('hygiene_logs');
      const req = store.get(date);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveHygieneLog(log: HygieneLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('hygiene_logs', 'readwrite');
      const store = tx.objectStore('hygiene_logs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Menopause Symptoms ---
  async getAllMenopauseSymptoms(): Promise<MenopauseSymptomEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('menopause_symptoms', 'readonly');
      const req = tx.objectStore('menopause_symptoms').getAll();
      req.onsuccess = () => {
        const sorted = (req.result as MenopauseSymptomEntry[]).sort((a, b) => b.date.localeCompare(a.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getMenopauseSymptomsForDate(date: string): Promise<MenopauseSymptomEntry[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('menopause_symptoms', 'readonly');
      const index = tx.objectStore('menopause_symptoms').index('date');
      const req = index.getAll(date);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveMenopauseSymptom(entry: MenopauseSymptomEntry): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('menopause_symptoms', 'readwrite');
      const req = tx.objectStore('menopause_symptoms').put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteMenopauseSymptom(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('menopause_symptoms', 'readwrite');
      const req = tx.objectStore('menopause_symptoms').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Bleeding Events ---
  async getAllBleedingEvents(): Promise<BleedingEvent[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bleeding_events', 'readonly');
      const req = tx.objectStore('bleeding_events').getAll();
      req.onsuccess = () => {
        const sorted = (req.result as BleedingEvent[]).sort((a, b) => b.date.localeCompare(a.date));
        resolve(sorted);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async saveBleedingEvent(event: BleedingEvent): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bleeding_events', 'readwrite');
      const req = tx.objectStore('bleeding_events').put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteBleedingEvent(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('bleeding_events', 'readwrite');
      const req = tx.objectStore('bleeding_events').delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Export / Import / Clear ---
  async exportAllDataJSON(): Promise<string> {
    const [settings, periodLogs, symptomLogs, moodLogs, medicalLogs, menopauseSymptoms, bleedingEvents] = await Promise.all([
      this.getSettings(),
      this.getAllPeriodLogs(),
      this.getAllSymptomLogs(),
      this.getAllMoodLogs(),
      this.getAllMedicalLogs(),
      this.getAllMenopauseSymptoms(),
      this.getAllBleedingEvents()
    ]);

    const exportPayload: HerCycleExportData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      source: 'HER CYCLE (Offline IndexedDB)',
      settings: settings || {
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
      },
      periodLogs,
      symptomLogs,
      moodLogs,
      medicalLogs,
      hygieneLogs: [],
      menopauseSymptoms,
      bleedingEvents
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  async importDataJSON(jsonString: string): Promise<{ success: boolean; message: string; counts?: Record<string, number> }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Invalid JSON file format: root must be an object.' };
      }
      if (!Array.isArray(parsed.periodLogs) && !parsed.settings) {
        return { success: false, message: 'Invalid HER CYCLE data: missing required settings or period logs structure.' };
      }

      const db = await this.getDB();
      const stores = ['settings', 'period_logs', 'symptom_logs', 'mood_logs', 'medical_logs', 'hygiene_logs', 'menopause_symptoms', 'bleeding_events'];
      const tx = db.transaction(stores, 'readwrite');

      if (parsed.settings) tx.objectStore('settings').put(parsed.settings, 'user_settings');

      let pCount = 0;
      if (Array.isArray(parsed.periodLogs)) {
        const store = tx.objectStore('period_logs');
        for (const item of parsed.periodLogs) {
          if (item?.date && item?.flow) { store.put(item); pCount++; }
        }
      }
      let sCount = 0;
      if (Array.isArray(parsed.symptomLogs)) {
        const store = tx.objectStore('symptom_logs');
        for (const item of parsed.symptomLogs) {
          if (item?.id && item?.date) { store.put(item); sCount++; }
        }
      }
      let mCount = 0;
      if (Array.isArray(parsed.moodLogs)) {
        const store = tx.objectStore('mood_logs');
        for (const item of parsed.moodLogs) {
          if (item?.date) { store.put(item); mCount++; }
        }
      }
      let medCount = 0;
      if (Array.isArray(parsed.medicalLogs)) {
        const store = tx.objectStore('medical_logs');
        for (const item of parsed.medicalLogs) {
          if (item?.id && item?.title) { store.put(item); medCount++; }
        }
      }
      let msCount = 0;
      if (Array.isArray(parsed.menopauseSymptoms)) {
        const store = tx.objectStore('menopause_symptoms');
        for (const item of parsed.menopauseSymptoms) {
          if (item?.id && item?.date) { store.put(item); msCount++; }
        }
      }
      let beCount = 0;
      if (Array.isArray(parsed.bleedingEvents)) {
        const store = tx.objectStore('bleeding_events');
        for (const item of parsed.bleedingEvents) {
          if (item?.id && item?.date) { store.put(item); beCount++; }
        }
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve({
          success: true,
          message: 'Successfully imported backup!',
          counts: { periods: pCount, symptoms: sCount, moods: mCount, medical: medCount, menopause: msCount, bleeding: beCount }
        });
        tx.onerror = () => resolve({ success: false, message: 'Database write error: ' + tx.error?.message });
      });
    } catch (err: any) {
      return { success: false, message: 'Failed to parse JSON file: ' + err.message };
    }
  }

  async clearAllData(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const stores = ['settings', 'period_logs', 'symptom_logs', 'mood_logs', 'medical_logs', 'hygiene_logs', 'menopause_symptoms', 'bleeding_events'];
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach(s => tx.objectStore(s).clear());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new HerCycleDatabase();
