// @vitest-environment jsdom
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

beforeEach(() => {
  document.documentElement.lang = 'zh-CN'
  vi.stubGlobal('matchMedia', (media: string) => Object.assign(new EventTarget(), { matches: false, media }))
})
import { Context, type Fiber } from 'cordis'
import { apply, taskbarClockModel } from '../src/client/index.ts'

// jsdom has no ResizeObserver; the JINE stretch observes the composer seat and
// window with it. A no-op stub keeps the lifecycle tests layout-free.
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver
}

declare global {
  const __DSH_VERSION__: string
}

const BODY_ATTRIBUTE = 'data-dsh-internet-angel-desktop'
let fiber: Fiber | undefined

async function mount(): Promise<Fiber> {
  const next = new Context().plugin({ apply })
  await next.await()
  return next
}

function fixture(): void {
  document.body.innerHTML = `
    <div id="root">
      <div data-phase="active">
        <div data-chat-flow>
          <div data-chat-flow-kind="user">
            <div data-actions-reveal="always">
              <div class="_bubble_fixture">请检查皮肤</div>
              <div class="_actions_fixture"><span class="_timeStart_fixture">15:38</span><button>复制</button></div>
            </div>
          </div>
          <div data-chat-flow-kind="assistant-step">
            <div data-variant="think" data-state="ok">Think：正在读取素材</div>
            <div class="_markdown_fixture_5"><p>中间播报</p></div>
            <div class="_markdown_fixture_5"><p>首版正文</p></div>
          </div>
          <div data-chat-flow-kind="tool-call">
            <div data-variant="read" data-tool="read" data-state="ok"><span class="_title_fixture">Read</span><span class="_summary_fixture">读取文件完成</span></div>
          </div>
          <div data-chat-flow-kind="tool-call">
            <div data-variant="write" data-tool="write" data-state="ok"><span class="_title_fixture">Write</span><span class="_summary_fixture">写入补丁完成</span></div>
          </div>
          <div data-chat-flow-kind="tool-call">
            <div data-variant="others" data-tool="skills.read" data-state="ok"><span class="_title_fixture">Tool call</span><span class="_summary_fixture">加载皮肤技能</span></div>
          </div>
          <div data-chat-flow-kind="tool-call">
            <div data-variant="bash" data-tool="pwsh" data-state="running"><span class="_visuallyHidden_fixture">Running</span><span class="_title_fixture">Pwsh</span><span class="_summary_fixture">执行测试</span></div>
          </div>
          <div data-chat-flow-kind="tool-call">
            <div data-variant="others" data-tool="custom_tool" data-state="ok"><span class="_title_fixture">Tool call</span><span class="_summary_fixture">调用自定义工具</span></div>
          </div>
          <div data-chat-flow-kind="user">
            <div data-actions-reveal="always">
              <div class="_bubble_fixture">尚未读取的消息</div>
              <div class="_actions_fixture"><span class="_timeEnd_fixture">16:19</span><button>复制</button></div>
            </div>
          </div>
        </div>
        <div data-slot="conversation.session.header"><header>
          <div data-slot="conversation.session.header.actions">
            <div data-schedule-fixture><button type="button" aria-expanded="false" aria-label="1 个提醒"><svg></svg><span>1 个提醒</span><svg></svg></button></div>
          </div>
        </header></div>
        <div role="tree"><div role="treeitem" aria-selected="true">Day 1</div><div role="treeitem" aria-selected="false">Day 2</div></div>
        <div data-slot="sidebar.settings"><div class="_triggerRow_fixture"><button type="button" aria-haspopup="dialog">设置</button><button type="button" data-phase="disconnected">重新连接</button></div></div>
        <div data-testid="chat-stats"><span>2 轮 · 8 步</span> | <span data-testid="cache-stat">缓存命中 90%</span> | <span>输入 1.2K tok · 输出 300 tok</span></div>
        <button type="button" aria-label="上下文已用 25%">上下文</button>
        <button type="button" aria-label="访问模式，当前：Workspace Write">Workspace Write</button>
      </div>
    </div>
  `
}

afterEach(async () => {
  await fiber?.dispose()
  fiber = undefined
  document.body.innerHTML = ''
  document.querySelectorAll('link[rel="icon"], link[rel="manifest"]').forEach(link => link.remove())
  document.body.removeAttribute(BODY_ATTRIBUTE)
  document.body.removeAttribute('data-ngo-save-open')
  document.body.removeAttribute('data-ngo-start-open')
  document.body.removeAttribute('data-ngo-settings-open')
  document.body.removeAttribute('data-ngo-settings-active')
  document.body.removeAttribute('data-ngo-phase')
  document.body.removeAttribute('data-ngo-side-scene')
  document.body.removeAttribute('data-ngo-side-transition')
  document.body.removeAttribute('data-ngo-jine-open')
  document.body.removeAttribute('data-ngo-jine-has-queue')
  document.body.removeAttribute('data-ngo-jine-queue-fallback')
  document.body.removeAttribute('data-ds-dark-theme')
  document.body.removeAttribute('style')
  document.documentElement.lang = ''
  window.sessionStorage.clear()
  window.localStorage.clear()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('Internet Angel Desktop lifecycle', () => {
  it('opens the Pomodoro window and notification at the deadline, then restores the webcam base', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 24, 10, 0, 0))
    fixture()
    fiber = await mount()
    const pomodoro = document.querySelector<HTMLElement>('[data-window-id="pomodoro"]')!
    const shortcut = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '番茄钟')!
    shortcut.click()
    const inputs = [...pomodoro.querySelectorAll<HTMLInputElement>('input[type="number"]')]
    inputs[0]!.value = '1'
    inputs[1]!.value = '1'
    pomodoro.querySelector<HTMLButtonElement>('[aria-label="应用自定义番茄钟时长"]')!.click()
    ;[...pomodoro.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '启动计时')!.click()

    await vi.advanceTimersByTimeAsync(60_000)
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    expect(pomodoro.dataset.windowState).toBe('open')
    expect(notice.hidden).toBe(false)
    expect(notice.dataset.windowTarget).toBe('pomodoro')
    expect(notice.textContent).toContain('专注结束')
    expect(document.querySelector<HTMLElement>('[data-skin-surface="webcam-stage"]')
      ?.dataset.webcamPose).toBe('pomodoro-leave')

    pomodoro.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    ;[...pomodoro.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '跳过')!.click()
    expect(notice.hidden).toBe(true)
    expect(document.querySelector<HTMLElement>('[data-skin-surface="webcam-stage"]')
      ?.dataset.webcamPose).not.toBe('pomodoro-leave')
  })

  it('maps local wall-clock time to the three original watch periods', () => {
    expect(taskbarClockModel(new Date(2026, 7, 24, 6, 5))).toEqual({ text: '06:05', period: 'noon' })
    expect(taskbarClockModel(new Date(2026, 7, 24, 17, 30))).toEqual({ text: '17:30', period: 'evening' })
    expect(taskbarClockModel(new Date(2026, 7, 24, 23, 9))).toEqual({ text: '23:09', period: 'night' })
  })

  it('switches the side background at a wall-clock boundary using the game blur timing', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 7, 24, 16, 59, 59, 900))
    fixture()
    fiber = await mount()

    expect(document.body.getAttribute('data-ngo-side-scene')).toBe('noon')
    expect(document.body.hasAttribute('data-ngo-side-transition')).toBe(false)
    await vi.advanceTimersByTimeAsync(120)
    expect(document.body.getAttribute('data-ngo-side-scene')).toBe('noon')
    expect(document.body.getAttribute('data-ngo-side-transition')).toBe('blur-in')
    await vi.advanceTimersByTimeAsync(200)
    expect(document.body.getAttribute('data-ngo-side-scene')).toBe('evening')
    expect(document.body.getAttribute('data-ngo-side-transition')).toBe('blur-out')
    await vi.advanceTimersByTimeAsync(3_200)
    expect(document.body.hasAttribute('data-ngo-side-transition')).toBe(false)
  })

  it('keeps JINE canonical while Task Manager owns execution details', async () => {
    fixture()
    fiber = await mount()

    expect(document.body.hasAttribute(BODY_ATTRIBUTE)).toBe(true)
    expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent).toContain('请检查皮肤')
    expect([...document.querySelectorAll('[data-jine-message]')].map(node => node.textContent)).toEqual([
      '请检查皮肤已读',
      '中间播报',
      '首版正文',
      '尚未读取的消息',
    ])
    expect([...document.querySelectorAll('[data-jine-time]')].map(node => node.textContent)).toEqual(['15:38', '16:19'])
    expect(document.querySelectorAll('[data-jine-receipt]')).toHaveLength(1)
    expect(document.querySelector('[data-jine-message]')?.textContent).not.toContain('15:38')
    expect(document.querySelector('[data-skin-surface="live-feed"]')?.textContent).toContain('正在读取素材')
    expect(document.querySelector('[data-skin-surface="live-feed"]')?.textContent).not.toContain('中间播报')
    expect(document.querySelector('[data-skin-surface="live-feed"]')?.textContent).toContain('读取文件完成')
    const taskFeed = document.querySelector<HTMLElement>('[data-skin-surface="task-manager-feed"]')!
    expect(taskFeed.textContent).toContain('正在读取素材')
    expect(taskFeed.textContent).toContain('中间播报')
    expect(taskFeed.textContent).toContain('读取文件完成')
    expect(taskFeed.textContent).toContain('加载皮肤技能')
    expect(taskFeed.querySelectorAll('[data-task-order]')).toHaveLength(2)
    const completedTask = taskFeed.querySelector<HTMLElement>('[data-task-state="completed"]')!
    expect(completedTask.hasAttribute('open')).toBe(false)
    expect([...completedTask.querySelectorAll<HTMLElement>(
      '[data-task-step-kind]:not([data-task-step-kind="status"]) [data-task-step-details] > summary',
    )].map(step => step.textContent)).toEqual([
      'TOOL调用自定义工具',
      'RUN执行测试',
      'SKILL加载皮肤技能',
      'WRITE写入补丁完成',
      'READ读取文件完成',
      'UPDATE中间播报',
      'THINK正在读取素材',
    ])
    const readDetail = completedTask.querySelector<HTMLDetailsElement>(
      '[data-task-step-kind="read"] [data-task-step-details]',
    )!
    expect(readDetail.open).toBe(false)
    readDetail.querySelector<HTMLElement>('summary')!.click()
    expect(readDetail.open).toBe(true)
    expect(readDetail.querySelector('[class*="taskManagerStepBody"]')?.textContent).toBe('读取文件完成')
    document.querySelector('[data-chat-flow]')!.append(document.createTextNode(' '))
    await vi.waitFor(() => {
      const projectedReadDetail = taskFeed.querySelector<HTMLDetailsElement>(
        '[data-task-state="completed"] [data-task-step-kind="read"] [data-task-step-details]',
      )!
      expect(projectedReadDetail.open).toBe(true)
      projectedReadDetail.querySelector<HTMLElement>('summary')!.click()
      expect(projectedReadDetail.open).toBe(false)
    })
    document.querySelector('[data-chat-flow]')!.append(document.createTextNode(' '))
    await vi.waitFor(() => {
      expect(taskFeed.querySelector<HTMLDetailsElement>(
        '[data-task-state="completed"] [data-task-step-kind="read"] [data-task-step-details]',
      )!.open).toBe(false)
    })
    expect(completedTask.querySelector('[data-task-step-kind="think"] [class*="taskManagerStepBody"]')?.textContent)
      .toBe('正在读取素材')
    let activeTask = taskFeed.querySelector<HTMLDetailsElement>('[data-task-state="queued"]')!
    expect(activeTask.open).toBe(true)
    activeTask.querySelector<HTMLElement>(':scope > summary')!.click()
    expect(activeTask.open).toBe(false)
    document.querySelector('[data-chat-flow]')!.append(document.createTextNode(' '))
    await vi.waitFor(() => {
      activeTask = taskFeed.querySelector<HTMLDetailsElement>('[data-task-state="queued"]')!
      expect(activeTask.open).toBe(false)
    })
    activeTask.querySelector<HTMLElement>(':scope > summary')!.click()
    expect(activeTask.open).toBe(true)
    document.querySelector('[data-chat-flow]')!.append(document.createTextNode(' '))
    await vi.waitFor(() => {
      activeTask = taskFeed.querySelector<HTMLDetailsElement>('[data-task-state="queued"]')!
      expect(activeTask.open).toBe(true)
    })
    const taskTabs = [...document.querySelectorAll<HTMLButtonElement>('[data-window-id="status"] [role="tab"]')]
    expect(taskTabs.map(tab => tab.getAttribute('aria-selected'))).toEqual(['false', 'true'])
    expect(taskFeed.hidden).toBe(true)
    taskTabs[0]!.click()
    expect(taskFeed.hidden).toBe(false)
    expect(document.querySelectorAll('[data-ngo-bright-tooltip^="tutorial_"]')).toHaveLength(4)
    expect(document.querySelector('[data-skin-surface="tweet-feed"]')?.textContent).toContain('首版正文')
    expect(document.querySelector('[data-skin-surface="tweet-feed"]')?.textContent).not.toContain('中间播报')
    expect(document.querySelector('[class*="jineInputGhost"]')).toBeNull()
    const clockLabel = document.querySelector('[class*="dayLabel"]')?.textContent ?? ''
    expect(clockLabel).toMatch(/^\d{2}:\d{2}$/)
    const clockIcon = document.querySelector<HTMLImageElement>('[data-clock-period]')!
    expect(['noon', 'evening', 'night']).toContain(clockIcon.dataset.clockPeriod)
    expect(clockIcon.src.startsWith('data:image/png;base64,')).toBe(true)
    expect(document.body.getAttribute('data-ngo-side-scene')).toBe(clockIcon.dataset.clockPeriod)
    expect(document.querySelectorAll('[class*="sideBackdrop"]').length).toBe(2)
    expect(document.querySelector('[class*="startMenuBrand"]')?.textContent).toBe('Needy Girl Overdose')
    expect(document.body.style.getPropertyValue('--ngo-jine-feed-bottom')).toBe('170px')
    expect(document.querySelectorAll('[data-quick-launch]')).toHaveLength(3)
    const webcamStage = document.querySelector<HTMLElement>('[data-skin-surface="webcam-stage"]')!
    expect(webcamStage.querySelectorAll('img')).toHaveLength(8)
    expect(webcamStage.querySelector<HTMLImageElement>('[data-webcam-screensaver]')?.src)
      .toMatch(/^data:image\/png;base64,/)
    expect(webcamStage.dataset.webcamPoseRollCount).toBe('1')
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    expect(favicon?.dataset.skinChrome).toBe('favicon')
    expect(favicon?.type).toBe('image/png')
    expect(favicon?.href.startsWith('data:image/png;base64,')).toBe(true)

    const think = document.querySelector<HTMLElement>("[data-variant='think']")!
    think.dataset.state = 'running'
    // Conversation activity no longer drives the game's time-of-day sidebar.
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const toolRow = document.createElement('div')
    toolRow.dataset.chatFlowKind = 'tool'
    toolRow.textContent = '运行中的工具'
    flow.append(toolRow)
    await vi.waitFor(() => expect(document.body.getAttribute('data-ngo-side-scene')).toBe(clockIcon.dataset.clockPeriod))
    toolRow.remove()
    await vi.waitFor(() => expect(document.body.getAttribute('data-ngo-side-scene')).toBe(clockIcon.dataset.clockPeriod))
    expect(webcamStage.dataset.webcamPoseRollCount).toBe('1')

    // Settings changes can make React replace the selected sidebar row with a
    // semantically identical node. That is not a conversation switch and must
    // not interrupt the current webcam pose.
    const selectedBeforeSettings = document.querySelector<HTMLElement>("[role='treeitem'][aria-selected='true']")!
    const settingsDialog = document.createElement('div')
    settingsDialog.setAttribute('role', 'dialog')
    const volume = document.createElement('input')
    volume.type = 'range'
    settingsDialog.append(volume)
    document.querySelector("[data-slot='sidebar.settings']")!.append(settingsDialog)
    volume.addEventListener('input', () => {
      selectedBeforeSettings.replaceWith(selectedBeforeSettings.cloneNode(true))
    })
    volume.value = '42'
    volume.dispatchEvent(new Event('input', { bubbles: true }))
    await new Promise(resolve => window.setTimeout(resolve, 20))
    expect(webcamStage.dataset.webcamPoseRollCount).toBe('1')

    const sessions = [...document.querySelectorAll<HTMLElement>("[role='treeitem']")]
    sessions[0]!.setAttribute('aria-selected', 'false')
    sessions[1]!.setAttribute('aria-selected', 'true')
    await vi.waitFor(() => expect(webcamStage.dataset.webcamPoseRollCount).toBe('2'))
  })

  it('keeps JINE reading position and accumulates completed-turn posts newest-first', async () => {
    fixture()
    fiber = await mount()
    const jine = document.querySelector<HTMLElement>('[data-skin-surface="jine-feed"]')!
    Object.defineProperty(jine, 'scrollHeight', { configurable: true, value: 600 })
    Object.defineProperty(jine, 'clientHeight', { configurable: true, value: 200 })
    jine.scrollTop = 120

    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const secondAnswer = document.createElement('div')
    secondAnswer.dataset.chatFlowKind = 'assistant-step'
    secondAnswer.innerHTML = `
      <div class="_markdown_fixture_5"><p>第二轮中途总结</p></div>
      <div class="_markdown_fixture_5"><p>第二轮最终总结</p></div>
    `
    const secondTail = document.createElement('div')
    secondTail.dataset.chatFlowKind = 'turn-tail'
    flow.append(secondAnswer, secondTail)

    await vi.waitFor(() => expect(document.querySelectorAll('[data-poketter-post]')).toHaveLength(2))
    const posts = [...document.querySelectorAll<HTMLElement>('[data-poketter-post]')]
    expect(posts.map(post => post.textContent?.includes('第二轮最终总结'))).toEqual([true, false])
    expect(posts[1]?.textContent).toContain('首版正文')
    expect(jine.textContent).toContain('第二轮中途总结')
    expect(jine.textContent).not.toContain('糖糖说')
    // 完成的轮次正文保留在 JINE（不迁往 POKETTER 后消失），POKETTER 另行累积
    expect(jine.textContent).toContain('第二轮最终总结')
    expect(document.querySelector('[data-skin-surface="task-manager-feed"]')?.textContent)
      .toContain('第二轮中途总结')
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    expect(notice.textContent).toContain('第二轮最终总结')
    const jineTask = document.querySelector<HTMLButtonElement>('[data-window-task="jine"]')!
    expect(jineTask.hasAttribute('data-window-attention')).toBe(true)
    jineTask.click()
    expect(notice.hidden).toBe(true)
    expect(jineTask.hasAttribute('data-window-attention')).toBe(false)
    expect(jine.scrollTop).toBe(120)
  })

  it('projects current-session telemetry into the four game status rows', async () => {
    fixture()
    fiber = await mount()

    const value = (metric: string): string | null => document.querySelector(
      `[data-ngo-task-metric='${metric}'] [data-ngo-task-metric-value]`,
    )?.textContent ?? null
    expect(value('tokens')).toBe('1500')
    expect(value('cache')).toBe('90%')
    expect(value('context')).toBe('25 / 100')
    expect(value('access')).toBe('WRITE')

    document.querySelector('[data-testid="chat-stats"]')!.innerHTML =
      '<span>3 轮 · 12 步</span> | <span data-testid="cache-stat">缓存命中 75%</span> | <span>输入 2K tok · 输出 500 tok</span>'
    document.querySelector('[aria-label="上下文已用 25%"]')!.setAttribute('aria-label', '上下文已用 60%')
    document.querySelector('[aria-label^="访问模式"]')!.setAttribute('aria-label', '访问模式，当前：Full access')
    document.querySelector('[aria-label^="访问模式"]')!.textContent = 'Full access'

    await vi.waitFor(() => {
      expect(value('tokens')).toBe('2500')
      expect(value('cache')).toBe('75%')
      expect(value('context')).toBe('60 / 100')
      expect(value('access')).toBe('FULL')
    })
  })

  it('lightly estimates full TOKEN digits once per second only while a visible task is running', async () => {
    vi.useFakeTimers()
    fixture()
    document.querySelector('[data-testid="chat-stats"]')!.innerHTML =
      '<span>2 轮 · 8 步</span> | <span>首 token 平均 1.5s · 25 tok/s</span> | <span data-testid="cache-stat">缓存命中 90%</span> | <span>输入 1.2K tok · 输出 300 tok</span>'
    fiber = await mount()

    const tokenValue = document.querySelector<HTMLElement>(
      "[data-ngo-task-metric='tokens'] [data-ngo-task-metric-value]",
    )!
    const task = document.querySelector<HTMLElement>('[data-task-state]')!
    document.querySelectorAll<HTMLElement>('[data-task-state]')
      .forEach(row => { row.dataset.taskState = 'completed' })
    task.dataset.taskState = 'running'

    expect(tokenValue.textContent).toBe('1500')
    expect(tokenValue.hasAttribute('data-ngo-token-live')).toBe(false)
    await vi.advanceTimersByTimeAsync(1_000)
    expect(tokenValue.textContent).toBe('1525')
    expect(tokenValue.hasAttribute('data-ngo-token-live')).toBe(true)

    task.dataset.taskState = 'completed'
    await vi.advanceTimersByTimeAsync(1_000)
    expect(tokenValue.textContent).toBe('1500')
    expect(tokenValue.hasAttribute('data-ngo-token-live')).toBe(false)
  })

  it('anchors JINE to the latest message whenever a closed or minimized window opens', async () => {
    fixture()
    fiber = await mount()
    const jine = document.querySelector<HTMLElement>('[data-skin-surface="jine-feed"]')!
    Object.defineProperty(jine, 'scrollHeight', { configurable: true, value: 900 })
    Object.defineProperty(jine, 'clientHeight', { configurable: true, value: 200 })
    // Simulate the stale middle-of-history offset retained while the window is hidden.
    jine.scrollTop = 260

    document.querySelector<HTMLButtonElement>('[data-quick-launch="jine"]')!.click()
    await vi.waitFor(() => expect(jine.scrollTop).toBe(900))
    expect(jine.hasAttribute('data-jine-open-anchor')).toBe(false)

    document.querySelector<HTMLButtonElement>(
      '[data-window-id="jine"] [data-window-action="minimize"]',
    )!.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(false))
    jine.scrollTop = 340
    document.querySelector<HTMLButtonElement>('[data-window-task="jine"]')!.click()
    await vi.waitFor(() => expect(jine.scrollTop).toBe(900))
    expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(true)
  })

  it('projects a manual compaction lifecycle into durable neutral JINE capsules', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const command = document.createElement('div')
    command.dataset.chatFlowKind = 'manual-compaction'
    command.innerHTML = `
      <div class="_callRow_fixture"><div data-variant="others" data-state="running">
        <span class="_title_fixture">compact</span><span class="_summary_fixture">正在压缩…</span>
      </div></div>
    `
    flow.append(command)

    fiber = await mount()
    await vi.waitFor(() => expect(document.querySelector('[data-jine-command-status]')?.textContent)
      .toBe('正在压缩上下文…'))
    const running = document.querySelector<HTMLElement>('[data-jine-command-status]')!
    expect(running.getAttribute('data-jine-command-status')).toBe('running')
    expect(running.hasAttribute('data-jine-task-link')).toBe(true)

    command.innerHTML = `
      <div class="_callRow_fixture"><div class="_compactionRow_fixture">
        <button><span data-compaction-icon="context"></span><span>compact</span><span>已压缩</span></button>
      </div></div>
    `
    await vi.waitFor(() => expect(document.querySelector('[data-jine-command-status]')?.textContent)
      .toBe('上下文已压缩'))
    expect(document.querySelector('[data-jine-command-status]')?.getAttribute('data-jine-command-status'))
      .toBe('completed')
  })

  it('baselines switched conversation history instead of announcing its old JINE messages', async () => {
    fixture()
    fiber = await mount()
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    expect(notice.hidden).toBe(true)

    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    flow.replaceChildren()
    for (let index = 0; index < 4; index++) {
      const user = document.createElement('div')
      user.dataset.chatFlowKind = 'user'
      user.innerHTML = `<div data-actions-reveal="always"><div>旧会话问题 ${index}</div></div>`
      const answer = document.createElement('div')
      answer.dataset.chatFlowKind = 'assistant-step'
      answer.innerHTML = `<div class="_markdown_fixture_5">旧会话回复 ${index}</div>`
      flow.append(user, answer)
    }
    const sessions = [...document.querySelectorAll<HTMLElement>("[role='treeitem']")]
    sessions[0]!.setAttribute('aria-selected', 'false')
    sessions[1]!.setAttribute('aria-selected', 'true')

    await vi.waitFor(() => expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent)
      .toContain('旧会话回复 3'))
    expect(notice.hidden).toBe(true)
    expect(document.querySelector('[data-window-task="jine"]')?.hasAttribute('data-window-attention')).toBe(false)
  })

  it('uses the DSH completion marker for background JINE notices', async () => {
    fixture()
    fiber = await mount()
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    const background = [...document.querySelectorAll<HTMLElement>("[role='treeitem']")][1]!
    const completion = document.createElement('span')
    completion.textContent = '已完成'
    background.append(completion)

    await vi.waitFor(() => expect(notice.textContent).toContain('Day 2 已完成'))
    expect(notice.dataset.windowTarget).toBe('jine')
    expect(document.querySelector('[data-window-task="jine"]')?.hasAttribute('data-window-attention')).toBe(true)
  })

  it('marks only the faulty execution step without failing or warning for the whole turn', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const failedTool = document.createElement('div')
    failedTool.dataset.chatFlowKind = 'tool-call'
    failedTool.dataset.state = 'error'
    failedTool.innerHTML = '<div data-tool="write" data-variant="write">写入前未读取文件</div>'
    flow.append(failedTool)

    fiber = await mount()
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    expect(notice.hidden).toBe(true)
    expect(document.querySelector('[data-task-state="failed"]')).toBeNull()
    const warningStep = document.querySelector<HTMLElement>('[data-task-step-warning]')!
    expect(warningStep.dataset.taskStepKind).toBe('write')
    expect(warningStep.querySelector('[class*="taskManagerStepWarning"]')?.textContent).toBe('!!!')
    expect(warningStep.textContent).toContain('前未读取文件')
    expect(warningStep.closest('[data-task-state]')?.getAttribute('data-task-state')).toBe('running')

    failedTool.dataset.state = 'fault'
    await new Promise(resolve => window.setTimeout(resolve, 20))
    expect(notice.hidden).toBe(true)
    expect(document.body.getAttribute('data-ngo-side-scene')).not.toBe('default')
  })

  it('proxies Start to settings and the clock to the save manager without replacing DSH controls', async () => {
    fixture()
    const settings = document.querySelector<HTMLButtonElement>("[data-slot='sidebar.settings'] button")!
    const onSettings = vi.fn()
    settings.addEventListener('click', onSettings)
    fiber = await mount()
    const connection = document.querySelector<HTMLButtonElement>("[data-slot='sidebar.settings'] button[data-phase]")!
    const onReconnect = vi.fn()
    connection.addEventListener('click', onReconnect)
    const scheduleCatalog = document.querySelector<HTMLElement>('[data-schedule-fixture]')!
    expect(connection.dataset.phase).toBe('disconnected')
    expect(scheduleCatalog.hasAttribute('data-ngo-schedule-catalog')).toBe(true)

    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
    const connectionProxy = document.querySelector<HTMLButtonElement>('[aria-controls="ngo-connection-popover"]')!
    const connectionPopover = document.querySelector<HTMLElement>('#ngo-connection-popover')!
    const connectionAction = connectionPopover.querySelector<HTMLButtonElement>('button')!
    const connectionTray = connectionProxy.parentElement as HTMLElement
    expect(connectionPopover.parentElement).toBe(connectionTray)
    expect(connectionProxy.dataset.connectionPhase).toBe('disconnected')
    expect(connectionTray.hidden).toBe(false)
    connectionProxy.click()
    expect(connectionProxy.getAttribute('aria-expanded')).toBe('true')
    expect(connectionPopover.hidden).toBe(false)
    expect(connectionPopover.textContent).toContain('网络连接已断开')
    connectionAction.click()
    expect(onReconnect).toHaveBeenCalledOnce()

    connection.dataset.phase = 'connecting'
    await vi.waitFor(() => expect(connectionProxy.dataset.connectionPhase).toBe('connecting'))
    expect(connectionAction.textContent).toBe('重新开始连接')
    const recovered = document.createElement('div')
    recovered.setAttribute('role', 'status')
    recovered.textContent = '已恢复连接'
    const triggerRow = connection.parentElement!
    connection.replaceWith(recovered)
    await vi.waitFor(() => expect(connectionProxy.dataset.connectionPhase).toBe('recovered'))
    expect(connectionAction.hidden).toBe(true)
    expect(connectionTray.hidden).toBe(true)
    expect(connectionPopover.hidden).toBe(true)
    recovered.remove()
    await vi.waitFor(() => expect(connectionProxy.dataset.connectionPhase).toBe('connected'))
    expect(connectionTray.hidden).toBe(true)
    connection.dataset.phase = 'disconnected'
    triggerRow.append(connection)
    await vi.waitFor(() => expect(connectionProxy.dataset.connectionPhase).toBe('disconnected'))
    expect(connectionTray.hidden).toBe(false)

    const start = buttons.find(button => button.textContent === '开始')!
    start.click()
    expect(document.body.hasAttribute('data-ngo-start-open')).toBe(true)
    expect(start.getAttribute('aria-expanded')).toBe('true')
    buttons.find(button => button.textContent === '控制面板')?.click()
    expect(onSettings).toHaveBeenCalledOnce()
    expect(document.body.hasAttribute('data-ngo-settings-open')).toBe(true)
    expect(document.querySelector('[data-window-id="settings"]')?.getAttribute('data-window-state')).toBe('open')
    expect(document.querySelector('[data-window-id="settings"]')?.textContent).not.toContain('正在连接系统设置')

    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    settings.closest("[data-slot='sidebar.settings']")?.append(dialog)
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-settings-open')).toBe(true))
    expect(document.body.hasAttribute('data-ngo-settings-active')).toBe(true)
    expect(dialog.style.left).toBe('8px')
    expect(dialog.style.top).toBe('42px')

    document.querySelector<HTMLElement>('[data-window-id="live"]')
      ?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    expect(document.body.hasAttribute('data-ngo-settings-active')).toBe(false)
    expect(Number(document.body.style.getPropertyValue('--ngo-settings-layer')))
      .toBe(Number(document.querySelector<HTMLElement>('[data-window-id="settings"]')?.style.zIndex) + 1)
    dialog.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }))
    expect(document.body.hasAttribute('data-ngo-settings-active')).toBe(true)

    dialog.remove()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-settings-open')).toBe(false))
    expect(document.querySelector('[data-window-id="settings"]')?.getAttribute('data-window-state')).toBe('closed')

    const clock = buttons.find(button => /^\d{2}:\d{2}$/.test(button.textContent ?? ''))!
    clock.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-save-open')).toBe(true))
    expect(clock.getAttribute('aria-expanded')).toBe('true')

    clock.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-save-open')).toBe(false))
    start.click()
    buttons.find(button => button.textContent === '继续游戏')?.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-save-open')).toBe(true))
    expect(clock.getAttribute('aria-expanded')).toBe('true')
    expect(clock.matches(':active')).toBe(false)
    await fiber.dispose()
    fiber = undefined
    expect(scheduleCatalog.hasAttribute('data-ngo-schedule-catalog')).toBe(false)
    expect(connection.dataset.phase).toBe('disconnected')
  })

  it('routes 从头开始 to the official New Session button in both text and rail forms', async () => {
    // 宽视口展开态：按钮带文本「新会话」；窄视口 rail 态：文本为空、只有 aria-label="新建会话"。
    // 前者走文本匹配，后者依赖 aria-label 精确匹配（"新建会话" 不是 "新会话" 的连续子串，
    // includes('新会话') 会落空，导致 rail 态下「从头开始」静默无效）。
    fixture()
    const sidebar = document.createElement('div')
    sidebar.setAttribute('data-slot', 'sidebar')
    const official = document.createElement('button')
    official.type = 'button'
    official.setAttribute('aria-label', '新建会话')
    const onOfficial = vi.fn()
    official.addEventListener('click', onOfficial)
    sidebar.append(official)
    document.querySelector('#root')!.prepend(sidebar)

    fiber = await mount()
    const scene = document.querySelector<HTMLElement>('[data-skin-chrome="scene"]')!
    scene.querySelector<HTMLButtonElement>('[aria-controls="ngo-start-menu"]')!.click()
    const newButton = [...scene.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '从头开始')!
    newButton.click()
    expect(onOfficial).toHaveBeenCalledOnce()
  })

  it('projects DSH workspaces, wrapped session titles and live statuses into App_Load', async () => {
    fixture()
    const tree = document.querySelector<HTMLElement>("[role='tree']")!
    const addWorkspace = document.createElement('button')
    addWorkspace.type = 'button'
    addWorkspace.setAttribute('aria-label', '添加工作区')
    const onAddWorkspace = vi.fn()
    addWorkspace.addEventListener('click', onAddWorkspace)
    tree.parentElement!.prepend(addWorkspace)
    tree.innerHTML = `
      <div class="_groupSection_fixture">
        <div role="treeitem" aria-expanded="true">
          <span class="_projectText_fixture"><span class="_title_fixture">dsh-skin-template</span></span>
          <button type="button" aria-label="在 dsh-skin-template 中新建会话"></button>
        </div>
        <div role="treeitem" aria-selected="true">
          <span><span data-state="done"></span><span class="_visuallyHidden_fixture">已完成</span></span>
          <span class="_title_fixture">皮肤设置优化</span><span>3天</span>
        </div>
        <div role="treeitem" aria-selected="false">
          <span><span data-state="warning"></span><span class="_visuallyHidden_fixture">等待审批</span></span>
          <span class="_title_fixture">解释很长的多语言词汇标题</span><span>刚刚</span>
          <span role="img" aria-label="有活动定时任务" title="有活动定时任务">定</span>
        </div>
      </div>
    `
    const sessions = [...tree.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")]
    const onSecondSession = vi.fn()
    sessions[1]!.addEventListener('click', onSecondSession)
    fiber = await mount()

    const scene = document.querySelector<HTMLElement>('[data-skin-chrome="scene"]')!
    const clock = [...scene.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => /^\d{2}:\d{2}$/.test(button.textContent ?? ''))!
    clock.click()

    const save = scene.querySelector<HTMLElement>('[data-window-id="save"]')!
    expect(save.id).toBe('ngo-save-manager')
    expect(save.dataset.windowState).toBe('open')
    expect([...save.querySelectorAll<HTMLElement>('[data-save-file]')].map(item => item.dataset.saveFile))
      .toEqual(['0:0', '0:1'])
    expect(save.querySelector('[data-save-workspace="0"] h2')?.textContent).toBe('dsh-skin-template')
    expect(save.textContent).toContain('皮肤设置优化')
    expect(save.textContent).toContain('解释很长的多语言词汇标题')
    expect(save.textContent).not.toContain('Data1_Day')
    expect([...save.querySelectorAll<HTMLElement>('[class*="saveStatusBadge"]')].map(badge => [
      badge.dataset.saveStatus,
      badge.textContent,
    ])).toEqual([['done', '✓'], ['warning', '!']])
    const scheduledSave = save.querySelector<HTMLButtonElement>('[data-save-file="0:1"]')!
    expect(scheduledSave.hasAttribute('data-save-scheduled')).toBe(true)
    expect(scheduledSave.getAttribute('aria-label')).toContain('有活动定时任务')
    const workspaceIndicator = save.querySelector<HTMLButtonElement>('[data-save-workspace-indicator="0"]')!
    expect(workspaceIndicator.hasAttribute('title')).toBe(false)
    expect(save.querySelector<HTMLElement>('[data-window-drag] [class*="titleText"]')?.textContent).toBe(
      '继续游戏 · dsh-skin-template',
    )
    expect(workspaceIndicator.hasAttribute('data-save-active')).toBe(true)
    expect(save.textContent).toContain('账号转生')
    save.querySelector<HTMLButtonElement>('[title="新建工作区"]')!.click()
    expect(onAddWorkspace).toHaveBeenCalledOnce()

    save.querySelector<HTMLButtonElement>('[data-save-file="0:1"]')!.click()
    expect(onSecondSession).toHaveBeenCalledOnce()

    sessions[0]!.setAttribute('aria-selected', 'false')
    sessions[1]!.setAttribute('aria-selected', 'true')
    await vi.waitFor(() => expect(save.querySelector('[data-save-file="0:1"]')?.hasAttribute('data-save-current')).toBe(true))
  })

  it('renames and locks appearance to light with the original full-cat hover hint', async () => {
    fixture()
    const settingsRoot = document.querySelector<HTMLElement>("[data-slot='sidebar.settings']")!
    const dialog = document.createElement('section')
    dialog.setAttribute('role', 'dialog')
    dialog.innerHTML = `
      <h2>设置</h2>
      <nav><button type="button">通用设置</button></nav>
      <div><span>外观</span>
        <button type="button"><svg aria-hidden="true"></svg>浅色</button>
        <button type="button"><svg aria-hidden="true"></svg>深色</button>
        <button type="button">跟随系统</button>
      </div>
    `
    const lightBeforeMount = dialog.querySelectorAll<HTMLButtonElement>('button')[1]!
    const darkBeforeMount = dialog.querySelectorAll<HTMLButtonElement>('button')[2]!
    const onLight = vi.fn(() => document.body.removeAttribute('data-ds-dark-theme'))
    const onDark = vi.fn()
    lightBeforeMount.addEventListener('click', onLight)
    darkBeforeMount.addEventListener('click', onDark)
    settingsRoot.append(dialog)
    fiber = await mount()

    const light = document.querySelector<HTMLButtonElement>("[data-ngo-theme-choice='light']")!
    const dark = document.querySelector<HTMLButtonElement>("[data-ngo-theme-choice='dark']")!
    expect(light.textContent).toContain('光明')
    expect(dark.textContent).toContain('黑暗')
    expect(dark.disabled).toBe(true)
    expect(dark.getAttribute('aria-disabled')).toBe('true')
    expect(dialog.querySelectorAll('[data-ngo-bright-tooltip]')).toHaveLength(1)
    expect(dialog.querySelector('[data-ngo-bright-tooltip]')).toBe(dark)
    expect(document.querySelectorAll('[data-ngo-bright-tooltip^="tutorial_"]')).toHaveLength(4)

    dark.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, clientX: 300, clientY: 220 }))
    const tooltip = document.querySelector<HTMLElement>('[data-ngo-bright-tooltip-popup]')!
    await vi.waitFor(() => expect(tooltip.hasAttribute('data-visible')).toBe(true))
    expect(tooltip.textContent).toContain('你的前途是光明的。')
    expect(tooltip.querySelector('[class*="brightTooltipCatBody"]')).toBeNull()
    expect(tooltip.querySelector<HTMLImageElement>('[class*="brightTooltipCat"]')?.src).toContain('data:image/png;base64')
    expect(tooltip.querySelector<HTMLElement>('[class*="brightTooltipBalloon"]')?.style.borderImageSource).toContain('data:image/png;base64')
    const follower = document.querySelector<HTMLElement>('[data-ngo-bright-tooltip="tutorial_follower"]')!
    follower.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, clientX: 420, clientY: 240 }))
    await vi.waitFor(() => expect(tooltip.textContent).toContain('这是我们一路消耗的 TOKEN 数。'))
    expect(tooltip.textContent).not.toMatch(/输入|输出|\d/)
    dark.click()
    expect(onDark).not.toHaveBeenCalled()

    document.body.setAttribute('data-ds-dark-theme', '')
    await vi.waitFor(() => expect(document.querySelector('[data-ngo-light-boot]')).not.toBeNull())
    expect(onLight).toHaveBeenCalledOnce()
    expect(document.body.hasAttribute('data-ds-dark-theme')).toBe(false)
    expect(document.querySelectorAll('[data-ngo-light-boot] [data-boot-part]')).toHaveLength(4)
    expect(document.querySelectorAll('[data-ngo-light-boot] [data-boot-side]')).toHaveLength(0)
    expect(document.querySelector('[data-ngo-light-boot]')?.getAttribute('data-boot-stage')).toBe('bios')
    expect(document.querySelector('[data-ngo-light-boot] [data-boot-copy]')?.textContent)
      .toBe('Booting Windose20')
    expect(document.querySelector<HTMLImageElement>('[data-boot-bios-logo]')?.src).toContain('data:image/png;base64')
    expect(document.querySelector('[data-boot-bios-version]')?.textContent).toBe('DSH')
    expect(document.querySelector<HTMLImageElement>("[data-ngo-light-boot] [data-boot-part='splash'] img")?.src)
      .toContain('data:image/png;base64')
  })

  it('uses Light and Darkness for the English appearance choices', async () => {
    fixture()
    document.documentElement.lang = 'en'
    const settingsRoot = document.querySelector<HTMLElement>("[data-slot='sidebar.settings']")!
    const dialog = document.createElement('section')
    dialog.setAttribute('role', 'dialog')
    dialog.innerHTML = `
      <h2>Settings</h2><button type="button">General settings</button>
      <div><span>Appearance</span><button type="button">Light</button><button type="button">Dark</button></div>
    `
    settingsRoot.append(dialog)
    fiber = await mount()

    expect(document.querySelector("[data-ngo-theme-choice='light']")?.textContent).toBe('Light')
    expect(document.querySelector("[data-ngo-theme-choice='dark']")?.textContent).toBe('Darkness')
    expect(dialog.querySelectorAll('[data-ngo-bright-tooltip]')).toHaveLength(1)
  })

  it('replays the boot sequence from the start menu restart command', async () => {
    fixture()
    fiber = await mount()

    document.querySelector<HTMLButtonElement>('[aria-label="开始菜单"] + button')?.click()
    const restart = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '重新启动')!
    restart.click()

    expect(document.querySelector('[data-ngo-light-boot]')?.getAttribute('data-boot-stage')).toBe('bios')
    expect(document.querySelector('[data-ngo-light-boot] [data-boot-copy]')?.textContent)
      .toBe('Booting Windose20')

    const overlay = document.querySelector<HTMLElement>('[data-ngo-light-boot]')!
    overlay.click()
    expect(overlay.dataset.bootStage).toBe('blackout')
    overlay.click()
    expect(overlay.dataset.bootStage).toBe('caution')
    const caution = overlay.querySelector<HTMLElement>("[data-boot-part='caution'][role='dialog']")!
    const hiddenBlueScreen = overlay.querySelector<HTMLElement>("[data-boot-part='blue-screen']")!
    expect(getComputedStyle(caution).pointerEvents).toBe('auto')
    expect(getComputedStyle(caution).cursor).not.toBe('none')
    expect(getComputedStyle(hiddenBlueScreen).pointerEvents).toBe('none')
    expect(overlay.textContent).toContain('粉丝社区制作的非官方二次创作')
    expect(overlay.textContent).toContain('DSH（DeepSeek Harness）是由 DeepSeek AI 开发的开源智能体框架')
    expect(overlay.textContent).toContain('皮肤作者及参与维护的粉丝社区与 DeepSeek AI 没有隶属')
    expect([...overlay.querySelectorAll<HTMLButtonElement>('[data-boot-action]')].map(button => button.textContent))
      .toEqual(['不同意', '同意'])

    overlay.querySelector<HTMLButtonElement>("[data-boot-action='accept']")!.click()
    expect(document.querySelector('[data-ngo-light-boot]')).toBeNull()
  })

  it('projects the Harness fatal plugin report as a blue-screen state', async () => {
    fixture()
    fiber = await mount()

    const boot = document.createElement('div')
    boot.dataset.dshBoot = ''
    boot.textContent = 'HARNESS Failed to load plugins failed to import loader entry'
    document.querySelector('#root')!.append(boot)

    await vi.waitFor(() => expect(boot.hasAttribute('data-ngo-harness-failure')).toBe(true))
    expect(document.body.hasAttribute('data-ngo-harness-failure')).toBe(true)
    expect(boot.getAttribute('role')).toBe('alert')
    expect(boot.getAttribute('aria-live')).toBe('assertive')
  })

  it('provides working window controls, taskbar restore and shortcut reopen', async () => {
    fixture()
    fiber = await mount()
    const live = document.querySelector<HTMLElement>('[data-window-id="live"]')!
    const minimize = live.querySelector<HTMLButtonElement>('[data-window-action="minimize"]')!
    const close = live.querySelector<HTMLButtonElement>('[data-window-action="close"]')!
    const task = document.querySelector<HTMLButtonElement>('[data-window-task="live"]')!

    expect(live.dataset.windowState).toBe('closed')
    expect(task.hidden).toBe(true)
    expect(getComputedStyle(task).display).toBe('none')
    const shortcut = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '直播')!
    shortcut.click()
    expect(task.getAttribute('aria-pressed')).toBe('true')
    expect(task.querySelector('[aria-hidden="true"]')).not.toBeNull()
    expect(task.textContent).toBe('LIVE')
    expect(document.body.style.getPropertyValue('--ngo-taskbar-window')).toContain('data:image/png;base64')
    expect(document.body.style.getPropertyValue('--ngo-taskbar-window-pressed')).toContain('data:image/png;base64')
    minimize.click()
    expect(live.dataset.windowState).toBe('minimized')
    expect(task.getAttribute('aria-pressed')).toBe('false')
    task.click()
    expect(live.dataset.windowState).toBe('open')
    close.click()
    expect(live.dataset.windowState).toBe('closed')
    expect(task.hidden).toBe(true)
    expect(getComputedStyle(task).display).toBe('none')
    shortcut.click()
    expect(live.dataset.windowState).toBe('open')
    expect(task.hidden).toBe(false)

    const status = document.querySelector<HTMLElement>('[data-window-id="status"]')!
    status.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(status.dataset.windowState).toBe('closed')
    document.querySelector<HTMLButtonElement>('[data-quick-launch="任务管理器"]')!.click()
    expect(status.dataset.windowState).toBe('open')
  })

  it('opens the medicine slot, locks rerolls for the decision and activates Power Pill only when eaten', async () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    fixture()
    fiber = await mount()
    const medicine = document.querySelector<HTMLElement>('[data-window-id="medicine"]')!
    const shortcut = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '吃药')!
    shortcut.click()
    expect(medicine.dataset.windowState).toBe('closed')
    const consent = document.querySelector<HTMLElement>('[data-medicine-consent]')!
    expect(consent.hidden).toBe(false)
    consent.querySelector<HTMLButtonElement>('[data-medicine-consent-action="accept"]')!.click()
    expect(medicine.dataset.windowState).toBe('open')

    const roll = medicine.querySelector<HTMLButtonElement>('[data-medicine-action="roll"]')!
    const take = medicine.querySelector<HTMLButtonElement>('[data-medicine-action="take"]')!
    expect(roll.hidden).toBe(false)
    expect(take.parentElement?.hidden).toBe(true)
    roll.click()
    await vi.advanceTimersByTimeAsync(2_400)
    expect(medicine.querySelector('[data-medicine-result]')?.textContent).toContain('大力丸！')
    expect(roll.disabled).toBe(true)
    expect(roll.hidden).toBe(true)
    expect(take.disabled).toBe(false)
    expect(take.parentElement?.hidden).toBe(false)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(false)

    take.click()
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(true)
    expect(document.querySelector('[data-medicine-effect-layer]')).not.toBeNull()
    expect(roll.disabled).toBe(false)
    await vi.advanceTimersByTimeAsync(6_500)
    expect(document.body.hasAttribute('data-ngo-power-pill')).toBe(false)
  })

  it('opens Internet independently, routes Chinese users to bilibili and jumps from search to JINE', async () => {
    document.documentElement.lang = 'zh-CN'
    fixture()
    fiber = await mount()

    const internet = document.querySelector<HTMLElement>('[data-window-id="internet"]')!
    const tweet = document.querySelector<HTMLElement>('[data-window-id="tweet"]')!
    const jine = document.querySelector<HTMLElement>('[data-window-id="jine"]')!
    const shortcut = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '因特网')!
    expect(internet.dataset.windowState).toBe('closed')
    shortcut.click()
    expect(internet.dataset.windowState).toBe('open')
    expect(tweet.dataset.windowState).toBe('closed')

    const official = internet.querySelector<HTMLAnchorElement>('[data-internet-official]')!
    expect(official.dataset.internetOfficial).toBe('bilibili')
    expect(official.href).toBe('https://space.bilibili.com/1365540467')
    expect(official.target).toBe('_blank')
    expect(official.rel).toContain('noopener')

    const input = internet.querySelector<HTMLInputElement>('[aria-label="搜索 JINE 聊天记录"]')!
    input.value = '首版'
    input.closest('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    expect(internet.querySelector('[aria-live="polite"]')?.textContent).toBe('找到 1 条记录')
    const result = internet.querySelector<HTMLButtonElement>('[data-internet-search-result]')!
    expect(result.textContent).toBe('JINE首版正文')
    result.click()
    expect(jine.dataset.windowState).toBe('open')
    expect([...document.querySelectorAll<HTMLElement>('[data-jine-message]')]
      .find(message => message.dataset.jineSearchText === '首版正文')
      ?.hasAttribute('data-jine-search-hit')).toBe(true)
  })

  it('routes non-Chinese Internet users to the official YouTube channel', async () => {
    document.documentElement.lang = 'en-US'
    fixture()
    fiber = await mount()

    const official = document.querySelector<HTMLAnchorElement>('[data-internet-official]')!
    expect(official.dataset.internetOfficial).toBe('youtube')
    expect(official.href).toBe('https://www.youtube.com/@wssplayground')
    expect(official.textContent).toContain('OFFICIAL CHANNEL')
  })

  it('projects DSH Todo into a Sticky window with original three-state game glyphs', async () => {
    fixture()
    const root = document.querySelector('#root')!
    const todoSource = document.createElement('section')
    todoSource.dataset.testid = 'todo-panel'
    todoSource.innerHTML = `
      <button type="button" aria-expanded="true">Todo</button>
      <ul>
        <li data-status="completed"><span>icon</span><span>任务1</span></li>
        <li data-status="in_progress"><span>icon</span><span>任务2</span></li>
        <li data-status="pending"><span>icon</span><span>任务3</span></li>
      </ul>
    `
    root.append(todoSource)
    fiber = await mount()

    const todoWindow = document.querySelector<HTMLElement>('[data-window-id="todo"]')!
    expect(todoWindow.dataset.windowState).toBe('closed')
    const todoShortcut = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '代办')!
    todoShortcut.click()
    expect(todoWindow.dataset.windowState).toBe('open')
    expect([...document.querySelectorAll('[data-todo-status]')].map(node => node.textContent)).toEqual([
      '任务1',
      '任务2',
      '任务3',
    ])
    expect(document.querySelector<HTMLImageElement>('[data-todo-glyph="completed"]')?.src)
      .toContain('data:image/png;base64')
    expect(document.querySelector('[data-todo-glyph="pending"]')).not.toBeNull()
    expect(document.querySelector('[data-todo-glyph="in_progress"]')?.querySelectorAll('img')).toHaveLength(8)

    todoWindow.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    todoSource.querySelector('li[data-status="in_progress"] span:last-child')!.textContent = '任务2更新'
    await vi.waitFor(() => expect(document.querySelector('[data-skin-surface="todo-list"]')?.textContent).toContain('任务2更新'))
    expect(todoWindow.dataset.windowState).toBe('closed')

    todoSource.remove()
    await vi.waitFor(() => expect(document.querySelector('[data-skin-surface="todo-list"]')?.textContent).toContain('今天没有代办'))
    const nextTodo = todoSource.cloneNode(true) as HTMLElement
    root.append(nextTodo)
    await vi.waitFor(() => expect(todoWindow.dataset.windowState).toBe('open'))
  })

  it('renders every image in image-only and text+image user messages as JINE bubbles', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const imageRow = document.createElement('div')
    imageRow.dataset.chatFlowKind = 'user'
    imageRow.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_userStack_fixture">
          <div data-slot="conversation.message.images">
            <img class="_gallery_fixture" src="http://test.local/pic-a.png" alt="图一">
            <img class="_gallery_fixture" src="http://test.local/pic-b.png" alt="图二">
          </div>
          <div class="_bubble_fixture"></div>
        </div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">17:01</span></div>
      </div>
    `
    const mixedRow = document.createElement('div')
    mixedRow.dataset.chatFlowKind = 'user'
    mixedRow.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_bubble_fixture">看图<img class="_gallery_fixture" src="/asset.png"></div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">17:02</span></div>
      </div>
    `
    const done = document.createElement('div')
    done.dataset.chatFlowKind = 'assistant-step'
    done.innerHTML = '<div class="_markdown_fixture_5"><p>收到</p></div>'
    const done2 = done.cloneNode(true) as HTMLElement
    flow.append(imageRow, done, mixedRow, done2)

    fiber = await mount()
    const messages = [...document.querySelectorAll('[data-jine-message][data-jine-speaker="user"]')]
    expect(messages).toHaveLength(4)

    const imageOnly = messages[2]!
    const imageOnlyImages = [...imageOnly.querySelectorAll<HTMLImageElement>('[data-jine-image]')]
    expect(imageOnlyImages.map(image => image.src)).toEqual([
      'http://test.local/pic-a.png',
      'http://test.local/pic-b.png',
    ])
    expect(imageOnlyImages.map(image => image.alt)).toEqual(['[图片]', '[图片]'])
    expect(imageOnly.querySelector('[class*="jineBubble"]')?.textContent).toBe('')

    const mixed = messages[3]!
    expect(mixed.textContent).toContain('看图')
    expect(mixed.textContent).toContain('已读')
    expect(mixed.querySelector('[class*="jineBubble"]')?.textContent).toBe('看图')
    expect(mixed.querySelector('img')?.getAttribute('src')).toBe('/asset.png')
    expect(imageOnly.querySelector('[class*="jineReceipt"]')).not.toBeNull()

    const albumSources = [...document.querySelectorAll<HTMLImageElement>('[data-picture-thumb] img')]
      .map(image => image.src)
    expect(albumSources).toEqual([
      'http://localhost:3000/asset.png',
      'http://test.local/pic-a.png',
      'http://test.local/pic-b.png',
    ])
  })

  it('keeps an interrupting steering bubble across pending-to-durable handoff', async () => {
    // 用户在助手工作中插话：主机尚未把消息接纳为 durable steering 节点时，它以
    // [data-pending-steering] 渲染在 [data-chat-flow] 内且没有
    // data-chat-flow-kind —— 皮肤仍应把它投影为 JINE 用户气泡。
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const interruptRow = document.createElement('div')
    interruptRow.setAttribute('data-pending-steering', '')
    interruptRow.setAttribute('data-actions-reveal', 'always')
    interruptRow.innerHTML = `
      <div class="_bubble_fixture">快停下，先回答我</div>
      <div class="_actions_fixture"><button>复制</button></div>
    `
    flow.append(interruptRow)

    fiber = await mount()
    const jine = document.querySelector<HTMLElement>('[data-skin-surface="jine-feed"]')!
    expect(jine.textContent).toContain('快停下，先回答我')
    const bubbles = [...jine.querySelectorAll('[data-jine-message][data-jine-speaker="user"]')]
    expect(bubbles.map(node => node.textContent)).toContain('快停下，先回答我')
    // 尚未处理完成的插话消息不应带"已读"
    const pending = bubbles.at(-1)!
    expect(pending.querySelector('[data-jine-receipt]')).toBeNull()

    // 主机接纳插话后会把 pending 行替换成正式 steering 节点，而不是 user。
    // 气泡应留在原来的流位置，且在后续助手回复到达后变为已读。
    const durableRow = document.createElement('div')
    durableRow.dataset.chatFlowKind = 'steering'
    durableRow.dataset.chatFlowKey = 'node:steering-1'
    durableRow.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_userStack_fixture"><div class="_bubble_fixture">快停下，先回答我</div></div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">16:30</span><button>复制</button></div>
      </div>
    `
    const reply = document.createElement('div')
    reply.dataset.chatFlowKind = 'assistant-step'
    reply.innerHTML = '<div class="_markdown_fixture_5"><p>插话后的回答</p></div>'
    interruptRow.replaceWith(durableRow, reply)

    await vi.waitFor(() => expect(jine.textContent).toContain('插话后的回答'))
    const handedOff = [...jine.querySelectorAll('[data-jine-message]')]
      .filter(node => node.textContent?.includes('快停下，先回答我'))
    expect(handedOff).toHaveLength(1)
    expect(handedOff[0]?.querySelector('[data-jine-receipt]')).not.toBeNull()
    const chronological = [...jine.querySelectorAll('[data-jine-message]')].map(node => node.textContent)
    expect(chronological.indexOf(handedOff[0]?.textContent ?? '')).toBeLessThan(
      chronological.findIndex(text => text?.includes('插话后的回答')),
    )
  })

  it('dodges shutdown and leaves a terminal blue screen that only a page refresh can clear', async () => {
    fixture()
    fiber = await mount()

    const start = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '开始')!
    const shutdown = [...document.querySelectorAll<HTMLButtonElement>('button')]
      .find(button => button.textContent === '关机')!
    start.click()
    shutdown.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }))
    expect(shutdown.hasAttribute('data-shutdown-dodged')).toBe(true)

    // Programmatic click models the rare fast click that lands before the
    // moving button leaves the pointer's hit target.
    shutdown.click()
    const overlay = document.querySelector<HTMLElement>('[data-ngo-light-boot]')!
    expect(overlay.dataset.bootStage).toBe('bios')
    overlay.click()
    expect(overlay.dataset.bootStage).toBe('blue-screen')
    expect(overlay.querySelector('[data-shutdown-blue-screen-copy]')?.textContent)
      .toContain('Refresh this tab to restart Windose20.')
    overlay.click()
    expect(overlay.dataset.bootStage).toBe('blue-screen')
    expect(overlay.isConnected).toBe(true)
  })

  it('starts with only webcam and Task Manager stats, then reveals process view for a new JINE turn', async () => {
    fixture()
    fiber = await mount()

    const webcam = document.querySelector<HTMLElement>('[data-window-id="webcam"]')!
    const status = document.querySelector<HTMLElement>('[data-window-id="status"]')!
    const jine = document.querySelector<HTMLElement>('[data-window-id="jine"]')!
    const tweet = document.querySelector<HTMLElement>('[data-window-id="tweet"]')!
    expect(webcam.dataset.windowState).toBe('open')
    expect(status.dataset.windowState).toBe('open')
    expect(jine.dataset.windowState).toBe('closed')
    expect(tweet.dataset.windowState).toBe('closed')
    expect([...status.querySelectorAll('[role="tab"]')].map(tab => tab.getAttribute('aria-selected')))
      .toEqual(['false', 'true'])

    status.querySelector<HTMLButtonElement>('[data-window-action="close"]')!.click()
    expect(status.dataset.windowState).toBe('closed')
    const user = document.createElement('div')
    user.dataset.chatFlowKind = 'user'
    user.innerHTML = '<div data-actions-reveal="always"><div class="_bubble_fixture">新的 JINE 会话</div></div>'
    document.querySelector('[data-chat-flow]')!.append(user)

    await vi.waitFor(() => expect(status.dataset.windowState).toBe('open'))
    expect([...status.querySelectorAll('[role="tab"]')].map(tab => tab.getAttribute('aria-selected')))
      .toEqual(['true', 'false'])
  })

  it('projects queued messages as interactive pending JINE bubbles without stealing host actions', async () => {
    fixture()
    const root = document.querySelector('#root')!
    const dock = document.createElement('div')
    dock.dataset.queueDock = ''
    dock.innerHTML = `
      <button type="button" aria-controls="queue-list" aria-expanded="false">1 条排队消息</button>
      <ul id="queue-list" hidden></ul>
    `
    root.append(dock)
    const list = dock.querySelector('ul')!
    const row = document.createElement('li')
    let saved = ''
    let removed = 0
    let steered = 0
    const icon = '<svg aria-hidden="true"><path /></svg>'
    const renderNormal = (text: string): void => {
      row.innerHTML = `
        <span>${icon}</span><span>${text}</span><div>
          <button type="button" aria-label="编辑">${icon}</button>
          <button type="button" aria-label="删除">${icon}</button>
          <button type="button" aria-label="立即发送">${icon}</button>
        </div>
      `
      const buttons = row.querySelectorAll<HTMLButtonElement>('button')
      buttons[0]!.addEventListener('click', () => { renderEditing(text) })
      buttons[1]!.addEventListener('click', () => { removed += 1; row.remove() })
      buttons[2]!.addEventListener('click', () => { steered += 1 })
    }
    const renderEditing = (text: string): void => {
      row.innerHTML = `
        <input aria-label="编辑排队消息" value="${text}"><div>
          <button type="button" aria-label="保存">${icon}</button>
          <button type="button" aria-label="取消编辑">${icon}</button>
        </div>
      `
      const sourceEditor = row.querySelector<HTMLInputElement>('input')!
      sourceEditor.focus()
      const buttons = row.querySelectorAll<HTMLButtonElement>('button')
      buttons[0]!.addEventListener('click', () => { saved = sourceEditor.value; renderNormal(saved) })
      buttons[1]!.addEventListener('click', () => { renderNormal(text) })
    }
    renderNormal('等这一轮结束后再检查动画')
    dock.querySelector('button')!.addEventListener('click', (event) => {
      const header = event.currentTarget as HTMLButtonElement
      header.setAttribute('aria-expanded', 'true')
      list.hidden = false
      list.append(row)
    })

    fiber = await mount()
    document.querySelector<HTMLButtonElement>('[data-quick-launch="jine"]')!.click()
    const jine = document.querySelector<HTMLElement>('[data-skin-surface="jine-feed"]')!
    await vi.waitFor(() => expect(jine.querySelector('[data-jine-queued]')?.textContent)
      .toContain('等这一轮结束后再检查动画'))
    expect(dock.querySelector('button')?.getAttribute('aria-expanded')).toBe('true')
    expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-jine-has-queue')).toBe(true)
    expect(document.body.hasAttribute('data-ngo-jine-queue-fallback')).toBe(false)
    expect(jine.querySelector('[data-jine-queued] [data-jine-queue-state]')?.textContent).toBe('排队中')
    expect([...jine.querySelectorAll<HTMLButtonElement>('[data-jine-queued] [data-jine-queue-actions] button')]
      .map(button => button.getAttribute('aria-label'))).toEqual(['编辑', '删除', '立即发送'])

    jine.querySelector<HTMLButtonElement>('[data-jine-queued] button[aria-label="编辑"]')!.click()
    await vi.waitFor(() => expect(jine.querySelector('[data-jine-queue-editor]')).not.toBeNull())
    const editor = jine.querySelector<HTMLInputElement>('[data-jine-queue-editor]')!
    expect(document.activeElement).toBe(editor)
    editor.value = '修改后的排队消息'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    expect(row.querySelector<HTMLInputElement>('input')?.value).toBe('修改后的排队消息')
    document.querySelector('[data-chat-flow-kind="assistant-step"]')!.append(document.createTextNode('流式更新'))
    await new Promise(resolve => window.setTimeout(resolve, 50))
    expect(jine.querySelector('[data-jine-queue-editor]')).toBe(editor)

    jine.querySelector<HTMLButtonElement>('[data-jine-queued] button[aria-label="保存"]')!.click()
    await vi.waitFor(() => expect(jine.querySelector('[data-jine-queued]')?.textContent)
      .toContain('修改后的排队消息'))
    expect(saved).toBe('修改后的排队消息')
    jine.querySelector<HTMLButtonElement>('[data-jine-queued] button[aria-label="立即发送"]')!.click()
    expect(steered).toBe(1)
    jine.querySelector<HTMLButtonElement>('[data-jine-queued] button[aria-label="删除"]')!.click()
    await vi.waitFor(() => expect(jine.querySelector('[data-jine-queued]')).toBeNull())
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-has-queue')).toBe(false))
    expect(removed).toBe(1)

    document.querySelector<HTMLButtonElement>(
      '[data-window-id="jine"] [data-window-action="minimize"]',
    )!.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(false))
    document.querySelector<HTMLButtonElement>('[data-window-task="jine"]')!.click()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(true))
  })

  it('reveals the official QueueDock only when JINE projection misses its grace period', async () => {
    fixture()
    const dock = document.createElement('div')
    dock.dataset.queueDock = ''
    dock.innerHTML = '<ul></ul>'
    document.querySelector('#root')!.append(dock)

    fiber = await mount()
    document.querySelector<HTMLButtonElement>('[data-quick-launch="jine"]')!.click()
    expect(document.body.hasAttribute('data-ngo-jine-has-queue')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-jine-queue-fallback')).toBe(false)
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-queue-fallback')).toBe(true))

    dock.remove()
    await vi.waitFor(() => expect(document.body.hasAttribute('data-ngo-jine-queue-fallback')).toBe(false))
  })

  it('asks the host for one older page when the JINE feed is flush to top', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const firstUser = flow.querySelector<HTMLElement>('[data-chat-flow-kind="user"]')!
    firstUser.setAttribute('data-chat-anchor-key', 'node:1')
    // 宿主在 [data-chat-flow] 头部渲染 hasMore 的"加载更早"行（官方分页按钮）。
    // 生产 CSS Module 类名不保证包含 `_older_`，定位必须依赖 DOM 契约。
    const olderRow = document.createElement('div')
    olderRow.className = 'Md3f7G'
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = '加载更早'
    olderRow.append(button)
    flow.prepend(olderRow)

    fiber = await mount()
    const jine = document.querySelector<HTMLElement>('[data-skin-surface="jine-feed"]')!
    const onClick = vi.fn()
    button.addEventListener('click', onClick)

    // 贴顶 → 滚动触发一次宿主加载
    jine.scrollTop = 0
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(1)

    // 头部锚点未变（宿主没有新的更早页）→ 不重复触发
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(1)

    // 宿主 prepend 了更早页（头部锚点变化）→ 继续拉取
    const oldPage = document.createElement('div')
    oldPage.setAttribute('data-chat-anchor-key', 'node:0')
    oldPage.setAttribute('data-chat-flow-kind', 'user')
    oldPage.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_bubble_fixture">更早的消息</div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">14:00</span></div>
      </div>
    `
    olderRow.after(oldPage)
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(2)

    // 离开顶部结束分页链；再次贴顶是全新意图
    jine.scrollTop = 120
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(2)
    jine.scrollTop = 0
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(3)

    // 加载中（disabled）→ 不触发
    button.disabled = true
    jine.dispatchEvent(new Event('scroll'))
    expect(onClick).toHaveBeenCalledTimes(3)
  })

  it('opens the separate ImageViewer window from a JINE image', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const historicalImageRow = document.createElement('div')
    historicalImageRow.dataset.chatFlowKind = 'steering'
    historicalImageRow.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_bubble_fixture"><img class="_gallery_fixture" src="http://test.local/previous.png" alt="旧图"></div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">16:58</span></div>
      </div>
    `
    const imageRow = document.createElement('div')
    imageRow.dataset.chatFlowKind = 'user'
    imageRow.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_bubble_fixture"><img class="_gallery_fixture" src="http://test.local/pic.png" alt="图"></div>
        <div class="_actions_fixture"><span class="_timeStart_fixture">17:03</span></div>
      </div>
    `
    const done = document.createElement('div')
    done.dataset.chatFlowKind = 'assistant-step'
    done.innerHTML = '<div class="_markdown_fixture_5"><p>收到</p></div>'
    flow.append(historicalImageRow, imageRow, done)

    fiber = await mount()
    const viewer = document.querySelector<HTMLElement>('[data-window-id="image-viewer"]')!
    expect(viewer.dataset.windowState).toBe('closed')

    const jineImage = [...document.querySelectorAll<HTMLImageElement>('[data-jine-image]')]
      .find(image => image.src === 'http://test.local/pic.png')!
    jineImage.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }))
    expect(viewer.dataset.windowState).toBe('open')
    const stage = document.querySelector<HTMLElement>('[data-skin-surface="image-viewer-stage"]')!
    expect(stage.getAttribute('data-phase')).toBe('hidden')
    const image = stage.querySelector('img')!
    expect(image.src).toBe('http://test.local/pic.png')

    // Album thumb renders; clicking it also routes to the viewer
    const thumbs = [...document.querySelectorAll<HTMLButtonElement>('[data-picture-thumb]')]
    expect(thumbs.map(thumb => thumb.querySelector('img')?.src)).toEqual([
      'http://test.local/pic.png',
      'http://test.local/previous.png',
    ])
    const thumb = thumbs[0]!
    expect(thumb.querySelector('img')?.src).toBe('http://test.local/pic.png')
    thumb.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 }))
    expect(stage.getAttribute('data-phase')).toBe('hidden')
  })

  it('opens the MyPicture album from the Start menu entry', async () => {
    fixture()
    fiber = await mount()
    const startMenu = document.querySelector<HTMLElement>('[aria-controls="ngo-start-menu"]')!
    startMenu.click()
    const entry = [...document.querySelectorAll<HTMLButtonElement>('[data-skin-chrome="scene"] button')]
      .find(button => button.textContent === '我的图片')!
    entry.click()
    expect(document.querySelector('[data-window-id="pictures"]')?.getAttribute('data-window-state')).toBe('open')
  })

  it('replaces the host favicon and restores it at its original position on unload', async () => {
    fixture()
    const beforeHost = document.createElement('span')
    document.head.append(beforeHost)
    const hostIcon = document.createElement('link')
    hostIcon.rel = 'icon'
    hostIcon.type = 'image/svg+xml'
    hostIcon.href = '/favicon.svg'
    document.head.append(hostIcon)
    const afterHost = document.createElement('span')
    document.head.append(afterHost)

    fiber = await mount()
    expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1)
    expect(document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.dataset.skinChrome).toBe('favicon')
    expect(document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute('type')).toBe('image/png')
    expect(document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.getAttribute('sizes')).toBe('32x32')
    expect(document.head.contains(hostIcon)).toBe(false)

    await fiber.dispose()
    fiber = undefined
    expect(document.querySelector('link[rel="icon"]')).toBe(hostIcon)
    expect(hostIcon.getAttribute('href')).toBe('/favicon.svg')
    expect(hostIcon.previousSibling).toBe(beforeHost)
    expect(hostIcon.nextSibling).toBe(afterHost)
  })

  it('swaps the PWA manifest icon list and restores the host manifest on unload', async () => {
    fixture()
    const beforeHost = document.createElement('span')
    document.head.append(beforeHost)
    const hostManifest = document.createElement('link')
    hostManifest.rel = 'manifest'
    hostManifest.href = '/manifest.webmanifest'
    document.head.append(hostManifest)
    const afterHost = document.createElement('span')
    document.head.append(afterHost)

    fiber = await mount()
    expect(document.querySelectorAll('link[rel="manifest"]')).toHaveLength(1)
    const skinManifest = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    expect(skinManifest?.dataset.skinChrome).toBe('manifest')
    expect(skinManifest?.href.startsWith('data:application/manifest+json,')).toBe(true)
    expect(document.head.contains(hostManifest)).toBe(false)

    const manifest = JSON.parse(decodeURIComponent(
      skinManifest!.href.slice('data:application/manifest+json,'.length),
    ))
    expect(manifest.name).toBe('DeepSeek Harness')
    expect(manifest.start_url).toBe(`${window.location.origin}/`)
    expect(manifest.icons).toHaveLength(4)
    expect(manifest.icons[0]).toMatchObject({ sizes: '512x512', type: 'image/png', purpose: 'any' })
    expect(manifest.icons[0].src).toContain('data:image/png;base64,')
    expect(manifest.icons[1]).toMatchObject({ sizes: '192x192', type: 'image/png' })
    expect(manifest.icons[2]).toMatchObject({ sizes: '32x32', type: 'image/png' })
    expect(manifest.icons[3]).toMatchObject({ sizes: 'any', type: 'image/svg+xml' })

    await fiber.dispose()
    fiber = undefined
    expect(document.querySelector('link[rel="manifest"][data-skin-chrome="manifest"]')).toBeNull()
    expect(document.querySelector('link[rel="manifest"]')).toBe(hostManifest)
    expect(hostManifest.previousSibling).toBe(beforeHost)
    expect(hostManifest.nextSibling).toBe(afterHost)
  })

  it('re-applies the composer follower offset after a React-style remount', async () => {
    fixture()
    const seat = document.createElement('div')
    seat.dataset.composerSeat = ''
    seat.innerHTML = `
      <div data-composer-card>
        <div data-input-scroll>
          <div data-composer-input contenteditable="true" data-phase="plain" role="textbox"></div>
          <div data-composer-placeholder>给智能体发消息</div>
        </div>
      </div>
    `
    document.querySelector('#root')!.append(seat)
    fiber = await mount()
    expect(seat.style.transform).toContain('translate')

    const card = seat.querySelector<HTMLElement>('[data-composer-card]')!
    const editor = seat.querySelector<HTMLElement>('[data-composer-input]')!
    card.dispatchEvent(new MouseEvent('click', { button: 0, bubbles: true }))
    expect(document.activeElement).toBe(editor)

    // Lexical may replace its root, but edits inside the root are observer noise.
    const editorReplacement = editor.cloneNode() as HTMLElement
    seat.style.transform = ''
    editor.replaceWith(editorReplacement)
    await vi.waitFor(() => expect(seat.style.transform).toContain('translate'))

    // The official InputBar remounts on hero<->active phase switches, dropping
    // the inline follower transform; the skin must re-apply it to the new node.
    const replacement = document.createElement('div')
    replacement.dataset.composerSeat = ''
    seat.replaceWith(replacement)

    await vi.waitFor(() => expect(replacement.style.transform).toContain('translate'))
  })

  it('only suppresses persistent JINE notices while both DSH and JINE are focused', async () => {
    fixture()
    const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(true)
    fiber = await mount()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const jineTask = document.querySelector<HTMLButtonElement>('[data-window-task="jine"]')!
    const statusTask = document.querySelector<HTMLButtonElement>('[data-window-task="status"]')!
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!

    jineTask.click()
    const focusedAnswer = document.createElement('div')
    focusedAnswer.dataset.chatFlowKind = 'assistant-step'
    focusedAnswer.innerHTML = '<div class="_markdown_fixture_5">前台消息</div>'
    flow.append(focusedAnswer)
    await vi.waitFor(() => expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent)
      .toContain('前台消息'))
    expect(notice.hidden).toBe(true)

    hasFocus.mockReturnValue(false)
    const backgroundAnswer = document.createElement('div')
    backgroundAnswer.dataset.chatFlowKind = 'assistant-step'
    backgroundAnswer.innerHTML = '<div class="_markdown_fixture_5">后台消息</div>'
    const backgroundTail = document.createElement('div')
    backgroundTail.dataset.chatFlowKind = 'turn-tail'
    flow.append(backgroundAnswer, backgroundTail)
    await vi.waitFor(() => expect(notice.hidden).toBe(false))
    expect(notice.textContent).toContain('后台消息')

    hasFocus.mockReturnValue(true)
    window.dispatchEvent(new Event('focus'))
    expect(notice.hidden).toBe(true)

    statusTask.click()
    const unfocusedJineAnswer = document.createElement('div')
    unfocusedJineAnswer.dataset.chatFlowKind = 'assistant-step'
    unfocusedJineAnswer.innerHTML = '<div class="_markdown_fixture_5">非前台 JINE 消息</div>'
    flow.append(unfocusedJineAnswer)
    await vi.waitFor(() => expect(notice.hidden).toBe(false))
    expect(notice.textContent).toContain('非前台 JINE 消息')
    jineTask.click()
    expect(notice.hidden).toBe(true)
  })

  it('adapts QuestionComposer choices into expandable JINE reply bubbles', async () => {
    fixture()
    const seat = document.createElement('div')
    seat.dataset.composerSeat = ''
    seat.innerHTML = `
      <div data-question-key="ask-1">
        <section aria-labelledby="question-ask-1-0">
          <header><div><h2 id="question-ask-1-0">请选择需要处理的功能</h2></div><div><button>_</button><button>×</button></div></header>
          <div data-question-scroll>
            <div role="group">
              <button type="button" role="checkbox" aria-checked="false" aria-label="保留很长的第一项说明">
                <span></span><span><span><span>保留很长的第一项说明</span><span>这是一段用于悬停展开的详细描述</span></span></span>
              </button>
              <div><span><svg></svg></span><div><div aria-hidden="true"></div><textarea placeholder="输入你的答案"></textarea></div></div>
            </div>
          </div>
          <footer>
            <div><button>上一题</button><button>下一题</button></div>
            <div></div>
            <div><button>跳过本题</button><button disabled>提交</button></div>
          </footer>
        </section>
      </div>
    `
    document.querySelector('#root')!.append(seat)
    const option = seat.querySelector<HTMLButtonElement>("button[role='checkbox']")!
    const confirm = seat.querySelectorAll<HTMLButtonElement>('footer button')[3]!
    const onConfirm = vi.fn()
    confirm.addEventListener('click', onConfirm)
    option.addEventListener('click', () => {
      const checked = option.getAttribute('aria-checked') !== 'true'
      option.setAttribute('aria-checked', checked ? 'true' : 'false')
      const marker = option.firstElementChild!
      marker.classList.toggle('checkboxChecked', checked)
      marker.replaceChildren(...(checked ? [document.createElement('svg')] : []))
      confirm.disabled = !checked
    })

    fiber = await mount()
    expect(seat.hasAttribute('data-ngo-question-seat')).toBe(true)
    expect(seat.querySelector('[data-question-key]')?.getAttribute('data-ngo-question-mode')).toBe('multi')
    expect(option.hasAttribute('data-ngo-question-option')).toBe(true)
    expect(option.querySelector('[data-ngo-question-option-copy]')?.textContent)
      .toContain('这是一段用于悬停展开的详细描述')
    const optionDetail = option.querySelector<HTMLElement>('[data-ngo-question-option-detail]')!
    expect(optionDetail.textContent).toBe('保留很长的第一项说明这是一段用于悬停展开的详细描述')
    expect(optionDetail.children).toHaveLength(2)
    expect(optionDetail.querySelector('[data-ngo-question-option-copy]')?.textContent)
      .toContain('这是一段用于悬停展开的详细描述')
    expect(optionDetail.getAttribute('aria-hidden')).toBe('true')
    const questionScroll = seat.querySelector<HTMLElement>('[data-question-scroll]')!
    const nativeGetRect = HTMLElement.prototype.getBoundingClientRect
    const rect = (left: number, top: number, width: number, height: number): DOMRect => ({
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    })
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      if (this === option) return rect(310, 120, 250, 34)
      if (this === questionScroll) return rect(20, 80, 560, 220)
      if (this.hasAttribute('data-ngo-question-option-portal')) return rect(0, 0, 548, 80)
      return nativeGetRect.call(this)
    })
    option.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    const optionPortal = document.body.querySelector<HTMLElement>('[data-ngo-question-option-portal]')!
    expect(optionPortal.parentElement).toBe(document.body)
    expect(optionPortal.textContent).toContain('这是一段用于悬停展开的详细描述')
    expect(optionPortal.style.left).toBe('24px')
    expect(optionPortal.style.maxWidth).toBe('548px')
    expect(option.hasAttribute('data-ngo-question-detail-active')).toBe(true)

    option.click()
    await vi.waitFor(() => expect(optionDetail.dataset.ngoQuestionOptionDetailChecked).toBe('true'))
    expect(optionDetail.querySelector('svg')).not.toBeNull()
    expect(document.body.querySelector('[data-ngo-question-option-portal] svg')).not.toBeNull()
    option.click()
    await vi.waitFor(() => expect(optionDetail.dataset.ngoQuestionOptionDetailChecked).toBe('false'))
    expect(optionDetail.querySelector('svg')).toBeNull()
    expect(document.body.querySelector('[data-ngo-question-option-portal] svg')).toBeNull()

    rectSpy.mockRestore()
    option.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    await vi.waitFor(() => expect(document.body.querySelector(
      '[data-ngo-question-option-portal]',
    )).toBeNull())
    expect(seat.querySelector<HTMLImageElement>('[data-ngo-question-avatar]')?.src)
      .toMatch(/^data:image\/png;base64,/)
    expect(confirm.getAttribute('data-ngo-question-confirm-label')).toBe('确定 ✓')
    const notice = document.querySelector<HTMLButtonElement>('[data-desktop-notice]')!
    expect(notice.textContent).toContain('正在等你回复')
    expect(notice.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/png;base64,/)
    expect(document.querySelector('[data-window-task="jine"]')?.hasAttribute('data-window-attention')).toBe(true)
    notice.click()
    expect(notice.hidden).toBe(true)
    expect(document.activeElement).toBe(option)

    const custom = seat.querySelector<HTMLElement>('[data-ngo-question-custom]')!
    const input = custom.querySelector<HTMLTextAreaElement>('textarea')!
    const inputBody = input.parentElement!
    const inputMirror = input.previousElementSibling!
    expect(input.hasAttribute('data-ngo-question-custom-input')).toBe(true)
    expect(inputBody.hasAttribute('data-ngo-question-custom-body')).toBe(true)
    expect(inputMirror.hasAttribute('data-ngo-question-custom-mirror')).toBe(true)
    expect(custom.hasAttribute('data-ngo-custom-open')).toBe(false)
    custom.querySelector<HTMLElement>('[data-ngo-question-pencil]')!.click()
    expect(custom.hasAttribute('data-ngo-custom-open')).toBe(true)
    expect(document.activeElement).toBe(input)
    input.value = '补充说明'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    expect(custom.hasAttribute('data-ngo-custom-value')).toBe(true)

    // Selecting a regular option on a revisited page makes the host clear its
    // previous custom value without another pencil click. The stale open flag
    // must not leave an empty full-width bubble behind.
    input.blur()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    input.value = ''
    seat.append(document.createComment('host-cleared-custom-answer'))
    await vi.waitFor(() => expect(custom.hasAttribute('data-ngo-custom-open')).toBe(false))
    expect(custom.hasAttribute('data-ngo-custom-value')).toBe(false)
    expect(custom.style.getPropertyValue('--ngo-question-custom-height')).toBe('24px')

    // Multi-select keeps its explicit confirmation step.
    option.click()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(onConfirm).not.toHaveBeenCalled()

    // A final single choice submits directly, matching the game's reply bubbles.
    const group = seat.querySelector<HTMLElement>("[role='group']")!
    group.setAttribute('role', 'radiogroup')
    option.setAttribute('role', 'radio')
    option.setAttribute('aria-checked', 'false')
    confirm.disabled = true
    group.append(document.createComment('rerender'))
    await vi.waitFor(() => expect(seat.querySelector('[data-question-key]')?.getAttribute('data-ngo-question-mode')).toBe('single'))
    option.click()
    await vi.waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))

    await fiber.dispose()
    fiber = undefined
    expect(seat.hasAttribute('data-ngo-question-seat')).toBe(false)
    expect(option.hasAttribute('data-ngo-question-option')).toBe(false)
    expect(input.hasAttribute('data-ngo-question-custom-input')).toBe(false)
    expect(inputBody.hasAttribute('data-ngo-question-custom-body')).toBe(false)
    expect(inputMirror.hasAttribute('data-ngo-question-custom-mirror')).toBe(false)
    expect(seat.querySelector('[data-ngo-question-avatar], [data-ngo-question-option-detail]')).toBeNull()
  })

  it('reacquires a focused QuestionComposer option replaced during selection', async () => {
    fixture()
    const seat = document.createElement('div')
    seat.dataset.composerSeat = ''
    seat.innerHTML = `
      <div data-question-key="ask-replaced-option">
        <section aria-labelledby="question-replaced-option-0">
          <header><h2 id="question-replaced-option-0">请选择验证项</h2></header>
          <div data-question-scroll>
            <div role="group">
              <button type="button" role="checkbox" aria-checked="false" aria-label="消息加载">
                <span></span><span>消息加载的详细说明</span>
              </button>
            </div>
          </div>
          <footer><button>确定</button></footer>
        </section>
      </div>
    `
    document.querySelector('#root')!.append(seat)
    fiber = await mount()

    const option = seat.querySelector<HTMLButtonElement>("button[role='checkbox']")!
    option.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(document.body.querySelector('[data-ngo-question-option-portal]')).not.toBeNull()

    const replacement = option.cloneNode(true) as HTMLButtonElement
    replacement.setAttribute('aria-checked', 'true')
    const marker = replacement.firstElementChild!
    marker.classList.add('checkboxChecked')
    marker.append(document.createElement('svg'))
    option.replaceWith(replacement)
    replacement.focus()

    await vi.waitFor(() => expect(replacement.querySelector(
      ':scope > [data-ngo-question-option-detail]',
    )?.getAttribute('data-ngo-question-option-detail-checked')).toBe('true'))
    expect(replacement.hasAttribute('data-ngo-question-detail-active')).toBe(true)
    expect(document.body.querySelector('[data-ngo-question-option-portal] svg')).not.toBeNull()
    replacement.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    expect(replacement.hasAttribute('data-ngo-question-keyboard-focus')).toBe(false)

    const other = document.createElement('button')
    other.type = 'button'
    other.setAttribute('role', 'checkbox')
    other.setAttribute('aria-checked', 'false')
    other.innerHTML = '<span></span><span>另一个选项</span>'
    replacement.parentElement!.append(other)
    await vi.waitFor(() => expect(other.hasAttribute('data-ngo-question-option')).toBe(true))
    other.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(document.body.querySelector('[data-ngo-question-option-portal]')?.textContent)
      .toContain('另一个选项')
    other.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    await vi.waitFor(() => expect(document.body.querySelector(
      '[data-ngo-question-option-portal]',
    )).toBeNull())
    expect(document.activeElement).toBe(replacement)

    await fiber.dispose()
    fiber = undefined
  })

  it('keeps submitted QuestionComposer exchanges as durable JINE dialogue', async () => {
    fixture()
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const askFlow = document.createElement('div')
    askFlow.dataset.chatFlowKind = 'tool-call'
    askFlow.dataset.chatFlowKey = 'ask-flow-1'
    askFlow.innerHTML = '<div data-tool="ask_user_question" data-state="running">等待回答</div>'
    flow.append(askFlow)

    const seat = document.createElement('div')
    seat.dataset.composerSeat = ''
    seat.innerHTML = `
      <div data-question-key="ask-durable">
        <section aria-labelledby="question-ask-durable-0">
          <header><div><h2 id="question-ask-durable-0">希望优先验证哪些部分？</h2></div><button>×</button></header>
          <div data-question-scroll>
            <div role="group">
              <button type="button" role="checkbox" aria-checked="false" aria-label="消息加载"><span></span><span>消息加载</span></button>
              <button type="button" role="checkbox" aria-checked="false" aria-label="气泡动画"><span></span><span>气泡动画</span></button>
              <div><span><svg></svg></span><div><textarea></textarea></div></div>
            </div>
          </div>
          <footer><span>1 / 1</span><button>跳过本题</button><button>确定</button></footer>
        </section>
      </div>
    `
    document.querySelector('#root')!.append(seat)
    const options = [...seat.querySelectorAll<HTMLButtonElement>("button[role='checkbox']")]
    for (const option of options) {
      option.addEventListener('click', () => option.setAttribute('aria-checked',
        option.getAttribute('aria-checked') === 'true' ? 'false' : 'true'))
    }
    const confirm = [...seat.querySelectorAll<HTMLButtonElement>('footer button')].at(-1)!
    confirm.addEventListener('click', () => seat.querySelector('[data-question-key]')?.remove())

    fiber = await mount()
    options[0]!.click()
    options[1]!.click()
    await new Promise(resolve => window.setTimeout(resolve, 0))
    expect(document.querySelector('[data-jine-question]')).toBeNull()
    expect(document.querySelectorAll('[data-jine-question-answer-bubble]')).toHaveLength(0)

    confirm.click()
    await vi.waitFor(() => expect(document.querySelectorAll(
      '[data-jine-question-answer-bubble]',
    )).toHaveLength(2))
    expect(document.querySelector('[data-jine-question]')?.textContent).toContain('希望优先验证哪些部分？')
    expect([...document.querySelectorAll('[data-jine-question-answer-bubble]')].map(node => node.textContent))
      .toEqual(['消息加载', '气泡动画'])
    await vi.waitFor(() => expect(document.querySelector(
      '[data-jine-question-answer] [data-jine-receipt]',
    )?.textContent).toBe('已读'))

    const laterUser = document.createElement('div')
    laterUser.dataset.chatFlowKind = 'user'
    laterUser.innerHTML = `
      <div data-actions-reveal="always">
        <div class="_bubble_fixture">后续追问</div>
        <div class="_actions_fixture"><span class="_timeEnd_fixture">17:20</span></div>
      </div>
    `
    const laterAssistant = document.createElement('div')
    laterAssistant.dataset.chatFlowKind = 'assistant-step'
    laterAssistant.innerHTML = '<div class="_markdown_fixture_5">后续回复</div>'
    flow.append(laterUser, laterAssistant)
    await vi.waitFor(() => expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent)
      .toContain('后续回复'))
    const durableQuestion = document.querySelector<HTMLElement>('[data-jine-question]')!
    const laterBubble = [...document.querySelectorAll<HTMLElement>('[data-jine-message]')]
      .find(node => node.textContent?.includes('后续回复'))!
    expect(durableQuestion.compareDocumentPosition(laterBubble) & Node.DOCUMENT_POSITION_FOLLOWING)
      .not.toBe(0)

    await fiber.dispose()
    fiber = await mount()
    expect(document.querySelector('[data-jine-question]')?.textContent).toContain('希望优先验证哪些部分？')
    expect([...document.querySelectorAll('[data-jine-question-answer-bubble]')].map(node => node.textContent))
      .toEqual(['消息加载', '气泡动画'])
  })

  it('expires durable ASK dialogue after 30 days and caps its global storage budget', async () => {
    fixture()
    const now = Date.now()
    const conversation = window.location.href
    const records = Array.from({ length: 260 }, (_, index) => ({
      requestKey: `ask-retained-${index}`,
      flowKey: `ask-flow-retained-${index}`,
      exchanges: [{
        index: 0,
        question: index === 0 ? '仍在生命周期内的问题' : `历史问题 ${index} ${'长'.repeat(4_000)}`,
        answers: [`回答 ${index}`],
        skipped: false,
      }],
      complete: true,
      submitRequested: false,
      completedAt: now - index,
    }))
    records.push({
      requestKey: 'ask-expired',
      flowKey: 'ask-flow-expired',
      exchanges: [{ index: 0, question: '三十天前的问题', answers: ['过期回答'], skipped: false }],
      complete: true,
      submitRequested: false,
      completedAt: now - 31 * 24 * 60 * 60 * 1000,
    })
    window.localStorage.setItem('dsh:internet-angel-desktop:question-transcripts:v2', JSON.stringify({
      version: 2,
      conversations: { [conversation]: records },
    }))
    const flow = document.querySelector<HTMLElement>('[data-chat-flow]')!
    const retainedFlow = document.createElement('div')
    retainedFlow.dataset.chatFlowKind = 'tool-call'
    retainedFlow.dataset.chatFlowKey = 'ask-flow-retained-0'
    retainedFlow.innerHTML = '<div data-tool="ask_user_question">已回答 1 项</div>'
    const expiredFlow = document.createElement('div')
    expiredFlow.dataset.chatFlowKind = 'tool-call'
    expiredFlow.dataset.chatFlowKey = 'ask-flow-expired'
    expiredFlow.innerHTML = '<div data-tool="ask_user_question">已回答 1 项</div>'
    flow.append(retainedFlow, expiredFlow)

    fiber = await mount()

    expect(document.querySelector('[data-jine-question]')?.textContent).toContain('仍在生命周期内的问题')
    expect(document.querySelector('[data-skin-surface="jine-feed"]')?.textContent).not.toContain('三十天前的问题')
    const serialized = window.localStorage.getItem('dsh:internet-angel-desktop:question-transcripts:v2')!
    const compacted = JSON.parse(serialized) as { conversations: Record<string, Array<{ requestKey: string }>> }
    const retained = Object.values(compacted.conversations).flat()
    expect(retained.length).toBeLessThanOrEqual(256)
    expect(retained.some(record => record.requestKey === 'ask-expired')).toBe(false)
    expect(serialized.length).toBeLessThanOrEqual(750_000)
  })

  it('migrates the current tab ASK ledger into the bounded persistent store', async () => {
    fixture()
    const legacyKey = `dsh:internet-angel-desktop:question-transcripts:v1:${window.location.href}`
    window.sessionStorage.setItem(legacyKey, JSON.stringify([{
      requestKey: 'ask-legacy',
      flowKey: 'ask-flow-legacy',
      exchanges: [{ index: 0, question: '旧标签页问题', answers: ['旧回答'], skipped: false }],
      complete: true,
      submitRequested: false,
    }]))
    const askFlow = document.createElement('div')
    askFlow.dataset.chatFlowKind = 'tool-call'
    askFlow.dataset.chatFlowKey = 'ask-flow-legacy'
    askFlow.innerHTML = '<div data-tool="ask_user_question">已回答 1 项</div>'
    document.querySelector('[data-chat-flow]')!.append(askFlow)

    fiber = await mount()

    expect(document.querySelector('[data-jine-question]')?.textContent).toContain('旧标签页问题')
    expect(window.sessionStorage.getItem(legacyKey)).toBeNull()
    const persistent = window.localStorage.getItem('dsh:internet-angel-desktop:question-transcripts:v2')
    expect(persistent).toContain('ask-flow-legacy')
  })

  it('adapts the official single-line custom answer into a content-sized multiline editor', async () => {
    fixture()
    const composer = document.createElement('div')
    composer.dataset.composerInput = ''
    composer.contentEditable = 'true'
    composer.setAttribute('role', 'textbox')
    document.querySelector('#root')!.append(composer)
    const seat = document.createElement('div')
    seat.dataset.composerSeat = ''
    seat.innerHTML = `
      <div data-question-key="ask-custom-input">
        <section aria-labelledby="question-ask-custom-input-0">
          <header><h2 id="question-ask-custom-input-0">还有其他想法吗？</h2><button>×</button></header>
          <div data-question-scroll><div role="radiogroup">
            <button role="radio" aria-checked="false" aria-label="没有"><span></span><span>没有</span></button>
            <div><span><svg></svg></span><div><input type="text" placeholder="请输入你的答案" /></div></div>
          </div></div>
          <footer><span>1 / 1</span><button>跳过本题</button><button>确定</button></footer>
        </section>
      </div>
    `
    document.querySelector('#root')!.append(seat)

    fiber = await mount()
    const row = seat.querySelector<HTMLElement>('[data-ngo-question-custom]')!
    const native = row.querySelector<HTMLInputElement>('[data-ngo-question-custom-native]')!
    const editor = row.querySelector<HTMLTextAreaElement>('[data-ngo-question-custom-editor]')!
    const composerEnter = vi.fn()
    const askEnter = vi.fn()
    composer.addEventListener('keydown', composerEnter)
    editor.addEventListener('keydown', askEnter)
    composer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    editor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
    expect(composerEnter).toHaveBeenCalledTimes(1)
    expect(askEnter).not.toHaveBeenCalled()
    expect(editor.placeholder).toBe('请输入你的答案')
    Object.defineProperty(editor, 'scrollHeight', { configurable: true, value: 68 })
    window.dispatchEvent(new Event('resize'))
    expect(row.style.getPropertyValue('--ngo-question-custom-height')).toBe('24px')
    editor.value = '第一行\n第二行\n第三行'
    editor.dispatchEvent(new Event('input', { bubbles: true }))
    expect(native.value).toBe('第一行\u2028第二行\u2028第三行')
    expect(editor.value).toBe('第一行\n第二行\n第三行')
    expect(row.style.getPropertyValue('--ngo-question-custom-height')).toBe('68px')
    expect(row.hasAttribute('data-ngo-custom-value')).toBe(true)

    await fiber.dispose()
    fiber = undefined
    expect(row.querySelector('[data-ngo-question-custom-editor]')).toBeNull()
    expect(native.hasAttribute('data-ngo-question-custom-native')).toBe(false)
    expect(row.style.getPropertyValue('--ngo-question-custom-height')).toBe('')
  })

  it('hot-unloads every owned node, attribute and art property', async () => {
    fixture()
    fiber = await mount()
    await fiber.dispose()
    fiber = undefined

    expect(document.body.hasAttribute(BODY_ATTRIBUTE)).toBe(false)
    expect(document.body.hasAttribute('data-ngo-phase')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-start-open')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-settings-open')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-settings-active')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-jine-open')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-jine-has-queue')).toBe(false)
    expect(document.body.hasAttribute('data-ngo-jine-queue-fallback')).toBe(false)
    expect(document.querySelector('[data-skin-chrome]')).toBeNull()
    expect(document.querySelector('link[rel="icon"][data-skin-chrome="favicon"]')).toBeNull()
    expect(document.body.style.getPropertyValue('--ngo-wallpaper')).toBe('')
    expect(document.body.style.getPropertyValue('--ngo-jine-feed-bottom')).toBe('')
  })

  it('projects the two DSH first-run steps without replacing their controls', async () => {
    fixture()
    fiber = await mount()

    const welcome = document.createElement('div')
    welcome.setAttribute('role', 'presentation')
    welcome.innerHTML = `
      <div></div><div><section role="region" aria-labelledby="welcome-notice-title">
        <div>brand</div><h2 id="welcome-notice-title">欢迎使用</h2>
        <p>产品提示</p><div><button type="button">继续</button></div>
      </section></div>
    `
    document.body.append(welcome)
    await vi.waitFor(() => expect(welcome.getAttribute('data-ngo-onboarding-surface')).toBe('notice'))
    const welcomeButton = welcome.querySelector<HTMLButtonElement>('button')!
    const welcomeClick = vi.fn()
    welcomeButton.addEventListener('click', welcomeClick)
    welcomeButton.click()
    expect(welcomeClick).toHaveBeenCalledOnce()
    expect(welcomeButton.getAttribute('data-ngo-onboarding-action')).toBe('accept')

    welcome.remove()
    const login = document.createElement('div')
    login.setAttribute('role', 'presentation')
    login.innerHTML = `
      <div></div><div><section role="region" aria-labelledby="deepseek-onboarding-title">
        <div>brand</div><h2 id="deepseek-onboarding-title">添加一个 API Key 开始使用</h2>
        <p>配置 DeepSeek 官方模型，即可开始使用。</p>
        <div><button type="button">稍后配置</button><button type="button">前往配置</button></div>
      </section></div>
    `
    document.body.append(login)
    await vi.waitFor(() => expect(login.getAttribute('data-ngo-onboarding-surface')).toBe('login'))
    expect(login.querySelectorAll('[data-ngo-login-fields]')).toHaveLength(1)
    const loginButtons = [...login.querySelectorAll<HTMLButtonElement>('button')]
    expect(loginButtons[0]?.getAttribute('data-ngo-onboarding-action')).toBe('guest')
    expect(loginButtons[0]?.dataset.ngoOnboardingLabel).toBe('游客登录')
    expect(loginButtons[1]?.getAttribute('data-ngo-onboarding-action')).toBe('login')
    expect(loginButtons[1]?.dataset.ngoOnboardingLabel).toBe('输入 API KEY')

    const settings = document.querySelector<HTMLElement>("[data-slot='sidebar.settings']")!
    const dialog = document.createElement('div')
    dialog.setAttribute('role', 'dialog')
    dialog.innerHTML = `
      <ul><li><div><div>DeepSeek</div><div><span>API Key</span>
        <input type="password" aria-label="API Key" /></div><details></details><div>
        <button type="button">取消</button><button type="button">应用</button></div></div></li></ul>
    `
    settings.append(dialog)
    const key = dialog.querySelector<HTMLInputElement>('input')!
    await vi.waitFor(() => expect(key.hasAttribute('data-ngo-login-api-key')).toBe(true))
    expect(key.closest('li')?.hasAttribute('data-ngo-login-card')).toBe(true)

    await fiber.dispose()
    fiber = undefined
    expect(login.querySelector('[data-ngo-login-fields]')).toBeNull()
    expect(login.hasAttribute('data-ngo-onboarding-surface')).toBe(false)
    expect(key.hasAttribute('data-ngo-login-api-key')).toBe(false)
  })
})
