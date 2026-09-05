import type { MedicineEffect } from './medicine-slot.ts'

export type MedicineBuffId =
  | 'minecraft-blindness'
  | 'minecraft-nausea'
  | 'terraria-gravity'
  | 'terraria-poisoned'
  | 'terraria-darkness'
  | 'terraria-cursed'
  | 'terraria-on-fire'
  | 'terraria-bleeding'
  | 'terraria-confused'
  | 'terraria-slow'
  | 'terraria-weak'
  | 'terraria-silenced'
  | 'terraria-broken-armor'
  | 'terraria-suffocation'

export interface MedicineBuff {
  id: MedicineBuffId
  game: 'minecraft' | 'terraria'
  label: string
  expiresAt: number | null
}

export interface MedicineEffectsOptions {
  gamekidSprite: string
  powerConsumableSprites?: readonly string[]
  onPowerConsume?: () => void
  powerDurationMs?: number
  retroDurationMs?: number
  gravityDurationMs?: number
  blindnessDurationMs?: number
  nauseaDurationMs?: number
  redPotionDurationMs?: number
  stewRandom?: () => number
  medicineRoot?: HTMLElement
  medicineLauncher?: HTMLElement
  cursorSprite?: string
  onBuffsChange?: (buffs: readonly MedicineBuff[]) => void
  storage?: Storage
  storageKey?: string
}

export interface MedicineEffects {
  activate(effect: MedicineEffect, stewOutcome?: SuspiciousStewOutcome): void
  isActive(effect: MedicineEffect): boolean
  dispose(): void
}

export type SuspiciousStewOutcome = 'blindness' | 'nausea'

const RED_POTION_DEBUFFS: readonly [MedicineBuffId, string][] = [
  ['terraria-poisoned', '中毒'],
  ['terraria-darkness', '黑暗'],
  ['terraria-cursed', '诅咒'],
  ['terraria-on-fire', '着火了！'],
  ['terraria-bleeding', '流血'],
  ['terraria-confused', '困惑'],
  ['terraria-slow', '缓慢'],
  ['terraria-weak', '虚弱'],
  ['terraria-silenced', '沉默'],
  ['terraria-broken-armor', '破损盔甲'],
  ['terraria-suffocation', '窒息'],
]

type PersistedMedicineEffect =
  | 'power-pill'
  | 'retro-vision'
  | 'gravity-potion'
  | 'stew-blindness'
  | 'stew-nausea'
  | 'red-potion'

const PERSISTED_MEDICINE_EFFECTS = [
  'power-pill',
  'retro-vision',
  'gravity-potion',
  'stew-blindness',
  'stew-nausea',
  'red-potion',
] as const satisfies readonly PersistedMedicineEffect[]

/**
 * Harmless desktop adaptations of Isaac's combat effects:
 * - Power Pill keeps the evidence-backed 6.5s Gamekid/rainbow presentation,
 *   but never disables or removes real DSH controls.
 * - Retro Vision uses one compositor-only full-screen layer for 30s. It avoids
 *   DOM capture and recurring canvas work because the page has no framebuffer
 *   that a web plugin can safely resample.
 * - Gravity Potion turns the complete document upside down for 10s.
 * - Suspicious Stew independently rolls Minecraft Blindness or Nausea.
 */
export function createMedicineEffects(
  classes: Record<string, string | undefined>,
  options: MedicineEffectsOptions,
): MedicineEffects {
  const body = document.body
  const powerTimers = new Set<number>()
  const retroTimers = new Set<number>()
  const gravityTimers = new Set<number>()
  const blindnessTimers = new Set<number>()
  const nauseaTimers = new Set<number>()
  const redPotionTimers = new Set<number>()
  const activeBuffs = new Map<MedicineBuffId, MedicineBuff>()
  let powerLayer: HTMLDivElement | null = null
  let powerPointerListener: ((event: PointerEvent) => void) | null = null
  let retroLayer: HTMLDivElement | null = null
  let retroFilter: SVGSVGElement | null = null
  let gravityRoot: HTMLElement | null = null
  let gravityPreviousTransform = ''
  let gravityPreviousTransformOrigin = ''
  let gravityPreviousCursor = ''
  let gravityCursor: HTMLSpanElement | null = null
  let gravityPointerListener: ((event: PointerEvent) => void) | null = null
  let gravityInteractionRedirector: EventListener | null = null
  let gravityRedirectingClick = false
  let blindnessLayer: HTMLDivElement | null = null
  let blindnessPointerListener: ((event: PointerEvent) => void) | null = null
  let blindnessFrame: number | null = null
  let blindnessPointerX = window.innerWidth / 2
  let blindnessPointerY = window.innerHeight / 2
  let stewNauseaLayer: HTMLDivElement | null = null
  let stewNauseaFrame: number | null = null
  let stewNauseaStartedAt: number | null = null
  let stewNauseaLastPaint = 0
  let redPotionNauseaLayer: HTMLDivElement | null = null
  let stewBlindnessActive = false
  let stewNauseaActive = false
  let redPotionActive = false
  let redPotionLayer: HTMLDivElement | null = null
  let redPotionCursor: HTMLSpanElement | null = null
  let redPotionPointerListener: ((event: PointerEvent) => void) | null = null
  let redPotionInteractionBlocker: EventListener | null = null
  let redPotionRedirectingClick = false
  let redPotionCursorFrame: number | null = null
  let redPotionTargetX = window.innerWidth / 2
  let redPotionTargetY = window.innerHeight / 2
  let redPotionCursorX = redPotionTargetX
  let redPotionCursorY = redPotionTargetY
  let lastPointerX = window.innerWidth / 2
  let lastPointerY = window.innerHeight / 2
  const persistedExpiries = new Map<PersistedMedicineEffect, number>()
  const storageKey = options.storageKey ?? 'ngo:medicine-effects:v1'

  const rememberPointerPosition = (event: PointerEvent): void => {
    lastPointerX = event.clientX
    lastPointerY = event.clientY
  }
  window.addEventListener('pointermove', rememberPointerPosition, { passive: true })
  window.addEventListener('pointerdown', rememberPointerPosition, { passive: true })

  const writePersistedEffects = (): void => {
    if (options.storage === undefined) return
    try {
      if (persistedExpiries.size === 0) options.storage.removeItem(storageKey)
      else options.storage.setItem(storageKey, JSON.stringify({
        version: 1,
        effects: Object.fromEntries(persistedExpiries),
      }))
    } catch {}
  }
  const rememberEffect = (effect: PersistedMedicineEffect, expiresAt: number): void => {
    persistedExpiries.set(effect, expiresAt)
    writePersistedEffects()
  }
  const forgetEffect = (effect: PersistedMedicineEffect, persist = true): void => {
    if (!persistedExpiries.delete(effect) || !persist) return
    writePersistedEffects()
  }
  const readPersistedEffects = (): void => {
    if (options.storage === undefined) return
    try {
      const parsed: unknown = JSON.parse(options.storage.getItem(storageKey) ?? 'null')
      if (typeof parsed !== 'object' || parsed === null || !('effects' in parsed)) return
      const effects = (parsed as { effects?: unknown }).effects
      if (typeof effects !== 'object' || effects === null) return
      const now = Date.now()
      for (const effect of PERSISTED_MEDICINE_EFFECTS) {
        const expiresAt = Number((effects as Record<string, unknown>)[effect])
        if (Number.isFinite(expiresAt) && expiresAt > now) persistedExpiries.set(effect, expiresAt)
      }
      writePersistedEffects()
    } catch {
      try { options.storage.removeItem(storageKey) } catch {}
    }
  }
  const emitBuffs = (): void => options.onBuffsChange?.([...activeBuffs.values()])
  const setBuff = (
    id: MedicineBuffId,
    game: MedicineBuff['game'],
    label: string,
    durationMs: number | null,
    expiresAt?: number,
  ): void => {
    activeBuffs.set(id, {
      id,
      game,
      label,
      expiresAt: durationMs === null ? null : expiresAt ?? Date.now() + durationMs,
    })
    emitBuffs()
  }
  const removeBuff = (id: MedicineBuffId): void => {
    if (!activeBuffs.delete(id)) return
    emitBuffs()
  }

  interface PowerConsumable {
    element: HTMLSpanElement
    x: number
    y: number
    eaten: boolean
  }

  const later = (timers: Set<number>, callback: () => void, delay: number): number => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)
    timers.add(timer)
    return timer
  }
  const interactiveTargetAt = (x: number, y: number): HTMLElement | null => document.elementFromPoint(x, y)
    ?.closest<HTMLElement>(
      "button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[role='button']:not([aria-disabled='true'])",
    ) ?? null
  const gravityVisiblePoint = (x: number, y: number): { x: number; y: number } => body.hasAttribute('data-ngo-gravity-potion')
    ? { x: window.innerWidth - x, y: window.innerHeight - y }
    : { x, y }
  const clearGravityCursor = (): void => {
    if (gravityPointerListener !== null) window.removeEventListener('pointermove', gravityPointerListener)
    gravityPointerListener = null
    gravityCursor?.remove()
    gravityCursor = null
  }
  const ensureGravityCursor = (): void => {
    if (redPotionActive || gravityCursor !== null || !body.hasAttribute('data-ngo-gravity-potion')) return
    const cursor = document.createElement('span')
    cursor.className = classes.terrariaGravityCursor ?? classes.terrariaRedCursor ?? ''
    cursor.dataset.terrariaGravityCursor = ''
    cursor.setAttribute('aria-hidden', 'true')
    if (options.cursorSprite !== undefined) {
      cursor.style.setProperty('--terraria-cursor', `url(${JSON.stringify(options.cursorSprite)})`)
    }
    cursor.style.setProperty('transform', `translate3d(${lastPointerX}px, ${lastPointerY}px, 0)`)
    document.documentElement.append(cursor)
    gravityCursor = cursor
    gravityPointerListener = (event): void => {
      gravityCursor?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
    }
    window.addEventListener('pointermove', gravityPointerListener, { passive: true })
  }
  const gravityBlockedEvents = ['pointerdown', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'] as const
  const installGravityInteractionRedirector = (): void => {
    if (gravityInteractionRedirector !== null) return
    gravityInteractionRedirector = (event): void => {
      if (redPotionActive || gravityRedirectingClick) return
      if (event.type === 'click' && event instanceof MouseEvent && event.detail !== 0) {
        const point = gravityVisiblePoint(event.clientX, event.clientY)
        const visibleTarget = interactiveTargetAt(point.x, point.y)
        event.preventDefault()
        event.stopImmediatePropagation()
        if (visibleTarget !== null) {
          gravityRedirectingClick = true
          try {
            visibleTarget.click()
          } finally {
            gravityRedirectingClick = false
          }
        }
        return
      }
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    for (const type of gravityBlockedEvents) {
      document.addEventListener(type, gravityInteractionRedirector, { capture: true, passive: false })
    }
  }
  const clearGravityInteractionRedirector = (): void => {
    if (gravityInteractionRedirector !== null) {
      for (const type of gravityBlockedEvents) document.removeEventListener(type, gravityInteractionRedirector, true)
    }
    gravityInteractionRedirector = null
    gravityRedirectingClick = false
  }
  const clearPowerPill = (persist = true): void => {
    for (const timer of powerTimers) window.clearTimeout(timer)
    powerTimers.clear()
    if (powerPointerListener !== null) window.removeEventListener('pointermove', powerPointerListener)
    powerPointerListener = null
    powerLayer?.remove()
    powerLayer = null
    body.removeAttribute('data-ngo-power-pill')
    forgetEffect('power-pill', persist)
  }
  const clearRetroVision = (persist = true): void => {
    for (const timer of retroTimers) window.clearTimeout(timer)
    retroTimers.clear()
    retroLayer?.remove()
    retroLayer = null
    retroFilter?.remove()
    retroFilter = null
    body.removeAttribute('data-ngo-retro-vision')
    forgetEffect('retro-vision', persist)
  }
  const clearGravityPotion = (persist = true): void => {
    for (const timer of gravityTimers) window.clearTimeout(timer)
    gravityTimers.clear()
    if (gravityRoot !== null) {
      gravityRoot.style.transform = gravityPreviousTransform
      gravityRoot.style.transformOrigin = gravityPreviousTransformOrigin
      gravityRoot.style.cursor = gravityPreviousCursor
    }
    clearGravityCursor()
    clearGravityInteractionRedirector()
    gravityRoot = null
    gravityPreviousTransform = ''
    gravityPreviousTransformOrigin = ''
    gravityPreviousCursor = ''
    body.removeAttribute('data-ngo-gravity-potion')
    removeBuff('terraria-gravity')
    forgetEffect('gravity-potion', persist)
  }
  const clearBlindnessVisual = (): void => {
    if (stewBlindnessActive || redPotionActive) return
    for (const timer of blindnessTimers) window.clearTimeout(timer)
    if (blindnessPointerListener !== null) window.removeEventListener('pointermove', blindnessPointerListener)
    blindnessPointerListener = null
    if (blindnessFrame !== null) window.cancelAnimationFrame(blindnessFrame)
    blindnessFrame = null
    blindnessLayer?.remove()
    blindnessLayer = null
    body.removeAttribute('data-ngo-minecraft-blindness')
  }
  const clearStewBlindness = (persist = true): void => {
    for (const timer of blindnessTimers) window.clearTimeout(timer)
    blindnessTimers.clear()
    stewBlindnessActive = false
    removeBuff('minecraft-blindness')
    clearBlindnessVisual()
    forgetEffect('stew-blindness', persist)
  }
  const syncNauseaVisualState = (): void => {
    if (stewNauseaLayer !== null || redPotionNauseaLayer !== null) {
      body.setAttribute('data-ngo-minecraft-nausea', '')
    } else {
      body.removeAttribute('data-ngo-minecraft-nausea')
    }
  }
  const clearStewNausea = (persist = true): void => {
    for (const timer of nauseaTimers) window.clearTimeout(timer)
    nauseaTimers.clear()
    if (stewNauseaFrame !== null) window.cancelAnimationFrame(stewNauseaFrame)
    stewNauseaFrame = null
    stewNauseaStartedAt = null
    stewNauseaLastPaint = 0
    stewNauseaActive = false
    removeBuff('minecraft-nausea')
    stewNauseaLayer?.remove()
    stewNauseaLayer = null
    syncNauseaVisualState()
    forgetEffect('stew-nausea', persist)
  }
  const isMedicineInteractionTarget = (target: Node): boolean => options.medicineRoot?.contains(target) === true
    || options.medicineLauncher?.contains(target) === true
    || (target instanceof Element && target.closest('[data-medicine-test-controls]') !== null)
  const redBlockedEvents = ['pointerdown', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu', 'wheel', 'keydown'] as const
  const clearRedPotion = (persist = true): void => {
    for (const timer of redPotionTimers) window.clearTimeout(timer)
    redPotionTimers.clear()
    redPotionActive = false
    if (redPotionPointerListener !== null) window.removeEventListener('pointermove', redPotionPointerListener)
    redPotionPointerListener = null
    if (redPotionInteractionBlocker !== null) {
      for (const type of redBlockedEvents) document.removeEventListener(type, redPotionInteractionBlocker, true)
    }
    redPotionInteractionBlocker = null
    redPotionRedirectingClick = false
    if (redPotionCursorFrame !== null) window.cancelAnimationFrame(redPotionCursorFrame)
    redPotionCursorFrame = null
    redPotionLayer?.remove()
    redPotionLayer = null
    redPotionNauseaLayer?.remove()
    redPotionNauseaLayer = null
    redPotionCursor?.remove()
    redPotionCursor = null
    body.removeAttribute('data-ngo-terraria-red-potion')
    let buffsChanged = false
    for (const [id] of RED_POTION_DEBUFFS) buffsChanged = activeBuffs.delete(id) || buffsChanged
    if (buffsChanged) emitBuffs()
    clearBlindnessVisual()
    syncNauseaVisualState()
    forgetEffect('red-potion', persist)
    ensureGravityCursor()
  }
  const clearAllEffects = (persist = true): void => {
    clearGravityPotion(persist)
    clearRedPotion(persist)
    clearPowerPill(persist)
    clearRetroVision(persist)
    clearStewBlindness(persist)
    clearStewNausea(persist)
    activeBuffs.clear()
    emitBuffs()
  }
  const dispose = (): void => {
    clearAllEffects(false)
    window.removeEventListener('pointermove', rememberPointerPosition)
    window.removeEventListener('pointerdown', rememberPointerPosition)
  }
  const makePowerLayer = (): HTMLDivElement => {
    const next = document.createElement('div')
    next.className = classes.effectLayer ?? ''
    next.dataset.medicineEffectLayer = ''
    next.setAttribute('aria-hidden', 'true')
    document.documentElement.append(next)
    powerLayer = next
    return next
  }
  const activatePowerPill = (
    duration = options.powerDurationMs ?? 6_500,
    expiresAt = Date.now() + duration,
  ): void => {
    clearPowerPill()
    rememberEffect('power-pill', expiresAt)
    body.setAttribute('data-ngo-power-pill', '')
    const effectLayer = makePowerLayer()
    const pacman = document.createElement('span')
    pacman.className = classes.powerPacman ?? ''
    const pacmanSprite = document.createElement('span')
    pacmanSprite.className = classes.powerPacmanSprite ?? ''
    pacman.style.setProperty('--medicine-gamekid', `url(${JSON.stringify(options.gamekidSprite)})`)
    pacman.style.setProperty('--medicine-pointer-x', `${lastPointerX}px`)
    pacman.style.setProperty('--medicine-pointer-y', `${lastPointerY}px`)
    pacman.style.setProperty('--medicine-facing', '1')
    pacman.append(pacmanSprite)

    const itemSprites = options.powerConsumableSprites ?? []
    const items: PowerConsumable[] = []
    if (itemSprites.length > 0) {
      const itemCount = 15
      const columns = Math.min(5, Math.max(3, Math.floor(window.innerWidth / 220)))
      const rows = Math.ceil(itemCount / columns)
      const left = 48
      const right = 48
      const top = 56
      const bottom = 96
      const width = Math.max(1, window.innerWidth - left - right)
      const height = Math.max(1, window.innerHeight - top - bottom)
      const cellWidth = width / columns
      const cellHeight = height / rows
      for (let index = 0; index < itemCount; index += 1) {
        const column = index % columns
        const row = Math.floor(index / columns)
        const x = left + cellWidth * (column + .5) + (Math.random() - .5) * Math.min(36, cellWidth * .24)
        const y = top + cellHeight * (row + .5) + (Math.random() - .5) * Math.min(36, cellHeight * .24)
        const item = document.createElement('span')
        item.className = classes.powerConsumable ?? ''
        item.style.left = `${x}px`
        item.style.top = `${y}px`
        item.style.setProperty('--medicine-consumable', `url(${JSON.stringify(itemSprites[index % itemSprites.length]!)})`)
        item.style.setProperty('--medicine-item-delay', `${(index % 5) * -120}ms`)
        item.setAttribute('aria-hidden', 'true')
        effectLayer.append(item)
        items.push({ element: item, x, y, eaten: false })
      }
    }
    effectLayer.append(pacman)

    let facing = 1
    let previousX: number | null = lastPointerX
    const consumeAt = (x: number, y: number): void => {
      for (const item of items) {
        if (item.eaten) continue
        const dx = item.x - x
        const dy = item.y - y
        if (dx * dx + dy * dy > 36 * 36) continue
        item.eaten = true
        item.element.dataset.consumed = ''
        options.onPowerConsume?.()
        later(powerTimers, () => item.element.remove(), 260)
      }
    }
    powerPointerListener = (event): void => {
      if (previousX !== null && Math.abs(event.clientX - previousX) >= 2) {
        facing = event.clientX < previousX ? -1 : 1
        pacman.style.setProperty('--medicine-facing', String(facing))
      }
      previousX = event.clientX
      pacman.style.setProperty('--medicine-pointer-x', `${event.clientX}px`)
      pacman.style.setProperty('--medicine-pointer-y', `${event.clientY}px`)
      consumeAt(event.clientX + facing * 18, event.clientY - 16)
    }
    window.addEventListener('pointermove', powerPointerListener, { passive: true })
    later(powerTimers, clearPowerPill, duration)
  }
  const activateRetroVision = (
    duration = options.retroDurationMs ?? 30_000,
    expiresAt = Date.now() + duration,
  ): void => {
    clearRetroVision()
    rememberEffect('retro-vision', expiresAt)
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    filter.setAttribute('width', '0')
    filter.setAttribute('height', '0')
    filter.setAttribute('aria-hidden', 'true')
    filter.dataset.retroVisionFilter = ''
    filter.innerHTML = `
      <filter id="ngo-retro-vision-pixelate" x="-5%" y="-5%" width="110%" height="110%"
        color-interpolation-filters="sRGB" primitiveUnits="userSpaceOnUse">
        <feFlood x="3" y="3" width="2" height="2" flood-color="#000" result="sample-mask" />
        <feComposite in="sample-mask" operator="over" x="0" y="0" width="8" height="8" result="sample-cell" />
        <feTile in="sample-cell" result="sample-grid" />
        <feComposite in="SourceGraphic" in2="sample-grid" operator="in" result="samples" />
        <feMorphology in="samples" operator="dilate" radius="3" />
      </filter>`
    document.documentElement.append(filter)
    retroFilter = filter
    body.setAttribute('data-ngo-retro-vision', '')
    const layer = document.createElement('div')
    layer.className = classes.retroVision ?? ''
    layer.dataset.retroVision = ''
    layer.setAttribute('aria-hidden', 'true')
    body.append(layer)
    retroLayer = layer
    later(retroTimers, clearRetroVision, duration)
  }
  const activateGravityPotion = (
    duration = options.gravityDurationMs ?? 10_000,
    expiresAt = Date.now() + duration,
  ): void => {
    clearGravityPotion()
    rememberEffect('gravity-potion', expiresAt)
    body.setAttribute('data-ngo-gravity-potion', '')
    gravityRoot = document.documentElement
    gravityPreviousTransform = gravityRoot.style.transform
    gravityPreviousTransformOrigin = gravityRoot.style.transformOrigin
    gravityPreviousCursor = gravityRoot.style.cursor
    gravityRoot.style.transformOrigin = '50% 50%'
    gravityRoot.style.cursor = 'none'
    gravityRoot.style.transform = gravityPreviousTransform === ''
      ? 'rotate(180deg)'
      : `${gravityPreviousTransform} rotate(180deg)`
    ensureGravityCursor()
    installGravityInteractionRedirector()
    setBuff('terraria-gravity', 'terraria', '重力反转', duration, expiresAt)
    later(gravityTimers, clearGravityPotion, duration)
  }
  const ensureBlindnessVisual = (): void => {
    if (blindnessLayer !== null) return
    body.setAttribute('data-ngo-minecraft-blindness', '')
    const layer = document.createElement('div')
    layer.className = classes.minecraftBlindness ?? ''
    layer.dataset.minecraftBlindness = ''
    layer.setAttribute('aria-hidden', 'true')
    blindnessPointerX = lastPointerX
    blindnessPointerY = lastPointerY
    layer.style.setProperty('--minecraft-blindness-x', `${blindnessPointerX}px`)
    layer.style.setProperty('--minecraft-blindness-y', `${blindnessPointerY}px`)
    document.documentElement.append(layer)
    blindnessLayer = layer
    blindnessPointerListener = (event): void => {
      blindnessPointerX = event.clientX
      blindnessPointerY = event.clientY
      if (blindnessFrame !== null) return
      blindnessFrame = window.requestAnimationFrame(() => {
        blindnessFrame = null
        blindnessLayer?.style.setProperty('--minecraft-blindness-x', `${blindnessPointerX}px`)
        blindnessLayer?.style.setProperty('--minecraft-blindness-y', `${blindnessPointerY}px`)
      })
    }
    window.addEventListener('pointermove', blindnessPointerListener, { passive: true })
  }
  const activateBlindness = (
    duration = options.blindnessDurationMs ?? 11_000,
    expiresAt = Date.now() + duration,
  ): void => {
    clearStewBlindness()
    rememberEffect('stew-blindness', expiresAt)
    stewBlindnessActive = true
    ensureBlindnessVisual()
    setBuff('minecraft-blindness', 'minecraft', '失明', duration, expiresAt)
    later(blindnessTimers, clearStewBlindness, duration)
  }
  const startStewNauseaAnimation = (): void => {
    const paint = (time: number): void => {
      const layer = stewNauseaLayer
      if (layer === null) {
        stewNauseaFrame = null
        return
      }
      stewNauseaStartedAt ??= time
      if (time - stewNauseaLastPaint >= 1000 / 30) {
        const angle = (time - stewNauseaStartedAt) / 2570 * Math.PI * 2
        const wave = (Math.sin(angle - Math.PI / 2) + 1) / 2
        const x = -2.5 + 5 * wave
        const y = 1.5 - 3 * wave
        const rotation = -4 + 8 * wave
        const scale = 1.02 + .06 * wave
        layer.style.opacity = `${.24 + .22 * wave}`
        layer.style.transform = `translate3d(${x}%, ${y}%, 0) rotate(${rotation}deg) scale(${scale})`
        stewNauseaLastPaint = time
      }
      stewNauseaFrame = window.requestAnimationFrame(paint)
    }
    stewNauseaFrame = window.requestAnimationFrame(paint)
  }
  const ensureNauseaVisual = (source: 'stew' | 'red-potion'): void => {
    if (source === 'stew' ? stewNauseaLayer !== null : redPotionNauseaLayer !== null) return
    body.setAttribute('data-ngo-minecraft-nausea', '')
    const layer = document.createElement('div')
    layer.className = classes.minecraftNausea ?? ''
    layer.dataset.minecraftNausea = ''
    layer.dataset.nauseaSource = source
    layer.setAttribute('aria-hidden', 'true')
    if (source === 'stew') {
      document.documentElement.append(layer)
      stewNauseaLayer = layer
      startStewNauseaAnimation()
    } else {
      body.append(layer)
      redPotionNauseaLayer = layer
    }
  }
  const activateNausea = (
    duration = options.nauseaDurationMs ?? 15_000,
    expiresAt = Date.now() + duration,
  ): void => {
    clearStewNausea()
    rememberEffect('stew-nausea', expiresAt)
    stewNauseaActive = true
    ensureNauseaVisual('stew')
    setBuff('minecraft-nausea', 'minecraft', '反胃', duration, expiresAt)
    later(nauseaTimers, clearStewNausea, duration)
  }
  const activateSuspiciousStew = (outcome?: SuspiciousStewOutcome): void => {
    const selectedOutcome = outcome ?? ((options.stewRandom ?? Math.random)() < .5 ? 'blindness' : 'nausea')
    if (selectedOutcome === 'blindness') activateBlindness()
    else activateNausea()
  }
  const activateRedPotion = (
    duration = options.redPotionDurationMs ?? 3_600_000,
    expiresAt = Date.now() + duration,
  ): void => {
    clearRedPotion()
    rememberEffect('red-potion', expiresAt)
    redPotionActive = true
    body.setAttribute('data-ngo-terraria-red-potion', '')
    ensureBlindnessVisual()
    ensureNauseaVisual('red-potion')

    const layer = document.createElement('div')
    layer.className = classes.terrariaRedPotion ?? ''
    layer.dataset.terrariaRedPotion = ''
    layer.setAttribute('aria-hidden', 'true')
    body.append(layer)
    redPotionLayer = layer

    clearGravityCursor()
    const cursor = document.createElement('span')
    cursor.className = classes.terrariaRedCursor ?? ''
    cursor.dataset.terrariaRedCursor = ''
    cursor.setAttribute('aria-hidden', 'true')
    if (options.cursorSprite !== undefined) cursor.style.setProperty('--terraria-cursor', `url(${JSON.stringify(options.cursorSprite)})`)
    document.documentElement.append(cursor)
    redPotionCursor = cursor
    redPotionTargetX = lastPointerX
    redPotionTargetY = lastPointerY
    redPotionCursorX = redPotionTargetX
    redPotionCursorY = redPotionTargetY

    const followCursor = (): void => {
      redPotionCursorFrame = null
      redPotionCursorX += (redPotionTargetX - redPotionCursorX) * .075
      redPotionCursorY += (redPotionTargetY - redPotionCursorY) * .075
      redPotionCursor?.style.setProperty('transform', `translate3d(${redPotionCursorX}px, ${redPotionCursorY}px, 0)`)
      if (Math.abs(redPotionTargetX - redPotionCursorX) > .5 || Math.abs(redPotionTargetY - redPotionCursorY) > .5) {
        redPotionCursorFrame = window.requestAnimationFrame(followCursor)
      }
    }
    redPotionPointerListener = (event): void => {
      redPotionTargetX = event.clientX
      redPotionTargetY = event.clientY
      if (redPotionCursorFrame === null) redPotionCursorFrame = window.requestAnimationFrame(followCursor)
    }
    window.addEventListener('pointermove', redPotionPointerListener, { passive: true })

    redPotionInteractionBlocker = (event): void => {
      if (redPotionRedirectingClick) return
      const target = event.target
      if (event.type === 'click' && event instanceof MouseEvent && event.detail !== 0) {
        const point = gravityVisiblePoint(redPotionCursorX, redPotionCursorY)
        const visibleTarget = interactiveTargetAt(point.x, point.y)
        event.preventDefault()
        event.stopImmediatePropagation()
        if (visibleTarget !== null && isMedicineInteractionTarget(visibleTarget)) {
          redPotionRedirectingClick = true
          try {
            visibleTarget.click()
          } finally {
            redPotionRedirectingClick = false
          }
        }
        return
      }
      if (target instanceof Node && isMedicineInteractionTarget(target)) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }
    for (const type of redBlockedEvents) {
      document.addEventListener(type, redPotionInteractionBlocker, { capture: true, passive: false })
    }
    options.medicineRoot?.querySelector<HTMLButtonElement>("[data-medicine-action='roll']")?.focus()
    for (const [id, label] of RED_POTION_DEBUFFS) {
      activeBuffs.set(id, { id, game: 'terraria', label, expiresAt })
    }
    emitBuffs()
    later(redPotionTimers, clearRedPotion, duration)
  }
  const restorePersistedEffects = (): void => {
    readPersistedEffects()
    const now = Date.now()
    const restored = [...persistedExpiries]
    for (const [effect, expiresAt] of restored) {
      const remaining = expiresAt - now
      if (remaining <= 0) {
        persistedExpiries.delete(effect)
        continue
      }
      if (effect === 'power-pill') activatePowerPill(remaining, expiresAt)
      else if (effect === 'retro-vision') activateRetroVision(remaining, expiresAt)
      else if (effect === 'gravity-potion') activateGravityPotion(remaining, expiresAt)
      else if (effect === 'stew-blindness') activateBlindness(remaining, expiresAt)
      else if (effect === 'stew-nausea') activateNausea(remaining, expiresAt)
      else activateRedPotion(remaining, expiresAt)
    }
    writePersistedEffects()
  }
  restorePersistedEffects()
  const drinkMilk = (): void => clearAllEffects()
  return {
    activate(effect, stewOutcome) {
      if (effect === 'power-pill') activatePowerPill()
      else if (effect === 'retro-vision') activateRetroVision()
      else if (effect === 'gravity-potion') activateGravityPotion()
      else if (effect === 'suspicious-stew') activateSuspiciousStew(stewOutcome)
      else if (effect === 'red-potion') activateRedPotion()
      else drinkMilk()
    },
    isActive(effect) {
      if (effect === 'power-pill') return body.hasAttribute('data-ngo-power-pill')
      if (effect === 'retro-vision') return body.hasAttribute('data-ngo-retro-vision')
      if (effect === 'gravity-potion') return body.hasAttribute('data-ngo-gravity-potion')
      if (effect === 'red-potion') return redPotionActive
      if (effect === 'suspicious-stew') return stewBlindnessActive || stewNauseaActive
      return false
    },
    dispose,
  }
}
