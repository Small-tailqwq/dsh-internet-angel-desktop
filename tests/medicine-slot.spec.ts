// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => { document.documentElement.lang = 'zh-CN' })
import { buildMedicineSlot, pickMedicine, type MedicineSlotSounds } from '../src/client/medicine-slot.ts'

afterEach(() => { vi.useRealTimers(); document.body.replaceChildren() })

describe('medicine slot', () => {
  it('selects medicines evenly within the medicine pool and preserves the milk bias', () => {
    expect(pickMedicine(() => 0).id).toBe('power-pill')
    expect(pickMedicine(() => 1 / 6).id).toBe('retro-vision')
    expect(pickMedicine(() => 2 / 6).id).toBe('gravity-potion')
    expect(pickMedicine(() => 3 / 6).id).toBe('suspicious-stew')
    expect(pickMedicine(() => 4 / 6).id).toBe('red-potion')
    expect(pickMedicine(() => 0.999999).id).toBe('milk-bucket')
    expect(pickMedicine(() => .49, true).id).toBe('milk-bucket')
    expect(pickMedicine(() => .5, true).id).toBe('power-pill')
    expect(pickMedicine(() => .999999, true).id).toBe('red-potion')
  })

  it('locks rerolls until the player takes or discards the pill', () => {
    vi.useFakeTimers()
    const sounds: MedicineSlotSounds = { play: vi.fn(), playLoop: vi.fn(), stop: vi.fn() }
    const onTake = vi.fn()
    const surface = buildMedicineSlot({}, {
      assets: {
        bodies: ['body0', 'body1', 'body2'],
        icons: Object.fromEntries([0, 8, 9, 10, 11, 12, 13].map(index => [index, `icon${index}`])),
        pillSheet: 'pill-sheet',
        medicineIcons: { 'gravity-potion': 'gravity-icon', 'suspicious-stew': 'stew-icon' },
      },
      sounds, onTake, random: () => 0, reducedMotion: true,
    })
    document.body.append(surface.root)
    surface.rollButton.click()
    vi.runAllTimers()
    expect(surface.root.dataset.slotPhase).toBe('decision')
    expect(surface.root.textContent).toContain('大力丸！')
    expect(surface.rollButton.disabled).toBe(true)
    expect(surface.takeButton.disabled).toBe(false)
    expect(Array.from(surface.root.querySelectorAll<HTMLImageElement>('img[aria-hidden="true"]'), wheel => wheel.getAttribute('src')))
      .toEqual(['icon0', 'icon0', 'icon0'])

    surface.rollButton.click()
    expect(sounds.playLoop).toHaveBeenCalledTimes(1)
    surface.takeButton.click()
    expect(onTake).toHaveBeenCalledWith(expect.objectContaining({ id: 'power-pill' }))
    expect(surface.rollButton.disabled).toBe(false)

    surface.rollButton.click()
    vi.runAllTimers()
    surface.discardButton.click()
    expect(onTake).toHaveBeenCalledTimes(1)
    expect(surface.rollButton.disabled).toBe(false)
    surface.dispose()
    expect(sounds.stop).toHaveBeenLastCalledWith('spin')
  })

  it('presents Gravity Potion as a drink with its own icon', () => {
    vi.useFakeTimers()
    const sounds: MedicineSlotSounds = { play: vi.fn(), playLoop: vi.fn(), stop: vi.fn() }
    const onTake = vi.fn()
    const surface = buildMedicineSlot({}, {
      assets: {
        bodies: ['body0', 'body1', 'body2'],
        icons: Object.fromEntries([0, 8, 9, 10, 11, 12, 13].map(index => [index, `icon${index}`])),
        pillSheet: 'pill-sheet',
        medicineIcons: { 'gravity-potion': 'gravity-icon', 'suspicious-stew': 'stew-icon' },
      },
      sounds, onTake, random: () => .16, reducedMotion: true,
    })
    document.body.append(surface.root)
    surface.rollButton.click()
    vi.runAllTimers()
    expect(surface.root.textContent).toContain('重力药水')
    expect(surface.takeButton.textContent).toBe('喝')
    expect(surface.discardButton.textContent).toBe('不喝')
    expect(surface.root.querySelector('[data-medicine-custom-icon]')).not.toBeNull()
    expect(Array.from(surface.root.querySelectorAll<HTMLImageElement>('img[aria-hidden="true"]'), wheel => wheel.getAttribute('src')))
      .toEqual(['icon0', 'icon0', 'icon0'])
    surface.takeButton.click()
    expect(onTake).toHaveBeenCalledWith(expect.objectContaining({ id: 'gravity-potion' }))
    expect(surface.root.textContent).toContain('已喝下「重力药水」')
    surface.dispose()
  })

  it('presents Suspicious Stew as food with its own icon', () => {
    vi.useFakeTimers()
    const sounds: MedicineSlotSounds = { play: vi.fn(), playLoop: vi.fn(), stop: vi.fn() }
    const onTake = vi.fn()
    const surface = buildMedicineSlot({}, {
      assets: {
        bodies: ['body0', 'body1', 'body2'],
        icons: Object.fromEntries([0, 8, 9, 10, 11, 12, 13].map(index => [index, `icon${index}`])),
        pillSheet: 'pill-sheet',
        medicineIcons: { 'suspicious-stew': 'stew-icon' },
      },
      sounds, onTake, random: () => .23, reducedMotion: true,
    })
    document.body.append(surface.root)
    surface.rollButton.click()
    vi.runAllTimers()
    expect(surface.root.textContent).toContain('谜之炖菜')
    expect(surface.takeButton.textContent).toBe('吃')
    expect(surface.discardButton.textContent).toBe('不吃')
    expect(surface.root.querySelector('[data-medicine-custom-icon]')).not.toBeNull()
    surface.takeButton.click()
    expect(onTake).toHaveBeenCalledWith(expect.objectContaining({ id: 'suspicious-stew' }))
    surface.dispose()
  })
})
