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
 * Gets ISO week information for a date.
 * @param {Date} dateObj - The Date object.
 * @returns {{year: number, week: number}} The year and week number.
 */
export function getISOWeekInfo(dateObj) {
  const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

/**
 * Creates a unique key for a week from a date string.
 * @param {string} dateStr - The date string.
 * @returns {string} The week key.
 */
export function weekKeyFromDateStr(dateStr) {
  const info = getISOWeekInfo(parseDate(dateStr));
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

export const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri'];

/**
 * Gets the day key for a date string.
 * @param {string} dateStr - The date string.
 * @returns {string|null} The day key, or null for weekends.
 */
export function dayKeyFromDateStr(dateStr) {
  const d = parseDate(dateStr);
  const jsDay = d.getDay();
  const map = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri' };
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