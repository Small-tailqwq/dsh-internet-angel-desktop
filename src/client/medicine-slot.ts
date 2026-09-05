import { t, setText, setAttr, type UiText } from './i18n.ts'
export type MedicineEffect =
  | 'power-pill'
  | 'retro-vision'
  | 'gravity-potion'
  | 'suspicious-stew'
  | 'red-potion'
  | 'milk-bucket'

export interface MedicineDefinition {
  id: MedicineEffect
  name: string
  originalName: string
  consumeVerb: '吃' | '喝'
  pillPosition?: readonly [number, number]
}

/** Isaac normally shuffles pill appearances every run. Fixed colours and the
 * Terraria bottle here intentionally remain recognizable desktop easter eggs. */
export const MEDICINES: readonly MedicineDefinition[] = [
  { id: 'power-pill', name: '大力丸！', originalName: 'POWER PILL!', consumeVerb: '吃', pillPosition: [2, 1] },
  { id: 'retro-vision', name: '复古视野', originalName: 'RETRO VISION', consumeVerb: '吃', pillPosition: [3, 1] },
  { id: 'gravity-potion', name: '重力药水', originalName: 'GRAVITATION POTION', consumeVerb: '喝' },
  { id: 'suspicious-stew', name: '谜之炖菜', originalName: 'SUSPICIOUS STEW', consumeVerb: '吃' },
  { id: 'red-potion', name: '红药水', originalName: 'RED POTION', consumeVerb: '喝' },
  { id: 'milk-bucket', name: '牛奶', originalName: 'MILK BUCKET', consumeVerb: '喝' },
] as const

export interface MedicineSlotAssets {
  bodies: readonly [string, string, string]
  brokenBody?: string
  icons: Readonly<Record<number, string>>
  pillSheet: string
  medicineIcons?: Partial<Record<MedicineEffect, string>>
  rewardIcons?: Partial<Record<SlotBonus, string>>
}

export type SlotBonus = 'card' | 'spiders' | 'bomb'
export type SlotReward = { kind: 'medicine'; medicine: MedicineDefinition } | { kind: SlotBonus }

/** Desktop crossover odds, independent of Isaac's machine payout tables. */
export const SLOT_ODDS = { medicine: .45, card: .20, spiders: .25, bomb: .10 } as const

export function pickSlotReward(random: () => number = Math.random, milkBias = false): SlotReward {
  let roll = Math.min(.999999999, Math.max(0, random()))
  if (milkBias) {
    if (roll < .5) return { kind: 'medicine', medicine: MEDICINES.find(item => item.id === 'milk-bucket')! }
    roll = (roll - .5) * 2
  }
  if (roll < SLOT_ODDS.medicine) {
    const pool = milkBias ? MEDICINES.filter(item => item.id !== 'milk-bucket') : MEDICINES
    return { kind: 'medicine', medicine: pool[Math.min(pool.length - 1, Math.floor(roll / SLOT_ODDS.medicine * pool.length))]! }
  }
  if (roll < SLOT_ODDS.medicine + SLOT_ODDS.card) return { kind: 'card' }
  if (roll < 1 - SLOT_ODDS.bomb) return { kind: 'spiders' }
  return { kind: 'bomb' }
}

const BONUS_COPY = {
  card: ['塔罗牌', '仅供赏玩 · 无特殊效果'],
  spiders: ['蓝蜘蛛 × 2', 'FRIENDS FOUND · 它们似乎在找什么…'],
  bomb: ['恶作剧炸弹', 'TROLL BOMB · BOOM!'],
} as const

export interface MedicineSlotSounds {
  play(name: 'coin' | 'pull' | 'stop' | 'spawn'): void
  playLoop(name: 'spin'): void
  stop(name: 'spin'): void
}

export interface MedicineSlotOptions {
  assets: MedicineSlotAssets
  sounds: MedicineSlotSounds
  onTake(medicine: MedicineDefinition): void
  onBonus?(reward: SlotBonus): UiText | void
  random?: () => number
  milkBiasActive?: () => boolean
  reducedMotion?: boolean
}

export interface MedicineSlotSurface {
  root: HTMLDivElement
  rollButton: HTMLButtonElement
  takeButton: HTMLButtonElement
  discardButton: HTMLButtonElement
  outlet: HTMLElement
  stage: HTMLElement
  breakMachine(): void
  dispose(): void
}

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: UiText): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  element.className = className
  if (text !== undefined) setText(element, text)
  return element
}

export function pickMedicine(random: () => number = Math.random, milkBias = false): MedicineDefinition {
  const roll = Math.min(.999999999, Math.max(0, random()))
  if (milkBias) {
    if (roll < .5) return MEDICINES.find(medicine => medicine.id === 'milk-bucket')!
    const nonMilk = MEDICINES.filter(medicine => medicine.id !== 'milk-bucket')
    return nonMilk[Math.min(nonMilk.length - 1, Math.floor((roll - .5) * 2 * nonMilk.length))]!
  }
  return MEDICINES[Math.min(MEDICINES.length - 1, Math.floor(roll * MEDICINES.length))]!
}

const CYCLE = [8, 9, 10, 11, 12, 13] as const
const MEDICINE_REEL_ICON = 0

export function buildMedicineSlot(
  classes: Record<string, string | undefined>,
  options: MedicineSlotOptions,
): MedicineSlotSurface {
  const random = options.random ?? Math.random
  const reducedMotion = options.reducedMotion ?? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  const timers = new Set<number>()
  let cycleTimer: number | undefined
  let selected: MedicineDefinition | null = null
  let busy = false
  let broken = false

  const later = (callback: () => void, delay: number): number => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      callback()
    }, reducedMotion ? Math.min(delay, 20) : delay)
    timers.add(timer)
    return timer
  }

  const root = node('div', classes.medicineSurface ?? '')
  root.dataset.medicineSlot = ''
  root.dataset.slotPhase = 'idle'
  const stage = node('div', classes.slotStage ?? '')
  const body = node('img', classes.slotBody ?? '')
  body.src = options.assets.bodies[0]
  setAttr(body, 'alt', () => t('以撒老虎机'))
  const wheels = [0, 1, 2].map((index) => {
    const wheel = node('img', `${classes.slotWheel ?? ''} ${classes[`slotWheel${index + 1}`] ?? ''}`)
    wheel.src = options.assets.icons[[8, 9, 10][index]!] ?? ''
    wheel.alt = ''
    wheel.setAttribute('aria-hidden', 'true')
    return wheel
  })
  const outlet = node('span', classes.slotOutlet ?? '')
  outlet.dataset.slotOutlet = ''
  stage.append(body, ...wheels, outlet)

  const result = node('section', classes.medicineResult ?? '')
  result.dataset.medicineResult = ''
  result.setAttribute('aria-live', 'polite')
  const pillIcon = node('span', classes.pillIcon ?? '')
  pillIcon.style.setProperty('--medicine-pill-sheet', `url(${JSON.stringify(options.assets.pillSheet)})`)
  pillIcon.setAttribute('aria-hidden', 'true')
  const medicineName = node('strong', classes.medicineName ?? '', () => t('试试今天的运气'))
  const medicineOriginal = node('span', classes.medicineOriginal ?? '', 'INSERT COIN')
  const decisions = node('div', classes.medicineDecisions ?? '')
  const takeButton = node('button', classes.takeButton ?? '', () => t('吃'))
  const discardButton = node('button', classes.discardButton ?? '', () => t('不吃'))
  for (const button of [takeButton, discardButton]) {
    button.type = 'button'
    button.disabled = true
  }
  takeButton.dataset.medicineAction = 'take'
  discardButton.dataset.medicineAction = 'discard'
  decisions.append(takeButton, discardButton)
  decisions.hidden = true
  result.append(pillIcon, medicineName, medicineOriginal, decisions)
  const rollButton = node('button', classes.rollButton ?? '', () => t('🪙 摇一次'))
  rollButton.type = 'button'
  rollButton.dataset.medicineAction = 'roll'
  root.append(stage, result, rollButton)

  const setWheel = (wheel: HTMLImageElement, icon: number): void => {
    wheel.src = options.assets.icons[icon] ?? options.assets.icons[8] ?? ''
  }
  const stopCycle = (): void => {
    if (cycleTimer === undefined) return
    window.clearInterval(cycleTimer)
    cycleTimer = undefined
  }
  const clearChoice = (message: UiText): void => {
    selected = null
    takeButton.disabled = true
    discardButton.disabled = true
    decisions.hidden = true
    rollButton.disabled = false
    rollButton.hidden = false
    setText(rollButton, () => t('🪙 再摇一次'))
    setText(medicineName, message)
    setText(medicineOriginal, 'READY')
    pillIcon.removeAttribute('data-medicine-pill')
    pillIcon.removeAttribute('data-medicine-custom-icon')
    pillIcon.style.removeProperty('--medicine-custom-icon')
    root.dataset.slotPhase = 'idle'
    rollButton.focus()
  }
  const reveal = (medicine: MedicineDefinition): void => {
    selected = medicine
    busy = false
    root.dataset.slotPhase = 'decision'
    body.src = options.assets.bodies[0]
    wheels.forEach(wheel => setWheel(wheel, MEDICINE_REEL_ICON))
    pillIcon.dataset.medicinePill = medicine.id
    const customIcon = options.assets.medicineIcons?.[medicine.id]
    if (customIcon !== undefined) {
      pillIcon.dataset.medicineCustomIcon = ''
      pillIcon.style.setProperty('--medicine-custom-icon', `url(${JSON.stringify(customIcon)})`)
    } else {
      pillIcon.removeAttribute('data-medicine-custom-icon')
      pillIcon.style.removeProperty('--medicine-custom-icon')
      pillIcon.style.setProperty('--medicine-pill-x', String(medicine.pillPosition?.[0] ?? 0))
      pillIcon.style.setProperty('--medicine-pill-y', String(medicine.pillPosition?.[1] ?? 0))
    }
    setText(medicineName, () => t(medicine.name))
    setText(medicineOriginal, medicine.originalName)
    setText(takeButton, () => t(medicine.consumeVerb))
    setText(discardButton, () => t('不' + medicine.consumeVerb))
    takeButton.disabled = false
    discardButton.disabled = false
    decisions.hidden = false
    rollButton.disabled = true
    rollButton.hidden = true
    options.sounds.play('spawn')
  }
  const revealReward = (reward: SlotReward): void => {
    root.dataset.slotReward = reward.kind
    if (reward.kind === 'medicine') { reveal(reward.medicine); return }
    busy = false
    clearChoice(() => t(BONUS_COPY[reward.kind][0]))
    body.src = options.assets.bodies[0]
    setText(medicineOriginal, () => t(BONUS_COPY[reward.kind][1]))
    const icon = options.assets.rewardIcons?.[reward.kind]
    if (icon) {
      pillIcon.dataset.medicinePill = reward.kind
      pillIcon.dataset.medicineCustomIcon = ''
      pillIcon.style.setProperty('--medicine-custom-icon', `url(${JSON.stringify(icon)})`)
    }
    options.sounds.play('spawn')
    const label = options.onBonus?.(reward.kind)
    if (label) setText(medicineName, label)
  }
  const spin = (): void => {
    if (broken || busy || selected !== null) return
    busy = true
    root.dataset.slotPhase = 'initiate'
    rollButton.disabled = true
    rollButton.hidden = false
    takeButton.disabled = true
    discardButton.disabled = true
    decisions.hidden = true
    setText(medicineName, () => t('摇奖中…'))
    setText(medicineOriginal, 'SPINNING')
    pillIcon.removeAttribute('data-medicine-pill')
    body.src = options.assets.bodies[1]
    options.sounds.play('coin')
    later(() => {
      root.dataset.slotPhase = 'spinning'
      body.src = options.assets.bodies[2]
      options.sounds.play('pull')
      options.sounds.playLoop('spin')
      let frame = 0
      let stoppedWheels = 0
      const tick = (): void => {
        wheels.forEach((wheel, index) => { if (index >= stoppedWheels) setWheel(wheel, CYCLE[(frame + index) % CYCLE.length]!) })
        frame += 1
      }
      tick()
      cycleTimer = window.setInterval(tick, reducedMotion ? 20 : 66)
      const reward = pickSlotReward(random, options.milkBiasActive?.() ?? false)
      const reelIcon = reward.kind === 'bomb' ? 2 : reward.kind === 'spiders' ? 5 : MEDICINE_REEL_ICON
      wheels.forEach((wheel, index) => later(() => {
        options.sounds.play('stop')
        stoppedWheels = index + 1
        setWheel(wheel, reelIcon)
        if (index === wheels.length - 1) {
          stopCycle()
          options.sounds.stop('spin')
          later(() => revealReward(reward), 160)
        }
      }, 850 + index * 420))
    }, 240)
  }
  const take = (): void => {
    if (selected === null || busy) return
    const medicine = selected
    options.onTake(medicine)
    clearChoice(() => t("已{0}下「{1}」", medicine.consumeVerb, t(medicine.name)))
  }
  const discard = (): void => {
    if (selected === null || busy) return
    const medicine = selected
    clearChoice(() => t("丢掉了「{0}」", t(medicine.name)))
  }

  rollButton.addEventListener('click', spin)
  takeButton.addEventListener('click', take)
  discardButton.addEventListener('click', discard)
  return {
    root,
    rollButton,
    takeButton,
    discardButton,
    outlet,
    stage,
    breakMachine() {
      if (broken) return
      broken = true
      busy = false
      selected = null
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      stopCycle()
      options.sounds.stop('spin')
      root.dataset.slotPhase = 'broken'
      if (options.assets.brokenBody) body.src = options.assets.brokenBody
      decisions.hidden = true
      takeButton.disabled = discardButton.disabled = rollButton.disabled = true
      rollButton.hidden = false
      pillIcon.removeAttribute('data-medicine-pill')
      setText(rollButton, () => t('已损坏'))
      setText(medicineName, () => t('老虎机被炸坏了'))
      setText(medicineOriginal, () => t('刷新网页后恢复'))
    },
    dispose() {
      rollButton.removeEventListener('click', spin)
      takeButton.removeEventListener('click', take)
      discardButton.removeEventListener('click', discard)
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      stopCycle()
      options.sounds.stop('spin')
    },
  }
}
