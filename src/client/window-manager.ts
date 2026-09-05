export interface WindowBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export interface ManagedWindow {
  id: string
  element: HTMLElement
  taskButton: HTMLButtonElement
  initialState?: 'open' | 'closed'
  /** Game-owned windows such as webcam cannot stay dismissed. Closing or
   * minimizing briefly applies the requested state, then restores the initial
   * rectangle and reactivates the window. */
  recoverOnDismiss?: boolean
  /** Runs after a persistent window is restored (the game uses this to show
   * Ame's short angry reaction after webcam close/minimize). */
  onDismissRecovered?: (action: 'minimize' | 'close') => void
  openers?: readonly HTMLElement[]
  followers?: readonly HTMLElement[]
  followerSelector?: string
  followerInset?: { top: number; right: number; bottom: number; left: number }
  followerWidthInset?: number
  followerVerticalAnchor?: 'top' | 'bottom'
  /** Anchor a transform-followed element to `window.left + inset` (left inset). */
  followerLeftInset?: number
  /** Anchor a transform-followed element to `window.bottom - inset` (bottom inset). */
  followerBottomInset?: number
  onActiveChange?: (active: boolean) => void
  onStackChange?: (layer: number, active: boolean) => void
}

export interface DesktopWindowManager {
  register(window: ManagedWindow): void
  setOpen(id: string, open: boolean): void
  /** Re-sync followers. A full refresh also remeasures viewport-responsive
   * default rectangles; an id-scoped refresh leaves that baseline unchanged. */
  refresh(id?: string): void
  /** Re-capture the window's current rect from the DOM and re-apply followers.
   * Use after an external geometry change (e.g. the JINE stretch clamp). */
  setRect(id: string): void
  dispose(): void
}

interface WindowRecord extends ManagedWindow {
  cleanup: Array<() => void>
  followerStyles: Map<HTMLElement, FollowerStyle>
  followerActivators: Set<HTMLElement>
  followerObservers: Map<HTMLElement, MutationObserver>
  expectedFollowerGeometry: Map<HTMLElement, { transform: string; width?: string }>
  originStyle: WindowGeometryStyle
  originRect: DOMRect
  currentRect: DOMRect
  restoreRect?: DOMRect
  recoveryTimer?: number
  recoveryPhaseTimer?: number
}

interface FollowerStyle {
  transform: string
  opacity: string
  pointerEvents: string
  left: string
  top: string
  width: string
  height: string
}

interface WindowGeometryStyle {
  left: string
  top: string
  right: string
  bottom: string
  width: string
  height: string
}

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'

const MIN_WINDOW_WIDTH = 120
const MIN_WINDOW_HEIGHT = 60
const MIN_VISIBLE_DRAG_WIDTH = 96
const MIN_VISIBLE_TITLE_HEIGHT = 34
const GRAVITY_ATTRIBUTE = 'data-ngo-gravity-potion'

export function getDesktopLayoutRect(element: HTMLElement): DOMRect {
  const rect = element.getBoundingClientRect()
  if (!document.body.hasAttribute(GRAVITY_ATTRIBUTE)) return rect

  const left = window.innerWidth - rect.right
  const top = window.innerHeight - rect.bottom
  return {
    left,
    top,
    width: rect.width,
    height: rect.height,
    right: left + rect.width,
    bottom: top + rect.height,
    x: left,
    y: top,
    toJSON: () => ({}),
  }
}

function defaultBounds(): WindowBounds {
  const side = window.innerWidth >= 900
    ? Math.min(242, window.innerWidth * 242 / 1920)
    : 0
  return {
    left: side,
    top: 0,
    right: window.innerWidth - side,
    bottom: window.innerHeight - 48,
  }
}

function listen(
  cleanup: Array<() => void>,
  target: EventTarget,
  type: string,
  listener: EventListener,
): void {
  target.addEventListener(type, listener)
  cleanup.push(() => target.removeEventListener(type, listener))
}

/**
 * Owns all game-window behavior behind a register/dispose interface: focus
 * ordering, taskbar synchronization, drag constraints and window state.
 */
export function createDesktopWindowManager(
  getBounds: () => WindowBounds = defaultBounds,
  sound?: (name: string) => void,
  stopSound?: (name: string) => void,
): DesktopWindowManager {
  const records = new Map<string, WindowRecord>()
  const focusOrder: WindowRecord[] = []
  let disposed = false

  const resolveFollowers = (record: WindowRecord): Set<HTMLElement> => {
    const followers = new Set(record.followers ?? [])
    if (record.followerSelector !== undefined) {
      document.querySelectorAll<HTMLElement>(record.followerSelector).forEach(follower => followers.add(follower))
    }
    return followers
  }

  const syncTask = (record: WindowRecord): void => {
    const state = record.element.dataset.windowState ?? 'open'
    record.taskButton.dataset.windowState = state
    record.taskButton.hidden = state === 'closed'
    record.taskButton.setAttribute('aria-pressed', String(record.element.dataset.windowActive === 'true'))
  }

  const syncFollowers = (record: WindowRecord, rect: DOMRect = getDesktopLayoutRect(record.element)): void => {
    record.currentRect = rect
    const state = record.element.dataset.windowState ?? 'open'
    for (const follower of resolveFollowers(record)) {
      if (!record.followerStyles.has(follower)) {
        record.followerStyles.set(follower, captureFollowerStyle(follower))
      }
      if (!record.followerActivators.has(follower)) {
        record.followerActivators.add(follower)
        listen(record.cleanup, follower, 'pointerdown', () => activate(record))
      }
      const original = record.followerStyles.get(follower)
      const inset = record.followerInset
      if (inset === undefined) {
        // Anchor to the window's CURRENT rect instead of a delta from the
        // origin rect: the CSS-positioned composer must be re-anchored after
        // every layout change (viewport resize, remount, JINE stretch) with no
        // accumulated error. Read the transform-free layout position first.
        follower.style.setProperty('transform', 'none', 'important')
        const cssRect = getDesktopLayoutRect(follower)
        const tx = rect.left + (record.followerLeftInset ?? 0) - cssRect.left
        const ty = rect.bottom - (record.followerBottomInset ?? 0) - cssRect.bottom
        const transform = `translate3d(${tx}px, ${ty}px, 0)${original?.transform ? ` ${original.transform}` : ''}`
        const width = record.followerWidthInset === undefined
          ? undefined
          : `${Math.max(1, rect.width - record.followerWidthInset)}px`
        record.expectedFollowerGeometry.set(follower, width === undefined ? { transform } : { transform, width })
        follower.style.setProperty('transform', transform, 'important')
        if (record.followerWidthInset !== undefined) {
          follower.style.setProperty('width', width ?? '', 'important')
        }
        if (!record.followerObservers.has(follower)) {
          const observer = new MutationObserver(() => {
            const expected = record.expectedFollowerGeometry.get(follower)
            if (expected === undefined || !follower.isConnected) return
            if (follower.style.getPropertyValue('transform') !== expected.transform
              || follower.style.getPropertyPriority('transform') !== 'important') {
              follower.style.setProperty('transform', expected.transform, 'important')
            }
            if (expected.width !== undefined
              && (follower.style.getPropertyValue('width') !== expected.width
                || follower.style.getPropertyPriority('width') !== 'important')) {
              follower.style.setProperty('width', expected.width, 'important')
            }
          })
          observer.observe(follower, { attributes: true, attributeFilter: ['style'] })
          record.followerObservers.set(follower, observer)
        }
      } else {
        follower.style.setProperty('transform', 'none', 'important')
        follower.style.left = `${rect.left + inset.left}px`
        follower.style.top = `${rect.top + inset.top}px`
        follower.style.width = `${Math.max(1, rect.width - inset.left - inset.right)}px`
        follower.style.height = `${Math.max(1, rect.height - inset.top - inset.bottom)}px`
      }
      follower.style.opacity = state === 'open' ? original?.opacity ?? '' : '0'
      follower.style.pointerEvents = state === 'open' ? original?.pointerEvents ?? '' : 'none'
    }
  }

  const activate = (record: WindowRecord): void => {
    const previousState = record.element.dataset.windowState ?? 'open'
    if (previousState !== 'open') record.element.dataset.windowState = 'open'
    if (previousState !== 'open') sound?.('kari')
    const previousIndex = focusOrder.indexOf(record)
    if (previousIndex >= 0) focusOrder.splice(previousIndex, 1)
    focusOrder.push(record)
    for (const other of records.values()) {
      const active = other === record
      const wasActive = other.element.dataset.windowActive === 'true'
      other.element.dataset.windowActive = String(active)
      const rank = focusOrder.indexOf(other)
      /* Leave one sub-layer between adjacent windows for externally mounted
       * followers such as DSH's settings dialog. */
      if (rank >= 0) {
        const layer = 100 + rank * 10
        other.element.style.zIndex = String(layer)
        other.onStackChange?.(layer, active)
      }
      syncTask(other)
      syncFollowers(other)
      if (active !== wasActive) other.onActiveChange?.(active)
    }
  }

  const deactivate = (record: WindowRecord): void => {
    const wasActive = record.element.dataset.windowActive === 'true'
    record.element.dataset.windowActive = 'false'
    if (wasActive) record.onActiveChange?.(false)
  }

  const activateFallback = (excluded: WindowRecord): void => {
    const fallback = [...focusOrder].reverse().find(candidate => candidate !== excluded
      && candidate.element.dataset.windowState === 'open')
    if (fallback !== undefined) activate(fallback)
  }

  const applyRect = (element: HTMLElement, rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): void => {
    element.style.left = `${rect.left}px`
    element.style.top = `${rect.top}px`
    element.style.width = `${rect.width}px`
    element.style.height = `${rect.height}px`
    element.style.right = 'auto'
    element.style.bottom = 'auto'
  }

  const resolvedRect = (
    left: number,
    top: number,
    width: number,
    height: number,
  ): DOMRect => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  })

  const sameRect = (
    first: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
    second: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
  ): boolean => Math.abs(first.left - second.left) <= 0.5
    && Math.abs(first.top - second.top) <= 0.5
    && Math.abs(first.width - second.width) <= 0.5
    && Math.abs(first.height - second.height) <= 0.5

  const measureOriginRect = (record: WindowRecord): DOMRect => {
    const currentStyle = captureWindowGeometryStyle(record.element)
    applyWindowGeometryStyle(record.element, record.originStyle)
    const rect = getDesktopLayoutRect(record.element)
    applyWindowGeometryStyle(record.element, currentStyle)
    return rect
  }

  const refreshViewportLayout = (record: WindowRecord): void => {
    if (!record.element.isConnected) return
    const currentRect = getDesktopLayoutRect(record.element)
    const previousOrigin = record.originRect
    const nextOrigin = measureOriginRect(record)
    record.originRect = nextOrigin

    if (record.restoreRect !== undefined && sameRect(record.restoreRect, previousOrigin)) {
      record.restoreRect = nextOrigin
    }
    if (record.element.dataset.windowMaximized === 'true') {
      const bounds = getBounds()
      const maximized = resolvedRect(
        bounds.left,
        bounds.top,
        Math.max(MIN_WINDOW_WIDTH, bounds.right - bounds.left),
        Math.max(MIN_WINDOW_HEIGHT, bounds.bottom - bounds.top),
      )
      applyRect(record.element, maximized)
      syncFollowers(record, maximized)
      return
    }

    // CSS-positioned windows naturally follow vw/vh and media queries. Only
    // re-apply the new default when an earlier recovery already pinned that
    // default as inline pixels; a manually moved/resized rectangle is kept.
    if (sameRect(currentRect, previousOrigin) && !sameRect(currentRect, nextOrigin)) {
      applyRect(record.element, nextOrigin)
      syncFollowers(record, nextOrigin)
      return
    }
    syncFollowers(record, currentRect)
  }

  const scheduleDismissRecovery = (record: WindowRecord, action: 'minimize' | 'close'): void => {
    if (record.recoverOnDismiss !== true || disposed || record.recoveryTimer !== undefined) return
    record.element.dataset.windowRecoveryPhase = action === 'minimize' ? 'minimizing' : 'closed-wait'
    if (action === 'minimize') {
      record.recoveryPhaseTimer = window.setTimeout(() => {
        delete record.recoveryPhaseTimer
        if (record.element.dataset.windowRecoveryPhase === 'minimizing') {
          record.element.dataset.windowRecoveryPhase = 'minimized-wait'
        }
      }, 200)
    }
    record.recoveryTimer = window.setTimeout(() => {
      delete record.recoveryTimer
      if (disposed || !record.element.isConnected) return
      if (record.recoveryPhaseTimer !== undefined) window.clearTimeout(record.recoveryPhaseTimer)
      delete record.recoveryPhaseTimer
      delete record.restoreRect
      record.element.dataset.windowMaximized = 'false'
      applyRect(record.element, record.originRect)
      syncFollowers(record, record.originRect)
      record.element.dataset.windowRecoveryPhase = action === 'minimize' ? 'popping' : 'born'
      activate(record)
      record.onDismissRecovered?.(action)
      record.recoveryPhaseTimer = window.setTimeout(() => {
        delete record.recoveryPhaseTimer
        record.element.removeAttribute('data-window-recovery-phase')
      }, action === 'minimize' ? 200 : 100)
    }, 300)
  }

  const minimize = (record: WindowRecord): void => {
    sound?.('pirodown')
    record.element.dataset.windowState = 'minimized'
    deactivate(record)
    syncTask(record)
    syncFollowers(record)
    activateFallback(record)
    scheduleDismissRecovery(record, 'minimize')
  }

  const close = (record: WindowRecord): void => {
    sound?.('windowClose')
    record.element.dataset.windowState = 'closed'
    deactivate(record)
    syncTask(record)
    syncFollowers(record)
    activateFallback(record)
    scheduleDismissRecovery(record, 'close')
  }

  const toggleMaximize = (record: WindowRecord): void => {
    activate(record)
    if (record.element.dataset.windowMaximized === 'true') {
      sound?.('pirodown')
      if (record.restoreRect !== undefined) {
        applyRect(record.element, record.restoreRect)
        syncFollowers(record, record.restoreRect)
      }
      record.element.dataset.windowMaximized = 'false'
      return
    }
    sound?.('kari')
    record.restoreRect = getDesktopLayoutRect(record.element)
    const bounds = getBounds()
    const maximized = resolvedRect(
      bounds.left,
      bounds.top,
      Math.max(MIN_WINDOW_WIDTH, bounds.right - bounds.left),
      Math.max(MIN_WINDOW_HEIGHT, bounds.bottom - bounds.top),
    )
    applyRect(record.element, maximized)
    syncFollowers(record, maximized)
    record.element.dataset.windowMaximized = 'true'
  }

  const register = (managed: ManagedWindow): void => {
    if (disposed || records.has(managed.id)) return
    const originStyle = captureWindowGeometryStyle(managed.element)
    const originRect = getDesktopLayoutRect(managed.element)
    const followerStyles = new Map<HTMLElement, FollowerStyle>()
    for (const follower of managed.followers ?? []) {
      followerStyles.set(follower, captureFollowerStyle(follower))
    }
    const record: WindowRecord = {
      ...managed,
      cleanup: [],
      followerStyles,
      followerActivators: new Set(),
      followerObservers: new Map(),
      expectedFollowerGeometry: new Map(),
      originStyle,
      originRect,
      currentRect: originRect,
    }
    records.set(record.id, record)
    record.element.dataset.windowState = managed.initialState ?? 'open'
    record.element.dataset.windowActive = 'false'
    record.taskButton.dataset.windowTask = record.id
    record.taskButton.type = 'button'

    const activateFromPointer = (): void => activate(record)
    listen(record.cleanup, record.element, 'pointerdown', activateFromPointer)

    const taskClick = (): void => {
      if (record.element.dataset.windowState !== 'open') activate(record)
      else if (record.element.dataset.windowActive === 'true') minimize(record)
      else activate(record)
    }
    listen(record.cleanup, record.taskButton, 'click', taskClick)

    for (const opener of record.openers ?? []) {
      const open = (): void => activate(record)
      listen(record.cleanup, opener, 'dblclick', open)
      listen(record.cleanup, opener, 'click', open)
    }

    const actionHandlers: Record<string, () => void> = {
      minimize: () => minimize(record),
      maximize: () => toggleMaximize(record),
      close: () => close(record),
    }
    for (const button of record.element.querySelectorAll<HTMLElement>('[data-window-action]')) {
      const action = button.dataset.windowAction ?? ''
      const handler = actionHandlers[action]
      if (handler !== undefined) listen(record.cleanup, button, 'click', handler)
    }

    for (const handle of record.element.querySelectorAll<HTMLElement>('[data-window-resize]')) {
      const direction = handle.dataset.windowResize as ResizeDirection | undefined
      if (direction === undefined) continue
      const onResizeStart = (event: Event): void => {
        const pointer = event as PointerEvent
        if (pointer.button !== 0 || record.element.dataset.windowMaximized === 'true') return
        event.preventDefault()
        event.stopPropagation()
        sound?.('pillGuiiin')
        activate(record)
        record.element.dataset.windowResizing = direction
      const start = getDesktopLayoutRect(record.element)
        const startX = pointer.clientX
        const startY = pointer.clientY
        const move = (moveEvent: Event): void => {
          const next = moveEvent as PointerEvent
          const bounds = getBounds()
          const dx = next.clientX - startX
          const dy = next.clientY - startY
          let left = start.left
          let top = start.top
          let right = start.right
          let bottom = start.bottom

          if (direction.includes('w')) left = Math.min(start.right - MIN_WINDOW_WIDTH, Math.max(bounds.left, start.left + dx))
          if (direction.includes('e')) right = Math.max(start.left + MIN_WINDOW_WIDTH, Math.min(bounds.right, start.right + dx))
          if (direction.includes('n')) top = Math.min(start.bottom - MIN_WINDOW_HEIGHT, Math.max(bounds.top, start.top + dy))
          if (direction.includes('s')) bottom = Math.max(start.top + MIN_WINDOW_HEIGHT, Math.min(bounds.bottom, start.bottom + dy))

          const rect = resolvedRect(left, top, right - left, bottom - top)
          applyRect(record.element, rect)
          syncFollowers(record, rect)
        }
        const stop = (): void => {
          delete record.element.dataset.windowResizing
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', stop)
          window.removeEventListener('pointercancel', stop)
          // Matches the game's MovableObject.OnEndDrag: the drag sound is
          // stopped (truncated) before the release click plays.
          stopSound?.('pillGuiiin')
          sound?.('poko')
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
        window.addEventListener('pointercancel', stop)
        record.cleanup.push(stop)
      }
      listen(record.cleanup, handle, 'pointerdown', onResizeStart)
    }

    const header = record.element.querySelector<HTMLElement>('[data-window-drag]')
    if (header !== null) {
      const onPointerDown = (event: Event): void => {
        const pointer = event as PointerEvent
        if (pointer.button !== 0 || record.element.dataset.windowMaximized === 'true') return
        if (pointer.target instanceof Element && pointer.target.closest('[data-window-action]') !== null) return
        event.preventDefault()
        sound?.('pillGuiiin')
        activate(record)
      const start = getDesktopLayoutRect(record.element)
        const offsetX = pointer.clientX - start.left
        const offsetY = pointer.clientY - start.top
        const move = (moveEvent: Event): void => {
          const next = moveEvent as PointerEvent
          const bounds = getBounds()
          const desktopWidth = Math.max(0, bounds.right - bounds.left)
          const desktopHeight = Math.max(0, bounds.bottom - bounds.top)
          const visibleWidth = Math.min(MIN_VISIBLE_DRAG_WIDTH, start.width, desktopWidth)
          const visibleTitleHeight = Math.min(MIN_VISIBLE_TITLE_HEIGHT, start.height, desktopHeight)
          // Side panels and the taskbar paint above windows, so a dragged
          // window may pass behind them. Keep a usable title-bar strip inside
          // the center desktop while the top edge remains fully constrained.
          const minLeft = bounds.left - start.width + visibleWidth
          const maxLeft = bounds.right - visibleWidth
          const maxTop = bounds.bottom - visibleTitleHeight
          const left = Math.min(maxLeft, Math.max(minLeft, next.clientX - offsetX))
          const top = Math.min(maxTop, Math.max(bounds.top, next.clientY - offsetY))
          const rect = resolvedRect(left, top, start.width, start.height)
          applyRect(record.element, rect)
          syncFollowers(record, rect)
        }
        const stop = (): void => {
          window.removeEventListener('pointermove', move)
          window.removeEventListener('pointerup', stop)
          window.removeEventListener('pointercancel', stop)
          // Matches the game's MovableObject.OnEndDrag: the drag sound is
          // stopped (truncated) before the release click plays.
          stopSound?.('pillGuiiin')
          sound?.('poko')
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', stop)
        window.addEventListener('pointercancel', stop)
        record.cleanup.push(stop)
      }
      listen(record.cleanup, header, 'pointerdown', onPointerDown)
      listen(record.cleanup, header, 'dblclick', () => toggleMaximize(record))
    }

    if (record.element.dataset.windowState === 'open') activate(record)
    else syncTask(record)
  }

  return {
    register,
    setOpen(id: string, open: boolean): void {
      const record = records.get(id)
      if (record === undefined) return
      if (open) activate(record)
      else if (record.element.dataset.windowState !== 'closed') close(record)
    },
    refresh(id?: string): void {
      if (id !== undefined) {
        const record = records.get(id)
        if (record !== undefined) syncFollowers(record)
        return
      }
      for (const record of records.values()) refreshViewportLayout(record)
    },
    setRect(id: string): void {
      const record = records.get(id)
      if (record === undefined || !record.element.isConnected) return
      syncFollowers(record, getDesktopLayoutRect(record.element))
    },
    dispose(): void {
      disposed = true
      for (const record of records.values()) {
        if (record.recoveryTimer !== undefined) window.clearTimeout(record.recoveryTimer)
        if (record.recoveryPhaseTimer !== undefined) window.clearTimeout(record.recoveryPhaseTimer)
        deactivate(record)
        for (const cleanup of record.cleanup.splice(0)) cleanup()
        for (const observer of record.followerObservers.values()) observer.disconnect()
        record.followerObservers.clear()
        record.expectedFollowerGeometry.clear()
        record.element.removeAttribute('data-window-state')
        record.element.removeAttribute('data-window-active')
        record.element.removeAttribute('data-window-maximized')
        record.element.removeAttribute('data-window-resizing')
        record.element.removeAttribute('data-window-dragging')
        record.element.removeAttribute('data-window-recovery-phase')
        record.element.removeAttribute('style')
        record.taskButton.removeAttribute('data-window-state')
        record.taskButton.removeAttribute('data-window-task')
        record.taskButton.removeAttribute('aria-pressed')
        record.taskButton.hidden = false
        for (const [follower, original] of record.followerStyles) {
          follower.style.transform = original.transform
          follower.style.opacity = original.opacity
          follower.style.pointerEvents = original.pointerEvents
          follower.style.left = original.left
          follower.style.top = original.top
          follower.style.width = original.width
          follower.style.height = original.height
        }
        record.followerActivators.clear()
      }
      records.clear()
      focusOrder.splice(0)
    },
  }
}

function captureFollowerStyle(element: HTMLElement): FollowerStyle {
  return {
    transform: element.style.transform,
    opacity: element.style.opacity,
    pointerEvents: element.style.pointerEvents,
    left: element.style.left,
    top: element.style.top,
    width: element.style.width,
    height: element.style.height,
  }
}

function captureWindowGeometryStyle(element: HTMLElement): WindowGeometryStyle {
  return {
    left: element.style.left,
    top: element.style.top,
    right: element.style.right,
    bottom: element.style.bottom,
    width: element.style.width,
    height: element.style.height,
  }
}

function applyWindowGeometryStyle(element: HTMLElement, style: WindowGeometryStyle): void {
  element.style.left = style.left
  element.style.top = style.top
  element.style.right = style.right
  element.style.bottom = style.bottom
  element.style.width = style.width
  element.style.height = style.height
}
