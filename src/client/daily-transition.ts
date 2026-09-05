import type { Sfx } from './sfx.ts'
import css from './skin.module.css'

const STORAGE_KEY = 'ngo:daily-transition:v1'
const MIN_CALENDAR_RADIUS = 3
const CALENDAR_STEP_VW = 9.7917
const CALENDAR_STEP_VH = 17.4074
const CALENDAR_CARD_RATIO = 0.680851
const ADVANCE_MS = 400
const NOTIFY_MS = 800
const EXIT_MS = 1_700
const REMOVE_MS = 2_100

export type DailyTransitionEmphasis = 'weekend' | 'custom' | 'off'
export type DailyTransitionWeekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DailyTransitionOptions {
  showWeekday: boolean
  emphasis: DailyTransitionEmphasis
  emphasizedWeekdays: DailyTransitionWeekday[]
  emphasisColor: string
}

interface DailyTransitionRecord {
  version: 3
  dateKey: string
}

interface CalendarDay {
  dateLabel: string
  month: string
  day: string
  weekday: string
  weekdayIndex: number
  monthBoundary: boolean
  offset: number
}

interface DailyPassage {
  days: CalendarDay[]
  previous: CalendarDay
  current: CalendarDay
}

function dateAtLocalOffset(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)
}

function localDateKey(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function localMonthDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month} / ${day}`
}

function localWeekday(date: Date): string {
  const english = document.documentElement.lang.toLowerCase().startsWith('en')
  const labels = english
    ? ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    : ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return labels[date.getDay()] ?? ''
}

function readRecord(value: string | null): DailyTransitionRecord | undefined {
  if (value === null) return undefined
  try {
    const record = JSON.parse(value) as Partial<DailyTransitionRecord>
    if (record.version !== 3 || typeof record.dateKey !== 'string') return undefined
    return record as DailyTransitionRecord
  } catch {
    return undefined
  }
}

function calendarDay(now: Date, offset: number, previous?: Date): CalendarDay {
  const date = dateAtLocalOffset(now, offset)
  return {
    dateLabel: localMonthDay(date),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
    weekday: localWeekday(date),
    weekdayIndex: date.getDay(),
    monthBoundary: previous !== undefined
      && (date.getMonth() !== previous.getMonth() || date.getFullYear() !== previous.getFullYear()),
    offset,
  }
}

function calendarRadius(): number {
  const viewportWidth = Math.max(window.innerWidth, 0)
  const viewportHeight = Math.max(window.innerHeight, 0)
  const step = Math.min(
    viewportWidth * CALENDAR_STEP_VW / 100,
    viewportHeight * CALENDAR_STEP_VH / 100,
  )
  if (!Number.isFinite(step) || step <= 0) return MIN_CALENDAR_RADIUS
  const cardWidth = step * CALENDAR_CARD_RATIO
  return Math.max(
    MIN_CALENDAR_RADIUS,
    Math.ceil((viewportWidth - cardWidth) / (step * 2)),
  )
}

/** Claims today's passage before playback, so reloads cannot replay it. */
function claimDailyPassage(now: Date): DailyPassage | undefined {
  try {
    const dateKey = localDateKey(now)
    const previousRecord = readRecord(window.localStorage.getItem(STORAGE_KEY))
    if (previousRecord?.dateKey === dateKey) return undefined
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 3,
      dateKey,
    } satisfies DailyTransitionRecord))

    const days: CalendarDay[] = []
    const radius = calendarRadius()
    let previousDate: Date | undefined
    for (let offset = -radius - 1; offset <= radius; offset += 1) {
      const day = calendarDay(now, offset, previousDate)
      days.push(day)
      previousDate = dateAtLocalOffset(now, offset)
    }
    return {
      days,
      previous: days[radius]!,
      current: days[radius + 1]!,
    }
  } catch {
    // Without durable storage there is no reliable "once per local day" contract.
    return undefined
  }
}

function makeDayCard(day: CalendarDay, heartSrc: string, showWeekday: boolean, emphasized: boolean): HTMLDivElement {
  const card = document.createElement('div')
  card.className = css.dailyTransitionDay ?? ''
  card.dataset.offset = String(day.offset)
  if (Math.abs(day.offset) <= 2) card.dataset.near = ''
  if (day.offset === 0) card.dataset.currentDate = ''
  if (emphasized) card.dataset.emphasized = ''
  if (day.monthBoundary) card.dataset.monthBoundary = ''

  if (day.offset === 0) {
    const heart = document.createElement('img')
    heart.className = css.dailyTransitionDayHeart ?? ''
    heart.src = heartSrc
    heart.alt = ''
    heart.draggable = false
    heart.setAttribute('aria-hidden', 'true')
    card.append(heart)
  }

  const date = document.createElement('div')
  date.className = css.dailyTransitionDate ?? ''
  const month = document.createElement('span')
  month.className = css.dailyTransitionMonth ?? ''
  month.textContent = day.month
  const slash = document.createElement('span')
  slash.className = css.dailyTransitionSlash ?? ''
  slash.textContent = '/'
  const number = document.createElement('strong')
  number.textContent = day.day
  date.append(month, slash, number)
  card.append(date)

  if (showWeekday) {
    const weekday = document.createElement('span')
    weekday.className = css.dailyTransitionWeekday ?? ''
    weekday.textContent = day.weekday
    card.append(weekday)
  }

  const separator = document.createElement('span')
  separator.className = css.dailyTransitionSeparator ?? ''
  separator.textContent = '▶ ▶ ▶'
  separator.setAttribute('aria-hidden', 'true')
  card.append(separator)
  return card
}

function weekdayIndex(weekday: DailyTransitionWeekday): number {
  return ({ sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 })[weekday]
}

function isEmphasized(day: CalendarDay, options: DailyTransitionOptions): boolean {
  if (options.emphasis === 'off') return false
  if (options.emphasis === 'weekend') return day.weekdayIndex === 0 || day.weekdayIndex === 6
  return options.emphasizedWeekdays.some(weekday => weekdayIndex(weekday) === day.weekdayIndex)
}

function setEmphasized(element: HTMLElement, emphasized: boolean): void {
  if (emphasized) element.dataset.emphasized = ''
  else delete element.dataset.emphasized
}

function playDailyPassage(
  passage: DailyPassage,
  sfx: Sfx,
  heartSrc: string,
  options: DailyTransitionOptions,
): () => void {
  const overlay = document.createElement('div')
  overlay.className = css.dailyTransition ?? ''
  overlay.dataset.ngoDailyTransition = ''
  overlay.dataset.phase = 'idle'
  overlay.setAttribute('role', 'status')
  overlay.setAttribute('aria-label', `${passage.previous.dateLabel} to ${passage.current.dateLabel}. Click to skip.`)
  overlay.style.setProperty('--ngo-day-emphasis-accent', options.emphasisColor)

  const title = document.createElement('div')
  title.className = css.dailyTransitionTitle ?? ''
  title.textContent = passage.previous.dateLabel
  setEmphasized(title, isEmphasized(passage.previous, options))

  const calendar = document.createElement('div')
  calendar.className = css.dailyTransitionCalendar ?? ''
  const track = document.createElement('div')
  track.className = css.dailyTransitionTrack ?? ''
  track.append(...passage.days.map(day => makeDayCard(
    day,
    heartSrc,
    options.showWeekday,
    isEmphasized(day, options),
  )))
  calendar.append(track)

  const arrow = document.createElement('div')
  arrow.className = css.dailyTransitionArrow ?? ''
  arrow.textContent = '▲'
  arrow.setAttribute('aria-hidden', 'true')
  overlay.append(title, calendar, arrow)
  document.body.append(overlay)

  let disposed = false
  const timers = new Set<number>()
  const schedule = (callback: () => void, delay: number): void => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      if (!disposed) callback()
    }, delay)
    timers.add(timer)
  }
  const remove = (): void => {
    if (disposed) return
    disposed = true
    for (const timer of timers) window.clearTimeout(timer)
    timers.clear()
    overlay.removeEventListener('click', skip)
    document.removeEventListener('keydown', onKeyDown)
    overlay.remove()
  }
  const skip = (): void => remove()
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') remove()
  }
  overlay.addEventListener('click', skip)
  document.addEventListener('keydown', onKeyDown)

  sfx.play('piyo')
  requestAnimationFrame(() => {
    if (!disposed) overlay.dataset.phase = 'arrow-down'
  })
  schedule(() => { overlay.dataset.phase = 'advance' }, ADVANCE_MS)
  schedule(() => {
    title.textContent = passage.current.dateLabel
    setEmphasized(title, isEmphasized(passage.current, options))
    sfx.play('notification')
  }, NOTIFY_MS)
  schedule(() => { overlay.dataset.phase = 'exit' }, EXIT_MS)
  schedule(remove, REMOVE_MS)
  return remove
}

export function installDailyTransition(
  sfx: Sfx,
  heartSrc: string,
  options: () => DailyTransitionOptions,
): () => void {
  let disposed = false
  let disposePassage: (() => void) | undefined
  const observer = new MutationObserver(() => tryStart())

  const tryStart = (): void => {
    if (disposed || disposePassage !== undefined) return
    // The forced-light boot/caution sequence owns the screen first. Waiting for
    // its removal also covers the delayed system-theme adoption path.
    if (document.body.hasAttribute('data-ds-dark-theme')
      || document.querySelector('[data-ngo-light-boot]') !== null) return
    const passage = claimDailyPassage(new Date())
    observer.disconnect()
    if (passage !== undefined) {
      disposePassage = playDailyPassage(passage, sfx, heartSrc, options())
    }
  }

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-ds-dark-theme'],
    childList: true,
    subtree: true,
  })
  tryStart()

  return () => {
    disposed = true
    observer.disconnect()
    disposePassage?.()
  }
}
