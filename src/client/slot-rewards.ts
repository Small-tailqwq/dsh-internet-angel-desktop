import { t, setText, setAttr, isChinese, type UiText } from './i18n.ts'
import { BOMB_ANIMATION } from './bomb-animation.generated.ts'
import type { SlotBonus } from './medicine-slot.ts'

const TAROT_CARDS = [["愚者", "The Fool"], ["魔术师", "The Magician"], ["女祭司", "The High Priestess"], ["皇后", "The Empress"], ["皇帝", "The Emperor"], ["教皇", "The Hierophant"], ["恋人", "The Lovers"], ["战车", "The Chariot"], ["正义", "Justice"], ["隐者", "The Hermit"], ["命运之轮", "Wheel of Fortune"], ["力量", "Strength"], ["倒吊人", "The Hanged Man"], ["死神", "Death"], ["节制", "Temperance"], ["恶魔", "The Devil"], ["高塔", "The Tower"], ["星星", "The Stars"], ["月亮", "The Moon"], ["太阳", "The Sun"], ["审判", "Judgement"], ["世界", "The World"]] as const
const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"] as const

export const WEB_SPIDER_THRESHOLD = 8

const webSpokes = Array.from({ length: 8 }, (_, i) => {
  const angle = i * Math.PI / 4
  return `<path d="M32 32L${32 + Math.cos(angle) * 29} ${32 + Math.sin(angle) * 29}"/>`
}).join('')
const webRings = [9, 18, 27].map(radius => `<polygon points="${Array.from({ length: 8 }, (_, i) => {
  const angle = i * Math.PI / 4
  return `${32 + Math.cos(angle) * radius},${32 + Math.sin(angle) * radius}`
}).join(' ')}"/>`).join('')
export const WEB_ICON = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><g fill="none" stroke="#30476b" stroke-width="4">${webSpokes}${webRings}</g><g fill="none" stroke="#d9f3ff" stroke-width="2">${webSpokes}${webRings}</g><circle cx="32" cy="32" r="3" fill="#81cbff"/></svg>`)}`

interface Spider {
  node: HTMLSpanElement
  x: number
  y: number
  tx: number
  ty: number
  nextMove: number
  born: number
}

interface RewardOptions {
  desktop: HTMLElement
  internet: HTMLButtonElement
  origin: HTMLElement
  spiderSprite: string
  webIcon: string
  cardSprite: string
  machine(): { outlet: HTMLElement; stage: HTMLElement; breakMachine(): void }
  webcam: HTMLElement
  onWebcamBomb(): void
  onBombGrab(): void
  bombSprite: string
  achievementMasks: readonly [string, string]
  onAchievement(): void
  onBombSound(event: 'drop' | 'explode' | 'explode-glitch'): void
}

/** One desktop activation owns its colony, web and achievement presentation. */
export function createSlotRewards(classes: Record<string, string | undefined>, options: RewardOptions) {
  const layer = document.createElement('div')
  layer.className = classes.rewardLayer ?? ''
  layer.dataset.slotRewards = ''

  options.desktop.append(layer)
  const icon = options.internet.querySelector('img')!
  const originalIcon = icon.src
  const originalTitle = options.internet.getAttribute('title')
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let spiders: Spider[] = []
  let bombs: Array<{ node: HTMLElement; handle: HTMLButtonElement; x: number; y: number; moved: boolean; elapsed: number; lastFrame: number; dropped: boolean; exploded: boolean }> = []
  let phase: 'roaming' | 'gathering' | 'weaving' | 'complete' = 'roaming'
  let phaseStarted = 0
  let frame = 0
  let lastTime = 0
  let disposed = false
  let toast: HTMLElement | undefined
  const timers = new Set<number>()
  const later = (action: () => void, delay: number) => {
    const timer = window.setTimeout(() => { timers.delete(timer); if (!disposed) action() }, delay)
    timers.add(timer)
  }
  const make = (tag: 'div' | 'span', className: string, text?: UiText) => {
    const node = document.createElement(tag)
    node.className = classes[className] ?? ''
    if (text) setText(node, text)
    return node
  }
  // Offset geometry keeps the colony and icons in the same desktop coordinates,
  // including while medicine effects transform their common ancestors.
  const center = (element: HTMLElement) => {
    let x = element.offsetWidth / 2
    let y = element.offsetHeight / 2
    let cursor: HTMLElement | null = element
    while (cursor && cursor !== options.desktop) {
      x += cursor.offsetLeft
      y += cursor.offsetTop
      cursor = cursor.offsetParent as HTMLElement | null
    }
    return { x, y }
  }
  // Three local probes invert the shared desktop transform for pointer input.
  const probes = [[0, 0], [100, 0], [0, 100]].map(([x, y]) => {
    const probe = document.createElement('span')
    probe.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none`
    layer.append(probe)
    return probe
  })
  const localPoint = (x: number, y: number) => {
    const [o, a, b] = probes.map(probe => probe.getBoundingClientRect())
    const ax = (a!.x - o!.x) / 100, ay = (a!.y - o!.y) / 100
    const bx = (b!.x - o!.x) / 100, by = (b!.y - o!.y) / 100
    const det = ax * by - ay * bx
    return { x: ((x - o!.x) * by - (y - o!.y) * bx) / det,
      y: ((y - o!.y) * ax - (x - o!.x) * ay) / det }
  }
  const outletPoint = () => {
    const rect = options.machine().outlet.getBoundingClientRect()
    return localPoint(rect.x, rect.y)
  }
  const web = make('div', 'wovenWeb')
  web.style.backgroundImage = `url(${JSON.stringify(options.webIcon)})`
  const announce = () => {
    toast?.remove()
    toast = make('div', 'rareAchievement')
    toast.dataset.slotAchievement = 'world-wide-web'
    toast.setAttribute('role', 'status')
    toast.setAttribute('aria-live', 'polite')
    const badge = make('span', 'achievementBadge')
    badge.setAttribute('aria-hidden', 'true')
    const glowRoot = make('span', 'achievementGlowRoot')
    const glowRotation = make('span', 'achievementGlowRotation')
    glowRoot.style.setProperty('--achievement-mask-root', `url(${JSON.stringify(options.achievementMasks[0])})`)
    glowRoot.style.setProperty('--achievement-mask-rotate', `url(${JSON.stringify(options.achievementMasks[1])})`)
    glowRotation.append(make('span', 'achievementGlow'))
    glowRoot.append(glowRotation)
    const badgeImage = make('span', 'achievementBadgeImage')
    badgeImage.style.backgroundImage = `url(${JSON.stringify(options.webIcon)})`
    badge.append(glowRoot, badgeImage)
    const copy = make('div', 'achievementCopy')
    copy.append(make('span', 'achievementName', 'World Wide Web'),
      make('span', 'achievementDescription', () => t('现在是真的「因特网」了。')))
    toast.append(badge, copy)
    options.desktop.append(toast)
    options.onAchievement()
    const notification = toast
    later(() => { notification.remove(); if (toast === notification) toast = undefined }, 8000)
  }
  const finish = () => {
    phase = 'complete'
    layer.dataset.colonyPhase = phase
    icon.src = options.webIcon
    options.internet.dataset.internetWeb = ''
    setAttr(options.internet, 'title', () => t('World Wide Web · 由八位小小站长织成'))
    for (const spider of spiders) spider.node.remove()
    spiders = []
    web.remove()
    announce()
  }
  const bombScale = 2
  const paintBomb = (node: HTMLElement, index: number) => {
    const size = BOMB_ANIMATION.cell * bombScale
    node.style.backgroundPosition = `${-(index % BOMB_ANIMATION.columns) * size}px ${-Math.floor(index / BOMB_ANIMATION.columns) * size}px`
  }
  const updateBombs = (elapsed: number) => {
    bombs = bombs.filter(bomb => {
      if (!bomb.moved && !bomb.exploded) Object.assign(bomb, outletPoint())
      bomb.node.style.left = `${bomb.x}px`
      bomb.node.style.top = `${bomb.y}px`
      bomb.elapsed += elapsed
      const index = Math.floor(bomb.elapsed * BOMB_ANIMATION.fps / 1000)
      if (!bomb.dropped && index >= BOMB_ANIMATION.dropFrame) {
        bomb.dropped = true
        options.onBombSound('drop')
      }
      if (!bomb.exploded && index >= BOMB_ANIMATION.explosion.start) {
        bomb.exploded = true
        bomb.handle.remove()
        const machine = options.machine()
        const rect = machine.stage.getBoundingClientRect()
        const corners = [localPoint(rect.left, rect.top), localPoint(rect.right, rect.bottom)]
        const left = Math.min(corners[0]!.x, corners[1]!.x), right = Math.max(corners[0]!.x, corners[1]!.x)
        const top = Math.min(corners[0]!.y, corners[1]!.y), bottom = Math.max(corners[0]!.y, corners[1]!.y)
        const distance = Math.hypot(bomb.x - Math.max(left, Math.min(right, bomb.x)), bomb.y - Math.max(top, Math.min(bottom, bomb.y)))
        if (!bomb.moved || distance < 56) machine.breakMachine()
        let webcamHit = false
        if (bomb.moved) {
          // Hit-test the visible camera content after removing the drag handle.
          const [o, a, b] = probes.map(probe => probe.getBoundingClientRect())
          const x = o!.x + (a!.x - o!.x) * bomb.x / 100 + (b!.x - o!.x) * (bomb.y - 24) / 100
          const y = o!.y + (a!.y - o!.y) * bomb.x / 100 + (b!.y - o!.y) * (bomb.y - 24) / 100
          const target = document.elementFromPoint(x, y)
          webcamHit = target !== null && options.webcam.contains(target)
        }
        options.onBombSound(webcamHit ? 'explode-glitch' : 'explode')
        if (webcamHit) options.onWebcamBomb()
      }
      const end = BOMB_ANIMATION.explosion.start + BOMB_ANIMATION.explosion.frames
      if (index >= end) { bomb.node.remove(); return false }
      if (index !== bomb.lastFrame) {
        bomb.lastFrame = index
        bomb.node.dataset.bombPhase = index < BOMB_ANIMATION.pulse.start ? 'appear'
          : index < BOMB_ANIMATION.explode.start ? 'pulse'
            : index < BOMB_ANIMATION.explosion.start ? 'burst' : 'explosion'
        // Reduced motion keeps the fuse duration and sound cues without strobing.
        paintBomb(bomb.node, motion.matches
          ? bomb.exploded ? BOMB_ANIMATION.explosion.start + 4 : BOMB_ANIMATION.appear.frames - 1
          : index)
        bomb.node.style.opacity = motion.matches && bomb.exploded
          ? String(1 - (index - BOMB_ANIMATION.explosion.start) / BOMB_ANIMATION.explosion.frames) : '1'
      }
      return true
    })
  }
  const tick = (now: number) => {
    frame = 0
    if (disposed || document.hidden) return
    if (!bombs.length && now - lastTime < 1000 / 30) { frame = requestAnimationFrame(tick); return }
    const elapsed = lastTime === 0 ? 0 : now - lastTime
    const dt = Math.min(.06, elapsed / 1000)
    lastTime = now
    updateBombs(elapsed)
    const width = layer.clientWidth
    const height = layer.clientHeight
    const target = phase === 'gathering' || phase === 'weaving' ? center(icon) : null
    let allArrived = true
    spiders = spiders.filter(spider => {
      if (phase === 'complete' && now - spider.born > 20000) { spider.node.remove(); return false }
      return true
    })
    spiders.forEach((spider, index) => {
      if (target) {
        const angle = index / spiders.length * Math.PI * 2 + (phase === 'weaving' ? (now - phaseStarted) / 750 : 0)
        const radius = phase === 'weaving' ? 30 * Math.max(0, 1 - (now - phaseStarted) / 3200) : 34
        spider.tx = target.x + Math.cos(angle) * radius
        spider.ty = target.y + Math.sin(angle) * radius
      } else if (now >= spider.nextMove) {
        spider.tx = Math.max(20, Math.min(width - 20, spider.x + (Math.random() - .5) * 260))
        spider.ty = Math.max(20, Math.min(height - 70, spider.y + (Math.random() - .5) * 220))
        spider.nextMove = now + 700 + Math.random() * 1300
      }
      const dx = spider.tx - spider.x
      const dy = spider.ty - spider.y
      const distance = Math.hypot(dx, dy)
      const step = motion.matches ? distance : Math.min(distance, (target ? 250 : 110) * dt)
      if (distance > 1) { spider.x += dx / distance * step; spider.y += dy / distance * step }
      if (distance > 6) allArrived = false
      spider.node.style.transform = `translate(${spider.x - 32}px, ${spider.y - 16}px)`
      spider.node.style.backgroundPositionX = `${motion.matches || distance < 2 ? 0 : -64 * (Math.floor(now / 70 + index) % 5)}px`
    })
    if (phase === 'gathering' && allArrived && target) {
      phase = 'weaving'
      phaseStarted = now
      layer.dataset.colonyPhase = phase
      layer.append(web)
    }
    if (phase === 'weaving' && target) {
      const progress = Math.min(1, (now - phaseStarted) / (motion.matches ? 600 : 3200))
      web.style.transform = `translate(${target.x - 32}px, ${target.y - 32}px)`
      web.style.clipPath = `circle(${progress * 72}% at 50% 50%)`
      if (progress >= 1) finish()
    }
    if (spiders.length || bombs.length) frame = requestAnimationFrame(tick)
  }
  const wake = () => {
    if (!frame && (spiders.length || bombs.length) && !document.hidden) { lastTime = 0; frame = requestAnimationFrame(tick) }
  }
  const onVisibility = () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
    else wake()
  }
  document.addEventListener('visibilitychange', onVisibility)
  const award = (reward: SlotBonus) => {
    if (disposed) return
    const point = reward === 'spiders' ? center(options.origin) : outletPoint()
    if (reward === 'spiders') {
      for (let i = 0; i < 2 && spiders.length < 24; i++) {
        const node = make('span', 'blueSpider')
        node.dataset.blueSpider = ''
        node.style.backgroundImage = `url(${JSON.stringify(options.spiderSprite)})`
        layer.append(node)
        const x = Math.max(24, Math.min(layer.clientWidth - 24, point.x + (i * 2 - 1) * 30))
        const y = Math.max(24, Math.min(layer.clientHeight - 70, point.y))
        spiders.push({ node, x, y, tx: x, ty: y, nextMove: 0, born: performance.now() })
      }
      if (phase === 'roaming' && spiders.length >= WEB_SPIDER_THRESHOLD) phase = 'gathering'
      layer.dataset.colonyPhase = phase
      wake()
      return
    }
    if (reward === 'bomb') {
      const node = make('div', 'trollBomb')
      node.dataset.bombPhase = 'appear'
      node.style.left = `${point.x}px`
      node.style.top = `${point.y}px`
      node.style.width = node.style.height = `${BOMB_ANIMATION.cell * bombScale}px`
      node.style.transform = `translate(${-BOMB_ANIMATION.anchor[0] * bombScale}px, ${-BOMB_ANIMATION.anchor[1] * bombScale}px)`
      node.style.backgroundImage = `url(${JSON.stringify(options.bombSprite)})`
      node.style.backgroundSize = `${BOMB_ANIMATION.cell * BOMB_ANIMATION.columns * bombScale}px ${BOMB_ANIMATION.cell * BOMB_ANIMATION.rows * bombScale}px`
      paintBomb(node, motion.matches ? BOMB_ANIMATION.appear.frames - 1 : 0)
      layer.append(node)
      const handle = document.createElement('button')
      handle.type = 'button'
      handle.className = classes.bombHandle ?? ''
      setAttr(handle, 'aria-label', () => t('拖走炸弹！'))
      setAttr(handle, 'title', () => t('拖走炸弹！'))
      node.append(handle)
      const bomb = { node, handle, x: point.x, y: point.y, moved: false, elapsed: 0, lastFrame: -1, dropped: false, exploded: false }
      let drag: { id: number; dx: number; dy: number } | undefined
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || bomb.exploded || drag) return
        event.preventDefault()
        event.stopPropagation()
        options.onBombGrab()
        const pointer = localPoint(event.clientX, event.clientY)
        drag = { id: event.pointerId, dx: pointer.x - bomb.x, dy: pointer.y - bomb.y }
        handle.setPointerCapture(event.pointerId)
      })
      handle.addEventListener('pointermove', event => {
        if (!drag || drag.id !== event.pointerId || bomb.exploded) return
        const pointer = localPoint(event.clientX, event.clientY)
        bomb.x = Math.max(24, Math.min(layer.clientWidth - 24, pointer.x - drag.dx))
        bomb.y = Math.max(48, Math.min(layer.clientHeight - 24, pointer.y - drag.dy))
        bomb.moved = true
        node.style.left = `${bomb.x}px`
        node.style.top = `${bomb.y}px`
      })
      const release = () => { drag = undefined }
      handle.addEventListener('pointerup', release)
      handle.addEventListener('pointercancel', release)
      handle.addEventListener('lostpointercapture', release)
      bombs.push(bomb)
      wake()
      return
    }
    const pickup = make('div', 'fortuneCard')
    pickup.style.left = `${point.x}px`
    pickup.style.top = `${point.y}px`
    const index = Math.floor(Math.random() * TAROT_CARDS.length)
    const card = TAROT_CARDS[index]!
    const title = () => `${ROMAN[index]} · ${isChinese() ? card[0] : card[1]}`
    pickup.dataset.tarotCard = String(index)
    const image = make('span', 'tarotFront')
    image.style.backgroundImage = `url(${JSON.stringify(options.cardSprite)})`
    image.style.backgroundPositionX = `${-index * 64}px`
    pickup.append(image, make('span', 'fortuneText', title))
    layer.append(pickup)
    later(() => pickup.remove(), 4500)
    return title
  }
  return {
    award,
    previewAchievement: announce,
    dispose() {
      disposed = true
      cancelAnimationFrame(frame)
      for (const timer of timers) window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      layer.remove()
      toast?.remove()
      icon.src = originalIcon
      delete options.internet.dataset.internetWeb
      if (originalTitle === null) options.internet.removeAttribute('title')
      else options.internet.title = originalTitle
      spiders = []
      bombs = []
    },
  }
}
