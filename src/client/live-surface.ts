import { t, setText, setAttr, type UiText } from './i18n.ts'
import css from './live-surface.module.css'

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: UiText,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) setText(node, text)
  return node
}

export interface LiveSurface {
  surface: HTMLDivElement
  feed: HTMLDivElement
  stateLabel: HTMLSpanElement
}

/**
 * Build the static NGO-style live page shell. It deliberately has no topic
 * chooser, API bridge, viewer state or copied community assets: only the
 * layout slots that can safely host DSH's own think/tool/intermediate feed.
 */
export function buildLiveSurface(onScrollClick?: () => void): LiveSurface {
  const surface = element('div', css.liveSurface ?? '')
  surface.dataset.skinSurface = 'live'

  const header = element('div', css.liveHeader ?? '')
  const heading = element('div', css.liveHeading ?? '')
  heading.append(
    element('span', css.liveStatusDot ?? ''),
    element('strong', css.liveTitle ?? '', 'LIVE'),
    element('span', css.liveSubtitle ?? '', () => t('DSH 中间播报')),
  )
  const stateLabel = element('span', css.liveState ?? '', () => t('准备就绪'))
  stateLabel.dataset.liveState = ''
  header.append(heading, stateLabel)

  const viewport = element('div', css.liveViewport ?? '')
  const preview = element('div', css.livePreview ?? '')
  preview.append(
    element('span', css.livePreviewEyebrow ?? '', 'COMMUNITY LIVE'),
    element('strong', css.livePreviewTitle ?? '', 'THINK / TOOL / UPDATE'),
    element('span', css.livePreviewCopy ?? '', 'DSH feed only · no external bridge'),
  )
  const feed = element('div', css.liveFeed ?? '')
  feed.dataset.skinSurface = 'live-feed'
  feed.setAttribute('aria-live', 'polite')
  viewport.append(preview, feed)

  const footer = element('div', css.liveFooter ?? '')
  const viewer = element('span', css.liveViewer ?? '', () => t('DSH LIVE · 连接中'))
  viewer.dataset.liveViewer = ''
  const controls = element('div', css.liveControls ?? '')
  const scrollButton = element('button', css.liveControl ?? '', () => t('跳至最新'))
  scrollButton.type = 'button'
  scrollButton.dataset.liveAction = 'latest'
  setAttr(scrollButton, 'aria-label', () => t('跳至最新直播消息'))
  controls.append(scrollButton)
  footer.append(viewer, controls)

  surface.append(header, viewport, footer)
  scrollButton.addEventListener('click', () => {
    onScrollClick?.()
    feed.scrollTop = feed.scrollHeight
  })
  return { surface, feed, stateLabel }
}

export function buildLiveComment(text: UiText, kind: string, running = false): HTMLDivElement {
  const comment = element('div', `${css.liveComment ?? ''}${running ? ` ${css.liveRunning ?? ''}` : ''}`)
  comment.dataset.liveKind = kind
  const label = kind === 'think' ? 'THINK' : kind === 'tool' ? 'TOOL' : 'UPDATE'
  comment.append(
    element('span', css.liveCommentLabel ?? '', label),
    element('span', css.liveCommentText ?? '', text),
  )
  return comment
}

export function buildLiveEmpty(text: UiText): HTMLDivElement {
  return element('div', css.liveEmpty ?? '', text)
}

export function setLiveState(surface: LiveSurface, running: boolean, hasEntries: boolean): void {
  setText(surface.stateLabel, () => running ? t('思考中…') : hasEntries ? t('已同步') : t('等待输入'))
  surface.stateLabel.dataset.liveState = running ? 'running' : hasEntries ? 'ready' : 'empty'
}
