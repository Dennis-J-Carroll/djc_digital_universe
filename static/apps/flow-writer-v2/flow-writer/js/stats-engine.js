/* ============================================================
   Flow Writer -- Stats Engine
   Stats aggregation, daily targets, and session analytics.
   Uses existing `settings` store as lightweight fallback to
   avoid IndexedDB version migration in Phase 2.
   ============================================================ */

import { setSettings, getSettings, getAllBranches } from './db.js';

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

const STORE_SESSIONS = 'sessions';
const STORE_DAILY_STATS = 'daily_stats';
const SETTINGS_DAILY_TARGET = 'dailyTarget';
const DEFAULT_DAILY_TARGET = 1500;
const MAX_SESSIONS = 100;

// ------------------------------------------------------------------
// Runtime State
// ------------------------------------------------------------------

let _currentSession = null; // { startTime, initialWordCount, wordsWritten, wordsDeleted }
let _lastWordCount = 0;

// ------------------------------------------------------------------
// Init
// ------------------------------------------------------------------

export async function initStatsEngine() {
  // Ensure daily target exists
  const settings = await getSettings();
  if (!settings[SETTINGS_DAILY_TARGET]) {
    await setSettings(SETTINGS_DAILY_TARGET, DEFAULT_DAILY_TARGET);
  }
}

// ------------------------------------------------------------------
// Session Recording
// ------------------------------------------------------------------

/**
 * Record a completed writing session.
 * @param {{ branchId: string, docId: string, startTime: number, endTime: number, wordsWritten: number, wordsDeleted: number, sprintId?: string }} session
 */
export async function recordSession(session) {
  const sessions = await _loadSessions();
  sessions.push({
    id: _generateId(),
    ...session,
  });

  // Prune to max 100
  if (sessions.length > MAX_SESSIONS) {
    sessions.sort((a, b) => b.startTime - a.startTime);
    sessions.length = MAX_SESSIONS;
  }

  await setSettings(STORE_SESSIONS, sessions);

  // Update daily_stats
  await _updateDailyStats(session.endTime || Date.now(), session.wordsWritten || 0, (session.endTime - session.startTime) || 0);
}

// ------------------------------------------------------------------
// Stats Retrieval
// ------------------------------------------------------------------

/**
 * Get today's stats.
 * @returns {Promise<{ totalWords: number, totalTime: number, sessions: number, sprintsCompleted: number }>}
 */
export async function getTodayStats() {
  const todayKey = _getDateKey(Date.now());
  const dailyStats = await _loadDailyStats();
  const today = dailyStats[todayKey];

  if (today) {
    return {
      totalWords: today.totalWords || 0,
      totalTime: today.totalTime || 0,
      sessions: today.sessions || 0,
      sprintsCompleted: today.sprintsCompleted || 0,
    };
  }

  return { totalWords: 0, totalTime: 0, sessions: 0, sprintsCompleted: 0 };
}

/**
 * Get stats for the last 7 days.
 * @returns {Promise<Array<{ date: string, totalWords: number, totalTime: number }>>}
 */
export async function getWeekStats() {
  const dailyStats = await _loadDailyStats();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = _getDateKey(d.getTime());
    const dayStat = dailyStats[dateKey];

    result.push({
      date: dateKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      totalWords: dayStat?.totalWords || 0,
      totalTime: dayStat?.totalTime || 0,
    });
  }

  return result;
}

/**
 * Get all-time stats.
 * @returns {Promise<{ totalWords: number, totalTime: number, longestStreak: number, avgWordsPerSession: number, sessionsCount: number }>}
 */
export async function getAllTimeStats() {
  const sessions = await _loadSessions();
  const dailyStats = await _loadDailyStats();

  let totalWords = 0;
  let totalTime = 0;
  let sessionsCount = sessions.length;

  for (const s of sessions) {
    totalWords += s.wordsWritten || 0;
    totalTime += (s.endTime - s.startTime) || 0;
  }

  // Calculate longest streak from daily stats
  const longestStreak = _calculateLongestStreak(dailyStats);
  const avgWordsPerSession = sessionsCount > 0 ? Math.round(totalWords / sessionsCount) : 0;

  return {
    totalWords,
    totalTime,
    longestStreak,
    avgWordsPerSession,
    sessionsCount,
  };
}

/**
 * Get per-branch word counts.
 * @returns {Promise<Array<{ branchId: string, branchName: string, wordCount: number }>>}
 */
export async function getBranchStats() {
  const branches = await getAllBranches();
  return branches.map(b => ({
    branchId: b.id,
    branchName: b.name,
    wordCount: b.metadata?.wordCount || 0,
  }));
}

// ------------------------------------------------------------------
// Daily Target
// ------------------------------------------------------------------

/**
 * Get current daily target progress.
 * @returns {Promise<{ target: number, current: number, percent: number }>}
 */
export async function getDailyTarget() {
  const settings = await getSettings();
  const target = settings[SETTINGS_DAILY_TARGET] || DEFAULT_DAILY_TARGET;
  const todayStats = await getTodayStats();
  const current = todayStats.totalWords;
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return { target, current, percent };
}

/**
 * Set daily word target.
 * @param {number} words
 */
export async function setDailyTarget(words) {
  const n = Number(words);
  if (n > 0) {
    await setSettings(SETTINGS_DAILY_TARGET, n);
  }
}

// ------------------------------------------------------------------
// Word Delta Tracking
// ------------------------------------------------------------------

/**
 * Called on editor input to track word deltas.
 * Calculates words written vs deleted by comparing current and previous word counts.
 * @param {string} editorValue - Current editor text
 * @param {string} previousValue - Previous editor text
 * @returns {{ wordsWritten: number, wordsDeleted: number }}
 */
export function trackWordDelta(editorValue, previousValue) {
  const currentWords = _countWords(editorValue);
  const previousWords = _countWords(previousValue);
  const delta = currentWords - previousWords;

  const wordsWritten = delta > 0 ? delta : 0;
  const wordsDeleted = delta < 0 ? Math.abs(delta) : 0;

  // Update current session tracking
  if (!_currentSession) {
    _currentSession = {
      startTime: Date.now(),
      initialWordCount: previousWords,
      wordsWritten: 0,
      wordsDeleted: 0,
    };
  }

  _currentSession.wordsWritten += wordsWritten;
  _currentSession.wordsDeleted += wordsDeleted;
  _lastWordCount = currentWords;

  return { wordsWritten, wordsDeleted };
}

/**
 * Reset the current in-progress session tracker.
 */
export function resetCurrentSession() {
  _currentSession = null;
}

/**
 * Get the current session's accumulated stats.
 */
export function getCurrentSessionStats() {
  if (!_currentSession) return null;
  return {
    wordsWritten: _currentSession.wordsWritten,
    wordsDeleted: _currentSession.wordsDeleted,
    duration: Date.now() - _currentSession.startTime,
  };
}

/**
 * End the current session and persist it.
 * @param {string} branchId
 * @param {string} docId
 */
export async function endAndRecordSession(branchId, docId) {
  if (!_currentSession) return;

  const now = Date.now();
  await recordSession({
    branchId,
    docId,
    startTime: _currentSession.startTime,
    endTime: now,
    wordsWritten: _currentSession.wordsWritten,
    wordsDeleted: _currentSession.wordsDeleted,
  });

  _currentSession = null;
}

// ------------------------------------------------------------------
// Editor Input Hook
// ------------------------------------------------------------------

/**
 * Lightweight hook called on editor input for daily target tracking.
 * @param {number} currentTotalWords - Current total word count across all docs
 */
export function onEditorInput(currentTotalWords) {
  // This is a lightweight update that triggers daily target re-renders
  // The actual delta tracking is done via trackWordDelta()
  _lastWordCount = currentTotalWords;
}

/**
 * Get the last known word count.
 */
export function getLastWordCount() {
  return _lastWordCount;
}

// ------------------------------------------------------------------
// Internal: Persistence helpers
// ------------------------------------------------------------------

async function _loadSessions() {
  try {
    const settings = await getSettings();
    if (settings[STORE_SESSIONS]) {
      const sessions = typeof settings[STORE_SESSIONS] === 'string'
        ? JSON.parse(settings[STORE_SESSIONS])
        : settings[STORE_SESSIONS];
      return Array.isArray(sessions) ? sessions : [];
    }
  } catch {
    // ignore
  }
  return [];
}

async function _loadDailyStats() {
  try {
    const settings = await getSettings();
    if (settings[STORE_DAILY_STATS]) {
      const stats = typeof settings[STORE_DAILY_STATS] === 'string'
        ? JSON.parse(settings[STORE_DAILY_STATS])
        : settings[STORE_DAILY_STATS];
      return stats && typeof stats === 'object' ? stats : {};
    }
  } catch {
    // ignore
  }
  return {};
}

async function _updateDailyStats(timestamp, wordsWritten, durationMs) {
  const dateKey = _getDateKey(timestamp);
  const dailyStats = await _loadDailyStats();

  if (!dailyStats[dateKey]) {
    dailyStats[dateKey] = {
      date: dateKey,
      totalWords: 0,
      totalTime: 0,
      sessions: 0,
      sprintsCompleted: 0,
    };
  }

  dailyStats[dateKey].totalWords += wordsWritten || 0;
  dailyStats[dateKey].totalTime += durationMs || 0;
  dailyStats[dateKey].sessions += 1;

  // Prune old entries: keep last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffKey = _getDateKey(cutoff.getTime());

  const pruned = {};
  for (const [key, value] of Object.entries(dailyStats)) {
    if (key >= cutoffKey) {
      pruned[key] = value;
    }
  }

  await setSettings(STORE_DAILY_STATS, pruned);
}

// ------------------------------------------------------------------
// Internal: Helpers
// ------------------------------------------------------------------

function _countWords(text) {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function _getDateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function _calculateLongestStreak(dailyStats) {
  const dates = Object.keys(dailyStats)
    .filter(d => dailyStats[d].totalWords > 0)
    .sort();

  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffMs = curr - prev;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays <= 1.5) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

function _generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Format milliseconds to human-readable time.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format a number with commas.
 * @param {number} n
 * @returns {string}
 */
export function formatNumber(n) {
  return n.toLocaleString();
}
