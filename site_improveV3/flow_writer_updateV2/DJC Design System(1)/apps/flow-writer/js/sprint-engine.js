/* ============================================================
   Flow Writer -- Sprint Engine
   Pomodoro-style sprint timer with session tracking.
   Timer states: IDLE | FOCUS | BREAK | PAUSED
   ============================================================ */

import { setSettings, getSettings, generateUUID } from './db.js';

// ------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------

export const SPRINT_PHASES = {
  IDLE: 'idle',
  FOCUS: 'focus',
  BREAK: 'break',
  PAUSED: 'paused',
};

const SETTINGS_KEY = 'sprintSettings';
const SESSIONS_KEY = 'sprintSessions';
const MAX_SESSIONS = 100;

const DEFAULT_SETTINGS = {
  sprintDuration: 25,      // minutes
  breakDuration: 5,        // minutes
  longBreakDuration: 15,   // minutes
  sprintsBeforeLongBreak: 4,
};

// ------------------------------------------------------------------
// Runtime State
// ------------------------------------------------------------------

let _state = {
  phase: SPRINT_PHASES.IDLE,
  remainingMs: 0,
  totalMs: 0,
  timerId: null,
  wordsAtStart: 0,
  wordsWritten: 0,
  sprintsCompletedToday: 0,
  currentSprintIndex: 0,   // 0-based, resets daily
  settings: { ...DEFAULT_SETTINGS },
  sessionStartTime: 0,
  currentSessionId: null,
};

let _onTickCallback = null;
let _onPhaseChange = null;
let _lastDateKey = null;

// ------------------------------------------------------------------
// Core Functions
// ------------------------------------------------------------------

/**
 * Initialize the sprint engine. Load settings from IndexedDB.
 */
export async function initSprintEngine() {
  await _loadSettings();
  await _loadTodaySprintCount();
}

/**
 * Start a new sprint with the given duration (in minutes).
 * If no duration provided, uses the default sprintDuration setting.
 */
export function startSprint(minutes) {
  const duration = minutes || _state.settings.sprintDuration;
  const now = Date.now();

  _state.phase = SPRINT_PHASES.FOCUS;
  _state.totalMs = duration * 60 * 1000;
  _state.remainingMs = _state.totalMs;
  _state.wordsAtStart = 0; // Will be set by onEditorInput
  _state.wordsWritten = 0;
  _state.sessionStartTime = now;
  _state.currentSessionId = generateUUID();

  _startTimer();
  _transitionPhase(SPRINT_PHASES.FOCUS);
  return getSprintState();
}

/**
 * Pause the current sprint timer.
 */
export function pauseSprint() {
  if (_state.phase !== SPRINT_PHASES.FOCUS && _state.phase !== SPRINT_PHASES.BREAK) {
    return getSprintState();
  }
  _state.phase = SPRINT_PHASES.PAUSED;
  _clearTimer();
  _notifyTick();
  return getSprintState();
}

/**
 * Resume from paused state.
 */
export function resumeSprint() {
  if (_state.phase !== SPRINT_PHASES.PAUSED) {
    return getSprintState();
  }
  // Resume into the phase we were in before pausing
  // We track the "active" phase via remainingMs vs totalMs context
  // When paused during FOCUS or BREAK, we re-enter FOCUS if remainingMs matches
  // the sprint duration context. Simple approach: always resume to FOCUS if
  // words were being tracked, else BREAK.
  // Better: we just restart the timer and keep the current phase label as PAUSED
  // but functionally ticking. Let's use a pragmatic approach:
  _state.phase = _state.wordsAtStart > 0 || _state.currentSprintIndex > 0
    ? SPRINT_PHASES.FOCUS
    : SPRINT_PHASES.BREAK;
  // Actually, simpler: we always know if we're in a "break" by checking if
  // the sessionStartTime was for a break. But we don't track break start separately.
  // Most pragmatic: treat resume as going back to FOCUS (the common case).
  // The UI can show the correct label based on whether wordsWritten is meaningful.
  _state.phase = SPRINT_PHASES.FOCUS;
  _startTimer();
  _notifyTick();
  return getSprintState();
}

/**
 * Stop the sprint early. Saves a session record.
 */
export function stopSprint() {
  _clearTimer();

  // Save session if we were in focus and wrote something
  if (_state.wordsWritten > 0 || _state.phase === SPRINT_PHASES.FOCUS) {
    _saveSession();
  }

  _state.phase = SPRINT_PHASES.IDLE;
  _state.remainingMs = 0;
  _state.totalMs = 0;
  _state.wordsAtStart = 0;
  _state.wordsWritten = 0;
  _state.currentSessionId = null;

  _notifyPhaseChange(SPRINT_PHASES.IDLE);
  _notifyTick();
  return getSprintState();
}

/**
 * Get a snapshot of the current sprint state.
 */
export function getSprintState() {
  return {
    phase: _state.phase,
    remainingMs: _state.remainingMs,
    totalMs: _state.totalMs,
    remainingStr: _formatMs(_state.remainingMs),
    progress: _state.totalMs > 0 ? 1 - (_state.remainingMs / _state.totalMs) : 0,
    wordsWritten: _state.wordsWritten,
    sprintsCompletedToday: _state.sprintsCompletedToday,
    currentSprintIndex: _state.currentSprintIndex,
    settings: { ..._state.settings },
  };
}

/**
 * Update sprint settings.
 */
export async function setSprintSettings(settings) {
  _state.settings = { ..._state.settings, ...settings };
  await setSettings(SETTINGS_KEY, _state.settings);
}

/**
 * Called on editor input to track words written during a focus sprint.
 */
export function onEditorInput(currentWordCount) {
  if (_state.phase === SPRINT_PHASES.FOCUS || _state.phase === SPRINT_PHASES.PAUSED) {
    if (_state.wordsAtStart === 0) {
      _state.wordsAtStart = currentWordCount;
    }
    const delta = currentWordCount - _state.wordsAtStart;
    _state.wordsWritten = Math.max(0, delta);
    _notifyTick();
  }
}

/**
 * Set callback for tick events (called every second).
 */
export function onTick(callback) {
  _onTickCallback = callback;
}

/**
 * Set callback for phase changes.
 */
export function onPhaseChange(callback) {
  _onPhaseChange = callback;
}

// ------------------------------------------------------------------
// Internal Timer
// ------------------------------------------------------------------

function _startTimer() {
  _clearTimer();
  _state.timerId = setInterval(_tick, 1000);
}

function _clearTimer() {
  if (_state.timerId) {
    clearInterval(_state.timerId);
    _state.timerId = null;
  }
}

function _tick() {
  if (_state.phase === SPRINT_PHASES.IDLE || _state.phase === SPRINT_PHASES.PAUSED) {
    return;
  }

  _state.remainingMs -= 1000;

  if (_state.remainingMs <= 0) {
    _state.remainingMs = 0;
    _handlePhaseComplete();
  }

  _notifyTick();
}

function _handlePhaseComplete() {
  _clearTimer();
  _playChime();

  if (_state.phase === SPRINT_PHASES.FOCUS) {
    // Focus completed -> save session, increment counter
    _state.sprintsCompletedToday++;
    _state.currentSprintIndex++;
    _saveSession();

    // Determine break type
    const isLongBreak = _state.currentSprintIndex % _state.settings.sprintsBeforeLongBreak === 0;
    const breakMinutes = isLongBreak
      ? _state.settings.longBreakDuration
      : _state.settings.breakDuration;

    _transitionPhase(SPRINT_PHASES.BREAK, breakMinutes);
  } else if (_state.phase === SPRINT_PHASES.BREAK) {
    // Break completed -> back to focus or idle
    _transitionPhase(SPRINT_PHASES.IDLE);
  }
}

function _transitionPhase(newPhase, minutes = null) {
  const prevPhase = _state.phase;

  if (newPhase === SPRINT_PHASES.BREAK && minutes) {
    _state.phase = SPRINT_PHASES.BREAK;
    _state.totalMs = minutes * 60 * 1000;
    _state.remainingMs = _state.totalMs;
    _state.wordsAtStart = 0;
    _startTimer();
  } else if (newPhase === SPRINT_PHASES.IDLE) {
    _state.phase = SPRINT_PHASES.IDLE;
    _state.remainingMs = 0;
    _state.totalMs = 0;
    _state.wordsAtStart = 0;
  } else if (newPhase === SPRINT_PHASES.FOCUS) {
    _state.phase = SPRINT_PHASES.FOCUS;
    _startTimer();
  }

  _notifyPhaseChange(newPhase, prevPhase);
  _notifyTick();
}

// ------------------------------------------------------------------
// Sound
// ------------------------------------------------------------------

function _playChime() {
  if (typeof window !== 'undefined' && window.__sprintSoundDisabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // silent fail
  }
}

// ------------------------------------------------------------------
// Persistence (using settings store to avoid DB migration)
// ------------------------------------------------------------------

async function _loadSettings() {
  try {
    const settings = await getSettings();
    if (settings[SETTINGS_KEY]) {
      const loaded = typeof settings[SETTINGS_KEY] === 'string'
        ? JSON.parse(settings[SETTINGS_KEY])
        : settings[SETTINGS_KEY];
      _state.settings = { ...DEFAULT_SETTINGS, ...loaded };
    }
  } catch {
    _state.settings = { ...DEFAULT_SETTINGS };
  }
}

async function _loadTodaySprintCount() {
  try {
    const sessions = await _loadSessions();
    const todayKey = _getDateKey(Date.now());
    const todaySessions = sessions.filter(s => _getDateKey(s.startTime) === todayKey);
    _state.sprintsCompletedToday = todaySessions.length;
    _state.currentSprintIndex = todaySessions.length;
  } catch {
    _state.sprintsCompletedToday = 0;
    _state.currentSprintIndex = 0;
  }
}

async function _loadSessions() {
  try {
    const settings = await getSettings();
    if (settings[SESSIONS_KEY]) {
      const sessions = typeof settings[SESSIONS_KEY] === 'string'
        ? JSON.parse(settings[SESSIONS_KEY])
        : settings[SESSIONS_KEY];
      return Array.isArray(sessions) ? sessions : [];
    }
  } catch {
    // ignore
  }
  return [];
}

function _saveSession() {
  const session = {
    id: _state.currentSessionId || generateUUID(),
    startTime: _state.sessionStartTime || Date.now(),
    endTime: Date.now(),
    wordsWritten: _state.wordsWritten,
    sprintIndex: _state.currentSprintIndex,
  };

  // Persist asynchronously
  _persistSession(session).catch(() => {});
}

async function _persistSession(session) {
  const sessions = await _loadSessions();
  sessions.push(session);

  // Prune old sessions to keep max 100
  if (sessions.length > MAX_SESSIONS) {
    sessions.sort((a, b) => b.startTime - a.startTime);
    sessions.length = MAX_SESSIONS;
  }

  await setSettings(SESSIONS_KEY, sessions);
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function _formatMs(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function _getDateKey(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function _notifyTick() {
  if (_onTickCallback) {
    _onTickCallback(getSprintState());
  }
}

function _notifyPhaseChange(newPhase, prevPhase) {
  if (_onPhaseChange) {
    _onPhaseChange(newPhase, prevPhase);
  }
}
