// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  document.documentElement.lang = 'zh-CN'
  vi.stubGlobal('matchMedia', (media: string) => Object.assign(new EventTarget(), { matches: false, media }))
})
import { Context, type Fiber } from 'cordis'
import { apply } from '../src/client/index.ts'

// jsdom has no ResizeObserver; the JINE stretch observes the composer seat and
// window with it. A no-op stub keeps the lifecycle tests layout-free.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver
}

let fiber: Fiber | undefined

async function mount(): Promise<Fiber> {
  const next = new Context().plugin({ apply })
  await next.await()
  return next
}

afterEach(async () => {
  await fiber?.dispose()
  fiber = undefined
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('webcam and LIVE surfaces', () => {
  it('keeps the webcam role viewport separate from the DSH LIVE feed', async () => {
    document.body.innerHTML = `
      <div id="root">
        <div data-phase="active">
          <div data-chat-flow>
            <div data-chat-flow-kind="assistant-step">
              <div data-variant="think" data-state="ok">正在梳理请求</div>
              <div data-chat-flow-kind="tool">读取素材完成</div>
              <div class="_markdown_fixture">中间更新</div>
              <div class="_markdown_fixture">最终正文</div>
            </div>
          </div>
        </div>
      </div>
    `
    fiber = await mount()

    const webcam = document.querySelector<HTMLElement>('[data-window-id="webcam"]')!
    const live = document.querySelector<HTMLElement>('[data-window-id="live"]')!
    expect(webcam.textContent).toContain('webcam')
    expect(live.textContent).toContain('LIVE')
    expect(webcam.querySelector('[data-webcam-role]')).not.toBeNull()
    expect(webcam.querySelector('[data-skin-surface="live-feed"]')).toBeNull()
    expect(live.querySelector('[data-skin-surface="live-feed"]')?.textContent)
      .toEqual(expect.stringContaining('正在梳理请求'))
    expect(live.querySelector('[data-live-kind="think"]')).not.toBeNull()
    expect(live.querySelector('[data-live-kind="update"]')).toBeNull()
    expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent).toContain('中间更新')
    expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent).toContain('最终正文')
    expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent).not.toContain('糖糖说')
    expect(document.querySelector('[data-skin-surface="task-manager-feed"]')?.textContent).toContain('中间更新')
    expect(document.querySelector('[data-skin-surface="task-manager-feed"]')?.textContent).toContain('读取素材完成')
    expect(document.querySelector('[data-skin-surface="tweet-feed"]')?.textContent).not.toContain('最终正文')
  })

  it('registers independent webcam and LIVE taskbar controls', async () => {
    document.body.innerHTML = '<div id="root"><div data-phase="hero"></div></div>'
    fiber = await mount()

    const webcam = document.querySelector<HTMLElement>('[data-window-id="webcam"]')!
    const live = document.querySelector<HTMLElement>('[data-window-id="live"]')!
    const webcamTask = document.querySelector<HTMLButtonElement>('[data-window-task="webcam"]')!
    const liveTask = document.querySelector<HTMLButtonElement>('[data-window-task="live"]')!
    const streamShortcut = Array.from(document.querySelectorAll<HTMLButtonElement>('button'))
      .find(button => button.textContent?.trim() === '直播')!
    expect(webcam.dataset.windowState).toBe('open')
    expect(live.dataset.windowState).toBe('closed')
    expect(liveTask.hidden).toBe(true)

    webcam.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(webcam.dataset.windowState).toBe('closed')
    expect(webcamTask.hidden).toBe(true)
    expect(live.dataset.windowState).toBe('closed')
    streamShortcut.click()
    expect(live.dataset.windowState).toBe('open')
    expect(liveTask.hidden).toBe(false)
    live.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(live.dataset.windowState).toBe('closed')
    expect(liveTask.hidden).toBe(true)
  })

  it('restores the webcam head-pat interaction without changing DSH state', async () => {
    document.body.innerHTML = '<div id="root"><div data-phase="hero"></div></div>'
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue()
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    fiber = await mount()

    const stage = document.querySelector<HTMLElement>('[data-skin-surface="webcam-stage"]')!
    const hitbox = stage.querySelector<HTMLButtonElement>('[data-webcam-interaction="pat"]')!
    expect(hitbox.getAttribute('aria-label')).toBe('摸摸糖糖的头')
    expect(hitbox.dataset.webcamPatCount).toBe('0')
    expect(document.body.style.getPropertyValue('--ngo-webcam-hand'))
      .toMatch(/^url\("data:image\/png;base64,/)
    expect(getComputedStyle(hitbox).cursor).toContain('data:image/png;base64')

    hitbox.click()
    expect(stage.hasAttribute('data-webcam-patting')).toBe(true)
    expect(hitbox.dataset.webcamPatCount).toBe('1')
    expect(play).toHaveBeenCalledOnce()

    // Game App_Webcam.Nade replays the sound and the (idempotent) happy()
    // base-animation swap on every head-pat.
    hitbox.click()
    expect(hitbox.dataset.webcamPatCount).toBe('2')
    expect(play).toHaveBeenCalledTimes(2)
    expect(stage.hasAttribute('data-webcam-patting')).toBe(true)
  })
})
