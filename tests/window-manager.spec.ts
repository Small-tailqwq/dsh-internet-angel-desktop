// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDesktopWindowManager } from '../src/client/window-manager.ts'

function fixture() {
  document.body.innerHTML = `
    <button id="open">open</button>
    <section id="window">
      <header data-window-drag>title</header>
      <button data-window-action="minimize">_</button>
      <button data-window-action="maximize">□</button>
      <button data-window-action="close">×</button>
      <span data-window-resize="n"></span>
      <span data-window-resize="ne"></span>
      <span data-window-resize="e"></span>
      <span data-window-resize="se"></span>
      <span data-window-resize="s"></span>
      <span data-window-resize="sw"></span>
      <span data-window-resize="w"></span>
      <span data-window-resize="nw"></span>
    </section>
    <button id="task">task</button>
    <div id="follower"></div>
  `
  const element = document.querySelector<HTMLElement>('#window')!
  element.getBoundingClientRect = () => ({
    left: 200, top: 100, width: 400, height: 300,
    right: 600, bottom: 400, x: 200, y: 100, toJSON: () => ({}),
  })
  // The follower's transform-free CSS layout position (jsdom has no layout);
  // current-rect re-anchoring reads it to translate the window to the follower.
  const follower = document.querySelector<HTMLElement>('#follower')!
  follower.getBoundingClientRect = element.getBoundingClientRect
  return {
    element,
    opener: document.querySelector<HTMLElement>('#open')!,
    task: document.querySelector<HTMLButtonElement>('#task')!,
    follower,
  }
}

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('desktop window manager', () => {
  it('keeps initially closed windows out of the taskbar until explicitly opened', () => {
    const nodes = fixture()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({ id: 'test', element: nodes.element, taskButton: nodes.task, initialState: 'closed' })
    expect(nodes.element.dataset.windowState).toBe('closed')
    expect(nodes.task.hidden).toBe(true)
    manager.setOpen('test', true)
    expect(nodes.element.dataset.windowState).toBe('open')
    expect(nodes.task.hidden).toBe(false)
    manager.dispose()
  })

  it('synchronizes minimize, restore, close and shortcut reopen', () => {
    const nodes = fixture()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({ id: 'test', element: nodes.element, taskButton: nodes.task, openers: [nodes.opener], followers: [nodes.follower] })

    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="minimize"]')!.click()
    expect(nodes.element.dataset.windowState).toBe('minimized')
    expect(nodes.follower.style.opacity).toBe('0')
    nodes.task.click()
    expect(nodes.element.dataset.windowState).toBe('open')
    expect(nodes.follower.style.opacity).toBe('')

    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(nodes.element.dataset.windowState).toBe('closed')
    expect(nodes.task.hidden).toBe(true)
    nodes.opener.click()
    expect(nodes.element.dataset.windowState).toBe('open')
    expect(nodes.task.hidden).toBe(false)
    for (let index = 0; index < 200; index += 1) nodes.opener.click()
    expect(nodes.element.style.zIndex).toBe('100')

    manager.dispose()
    expect(nodes.element.hasAttribute('data-window-state')).toBe(false)
  })

  it('restores a persistent window to its original rectangle after minimize or close', () => {
    vi.useFakeTimers()
    const nodes = fixture()
    const onDismissRecovered = vi.fn()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({
      id: 'webcam',
      element: nodes.element,
      taskButton: nodes.task,
      recoverOnDismiss: true,
      onDismissRecovered,
    })

    nodes.element.style.left = '420px'
    nodes.element.style.top = '260px'
    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="minimize"]')!.click()
    expect(nodes.element.dataset.windowState).toBe('minimized')
    expect(nodes.element.dataset.windowRecoveryPhase).toBe('minimizing')
    vi.advanceTimersByTime(200)
    expect(nodes.element.dataset.windowRecoveryPhase).toBe('minimized-wait')
    vi.advanceTimersByTime(100)
    expect(nodes.element.dataset.windowState).toBe('open')
    expect(nodes.element.dataset.windowRecoveryPhase).toBe('popping')
    expect(nodes.element.style.left).toBe('200px')
    expect(nodes.element.style.top).toBe('100px')
    expect(onDismissRecovered).toHaveBeenCalledTimes(1)
    expect(onDismissRecovered).toHaveBeenLastCalledWith('minimize')
    vi.advanceTimersByTime(200)
    expect(nodes.element.hasAttribute('data-window-recovery-phase')).toBe(false)

    nodes.element.style.left = '500px'
    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(nodes.element.dataset.windowState).toBe('closed')
    expect(nodes.element.dataset.windowRecoveryPhase).toBe('closed-wait')
    vi.advanceTimersByTime(300)
    expect(nodes.element.dataset.windowState).toBe('open')
    expect(nodes.element.dataset.windowRecoveryPhase).toBe('born')
    expect(nodes.element.style.left).toBe('200px')
    expect(nodes.task.hidden).toBe(false)
    expect(onDismissRecovered).toHaveBeenCalledTimes(2)
    expect(onDismissRecovered).toHaveBeenLastCalledWith('close')
    vi.advanceTimersByTime(100)
    expect(nodes.element.hasAttribute('data-window-recovery-phase')).toBe(false)

    manager.dispose()
  })

  it('maximizes into the center desktop and keeps a reachable title-bar strip while dragging', () => {
    const nodes = fixture()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({ id: 'test', element: nodes.element, taskButton: nodes.task, followers: [nodes.follower] })

    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="maximize"]')!.click()
    expect(nodes.element.dataset.windowMaximized).toBe('true')
    expect(nodes.element.style.left).toBe('100px')
    expect(nodes.element.style.width).toBe('800px')
    nodes.element.querySelector<HTMLButtonElement>('[data-window-action="maximize"]')!.click()
    expect(nodes.element.style.left).toBe('200px')

    const header = nodes.element.querySelector<HTMLElement>('[data-window-drag]')!
    header.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 250, clientY: 120 }))
    window.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: -1000, clientY: 900 }))
    window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    // The window may pass behind the left scene and taskbar while 96px of its
    // width and its full 34px title bar remain reachable in the desktop.
    expect(nodes.element.style.left).toBe('-204px')
    expect(nodes.element.style.top).toBe('666px')
    expect(nodes.follower.style.transform).toBe('translate3d(-404px, 566px, 0)')

    manager.dispose()
  })

  it('resizes from all edges within desktop bounds and preserves the opposite edge', () => {
    const nodes = fixture()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({
      id: 'test',
      element: nodes.element,
      taskButton: nodes.task,
      followers: [nodes.follower],
      followerWidthInset: 24,
      followerVerticalAnchor: 'bottom',
    })

    nodes.element.querySelector<HTMLElement>('[data-window-resize="se"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 600, clientY: 400 }))
    window.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 950, clientY: 800 }))
    expect(nodes.element.style.left).toBe('200px')
    expect(nodes.element.style.top).toBe('100px')
    expect(nodes.element.style.width).toBe('700px')
    expect(nodes.element.style.height).toBe('600px')
    expect(nodes.follower.style.width).toBe('676px')
    expect(nodes.follower.style.transform).toBe('translate3d(0px, 300px, 0)')
    window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    expect(nodes.element.hasAttribute('data-window-resizing')).toBe(false)

    manager.dispose()
  })

  it('enforces the Unity window minimum while resizing north-west', () => {
    const nodes = fixture()
    const manager = createDesktopWindowManager(() => ({ left: 100, top: 0, right: 900, bottom: 700 }))
    manager.register({ id: 'test', element: nodes.element, taskButton: nodes.task })

    nodes.element.querySelector<HTMLElement>('[data-window-resize="nw"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0, clientX: 200, clientY: 100 }))
    window.dispatchEvent(new MouseEvent('pointermove', { bubbles: true, clientX: 800, clientY: 600 }))
    window.dispatchEvent(new MouseEvent('pointerup', { bubbles: true }))
    expect(nodes.element.style.left).toBe('480px')
    expect(nodes.element.style.top).toBe('340px')
    expect(nodes.element.style.width).toBe('120px')
    expect(nodes.element.style.height).toBe('60px')

    manager.dispose()
  })

  it('keeps dynamic followers in the focus order and reports active-state changes', () => {
    const nodes = fixture()
    const other = document.createElement('section')
    const otherTask = document.createElement('button')
    document.body.append(other, otherTask)
    other.getBoundingClientRect = nodes.element.getBoundingClientRect
    const onActiveChange = vi.fn()
    const manager = createDesktopWindowManager()

    manager.register({
      id: 'settings',
      element: nodes.element,
      taskButton: nodes.task,
      followerSelector: '#follower',
      onActiveChange,
    })
    manager.register({ id: 'other', element: other, taskButton: otherTask })
    expect(nodes.element.dataset.windowActive).toBe('false')
    expect(onActiveChange).toHaveBeenLastCalledWith(false)

    nodes.follower.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    expect(nodes.element.dataset.windowActive).toBe('true')
    expect(other.dataset.windowActive).toBe('false')
    expect(onActiveChange).toHaveBeenLastCalledWith(true)
    expect(Number(nodes.element.style.zIndex)).toBeGreaterThan(Number(other.style.zIndex))

    manager.dispose()
    expect(onActiveChange).toHaveBeenLastCalledWith(false)
  })
})
