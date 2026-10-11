import type { Context } from 'cordis'
import { t, setAttr } from './i18n.ts'
import { desktopChromeTop } from './window-manager.ts'

type AppKind = 'terminal' | 'browser'
type Observable<T> = { getSnapshot(): T; subscribe(listener: () => void): () => void }
type Tab = { sessionId: string; tabId: string; kind: string }
interface Sidebar {
  mounted: Observable<string | undefined>
  openTabs: Observable<readonly Tab[]>
  openTab(kind: string, options?: { params?: Record<string, unknown> }): void
  openResource(address: string): void
  float(id: string, rect: { x: number; y: number; width: number; height: number }): void
  focus(id: string): void
  isExpanded(): boolean
  toggleExpanded(): void
}

/** Small pixel-grid drawings share the desktop's purple, pink and cyan palette. */
const icon = (drawing: string): string => `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">${drawing}</svg>`,
)}`

/**
 * Pixel map to SVG: one character per pixel, `.` transparent. Each colour
 * becomes one path of horizontal runs, so the drawing scales on whole pixels.
 */
export function pixelIcon(rows: readonly string[], palette: Readonly<Record<string, string>>): string {
  const paths = new Map<string, string>()
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const key = row[x]!
      let end = x + 1
      while (row[end] === key) end += 1
      const fill = palette[key]
      if (fill !== undefined) paths.set(fill, `${paths.get(fill) ?? ''}M${x} ${y}h${end - x}v1H${x}z`)
      x = end
    }
  })
  const drawing = [...paths].map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join('')
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rows[0]!.length} ${rows.length}" shape-rendering="crispEdges">${drawing}</svg>`,
  )}`
}

/** The quick-launch sprites' 12-unit grid and grey/blue ramp (NGO taskbar icons). */
const TERMINAL_ICON = pixelIcon([
  'AAAAAAAAAAAA',
  'ADDDDDDDDBDA',
  'AAAAAAAAAAAA',
  'AEEEEEEEEEEA',
  'AEFEEEEEEEEA',
  'AEEFEEEEEEEA',
  'AEEEFEEEEEEA',
  'AEEFEEEEEEEA',
  'AEFEEBBBEEEA',
  'AEEEEEEEEEEA',
  'AEEEEEEEEEEA',
  'AAAAAAAAAAAA',
], { A: '#454355', B: '#e0dae2', D: '#bdaac7', E: '#215c92', F: '#5bb4e2' })

export const NATIVE_APPS = [
  { kind: 'terminal', label: '终端', icon: TERMINAL_ICON },
  { kind: 'browser', label: '浏览器', icon: icon('<path fill="#3716b1" d="M2 3h28v26H2z"/><path fill="#f4d8ff" d="M4 5h24v4H4z"/><path fill="#fff1ff" d="M4 11h24v16H4z"/><path fill="#52bce2" d="M12 12h8v2h4v9h-4v3h-8v-3H8v-9h4z"/><path fill="#bdf6ff" d="M14 14h4v3h4v2h-4v5h-4v-5h-4v-2h4z"/><path fill="#5127ff" d="M6 6h2v2H6zm4 0h2v2h-2z"/>') },
] as const

/** Desktop-icon palette: the globe/notebook sprites' navy outline and purple ramp. */
const DESKTOP_PALETTE = {
  O: '#34316a', P: '#4d23cf', L: '#b790fb', l: '#decdff', W: '#fdfdfd',
  S: '#5bb4e2', s: '#215c92', c: '#aeedf0', K: '#fb7dd2', k: '#d30081',
  Y: '#fff1ff', y: '#f4d8ff',
} as const

/** 「此电脑」 on the same 32-unit grid as the 64px desktop sprites. */
export const COMPUTER_ICON = pixelIcon([
  '................................',
  '................................',
  '..OOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
  '.OlllllllllllllllllllllllllllLO.',
  '.OlLLLLLLLLLLLLLLLLLLLLLLLLLLPO.',
  '.OlLOOOOOOOOOOOOOOOOOOOOOOOOLPO.',
  '.OlLOccccSSSSSSSSSSSSSSSSSSOLPO.',
  '.OlLOcSSSSSSSSSSSSSSSSSSSSsOLPO.',
  '.OlLOcSSSSSSSSSSSSSSSSSSSSsOLPO.',
  '.OlLOSSSSSSSKKSSSKKSSSSSSSsOLPO.',
  '.OlLOSSSSSSKWKKSKKKKSSSSSSsOLPO.',
  '.OlLOSSSSSSKWKKKKKKKSSSSSSsOLPO.',
  '.OlLOSSSSSSKKKKKKKKKSSSSSSsOLPO.',
  '.OlLOSSSSSSSKKKKKKKSSSSSSSsOLPO.',
  '.OlLOSSSSSSSSKKKKKSSSSSSSSsOLPO.',
  '.OlLOSSSSSSSSSKKKSSSSSSSSSsOLPO.',
  '.OlLOSSSSSSSSSSKSSSSSSSSSSsOLPO.',
  '.OlLOSSSSSSSSSSSSSSSSSSSSSsOLPO.',
  '.OlLOssssssssssssssssssssssOLPO.',
  '.OlLOOOOOOOOOOOOOOOOOOOOOOOOLPO.',
  '.OlLLLLLLLLLLLLLLLLLLLLKKLcLLPO.',
  '.OLPPPPPPPPPPPPPPPPPPPPPPPPPPPO.',
  '..OOOOOOOOOOOOOOOOOOOOOOOOOOOO..',
  '............OOOOOOOO............',
  '............OLLLLLPO............',
  '............OLLLLLPO............',
  '.......OOOOOOOOOOOOOOOOOO.......',
  '......OlllllllllllllllllLO......',
  '......OLLLLLLLLLLLLLLLLLPO......',
  '......OPPPPPPPPPPPPPPPPPPO......',
  '.......OOOOOOOOOOOOOOOOOO.......',
  '................................',
], DESKTOP_PALETTE)

/** 16-unit 「此电脑」 for list-sized places (16/32px stay on whole pixels). */
export const COMPUTER_SMALL_ICON = pixelIcon([
  '................',
  '.OOOOOOOOOOOOOO.',
  '.OlllllllllllLO.',
  '.OlOOOOOOOOOOPO.',
  '.OlOccSSSSSSOPO.',
  '.OlOcSKKSKKSOPO.',
  '.OlOSSKKKKKSOPO.',
  '.OlOSSSKKKSSOPO.',
  '.OlOSSSSKSSsOPO.',
  '.OlOssssssssOPO.',
  '.OlOOOOOOOOOOPO.',
  '.OPPPPPPPPPPPPO.',
  '.OOOOOOOOOOOOOO.',
  '......OLPO......',
  '...OlLLLLLLLPO..',
  '...OOOOOOOOOOO..',
], DESKTOP_PALETTE)

const FOLDER_ROWS = [
  '................',
  '................',
  '.OOOOO..........',
  'OyyyyyO.........',
  'OyYYYYyOOOOOOOO.',
  'OyYYYYYYYYYYYYyO',
  'OOOOOOOOOOOOOOOO',
  'OKKKKKKKKKKKKKKO',
  'OKyyyyyyyyyyyykO',
  'OKyyyyyyyyyyyykO',
  'OKyyyyyyyyyyyykO',
  'OKyyyyyyyyyyyykO',
  'OKyyyyyyyyyyyykO',
  'OkkkkkkkkkkkkkkO',
  'OOOOOOOOOOOOOOOO',
  '................',
]
export const FOLDER_ICON = pixelIcon(FOLDER_ROWS, DESKTOP_PALETTE)
export const FILE_ICON = pixelIcon([
  '...OOOOOOOO.....',
  '...OYYYYYYOO....',
  '...OYYYYYYOyO...',
  '...OYYYYYYOyyO..',
  '...OYYYYYYOOOOO.',
  '...OYPPPPPPYYlO.',
  '...OYYYYYYYYYlO.',
  '...OYPPPPPPPPlO.',
  '...OYYYYYYYYYlO.',
  '...OYPPPPPPPPlO.',
  '...OYYYYYYYYYlO.',
  '...OYPPPPPYYYlO.',
  '...OYYYYYYYYYlO.',
  '...OllllllllllO.',
  '...OOOOOOOOOOOO.',
  '................',
], DESKTOP_PALETTE)
export const PICTURES_ICON = pixelIcon([
  ...FOLDER_ROWS.slice(0, 8),
  'OKyOOOOOOOOOOykO',
  'OKyOccccccWcOykO',
  'OKyOcccKccccOykO',
  'OKyOccKKKcSSOykO',
  'OKyOcKKKKSSSOykO',
  'OkkOOOOOOOOOOkkO',
  ...FOLDER_ROWS.slice(14),
], DESKTOP_PALETTE)

export interface NativeAppEntry {
  kind: AppKind
  /** Desktop icons and quick-launch buttons that open the app. */
  launchers: HTMLButtonElement[]
  task: HTMLButtonElement
}

/** Desktop-side face over the host's right-sidebar tabs. */
export interface HostWindows {
  /** Open a new host browser window, optionally at `url`; false when the host has no browser. */
  openBrowser(url?: string): boolean
  /** Open a `dsh-resource://` address (a workspace file) in a host window; false without a sidebar. */
  openResource(address: string): boolean
}

type Request = { kind: 'app'; app: AppKind; params?: Record<string, unknown> } | { kind: 'resource'; address: string }

/** The host owns tab/session lifetimes, terminal cleanup and native float geometry. */
export function installNativeApps(ctx: Context, entries: NativeAppEntry[], desktopInsets: () => { left: number; right: number }, returnToConversation: () => void, closeMenu: () => void): HostWindows {
  for (const entry of entries) {
    for (const button of entry.launchers) button.disabled = true
    entry.task.hidden = true
  }
  let bound: { sidebar: Sidebar; available: (kind: string) => boolean; request: (request: Request) => void } | undefined
  ctx.inject(['sidebarRight', 'sidebarRightTabs'], scope => {
    const sidebar = scope.get('sidebarRight') as Sidebar
    const registry = scope.get('sidebarRightTabs') as { entries(): readonly { kind: string }[]; subscribe(fn: () => void): () => void }
    let pending: Request | undefined
    let frame = 0
    let cascade = 0
    const foreground = 'data-ngo-native-foreground'
    const hadForeground = document.body.hasAttribute(foreground)
    const focusSurface = (event: Event): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('[data-sidebar-right-panel]')) document.body.setAttribute(foreground, '')
      else if (target.closest('[data-window-id], [data-shortcut-modal="settings"], [data-ngo-taskbar], #ngo-start-menu')) document.body.removeAttribute(foreground)
    }
    document.addEventListener('pointerdown', focusSurface, true)
    document.addEventListener('focusin', focusSurface, true)
    const available = (kind: string): boolean => registry.entries().some(type => type.kind === kind)
    // Float a freshly opened tab as a desktop window. The host's openContent
    // always reveals the docked column; an app window only floats, so a column
    // that was collapsed before the open is collapsed again.
    const present = (tab: Tab | undefined, wasExpanded: boolean, slot: number): void => {
      if (tab !== undefined) {
        const offset = slot * 28
        const inset = desktopInsets()
        const width = Math.min(800, innerWidth - inset.left - inset.right - 24)
        sidebar.float(tab.tabId, { x: Math.max(inset.left + 12, Math.min(inset.left + 36 + offset, innerWidth - inset.right - width - 12)), y: desktopChromeTop() + 64 + offset,
          width, height: Math.max(240, Math.min(620, innerHeight - 180)) })
      }
      if (!wasExpanded && sidebar.isExpanded()) sidebar.toggleExpanded()
      // A collapsed host panel is aria-hidden with its floats; that is the
      // host's own collapsed-float behaviour, which the skin does not widen.
      if (tab !== undefined) sidebar.focus(tab.tabId)
      document.body.setAttribute(foreground, '')
    }
    const sync = (): void => {
      const session = sidebar.mounted.getSnapshot()
      const tabs = sidebar.openTabs.getSnapshot()
      for (const entry of entries) {
        const usable = available(entry.kind)
        const label = NATIVE_APPS.find(app => app.kind === entry.kind)!.label
        for (const button of entry.launchers) {
          button.disabled = !usable
          setAttr(button, 'title', () => !usable
            ? t('宿主未启用此组件') : session === undefined ? t('请先选择一个会话') : t(label))
        }
        entry.task.hidden = !tabs.some(tab => tab.sessionId === session && tab.kind === entry.kind)
      }
      if (pending === undefined || session === undefined) return
      const request = pending
      pending = undefined
      const before = new Set(tabs.filter(tab => tab.sessionId === session).map(tab => tab.tabId))
      const fresh = (): Tab | undefined => sidebar.openTabs.getSnapshot()
        .find(tab => tab.sessionId === session && !before.has(tab.tabId))
      const wasExpanded = sidebar.isExpanded()
      cascade = (cascade + 1) % 6
      if (request.kind === 'resource') {
        sidebar.openResource(request.address)
        present(fresh(), wasExpanded, cascade)
        return
      }
      // A plain launch refocuses the app's window; a URL always gets a new one.
      const existing = request.params === undefined
        ? tabs.find(tab => tab.sessionId === session && tab.kind === request.app) : undefined
      if (existing !== undefined) {
        present(existing, wasExpanded, cascade)
        return
      }
      sidebar.openTab(request.app, request.params === undefined ? undefined : { params: request.params })
      present(fresh(), wasExpanded, cascade)
    }
    const schedule = (): void => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(sync)
    }
    const request = (next: Request): void => {
      closeMenu()
      pending = next
      returnToConversation()
      schedule()
    }
    bound = { sidebar, available, request }
    const listeners = entries.map(entry => {
      const open = (): void => { request({ kind: 'app', app: entry.kind }) }
      const buttons = [...entry.launchers, entry.task]
      for (const button of buttons) button.addEventListener('click', open)
      return () => { for (const button of buttons) button.removeEventListener('click', open) }
    })
    const unsubscribes = [sidebar.mounted.subscribe(schedule), sidebar.openTabs.subscribe(schedule), registry.subscribe(schedule)]
    sync()
    return () => {
      cancelAnimationFrame(frame)
      pending = undefined
      if (bound?.sidebar === sidebar) bound = undefined
      for (const dispose of [...listeners, ...unsubscribes]) dispose()
      document.removeEventListener('pointerdown', focusSurface, true)
      document.removeEventListener('focusin', focusSurface, true)
      document.body.toggleAttribute(foreground, hadForeground)
      for (const entry of entries) {
        for (const button of entry.launchers) button.disabled = true
        entry.task.hidden = true
      }
    }
  })
  return {
    openBrowser(url) {
      if (bound === undefined || !bound.available('browser')) return false
      bound.request(url === undefined ? { kind: 'app', app: 'browser' } : { kind: 'app', app: 'browser', params: { url } })
      return true
    },
    openResource(address) {
      if (bound === undefined) return false
      bound.request({ kind: 'resource', address })
      return true
    },
  }
}
