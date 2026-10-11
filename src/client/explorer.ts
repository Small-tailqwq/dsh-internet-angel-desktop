/**
 * 「此电脑」: an explorer over the current Session's workspace, with
 * 「我的图片」 as a second place. Listing goes through the host's read-only
 * `remote.workspaceFiles.list`; opening a file hands its resource address to
 * the host viewer, so the skin never reads file contents itself.
 */
import type { Context } from 'cordis'
import { t, setAttr, setText, type UiText } from './i18n.ts'
import { COMPUTER_SMALL_ICON, FILE_ICON, FOLDER_ICON, PICTURES_ICON, pixelIcon } from './native-apps.ts'
import css from './skin.module.css'

type Place = 'workspace' | 'pictures'
interface Entry { readonly name: string; readonly type: 'file' | 'directory' | 'other'; readonly size?: number }
type ListResult = { ok: true; value: { entries: readonly Entry[]; truncated: boolean } }
  | { ok: false; error: { code?: string; message?: string } | string }
interface WorkspaceFilesRemote {
  workspaceFiles: { list(sessionId: string, path: string, signal: AbortSignal): Promise<ListResult> }
}

export interface ExplorerSession { id: string; cwd?: string | undefined }

export interface ExplorerSurface {
  root: HTMLDivElement
  pictureGrid: HTMLDivElement
  pictureEmpty: HTMLDivElement
}

interface Parts extends ExplorerSurface {
  back: HTMLButtonElement
  forward: HTMLButtonElement
  up: HTMLButtonElement
  refresh: HTMLButtonElement
  address: HTMLSpanElement
  places: Record<Place, HTMLButtonElement>
  list: HTMLDivElement
  message: HTMLDivElement
  status: HTMLSpanElement
}

const PARTS = new WeakMap<HTMLDivElement, Parts>()

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string | undefined, text?: UiText): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className ?? ''
  if (text !== undefined) setText(node, text)
  return node
}

function icon(src: string, className: string | undefined): HTMLImageElement {
  const image = element('img', className)
  image.src = src
  image.alt = ''
  image.setAttribute('aria-hidden', 'true')
  return image
}

/** 9-unit white glyphs, drawn at 18px on the toolbar's square pixel keys. */
const glyph = (rows: readonly string[]): string => pixelIcon(rows, { W: '#fff' })
const BACK_ROWS = ['.........', '....W....', '...WW....', '..WWWWWW.', '.WWWWWWW.', '..WWWWWW.', '...WW....', '....W....', '.........']
const GLYPHS = {
  back: glyph(BACK_ROWS),
  forward: glyph(BACK_ROWS.map(row => [...row].reverse().join(''))),
  up: glyph(['....W....', '...WWW...', '..WWWWW..', '.WWWWWWW.', '...WWW...', '...WWW...', '...WWW...', '...WWW...', '.........']),
  refresh: glyph(['...WWWW..', '..W....W.', '.W....WWW', '.W.....W.', '.W.......', '.W.....W.', '..W...W..', '...WWW...', '.........']),
}

function toolButton(action: keyof typeof GLYPHS, label: UiText): HTMLButtonElement {
  const button = element('button', css.explorerTool)
  button.type = 'button'
  button.dataset.explorerAction = action
  const key = element('span', css.explorerToolGlyph)
  key.append(icon(GLYPHS[action], undefined))
  button.append(key, element('span', css.explorerToolLabel, label))
  setAttr(button, 'aria-label', label)
  return button
}

/** Build the explorer body; the album grid is the existing 「我的图片」 surface. */
export function buildExplorer(): ExplorerSurface {
  const root = element('div', css.explorer)
  root.dataset.skinSurface = 'explorer'
  root.dataset.explorerPlace = 'workspace'

  const toolbar = element('div', css.explorerToolbar)
  toolbar.setAttribute('role', 'toolbar')
  const back = toolButton('back', () => t('后退'))
  const forward = toolButton('forward', () => t('前进'))
  const up = toolButton('up', () => t('向上'))
  const refresh = toolButton('refresh', () => t('刷新'))
  toolbar.append(back, forward, up, refresh)

  const addressRow = element('div', css.explorerAddressRow)
  const address = element('span', css.explorerAddress)
  address.dataset.explorerAddress = ''
  addressRow.append(element('span', css.explorerAddressLabel, () => t('地址')), address)

  const main = element('div', css.explorerMain)
  const pane = element('nav', css.explorerPane)
  setAttr(pane, 'aria-label', () => t('其他位置'))
  const placeButton = (place: Place, src: string, label: UiText): HTMLButtonElement => {
    const button = element('button', css.explorerPlace)
    button.type = 'button'
    button.dataset.explorerPlaceButton = place
    button.append(icon(src, css.explorerPlaceIcon), element('span', '', label))
    return button
  }
  const places: Record<Place, HTMLButtonElement> = {
    workspace: placeButton('workspace', COMPUTER_SMALL_ICON, () => t('工作区')),
    pictures: placeButton('pictures', PICTURES_ICON, () => t('我的图片')),
  }
  const group = element('section', css.explorerPaneGroup)
  group.append(element('h3', css.explorerPaneTitle, () => t('其他位置')), places.workspace, places.pictures)
  pane.append(group)

  const view = element('div', css.explorerView)
  const list = element('div', css.explorerList)
  list.dataset.explorerList = ''
  list.setAttribute('role', 'listbox')
  setAttr(list, 'aria-label', () => t('文件和文件夹'))
  const message = element('div', css.explorerMessage)
  message.hidden = true
  const pictureGrid = element('div', css.pictureGrid)
  pictureGrid.dataset.skinSurface = 'picture-grid'
  const pictureEmpty = element('div', css.pictureEmpty, () => t('相册为空——点击 JINE 消息中的图片查看'))
  view.append(list, message, pictureGrid, pictureEmpty)
  main.append(pane, view)

  const statusBar = element('div', css.explorerStatus)
  const status = element('span', '')
  status.setAttribute('aria-live', 'polite')
  statusBar.append(status)

  root.append(toolbar, addressRow, main, statusBar)
  PARTS.set(root, { root, pictureGrid, pictureEmpty, back, forward, up, refresh, address, places, list, message, status })
  return { root, pictureGrid, pictureEmpty }
}

function encodeSegment(segment: string): string {
  return encodeURIComponent(segment).replace(/%3A/gi, ':')
}

/** `dsh-resource://file/session/<id>/<path>`, the host's session file address grammar. */
export function sessionFileAddress(sessionId: string, path: string): string {
  const normalized = path.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
  return `dsh-resource://file/session/${encodeSegment(sessionId)}/${normalized.split('/').map(encodeSegment).join('/')}`
}

/**
 * The host's `fileAddressFor`: a file under the Session's workspace root is
 * addressed by its root-relative path, anything else by its absolute path.
 */
export function workspaceFileAddress(sessionId: string, root: string | undefined, path: string): string {
  const normalized = path.replace(/\\/g, '/')
  const base = root?.replace(/\\/g, '/').replace(/\/+$/, '') ?? ''
  if (base !== '' && normalized === base) return sessionFileAddress(sessionId, '')
  if (base !== '' && normalized.startsWith(`${base}/`)) return sessionFileAddress(sessionId, normalized.slice(base.length + 1))
  return sessionFileAddress(sessionId, normalized)
}

function join(parent: string, name: string): string {
  return `${parent.replace(/[/\\]+$/, '')}/${name}`
}

function parentOf(path: string): string {
  const trimmed = path.replace(/[/\\]+$/, '')
  const index = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\'))
  return index <= 0 ? trimmed : trimmed.slice(0, index)
}

function same(left: string, right: string): boolean {
  const normal = (path: string): string => path.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase()
  return normal(left) === normal(right)
}

function formatSize(size: number | undefined): string {
  if (size === undefined) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function failureText(error: Extract<ListResult, { ok: false }>['error']): string {
  const code = typeof error === 'string' ? error : error.code ?? ''
  if (code === 'workspace-file/not-found') return t('找不到该文件夹。')
  if (code === 'workspace-file/outside-workspace') return t('该位置在工作区之外。')
  if (code === 'workspace-file/not-directory') return t('这不是文件夹。')
  return t('无法读取该文件夹。')
}

export interface ExplorerController {
  showPlace(place: Place): void
  /** Re-read the session's workspace root; a changed root resets navigation. */
  sessionChanged(): void
  dispose(): void
}

/**
 * Wire one explorer. Every listener, the remote binding and any in-flight
 * listing belong to this activation and are released by `dispose`.
 */
export function installExplorer(
  ctx: Context,
  surface: ExplorerSurface,
  deps: {
    session(): ExplorerSession | undefined
    openFile(address: string): boolean
    renderPictures(): void
  },
): ExplorerController {
  const parts = PARTS.get(surface.root)!
  let remote: WorkspaceFilesRemote | undefined
  let place: Place = 'workspace'
  let root: string | undefined
  let sessionId: string | undefined
  let history: string[] = []
  let cursor = -1
  let listing: AbortController | undefined
  let selected: string | undefined

  const current = (): string | undefined => history[cursor]
  const syncChrome = (): void => {
    surface.root.dataset.explorerPlace = place
    for (const [key, button] of Object.entries(parts.places)) button.setAttribute('aria-current', String(key === place))
    const path = current()
    const inWorkspace = place === 'workspace'
    parts.back.disabled = !inWorkspace || cursor <= 0
    parts.forward.disabled = !inWorkspace || cursor >= history.length - 1
    parts.up.disabled = !inWorkspace || path === undefined || root === undefined || same(path, root)
    parts.refresh.disabled = inWorkspace && path === undefined
    setText(parts.address, inWorkspace ? (path ?? t('（没有工作区）')) : () => t('我的图片'))
  }
  const showMessage = (text: string | undefined): void => {
    parts.message.hidden = text === undefined
    if (text !== undefined) setText(parts.message, text)
  }
  const select = (name: string | undefined): void => {
    selected = name
    for (const item of parts.list.querySelectorAll<HTMLElement>('[data-explorer-entry]')) {
      item.setAttribute('aria-selected', String(item.dataset.explorerEntry === name))
    }
  }

  const render = (entries: readonly Entry[], truncated: boolean): void => {
    const sorted = [...entries].sort((left, right) => (left.type === 'directory' ? 0 : 1) - (right.type === 'directory' ? 0 : 1)
      || left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' }))
    parts.list.replaceChildren(...sorted.map((entry) => {
      const item = element('button', css.explorerItem)
      item.type = 'button'
      item.setAttribute('role', 'option')
      item.setAttribute('aria-selected', 'false')
      item.dataset.explorerEntry = entry.name
      item.dataset.explorerType = entry.type
      const meta = entry.type === 'directory' ? t('文件夹') : formatSize(entry.size)
      item.append(
        icon(entry.type === 'directory' ? FOLDER_ICON : FILE_ICON, css.explorerItemIcon),
        element('span', css.explorerItemName, entry.name),
        element('span', css.explorerItemMeta, meta),
      )
      item.title = entry.name
      return item
    }))
    showMessage(sorted.length === 0 ? t('此文件夹为空。') : undefined)
    setText(parts.status, () => truncated
      ? t('{0} 个对象（列表已截断）', sorted.length)
      : t('{0} 个对象', sorted.length))
  }

  const load = (): void => {
    listing?.abort()
    listing = undefined
    selected = undefined
    syncChrome()
    if (place !== 'workspace') return
    const path = current()
    parts.list.replaceChildren()
    if (sessionId === undefined || path === undefined) {
      showMessage(t('请先选择一个带工作区的会话。'))
      setText(parts.status, '')
      return
    }
    if (remote === undefined) {
      showMessage(t('正在连接文件服务…'))
      return
    }
    const controller = new AbortController()
    listing = controller
    showMessage(t('正在读取…'))
    const id = sessionId
    void remote.workspaceFiles.list(id, path, controller.signal).then((result) => {
      if (listing !== controller || controller.signal.aborted) return
      listing = undefined
      if (result.ok) render(result.value.entries, result.value.truncated)
      else {
        showMessage(failureText(result.error))
        setText(parts.status, '')
      }
    }, () => {
      if (listing !== controller) return
      listing = undefined
      showMessage(t('无法读取该文件夹。'))
    })
  }

  const navigate = (path: string): void => {
    history = [...history.slice(0, cursor + 1), path]
    cursor = history.length - 1
    load()
  }

  const showPlace = (next: Place): void => {
    place = next
    if (next === 'pictures') {
      listing?.abort()
      listing = undefined
      deps.renderPictures()
      setText(parts.status, () => t('{0} 张图片', surface.pictureGrid.childElementCount))
      syncChrome()
      return
    }
    load()
  }

  const sessionChanged = (): void => {
    const session = deps.session()
    const nextRoot = session?.cwd
    if (session?.id === sessionId && nextRoot === root) return
    sessionId = session?.id
    root = nextRoot
    history = root === undefined ? [] : [root]
    cursor = history.length - 1
    if (place === 'workspace') load()
    else syncChrome()
  }

  const activate = (item: HTMLElement): void => {
    const name = item.dataset.explorerEntry
    const path = current()
    if (name === undefined || path === undefined || sessionId === undefined) return
    const target = join(path, name)
    if (item.dataset.explorerType === 'directory') navigate(target)
    else if (item.dataset.explorerType === 'file' && !deps.openFile(workspaceFileAddress(sessionId, root, target))) {
      showMessage(t('宿主未启用文件预览。'))
    }
  }

  const onClick = (event: MouseEvent): void => {
    const target = event.target instanceof Element ? event.target : null
    const item = target?.closest<HTMLElement>('[data-explorer-entry]')
    if (item != null && parts.list.contains(item)) {
      // XP opens on double click; a second click on the selected item (and
      // touch, which has no dblclick) does the same.
      if (event.detail >= 2 || selected === item.dataset.explorerEntry && event.detail === 0) activate(item)
      else select(item.dataset.explorerEntry)
      return
    }
    const action = target?.closest<HTMLElement>('[data-explorer-action]')?.dataset.explorerAction
    if (action === 'back' && cursor > 0) { cursor -= 1; load() }
    else if (action === 'forward' && cursor < history.length - 1) { cursor += 1; load() }
    else if (action === 'up') {
      const path = current()
      if (path !== undefined && root !== undefined && !same(path, root)) navigate(parentOf(path))
    } else if (action === 'refresh') showPlace(place)
    const placeButton = target?.closest<HTMLElement>('[data-explorer-place-button]')?.dataset.explorerPlaceButton
    if (placeButton === 'workspace' || placeButton === 'pictures') showPlace(placeButton)
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    const item = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-explorer-entry]') : null
    if (item === null) {
      if (event.key === 'Backspace' && place === 'workspace' && !(event.target instanceof HTMLInputElement)) {
        event.preventDefault()
        parts.up.click()
      }
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      activate(item)
    } else if (event.key === 'Backspace') {
      event.preventDefault()
      parts.up.click()
    }
  }
  const onFocusIn = (event: FocusEvent): void => {
    const item = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-explorer-entry]') : null
    if (item !== null) select(item.dataset.explorerEntry)
  }
  surface.root.addEventListener('click', onClick)
  surface.root.addEventListener('keydown', onKeyDown)
  surface.root.addEventListener('focusin', onFocusIn)

  let disposed = false
  // The namespace is its own injection (as in the host's files tab): waiting
  // only for `remote` can bind before `workspaceFiles` exists.
  ctx.inject(['remote', 'remote.workspaceFiles'], (scope) => {
    const bound = scope.get('remote') as WorkspaceFilesRemote | undefined
    if (bound?.workspaceFiles?.list === undefined) return
    remote = bound
    if (!disposed && place === 'workspace') load()
    return () => {
      if (remote === bound) {
        remote = undefined
        listing?.abort()
        listing = undefined
      }
    }
  })
  sessionChanged()
  if (history.length === 0) load()

  return {
    showPlace,
    sessionChanged,
    dispose: () => {
      disposed = true
      listing?.abort()
      listing = undefined
      surface.root.removeEventListener('click', onClick)
      surface.root.removeEventListener('keydown', onKeyDown)
      surface.root.removeEventListener('focusin', onFocusIn)
    },
  }
}
