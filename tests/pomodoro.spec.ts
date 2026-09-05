// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPomodoroController, type PomodoroSnapshot } from '../src/client/pomodoro.ts'

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
})

describe('pomodoro controller', () => {
  it('uses an absolute deadline and persists the active phase', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T10:00:00Z'))
    let latest: PomodoroSnapshot | undefined
    const controller = createPomodoroController({
      storage: localStorage,
      onChange: snapshot => { latest = snapshot },
    })

    controller.toggle()
    vi.advanceTimersByTime(25 * 60_000)
    expect(latest).toMatchObject({ phase: 'break', running: true, completedFocus: 1, longBreak: false })
    expect(latest?.remainingMs).toBe(5 * 60_000)
    controller.dispose()

    vi.advanceTimersByTime(60_000)
    const restored = createPomodoroController({ storage: localStorage, onChange: () => {} })
    expect(restored.snapshot().phase).toBe('break')
    expect(restored.snapshot().remainingMs).toBe(4 * 60_000)
    restored.dispose()
  })

  it('uses a fifteen-minute break after the fourth completed focus', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-24T10:00:00Z'))
    const controller = createPomodoroController({ storage: localStorage, onChange: () => {} })
    controller.configure(1, 1)
    controller.toggle()
    for (let round = 0; round < 3; round += 1) {
      vi.advanceTimersByTime(60_000)
      vi.advanceTimersByTime(60_000)
    }
    vi.advanceTimersByTime(60_000)
    expect(controller.snapshot()).toMatchObject({
      phase: 'break',
      completedFocus: 4,
      longBreak: true,
      remainingMs: 15 * 60_000,
    })
    controller.dispose()
  })
})
