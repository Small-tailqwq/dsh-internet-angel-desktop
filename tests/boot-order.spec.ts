// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Context } from 'cordis'
import { installDailyTransition } from '../src/client/daily-transition.ts'
import { installLightModeLock } from '../src/client/light-mode-lock.ts'
import type { Sfx } from '../src/client/sfx.ts'

const sfx = { play: vi.fn() } as unknown as Sfx

/** Minimal theme host: snapshot plus `theme/change` subscribers. */
function themeHost(initial: { preference: string, revision: number, scheme: 'light' | 'dark' }, available = true) {
  let snapshot = initial
  let present = available
  const listeners = new Set<() => void>()
  const theme = {
    getTheme: () => ({
      preference: snapshot.preference,
      revision: snapshot.revision,
      fontSize: 14,
      active: { colorScheme: snapshot.scheme },
    }),
    setTheme: vi.fn(),
  }
  const ctx = {
    get: (name: string) => name === 'theme' && present ? theme : undefined,
    on: (_name: string, listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
  } as unknown as Context
  return {
    ctx,
    adopt(next: { preference: string, scheme: 'light' | 'dark' }) {
      present = true
      snapshot = { ...next, revision: snapshot.revision + 1 }
      for (const listener of listeners) listener()
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  document.body.replaceChildren()
  for (const { name } of [...document.body.attributes]) document.body.removeAttribute(name)
})

describe('startup order between the forced-light boot and the daily calendar', () => {
  it('holds the calendar until the theme decision is known', () => {
    let ready: (() => void) | undefined
    const dispose = installDailyTransition(sfx, 'heart.png', () => ({
      showWeekday: true, emphasis: 'off', emphasizedWeekdays: [], emphasisColor: '#ff536f',
    }), (callback) => {
      ready = callback
      return () => { ready = undefined }
    })
    expect(document.querySelector('[data-ngo-daily-transition]')).toBeNull()
    ready?.()
    expect(document.querySelector('[data-ngo-daily-transition]')).not.toBeNull()
    dispose()
  })

  it('settles only after the host preference lands, then without a boot when it is light', () => {
    vi.useFakeTimers()
    const host = themeHost({ preference: 'system', revision: 0, scheme: 'dark' })
    const lock = installLightModeLock(host.ctx)
    const settled = vi.fn()
    lock.whenThemeSettled(settled)
    vi.advanceTimersByTime(1000)
    expect(settled).not.toHaveBeenCalled()
    host.adopt({ preference: 'light', scheme: 'light' })
    expect(settled).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-ngo-light-boot]')).toBeNull()
    lock.dispose()
  })

  it('boots first and only then settles when the dark start outlasts the grace period', () => {
    vi.useFakeTimers()
    const host = themeHost({ preference: 'system', revision: 0, scheme: 'dark' })
    const lock = installLightModeLock(host.ctx)
    const order: string[] = []
    lock.whenThemeSettled(() => {
      order.push(document.querySelector('[data-ngo-light-boot]') === null ? 'settled-without-boot' : 'settled-after-boot')
    })
    vi.advanceTimersByTime(1500)
    expect(order).toEqual(['settled-after-boot'])
    lock.dispose()
  })

  it('does not settle a light OS start before the preference or the grace period', () => {
    vi.useFakeTimers()
    const host = themeHost({ preference: 'system', revision: 0, scheme: 'light' })
    const lock = installLightModeLock(host.ctx)
    const settled = vi.fn()
    lock.whenThemeSettled(settled)
    vi.advanceTimersByTime(1499)
    expect(settled).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(settled).toHaveBeenCalledTimes(1)
    lock.dispose()
  })

  it('replays the 0.2.0-rc.2 cold desktop start without a forced boot', () => {
    vi.useFakeTimers()
    // The skin mounts before the theme service; its first snapshot is already
    // revision 1 (system/dark) and the saved light preference follows.
    const host = themeHost({ preference: 'system', revision: 0, scheme: 'dark' }, false)
    const lock = installLightModeLock(host.ctx)
    const settled = vi.fn()
    lock.whenThemeSettled(settled)
    vi.advanceTimersByTime(300)
    host.adopt({ preference: 'system', scheme: 'dark' })
    expect(settled).not.toHaveBeenCalled()
    host.adopt({ preference: 'light', scheme: 'light' })
    expect(settled).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(5000)
    expect(document.querySelector('[data-ngo-light-boot]')).toBeNull()
    lock.dispose()
  })

  it('still forces the light reboot for an explicit dark preference', () => {
    vi.useFakeTimers()
    const host = themeHost({ preference: 'dark', revision: 3, scheme: 'dark' })
    const lock = installLightModeLock(host.ctx)
    expect(document.querySelector('[data-ngo-light-boot]')).not.toBeNull()
    lock.dispose()
  })

  it('plays the opening BIOS before the calendar on a fresh page', async () => {
    vi.useFakeTimers()
    const host = themeHost({ preference: 'light', revision: 2, scheme: 'light' })
    const lock = installLightModeLock(host.ctx, undefined, { startupBoot: true })
    const dispose = installDailyTransition(sfx, 'heart.png', () => ({
      showWeekday: true, emphasis: 'off', emphasizedWeekdays: [], emphasisColor: '#ff536f',
    }), ready => lock.whenThemeSettled(ready))
    expect(document.querySelector('[data-ngo-light-boot]')).not.toBeNull()
    expect(document.querySelector('[data-ngo-daily-transition]')).toBeNull()
    // Skip BIOS and splash, then accept the caution notice.
    const overlay = document.querySelector<HTMLElement>('[data-ngo-light-boot]')!
    overlay.click()
    overlay.click()
    expect(overlay.dataset.bootStage).toBe('caution')
    document.querySelector<HTMLButtonElement>("[data-boot-action='accept']")!.click()
    expect(document.querySelector('[data-ngo-light-boot]')).toBeNull()
    await Promise.resolve()
    expect(document.querySelector('[data-ngo-daily-transition]')).not.toBeNull()
    expect(host.ctx.get('theme')).toBeDefined()
    dispose()
    lock.dispose()
  })
})
