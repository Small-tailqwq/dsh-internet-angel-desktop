export type PomodoroPhase = 'focus' | 'break'

export interface PomodoroSnapshot {
  phase: PomodoroPhase
  running: boolean
  remainingMs: number
  focusMinutes: number
  breakMinutes: number
  completedFocus: number
  longBreak: boolean
}

interface StoredPomodoro extends Omit<PomodoroSnapshot, 'remainingMs'> {
  remainingMs: number
  deadlineMs: number | undefined
}

export interface PomodoroTransition {
  from: PomodoroPhase
  to: PomodoroPhase
  natural: boolean
  longBreak: boolean
}

export interface PomodoroController {
  snapshot(): PomodoroSnapshot
  toggle(): void
  skip(): void
  reset(): void
  configure(focusMinutes: number, breakMinutes: number): void
  dispose(): void
}

const DEFAULT_FOCUS_MINUTES = 25
const DEFAULT_BREAK_MINUTES = 5
const LONG_BREAK_MINUTES = 15
const MINUTE_MS = 60_000

function clampMinutes(value: number): number {
  return Math.max(1, Math.min(180, Math.round(value)))
}

export function createPomodoroController(options: {
  storage?: Storage
  storageKey?: string
  now?: () => number
  onChange(snapshot: PomodoroSnapshot): void
  onTransition?(transition: PomodoroTransition): void
}): PomodoroController {
  const now = options.now ?? Date.now
  const storage = options.storage
  const storageKey = options.storageKey ?? 'ngo:pomodoro:v1'
  let tickTimer: number | undefined
  let state: StoredPomodoro = {
    phase: 'focus',
    running: false,
    remainingMs: DEFAULT_FOCUS_MINUTES * MINUTE_MS,
    focusMinutes: DEFAULT_FOCUS_MINUTES,
    breakMinutes: DEFAULT_BREAK_MINUTES,
    completedFocus: 0,
    longBreak: false,
    deadlineMs: undefined,
  }

  try {
    const stored = storage?.getItem(storageKey)
    if (stored !== null && stored !== undefined) {
      const parsed = JSON.parse(stored) as Partial<StoredPomodoro>
      const focusMinutes = clampMinutes(Number(parsed.focusMinutes) || DEFAULT_FOCUS_MINUTES)
      const breakMinutes = clampMinutes(Number(parsed.breakMinutes) || DEFAULT_BREAK_MINUTES)
      const phase: PomodoroPhase = parsed.phase === 'break' ? 'break' : 'focus'
      const running = parsed.running === true && Number.isFinite(parsed.deadlineMs)
      state = {
        phase,
        running,
        remainingMs: Math.max(0, Number(parsed.remainingMs)
          || (phase === 'focus' ? focusMinutes : breakMinutes) * MINUTE_MS),
        focusMinutes,
        breakMinutes,
        completedFocus: Math.max(0, Math.floor(Number(parsed.completedFocus) || 0)),
        longBreak: parsed.longBreak === true,
        deadlineMs: running ? Number(parsed.deadlineMs) : undefined,
      }
    }
  } catch {
    // A damaged local preference must not prevent the desktop from mounting.
  }

  const remaining = (): number => state.running && state.deadlineMs !== undefined
    ? Math.max(0, state.deadlineMs - now())
    : state.remainingMs

  const snapshot = (): PomodoroSnapshot => ({
    phase: state.phase,
    running: state.running,
    remainingMs: remaining(),
    focusMinutes: state.focusMinutes,
    breakMinutes: state.breakMinutes,
    completedFocus: state.completedFocus,
    longBreak: state.longBreak,
  })

  const persist = (): void => {
    try { storage?.setItem(storageKey, JSON.stringify({ ...state, remainingMs: remaining() })) } catch {}
  }
  const paint = (): void => {
    options.onChange(snapshot())
    persist()
  }
  const stopTicker = (): void => {
    if (tickTimer !== undefined) window.clearInterval(tickTimer)
    tickTimer = undefined
  }
  const startTicker = (): void => {
    stopTicker()
    tickTimer = window.setInterval(tick, 250)
  }
  const enter = (phase: PomodoroPhase, natural: boolean): void => {
    const from = state.phase
    let longBreak = false
    if (from === 'focus' && phase === 'break' && natural) state.completedFocus += 1
    if (phase === 'break') longBreak = natural && state.completedFocus > 0 && state.completedFocus % 4 === 0
    state.phase = phase
    state.longBreak = longBreak
    state.running = true
    state.remainingMs = (phase === 'focus'
      ? state.focusMinutes
      : longBreak ? LONG_BREAK_MINUTES : state.breakMinutes) * MINUTE_MS
    state.deadlineMs = now() + state.remainingMs
    options.onTransition?.({ from, to: phase, natural, longBreak })
    startTicker()
    paint()
  }
  function tick(): void {
    if (!state.running) return
    if (remaining() > 0) {
      options.onChange(snapshot())
      return
    }
    enter(state.phase === 'focus' ? 'break' : 'focus', true)
  }

  if (state.running) {
    if (remaining() <= 0) enter(state.phase === 'focus' ? 'break' : 'focus', true)
    else startTicker()
  }
  paint()

  return {
    snapshot,
    toggle(): void {
      if (state.running) {
        state.remainingMs = remaining()
        state.running = false
        state.deadlineMs = undefined
        stopTicker()
      } else {
        state.running = true
        state.deadlineMs = now() + Math.max(1, state.remainingMs)
        startTicker()
      }
      paint()
    },
    skip(): void {
      enter(state.phase === 'focus' ? 'break' : 'focus', false)
    },
    reset(): void {
      stopTicker()
      state.phase = 'focus'
      state.running = false
      state.longBreak = false
      state.remainingMs = state.focusMinutes * MINUTE_MS
      state.deadlineMs = undefined
      paint()
    },
    configure(focusMinutes: number, breakMinutes: number): void {
      state.focusMinutes = clampMinutes(focusMinutes)
      state.breakMinutes = clampMinutes(breakMinutes)
      if (!state.running) {
        state.phase = 'focus'
        state.longBreak = false
        state.remainingMs = state.focusMinutes * MINUTE_MS
      }
      paint()
    },
    dispose(): void {
      stopTicker()
      persist()
    },
  }
}
