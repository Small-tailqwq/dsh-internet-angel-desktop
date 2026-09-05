// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMedicineEffects } from '../src/client/medicine-effects.ts'

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.replaceChildren()
  document.body.removeAttribute('data-ngo-power-pill')
  document.body.removeAttribute('data-ngo-retro-vision')
  document.body.removeAttribute('data-ngo-gravity-potion')
  document.body.removeAttribute('data-ngo-minecraft-blindness')
  document.body.removeAttribute('data-ngo-minecraft-nausea')
  document.body.removeAttribute('data-ngo-terraria-red-potion')
  document.documentElement.style.transform = ''
  document.documentElement.style.transformOrigin = ''
})

describe('medicine effects', () => {
  it('runs Power Pill for the configured Gamekid interval and cleans up', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({
      effectLayer: 'layer', powerRainbow: 'rainbow', powerPacman: 'pacman', powerPellet: 'pellet',
    }, { gamekidSprite: 'gamekid', powerDurationMs: 65 })
    effects.activate('power-pill')
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(true)
    expect(document.querySelector('[data-medicine-effect-layer] .pacman')).not.toBeNull()
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 80 }))
    expect(document.querySelector('.pacman')?.getAttribute('style')).toContain('120px')
    vi.advanceTimersByTime(65)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(false)
    expect(document.querySelector('[data-medicine-effect-layer]')).toBeNull()
  })

  it('mounts one full-screen Retro Vision compositor and resets after 30 seconds', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({ retroVision: 'retro' }, {
      gamekidSprite: 'gamekid', retroDurationMs: 30,
    })
    effects.activate('retro-vision')
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(true)
    expect(document.querySelector('[data-retro-vision].retro')).not.toBeNull()
    expect(document.querySelector('[data-retro-vision-filter] #ngo-retro-vision-pixelate')).not.toBeNull()
    expect(document.querySelector('[data-retro-vision-surface]')).toBeNull()
    vi.advanceTimersByTime(30)
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(false)
    expect(document.querySelector('[data-retro-vision]')).toBeNull()
    expect(document.querySelector('[data-retro-vision-filter]')).toBeNull()
    effects.dispose()
  })

  it('turns the complete document upside down for Gravity Potion and restores it', () => {
    vi.useFakeTimers()
    document.documentElement.style.transform = 'scale(1)'
    document.documentElement.style.transformOrigin = '0 0'
    const effects = createMedicineEffects({}, { gamekidSprite: 'gamekid', gravityDurationMs: 100 })
    effects.activate('gravity-potion')
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(true)
    expect(document.documentElement.style.transform).toBe('scale(1) rotate(180deg)')
    expect(document.documentElement.style.transformOrigin).toBe('50% 50%')
    vi.advanceTimersByTime(100)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(false)
    expect(document.documentElement.style.transform).toBe('scale(1)')
    expect(document.documentElement.style.transformOrigin).toBe('0 0')
    effects.dispose()
  })

  it('keeps different medicines active on independent timers', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({ effectLayer: 'layer', powerPacman: 'pacman' }, {
      gamekidSprite: 'gamekid',
      powerDurationMs: 100, retroDurationMs: 200, gravityDurationMs: 300,
    })
    effects.activate('power-pill')
    effects.activate('retro-vision')
    effects.activate('gravity-potion')
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(true)

    vi.advanceTimersByTime(100)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(true)
    vi.advanceTimersByTime(100)
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(true)
    vi.advanceTimersByTime(100)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(false)
    effects.dispose()
  })

  it('refreshes only the repeated medicine', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({}, {
      gamekidSprite: 'gamekid', powerDurationMs: 200, gravityDurationMs: 100,
    })
    effects.activate('power-pill')
    effects.activate('gravity-potion')
    vi.advanceTimersByTime(60)
    effects.activate('gravity-potion')
    vi.advanceTimersByTime(40)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(true)
    vi.advanceTimersByTime(60)
    expect(document.body.hasAttribute('data-ngo-gravity-potion')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(true)
    effects.dispose()
  })

  it('rolls both Suspicious Stew effects independently', () => {
    vi.useFakeTimers()
    const stewRandom = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(.75)
    const effects = createMedicineEffects({ minecraftBlindness: 'blindness' }, {
      gamekidSprite: 'gamekid', stewRandom, blindnessDurationMs: 110, nauseaDurationMs: 70,
    })
    effects.activate('suspicious-stew')
    expect(document.body.hasAttribute('data-ngo-minecraft-blindness')).toBe(true)
    expect(document.querySelector('[data-minecraft-blindness].blindness')).not.toBeNull()
    effects.activate('suspicious-stew')
    expect(document.body.hasAttribute('data-ngo-minecraft-blindness')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-minecraft-nausea')).toBe(true)
    expect(document.querySelector('[data-minecraft-nausea]')).not.toBeNull()
    vi.advanceTimersByTime(70)
    expect(document.body.hasAttribute('data-ngo-minecraft-nausea')).toBe(false)
    expect(document.querySelector('[data-minecraft-nausea]')).toBeNull()
    expect(document.body.hasAttribute('data-ngo-minecraft-blindness')).toBe(true)
    vi.advanceTimersByTime(40)
    expect(document.body.hasAttribute('data-ngo-minecraft-blindness')).toBe(false)
    effects.dispose()
  })

  it('shows Suspicious Stew nausea independently while Red Potion is active', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({
      minecraftBlindness: 'blindness', minecraftNausea: 'nausea', terrariaRedPotion: 'red',
    }, {
      gamekidSprite: 'gamekid', stewRandom: () => .75,
      nauseaDurationMs: 70, redPotionDurationMs: 200,
    })

    effects.activate('red-potion')
    expect(document.querySelector('[data-nausea-source="red-potion"].nausea')).not.toBeNull()
    effects.activate('suspicious-stew')
    expect(document.querySelectorAll('[data-minecraft-nausea]')).toHaveLength(2)
    expect(document.querySelector('[data-nausea-source="stew"].nausea')).not.toBeNull()

    vi.advanceTimersByTime(70)
    expect(document.querySelector('[data-nausea-source="stew"]')).toBeNull()
    expect(document.querySelector('[data-nausea-source="red-potion"]')).not.toBeNull()
    expect(document.body.hasAttribute('data-ngo-minecraft-nausea')).toBe(true)
    vi.advanceTimersByTime(130)
    expect(document.querySelector('[data-nausea-source="red-potion"]')).toBeNull()
    expect(document.body.hasAttribute('data-ngo-minecraft-nausea')).toBe(false)
    effects.dispose()
  })

  it('composes Retro Vision with Suspicious Stew nausea on separate render layers', () => {
    vi.useFakeTimers()
    const effects = createMedicineEffects({ retroVision: 'retro', minecraftNausea: 'nausea' }, {
      gamekidSprite: 'gamekid', retroDurationMs: 200, nauseaDurationMs: 70,
    })

    effects.activate('retro-vision')
    effects.activate('suspicious-stew', 'nausea')
    const nausea = document.querySelector('[data-nausea-source="stew"]')
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-minecraft-nausea')).toBe(true)
    expect(nausea?.parentElement).toBe(document.documentElement)
    expect(document.body.contains(nausea)).toBe(false)

    vi.advanceTimersByTime(70)
    expect(document.querySelector('[data-nausea-source="stew"]')).toBeNull()
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(true)
    vi.advanceTimersByTime(130)
    expect(document.body.hasAttribute('data-ngo-retro-vision')).toBe(false)
    effects.dispose()
  })
})
