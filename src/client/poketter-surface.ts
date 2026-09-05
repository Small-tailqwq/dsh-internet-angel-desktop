import { t, setText, setAttr, type UiText } from './i18n.ts'
import {
  NGO_POKETTER_AME_AVATAR,
  NGO_POKETTER_BACKGROUND,
  NGO_POKETTER_DIVIDER,
  NGO_POKETTER_FAVORITE,
  NGO_POKETTER_LOGO,
  NGO_POKETTER_RETWEET,
} from './art.generated.ts'
import css from './poketter-surface.module.css'

export const poketterCss = css

export interface PoketterPost {
  source: Element
  orderLabel: string
  time: string
  identity?: PoketterIdentity
}

export interface PoketterIdentity {
  avatarCssUrl: string
  displayName: string
  handle: string
}

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

/** The original app uses a bitmap POKETTER logo rather than an account strip. */
export function createPoketterHeader(): HTMLDivElement {
  const header = element('div', css.header ?? '')
  const logo = element('img', css.logo ?? '')
  logo.src = NGO_POKETTER_LOGO.dataUri
  logo.alt = 'Poketter'
  header.append(logo)
  return header
}

/** Keep the original Poketter scenery on the fixed stage, outside the scrolling paper. */
export function decoratePoketterStage(stage: HTMLElement): void {
  stage.style.backgroundImage = NGO_POKETTER_BACKGROUND.cssUrl
}

function sanitizeFinalMarkdown(source: Element): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  clone.querySelectorAll('[id]').forEach(node => { node.removeAttribute('id') })
  clone.querySelectorAll('button').forEach(node => { node.remove() })
  clone.removeAttribute('data-streaming')
  return clone
}

function stat(className: string, iconSource: string, label: UiText): HTMLSpanElement {
  const item = element('span', className)
  const icon = element('img', css.statIcon ?? '')
  icon.src = iconSource
  setAttr(icon, 'alt', label)
  item.append(icon, element('span', css.statNumber ?? '', '0'))
  return item
}

function renderPost(post: PoketterPost): HTMLElement {
  const article = element('article', css.card ?? '')
  article.dataset.poketterPost = ''
  const identity = post.identity
  const avatar = identity === undefined
    ? element('img', css.postAvatar ?? '')
    : element('span', `${css.postAvatar ?? ''} ${css.subagentAvatar ?? ''}`)
  if (avatar instanceof HTMLImageElement) {
    avatar.src = NGO_POKETTER_AME_AVATAR.dataUri
    avatar.alt = ''
  } else {
    avatar.style.backgroundImage = identity!.avatarCssUrl
    avatar.setAttribute('aria-hidden', 'true')
  }
  const main = element('div', css.postMain ?? '')
  const meta = element('div', css.meta ?? '', () => identity === undefined
    ? t('💙糖糖💙 🔑 @raincandy_U')
    : `${identity.displayName} @${identity.handle}`)
  const content = element('div', css.content ?? '')
  content.append(sanitizeFinalMarkdown(post.source))
  const stats = element('div', css.stats ?? '')
  stats.append(
    stat(`${css.stat ?? ''} ${css.retweet ?? ''}`, NGO_POKETTER_RETWEET.dataUri, () => t('转推')),
    stat(`${css.stat ?? ''} ${css.favorite ?? ''}`, NGO_POKETTER_FAVORITE.dataUri, () => t('收藏')),
  )
  const date = element('div', css.date ?? '', `${post.orderLabel}${post.time === '' ? '' : ` · ${post.time}`}`)
  const divider = element('div', css.divider ?? '')
  divider.style.backgroundImage = NGO_POKETTER_DIVIDER.cssUrl
  main.append(meta, content, stats, date, divider)
  article.append(avatar, main)
  return article
}

/** Rebuild the full completed-turn timeline, newest post first like SetAsFirstSibling. */
export function renderPoketter(
  surface: HTMLElement,
  posts: readonly PoketterPost[],
  emptyClass: string,
): void {
  const previousTop = surface.scrollTop
  surface.replaceChildren(...posts.map(renderPost))
  if (posts.length === 0) {
    const empty = element('div', emptyClass, () => t('每轮对话结束后，糖糖会把大总结发布在这里。'))
    empty.dataset.poketterEmpty = ''
    surface.append(empty)
  }
  surface.scrollTop = previousTop
}
