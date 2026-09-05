// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'

beforeEach(() => { document.documentElement.lang = 'zh-CN' })
import { createPoketterHeader, decoratePoketterStage, poketterCss, renderPoketter } from '../src/client/poketter-surface.ts'

describe('POKETTER surface', () => {
  it('renders completed turns newest-first with original Poketter decorations', () => {
    const source = document.createElement('div')
    source.className = '_markdown_fixture_5'
    source.id = 'official-markdown'
    source.innerHTML = '<p>最终正文</p><button>复制</button><span id="nested-id">正文</span>'
    const surface = document.createElement('div')

    const newer = source.cloneNode(true) as HTMLElement
    newer.id = 'newer-markdown'
    newer.querySelector('p')!.textContent = '第二轮正文'
    renderPoketter(surface, [
      { source: newer, orderLabel: '第 2 轮', time: '16:19' },
      { source, orderLabel: '第 1 轮', time: '15:38' },
    ], 'empty-surface')

    const articles = [...surface.querySelectorAll<HTMLElement>('[data-poketter-post]')]
    const article = articles[0]
    expect(articles).toHaveLength(2)
    expect(article).not.toBeNull()
    expect(article?.classList.contains(poketterCss.card ?? '')).toBe(true)
    expect(article?.textContent).toContain('第二轮正文')
    expect(article?.textContent).toContain('💙糖糖💙 🔑 @raincandy_U')
    expect(article?.textContent).toContain('第 2 轮 · 16:19')
    expect(articles[1]?.textContent).toContain('最终正文')
    expect(article?.querySelector('button')).toBeNull()
    expect(article?.querySelector('[id]')).toBeNull()
    expect(surface.querySelector('[data-poketter-empty]')).toBeNull()
  })

  it('renders the original embedded Poketter logo with a translated label', () => {
    const header = createPoketterHeader()
    const avatar = header.querySelector('img')

    expect(avatar?.src).toMatch(/^data:image\/png;base64,/)
    expect(avatar?.alt).toBe('Poketter')
    expect(avatar?.src).not.toContain('codex-ngo-reference')
  })

  it('keeps the scenery on the fixed stage instead of the scrolling feed', () => {
    const stage = document.createElement('div')
    const feed = document.createElement('div')

    decoratePoketterStage(stage)
    renderPoketter(feed, [], 'empty-surface')

    expect(stage.style.backgroundImage).toContain('data:image/png;base64,')
    expect(feed.style.backgroundImage).toBe('')
  })
})
