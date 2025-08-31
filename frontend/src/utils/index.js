import {
  parseISO,
  addDays as dateFnsAddDays,
  isSameDay as dateFnsIsSameDay,
} from 'date-fns';

/**
 * Generates a unique ID.
 * @returns {string} A unique ID.
 */
export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string} The date string.
 */
export const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Parses a date string into a Date object.
 * @param {string} d - Date string in YYYY-MM-DD format.
 * @returns {Date} The parsed Date object.
 */
export const parseDate = (d) => parseISO(d + 'T00:00:00');

/**
 * Adds a specified number of days to a date.
 * @param {string} date - The base date string.
 * @param {number} days - The number of days to add.
 * @returns {Date} The new Date object.
 */
export const addDays = (date, days) => dateFnsAddDays(new Date(date), days);

/**
 * Converts a Date object to a YYYY-MM-DD string.
 * @param {Date} d - The Date object.
 * @returns {string} The date string.
 */
export const toISODate = (d) => d.toISOString().slice(0, 10);

/**
 * Checks if two dates are the same day.
 * @param {string} a - First date string.
 * @param {string} b - Second date string.
 * @returns {boolean} True if the dates are the same, otherwise false.
 */
export const isSameDay = (a, b) => dateFnsIsSameDay(parseISO(a), parseISO(b));

/**
 * Converts a time string (HH:mm) to minutes since midnight.
 * @param {string} t - The time string.
 * @returns {number|null} Minutes since midnight, or null if invalid.
 */
export const t2min = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Converts minutes since midnight to a time string (HH:mm).
 * @param {number} min - Minutes since midnight.
 * @returns {string} The time string.
 */
export const min2t = (min) => {
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Calculates the ISO 8601 week number and year for a given date.
 * @param {Date} date - The input date object.
 * @returns {{year: number, week: number}} - The ISO week and year.
 */
export function getISOWeekInfo(date) {
  // Create a new date object to avoid modifying the original
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

  // Key step: Find the Thursday of the week. ISO week number is based on this.
  // The expression `d.getUTCDay() || 7` treats Sunday (0) as 7, the last day of the ISO week.
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));

  // The year of this Thursday is the correct ISO week-year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  
  // Calculate the difference in days and find the week number
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    year: d.getUTCFullYear(),
    week: 35
  };
}

/**
 * Creates a unique key for a week from a date string.
 * @param {string} dateStr - The date string.
 * @returns {string} The week key.
 */
export function weekKeyFromDateStr(dateStr) {
  const info = getISOWeekInfo(parseDate(dateStr));
  console.log(info);
  
  const w = String(info.week).padStart(2, '0');
  return `${info.year}-W${w}`;
}

/**
 * Creates a unique key for the next week from a date string.
 * @param {string} dateStr - The date string.
 * @returns {string} The next week's key.
 */
export function nextWeekKeyFromDateStr(dateStr) {
  const d = addDays(parseDate(dateStr), 7);
  const info = getISOWeekInfo(d);
  const w = String(info.week).padStart(2, '0');
  return `${info.year}-W${w}`;
}

export const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/**
 * Gets the day key for a date string.
 * @param {string} dateStr - The date string.
 * @returns {string|null} The day key, or null for weekends.
 */
export function dayKeyFromDateStr(dateStr) {
  const d = parseDate(dateStr);
  const jsDay = d.getDay();
  const map = { 0: 'mon', 1: 'tue', 2: 'wed', 3: 'thu', 4: 'fri', 5: 'sat', 6: 'sun' };
  return map[jsDay] || null;
}

/**
 * Normalizes a list of time blocks by merging overlapping ones.
 * @param {Array<Object>} blocks - The list of time blocks.
 * @returns {Array<Object>} The normalized list.
 */
export function normalizeBlocks(blocks = []) {
  const arr = blocks.slice().filter((b) => b && b.start && b.end && t2min(b.start) < t2min(b.end)).sort((a, b) => t2min(a.start) - t2min(b.start));
  const merged = [];
  for (const b of arr) {
    if (!merged.length) merged.push({ ...b });
    else {
      const last = merged[merged.length - 1];
      if (t2min(b.start) <= t2min(last.end)) {
        if (t2min(b.end) > t2min(last.end)) last.end = b.end;
      } else {
        merged.push({ ...b });
      }
    }
  }
  return merged;
}

/**
 * Calculates free time windows between time blocks.
 * @param {Array<Object>} blocks - The time blocks.
 * @param {string} dayStart - The start time of the day.
 * @param {string} dayEnd - The end time of the day.
 * @returns {Array<Object>} A list of free time windows.
 */
export function freeWindows(blocks, dayStart = '00:00', dayEnd = '23:59') {
  const res = [];
  const merged = normalizeBlocks(blocks);
  let cursor = t2min(dayStart);
  const endDay = t2min(dayEnd);
  for (const b of merged) {
    const s = t2min(b.start);
    const e = t2min(b.end);
    if (s > cursor) res.push({ start: min2t(cursor), end: min2t(s) });
    cursor = Math.max(cursor, e);
  }
  if (cursor < endDay) res.push({ start: min2t(cursor), end: min2t(endDay) });
  return res;
}

/**
 * Checks if a time falls within a list of time blocks.
 * @param {string} time - The time string.
 * @param {Array<Object>} blocks - The list of time blocks.
 * @returns {boolean} True if the time is within a block, otherwise false.
 */
export function timeFallsInBlocks(time, blocks = []) {
  if (!time) return false;
  const tm = t2min(time);
  return normalizeBlocks(blocks).some((b) => tm >= t2min(b.start) && tm < t2min(b.end));
}

/**
 * Calculates the next revision date for a task.
 * @param {Object} task - The task object.
 * @returns {Date|null} The next revision date, or null if no more revisions are needed.
 */
export function getNextRevisionDate(task) {
  if (!task.revisable || task.revisionStage >= 3) return null;
  const base = parseDate(task.createdAt || task.date);
  const offsets = [7, 30, 90];
  return addDays(base, offsets[task.revisionStage]);
}

/**
 * Gets the Monday date of an ISO week.
 * @param {number} week - ISO week number.
 * @param {number} year - The year.
 * @returns {Date} The Date object for Monday of that week.
 */
export function firstDateOfISOWeek(week, year) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = new Date(simple);
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Converts a week key (YYYY-Wxx) and a day key (mon–fri) into a date string (YYYY-MM-DD).
 * @param {string} weekKey - Week key like "2025-W35".
 * @param {string} dayKey - Day key ("mon", "tue", ..., "fri").
 * @returns {string} ISO date string for that day.
 */
export function dateStrFromWeekAndDay(weekKey, dayKey) {
  const [year, weekStr] = weekKey.split("-W");
  const week = parseInt(weekStr, 10);
  const firstDay = firstDateOfISOWeek(week, parseInt(year, 10)); // Monday
  const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayIndex = days.indexOf(dayKey);
  console.log("day index",dayIndex);
  
  if (dayIndex === -1) throw new Error(`Invalid dayKey: ${dayKey}`);
  return toISODate(addDays(firstDay, dayIndex));
}



/**
 * Calculates the date string for a specific day within the same week as a given date.
 * @param {string} dateStr - The reference date string (e.g., '2025-09-03').
 * @param {string} targetDayKey - The key of the target day (e.g., 'mon', 'tue').
 * @returns {string} The date string of the target day (e.g., '2025-09-01').
 */
export const getDateForDayInWeek = (dateStr, targetDayKey) => {
  // Assumes you have these helper functions already:
  // parseDate(dateStr): Converts 'YYYY-MM-DD' string to a Date object.
  // addDays(date, num): Returns a new Date object with 'num' days added.
  // toISODate(date): Converts a Date object to a 'YYYY-MM-DD' string.

  const date = parseDate(dateStr);
  
  // Standard JS: Sunday is 0, Monday is 1, etc.
  // We'll adjust to a Monday-first index (mon=0, sun=6) for easier calculation.
  const currentDayIndex = (date.getDay() === 0) ? 6 : date.getDay() - 1;
  const targetDayIndex = dayKeys.indexOf(targetDayKey);
  
  const dayDifference = targetDayIndex - currentDayIndex;
  
  const resultDate = addDays(date, dayDifference);
  
  return toISODate(resultDate);
};