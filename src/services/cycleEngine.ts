import {
  PeriodLog,
  UserSettings,
  CycleStats,
  CurrentPhaseInfo,
  MenstrualPhase
} from '../types';

/**
 * Format Date object to YYYY-MM-DD using local time
 */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse YYYY-MM-DD into a local midnight Date
 */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Add days to YYYY-MM-DD string
 */
export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Difference in days between two YYYY-MM-DD strings (dateStr1 - dateStr2)
 */
export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = parseDate(dateStr1).getTime();
  const d2 = parseDate(dateStr2).getTime();
  return Math.round((d1 - d2) / (1000 * 60 * 60 * 24));
}

export interface DetectedPeriod {
  startDate: string;
  endDate: string;
  durationDays: number;
  flowLogs: PeriodLog[];
}

/**
 * Identifies distinct periods from individual daily flow logs.
 * A period is a cluster of days with flow > 'none', allowing at most 1 day gap (e.g. temporary spotting dip).
 */
export function detectPeriodsFromLogs(logs: PeriodLog[]): DetectedPeriod[] {
  const flowLogs = logs
    .filter(l => l.flow && l.flow !== 'none')
    .sort((a, b) => a.date.localeCompare(b.date));

  if (flowLogs.length === 0) return [];

  const periods: DetectedPeriod[] = [];
  let currentGroup: PeriodLog[] = [flowLogs[0]];

  for (let i = 1; i < flowLogs.length; i++) {
    const prev = flowLogs[i - 1];
    const curr = flowLogs[i];
    const diff = daysBetween(curr.date, prev.date);

    // If consecutive or 1 day gap (diff <= 2)
    if (diff <= 2) {
      currentGroup.push(curr);
    } else {
      // Finalize previous period
      periods.push({
        startDate: currentGroup[0].date,
        endDate: currentGroup[currentGroup.length - 1].date,
        durationDays: daysBetween(currentGroup[currentGroup.length - 1].date, currentGroup[0].date) + 1,
        flowLogs: [...currentGroup]
      });
      currentGroup = [curr];
    }
  }

  // Finalize last group
  if (currentGroup.length > 0) {
    periods.push({
      startDate: currentGroup[0].date,
      endDate: currentGroup[currentGroup.length - 1].date,
      durationDays: daysBetween(currentGroup[currentGroup.length - 1].date, currentGroup[0].date) + 1,
      flowLogs: [...currentGroup]
    });
  }

  return periods;
}

/**
 * Calculate statistical cycle health, lengths, and regularity
 */
export function calculateCycleStats(periodLogs: PeriodLog[], settings: UserSettings): CycleStats {
  const detected = detectPeriodsFromLogs(periodLogs);

  // If user has not logged enough historical periods, fallback gracefully with explicit small sample label
  if (detected.length < 2) {
    return {
      averageCycleLength: settings.cycleLength || 28,
      averagePeriodDuration: detected.length === 1 ? detected[0].durationDays : (settings.periodDuration || 5),
      minCycleLength: settings.cycleLength || 28,
      maxCycleLength: settings.cycleLength || 28,
      cycleCount: detected.length,
      regularityScore: settings.regularity === 'regular' ? 'Regular (Self-reported)' : 'Varied (Self-reported)',
      isSampleSmall: true,
      disclaimer: detected.length === 0
        ? 'Using baseline onboarding averages. Log at least 2 consecutive periods to calculate your personalized cycle stats.'
        : 'Based on 1 logged period and baseline settings. Log your next period to calculate exact interval variation.'
    };
  }

  // Calculate cycle lengths between consecutive period start dates
  const cycleLengths: number[] = [];
  for (let i = 1; i < detected.length; i++) {
    const len = daysBetween(detected[i].startDate, detected[i - 1].startDate);
    // Sanity check: cycles are typically between 18 and 60 days
    if (len >= 18 && len <= 65) {
      cycleLengths.push(len);
    }
  }

  const periodDurations = detected.map(p => p.durationDays);

  const avgPeriodDuration = Math.round(
    periodDurations.reduce((sum, d) => sum + d, 0) / periodDurations.length
  );

  if (cycleLengths.length === 0) {
    return {
      averageCycleLength: settings.cycleLength || 28,
      averagePeriodDuration: avgPeriodDuration,
      minCycleLength: settings.cycleLength || 28,
      maxCycleLength: settings.cycleLength || 28,
      cycleCount: detected.length,
      regularityScore: 'Awaiting Interval Data',
      isSampleSmall: true,
      disclaimer: 'Logged periods have large gaps or overlap. Continuing to log will refine your averages.'
    };
  }

  const avgCycleLength = Math.round(
    cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
  );

  const minCycle = Math.min(...cycleLengths);
  const maxCycle = Math.max(...cycleLengths);
  const diff = maxCycle - minCycle;

  let regularityLabel = 'Highly Regular';
  if (diff > 8) {
    regularityLabel = 'Irregular / High Variance';
  } else if (diff > 4) {
    regularityLabel = 'Normal Moderate Variance';
  }

  return {
    averageCycleLength: avgCycleLength,
    averagePeriodDuration: avgPeriodDuration,
    minCycleLength: minCycle,
    maxCycleLength: maxCycle,
    cycleCount: detected.length,
    regularityScore: regularityLabel,
    isSampleSmall: cycleLengths.length < 3,
    disclaimer: cycleLengths.length < 3
      ? 'Calculated from limited historical data. Predictions will become more precise with each cycle.'
      : 'Calculated from your verified historical period start dates.'
  };
}

/**
 * Determine the user's most recent period start date
 */
export function getMostRecentPeriodStart(periodLogs: PeriodLog[], settings: UserSettings): string {
  const detected = detectPeriodsFromLogs(periodLogs);
  if (detected.length > 0) {
    return detected[detected.length - 1].startDate;
  }
  return settings.lastPeriodDate || formatDate(new Date());
}

/**
 * Predict future period start dates
 */
export function predictUpcomingCycles(
  lastStartDate: string,
  cycleLength: number,
  periodDuration: number,
  count = 3
): Array<{ periodStart: string; periodEnd: string; ovulationDate: string; fertileStart: string; fertileEnd: string }> {
  const predictions = [];
  let currentStart = lastStartDate;

  for (let i = 0; i < count; i++) {
    const nextStart = addDays(currentStart, cycleLength);
    const nextEnd = addDays(nextStart, periodDuration - 1);
    // Ovulation is roughly 14 days before next period start (Luteal phase calculation)
    const ovulation = addDays(nextStart, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);

    predictions.push({
      periodStart: nextStart,
      periodEnd: nextEnd,
      ovulationDate: ovulation,
      fertileStart,
      fertileEnd
    });

    currentStart = nextStart;
  }

  return predictions;
}

/**
 * Get comprehensive phase & status information for any target date
 */
export function getCurrentPhaseInfo(
  targetDateStr: string,
  periodLogs: PeriodLog[],
  settings: UserSettings
): CurrentPhaseInfo {
  const stats = calculateCycleStats(periodLogs, settings);
  const avgCycle = stats.averageCycleLength;
  const avgDuration = stats.averagePeriodDuration;
  const lutealLen = settings.lutealLength || 14;

  const detected = detectPeriodsFromLogs(periodLogs);
  
  // Find the period immediately preceding or containing targetDateStr
  let latestPeriod: DetectedPeriod | null = null;
  for (const p of detected) {
    if (p.startDate <= targetDateStr) {
      if (!latestPeriod || p.startDate > latestPeriod.startDate) {
        latestPeriod = p;
      }
    }
  }

  const baselineStart = latestPeriod ? latestPeriod.startDate : (settings.lastPeriodDate || targetDateStr);
  const rawDayInCycle = daysBetween(targetDateStr, baselineStart) + 1;

  // Normalized day within cycle (handling if overdue or multiple cycles have passed)
  let dayInCycle = rawDayInCycle;
  if (dayInCycle <= 0) {
    dayInCycle = 1;
  } else if (dayInCycle > avgCycle) {
    dayInCycle = ((dayInCycle - 1) % avgCycle) + 1;
  }

  // Check if target date is currently during bleeding
  const isBleeding = latestPeriod
    ? (targetDateStr >= latestPeriod.startDate && targetDateStr <= latestPeriod.endDate)
    : (dayInCycle <= avgDuration);

  // Dynamic ovulation calculation: calculated as (avgCycle - lutealLen)
  // For standard 28-day cycle with 14-day luteal, ovulation is day 14.
  // For a 32-day cycle, ovulation is day 18 (NOT day 14).
  const ovulationCycleDay = Math.max(avgDuration + 2, avgCycle - lutealLen);
  const fertileStartDay = Math.max(avgDuration + 1, ovulationCycleDay - 5);
  const fertileEndDay = Math.min(avgCycle, ovulationCycleDay + 1);

  // Calculate dates
  const nextPeriodDate = addDays(baselineStart, avgCycle);
  const daysUntilNextPeriod = daysBetween(nextPeriodDate, targetDateStr);

  const ovulationDate = addDays(baselineStart, ovulationCycleDay - 1);
  const fertileStart = addDays(baselineStart, fertileStartDay - 1);
  const fertileEnd = addDays(baselineStart, fertileEndDay - 1);

  // Phase Determination
  let phase: MenstrualPhase = 'follicular';
  let phaseName = 'Follicular Phase';
  let phaseDescription = '';
  let hormoneSummary = '';
  let selfCareTip = '';
  let nutritionTip = '';
  let movementTip = '';
  let chanceOfPregnancy: 'Low' | 'Medium' | 'High' | 'Peak' = 'Low';

  if (isBleeding || dayInCycle <= avgDuration) {
    phase = 'menstrual';
    phaseName = 'Menstrual Phase';
    phaseDescription = 'Your uterine lining is shedding. Estrogen and progesterone are at their lowest baseline levels, signaling your body to rest and renew.';
    hormoneSummary = 'Low Estrogen & Low Progesterone';
    selfCareTip = 'Honor your body with extra sleep, gentle heat wraps, and a warm magnesium bath.';
    nutritionTip = 'Focus on iron-rich leafy greens, bone broths, warm lentil stews, and warming herbal teas.';
    movementTip = 'Gentle yin yoga, pelvic floor stretching, and unhurried restorative walking.';
    chanceOfPregnancy = 'Low';
  } else if (dayInCycle < fertileStartDay) {
    phase = 'follicular';
    phaseName = 'Follicular Phase';
    phaseDescription = 'Follicle-stimulating hormone (FSH) prompts egg follicles to mature. Estrogen begins its steady rise, bringing a fresh surge of mental clarity, creativity, and vitality.';
    hormoneSummary = 'Rising Estrogen & Rising FSH';
    selfCareTip = 'Harness this creative burst for brainstorming new projects, organizing, and socializing.';
    nutritionTip = 'Incorporate fermented foods (kimchi, kefir), sprouted seeds, fresh berries, and light lean proteins.';
    movementTip = 'Cardio, upbeat flow yoga, dance, and progressive resistance training.';
    chanceOfPregnancy = 'Low';
  } else if (dayInCycle <= fertileEndDay) {
    phase = 'ovulatory';
    phaseName = 'Ovulatory Phase';
    phaseDescription = 'Luteinizing Hormone (LH) surges, triggering the release of an egg from your dominant follicle. You are at your peak fertility and social confidence.';
    hormoneSummary = 'Peak Estrogen & LH Surge';
    selfCareTip = 'You are naturally magnetic and communicative. Great time for important presentations, dates, and self-expression.';
    nutritionTip = 'Antioxidant-rich foods, cruciferous veggies to assist liver estrogen metabolism, and optimal hydration.';
    movementTip = 'High-energy interval workouts, power lifting, running, and dynamic vinyasa.';
    chanceOfPregnancy = (dayInCycle === ovulationCycleDay) ? 'Peak' : 'High';
  } else {
    phase = 'luteal';
    phaseName = 'Luteal Phase';
    phaseDescription = 'Following ovulation, the corpus luteum produces progesterone to stabilize your body. Energy turns reflective and inward as your body prepares for the next cycle.';
    hormoneSummary = 'Dominant Progesterone, Gradual Taper';
    selfCareTip = 'Establish peaceful evening wind-down rituals. Reduce caffeine to soothe premenstrual mood sensitivity.';
    nutritionTip = 'Complex carbohydrates (sweet potatoes, oats), pumpkin seeds, and foods rich in vitamin B6 and magnesium.';
    movementTip = 'Moderate pilates, barre, steady swimming, and calming evening walks.';
    chanceOfPregnancy = 'Low';
  }

  return {
    phase,
    phaseName,
    dayInCycle,
    totalCycleDays: avgCycle,
    daysUntilNextPeriod: Math.max(0, daysUntilNextPeriod),
    nextPeriodDate,
    isPeriodActive: isBleeding,
    activePeriodDay: isBleeding ? dayInCycle : undefined,
    ovulationDate,
    fertileStart,
    fertileEnd,
    chanceOfPregnancy,
    phaseDescription,
    hormoneSummary,
    selfCareTip,
    nutritionTip,
    movementTip
  };
}

/**
 * Get map of day statuses for calendar view
 */
export interface CalendarDayStatus {
  date: string;
  isPeriod: boolean;
  flow?: string;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  hasSymptoms: boolean;
  hasMood: boolean;
  hasNotes: boolean;
}

export function buildMonthCalendarMap(
  year: number,
  month: number, // 0-indexed (0 = Jan, 11 = Dec)
  periodLogs: PeriodLog[],
  symptomLogsCountByDate: Record<string, number>,
  moodLogsCountByDate: Record<string, boolean>,
  settings: UserSettings
): Map<string, CalendarDayStatus> {
  const map = new Map<string, CalendarDayStatus>();
  const stats = calculateCycleStats(periodLogs, settings);
  const avgCycle = stats.averageCycleLength;
  const avgDuration = stats.averagePeriodDuration;
  const lutealLen = settings.lutealLength || 14;

  const logMap = new Map<string, PeriodLog>();
  periodLogs.forEach(l => logMap.set(l.date, l));

  // Determine recent period and upcoming predictions
  const detected = detectPeriodsFromLogs(periodLogs);
  const lastStart = detected.length > 0 ? detected[detected.length - 1].startDate : (settings.lastPeriodDate || null);

  const predictedDates = new Set<string>();
  const fertileDates = new Set<string>();
  const ovulationDates = new Set<string>();

  if (lastStart) {
    // Predict next 6 cycles to cover any visible future calendar months
    let anchor = lastStart;
    for (let c = 0; c < 6; c++) {
      const pStart = addDays(anchor, avgCycle);
      const pEnd = addDays(pStart, avgDuration - 1);
      const ovDate = addDays(pStart, -lutealLen);
      const fStart = addDays(ovDate, -5);
      const fEnd = addDays(ovDate, 1);

      // Add predicted period bleeding days
      let d = pStart;
      while (d <= pEnd) {
        predictedDates.add(d);
        d = addDays(d, 1);
      }

      // Add fertile days
      let f = fStart;
      while (f <= fEnd) {
        fertileDates.add(f);
        f = addDays(f, 1);
      }

      ovulationDates.add(ovDate);
      anchor = pStart;
    }
  }

  // Days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = logMap.get(dateStr);
    const isPeriod = Boolean(log && log.flow && log.flow !== 'none');

    map.set(dateStr, {
      date: dateStr,
      isPeriod,
      flow: log?.flow,
      isPredictedPeriod: !isPeriod && predictedDates.has(dateStr),
      isFertile: fertileDates.has(dateStr),
      isOvulation: ovulationDates.has(dateStr),
      hasSymptoms: Boolean(symptomLogsCountByDate[dateStr]),
      hasMood: Boolean(moodLogsCountByDate[dateStr]),
      hasNotes: Boolean(log?.notes)
    });
  }

  return map;
}
