import { isChinese, setText } from './i18n.ts'
import type { Context } from 'cordis'
import {
  NGO_BOOT_BACKGROUND,
  NGO_BOOT_BIOS,
  NGO_BOOT_BIOS_LOGO,
  NGO_BOOT_CAUTION_BACKGROUND,
  NGO_BOOT_CAUTION_BUTTON,
  NGO_BOOT_CAUTION_BUTTON_HOVERED,
  NGO_BOOT_CAUTION_BUTTON_PRESSED,
  NGO_BOOT_CAUTION_FRAME,
  NGO_BOOT_CAUTION_ICON,
  NGO_FONT_PRESS_START_2P,
  NGO_PIEN_TUTORIAL,
  NGO_TOOLTIP_BALLOON,
} from './art.generated.ts'
import type { Sfx } from './sfx.ts'
import css from './skin.module.css'

const TOOLTIP_TARGET = 'data-ngo-bright-tooltip'
const THEME_CHOICE = 'data-ngo-theme-choice'
const DARK_THEME_ATTRIBUTE = 'data-ds-dark-theme'
const BOOT_COPY_PREFIX = 'Booting Windose20'
const BOOT_COPY_DOTS = '.............................'
const BIOS_LEAD_IN_MS = 1_400
const BIOS_TYPING_MS = 8_000
const SPLASH_FADE_IN_MS = 2_200
const SPLASH_HOLD_MS = 7_000
const SPLASH_FADE_OUT_MS = 200
const HOST_THEME_ADOPTION_GRACE_MS = 1_500
const CAUTION_COPY_ZH = `本皮肤是由粉丝社区制作的非官方二次创作，仅供个人娱乐与非商业使用。
本皮肤与《主播女孩重度依赖》及其制作组、发行方和其他权利人均无授权、赞助或官方合作关系；原作的角色、名称、美术与相关素材权利归相应权利人所有。
DSH（DeepSeek Harness）是由 DeepSeek AI 开发的开源智能体框架。本皮肤仅运行于 DSH；皮肤作者及参与维护的粉丝社区与 DeepSeek AI 没有隶属、授权、赞助、背书或官方合作关系。
本项目只是运行于 DSH 的界面皮肤，不是《主播女孩重度依赖》的网页复刻、移植或游戏版本，也无意替代原作。
严禁将本皮肤或其中素材用于销售、广告、付费服务、再授权或任何其他商业用途。
继续使用即表示你已理解以上说明，并愿意尊重原作、社区项目与所有相关权利人。
来，跟你可爱的当代互联网小天使拉勾勾！`

const CAUTION_COPY_EN = `This is an unofficial fan-made skin created by the community for personal entertainment and non-commercial use only.
This skin is not affiliated with, authorized by, sponsored by, endorsed by, or officially associated with NEEDY GIRL OVERDOSE, its developers, publishers, or other rights holders. All rights in the original characters, names, artwork, and related materials belong to their respective owners.
DeepSeek Harness (DSH) is an open-source agent harness developed by DeepSeek AI. This skin merely runs on DSH; the skin authors and contributing fan community are not affiliated with, authorized by, sponsored by, endorsed by, or officially associated with DeepSeek AI.
This project is only a user-interface skin for DSH. It is not a web remake, port, or game version of NEEDY GIRL OVERDOSE, and is not intended to replace the original work.
Do not use this skin or any included materials for sales, advertising, paid services, sublicensing, or any other commercial purpose.
By continuing, you confirm that you understand this notice and will respect the original work, the community project, and all relevant rights holders.
Now pinky-promise your adorable Internet Angel!`

interface ThemeBridge {
  getTheme?(): {
    preference?: string
    fontSize?: number
    revision?: number
  }
  setTheme(id: string): void
}

export interface LightModeLock {
  syncSettings(): void
  restart(): void
  shutdown(): void
  crashWebcam(): void
  dispose(): void
}

function textOf(node: Element): string {
  return (node.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function replaceChoiceLabel(button: HTMLButtonElement, labels: readonly string[], replacement: string): void {
  const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current !== null) {
    const currentLabel = (current.nodeValue ?? '').trim()
    if (labels.includes(currentLabel)) {
      if (currentLabel !== replacement) current.nodeValue = replacement
      if (button.getAttribute('aria-label') !== replacement) button.setAttribute('aria-label', replacement)
      return
    }
    current = walker.nextNode()
  }
}

function isEnglishUi(lightText: string, darkText: string): boolean {
  return ['Light', 'Dark', 'Darkness'].includes(lightText)
    || ['Light', 'Dark', 'Darkness'].includes(darkText)
    || document.documentElement.lang.toLowerCase().startsWith('en')
}

function tooltipCopy(target?: HTMLElement | null): string {
  const english = document.documentElement.lang.toLowerCase().startsWith('en')
  return (english ? target?.dataset.ngoTooltipEn : target?.dataset.ngoTooltipZh)
    ?? (english ? 'Your future is bright.' : '你的前途是光明的。')
}

function makeTooltip(): HTMLDivElement {
  const tooltip = document.createElement('div')
  tooltip.className = css.brightTooltip ?? ''
  tooltip.dataset.ngoBrightTooltipPopup = ''
  tooltip.setAttribute('role', 'tooltip')
  tooltip.setAttribute('aria-hidden', 'true')

  const balloon = document.createElement('span')
  balloon.className = css.brightTooltipBalloon ?? ''
  balloon.style.borderImageSource = NGO_TOOLTIP_BALLOON.cssUrl
  const copy = document.createElement('span')
  copy.className = css.brightTooltipCopy ?? ''
  copy.textContent = tooltipCopy()
  balloon.append(copy)
  const cat = document.createElement('img')
  cat.className = css.brightTooltipCat ?? ''
  cat.src = NGO_PIEN_TUTORIAL.dataUri
  cat.alt = ''
  cat.setAttribute('aria-hidden', 'true')
  tooltip.append(balloon, cat)
  return tooltip
}

function makeBootOverlay(dshVersion: string): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.className = css.lightBootOverlay ?? ''
  overlay.dataset.ngoLightBoot = ''
  overlay.dataset.bootStage = 'bios'
  overlay.setAttribute('role', 'status')
  overlay.setAttribute('aria-label', 'Restarting in light mode')
  overlay.style.setProperty('--ngo-boot-caution-button', NGO_BOOT_CAUTION_BUTTON.cssUrl)
  overlay.style.setProperty('--ngo-boot-caution-button-hovered', NGO_BOOT_CAUTION_BUTTON_HOVERED.cssUrl)
  overlay.style.setProperty('--ngo-boot-caution-button-pressed', NGO_BOOT_CAUTION_BUTTON_PRESSED.cssUrl)

  const fontFace = document.createElement('style')
  fontFace.dataset.bootFont = 'press-start-2p'
  fontFace.textContent = `@font-face{font-family:'NgoPressStart2P';src:url(${JSON.stringify(NGO_FONT_PRESS_START_2P.dataUri)}) format('woff2');font-style:normal;font-weight:400;font-display:block}`
  overlay.append(fontFace)

  const bios = document.createElement('div')
  bios.className = css.bootFrame ?? ''
  bios.dataset.bootPart = 'bios'
  const biosImage = document.createElement('img')
  biosImage.src = NGO_BOOT_BIOS.dataUri
  biosImage.alt = ''
  biosImage.setAttribute('aria-hidden', 'true')
  const biosLogo = document.createElement('img')
  biosLogo.className = css.bootBiosLogo ?? ''
  biosLogo.dataset.bootBiosLogo = ''
  biosLogo.src = NGO_BOOT_BIOS_LOGO.dataUri
  biosLogo.alt = ''
  biosLogo.setAttribute('aria-hidden', 'true')
  const biosVersion = document.createElement('span')
  biosVersion.className = css.bootBiosVersion ?? ''
  biosVersion.dataset.bootBiosVersion = ''
  biosVersion.textContent = dshVersion
  biosVersion.setAttribute('aria-hidden', 'true')
  const bootCopy = document.createElement('span')
  bootCopy.className = css.bootingText ?? ''
  bootCopy.dataset.bootCopy = ''
  bootCopy.textContent = BOOT_COPY_PREFIX
  bootCopy.setAttribute('aria-hidden', 'true')
  bios.append(biosImage, biosLogo, biosVersion, bootCopy)
  overlay.append(bios)

  const splash = document.createElement('div')
  splash.dataset.bootPart = 'splash'
  splash.setAttribute('aria-hidden', 'true')
  const splashImage = document.createElement('img')
  splashImage.className = css.bootSplashImage ?? ''
  splashImage.src = NGO_BOOT_BACKGROUND.dataUri
  splashImage.alt = ''
  splash.append(splashImage)
  overlay.append(splash)

  const caution = document.createElement('section')
  caution.className = css.bootCautionStage ?? ''
  caution.dataset.bootPart = 'caution'
  caution.setAttribute('role', 'dialog')
  caution.setAttribute('aria-modal', 'true')
  caution.setAttribute('aria-labelledby', 'ngo-boot-caution-title')
  const cautionBackground = document.createElement('img')
  cautionBackground.className = css.bootCautionBackground ?? ''
  cautionBackground.src = NGO_BOOT_CAUTION_BACKGROUND.dataUri
  cautionBackground.alt = ''
  cautionBackground.setAttribute('aria-hidden', 'true')
  const cautionWindow = document.createElement('div')
  cautionWindow.className = css.bootCautionWindow ?? ''
  cautionWindow.style.borderImageSource = NGO_BOOT_CAUTION_FRAME.cssUrl
  const cautionWindowTitle = document.createElement('div')
  cautionWindowTitle.className = css.bootCautionWindowTitle ?? ''
  cautionWindowTitle.textContent = 'Caution'
  const cautionContent = document.createElement('div')
  cautionContent.className = css.bootCautionContent ?? ''
  const cautionHeading = document.createElement('div')
  cautionHeading.className = css.bootCautionHeading ?? ''
  const cautionIcon = document.createElement('img')
  cautionIcon.src = NGO_BOOT_CAUTION_ICON.dataUri
  cautionIcon.alt = ''
  cautionIcon.setAttribute('aria-hidden', 'true')
  const cautionTitle = document.createElement('h2')
  cautionTitle.id = 'ngo-boot-caution-title'
  setText(cautionTitle, () => isChinese() ? '！使用声明！' : 'Usage Notice!')
  cautionHeading.append(cautionIcon, cautionTitle)
  const cautionCopy = document.createElement('p')
  setText(cautionCopy, () => isChinese() ? CAUTION_COPY_ZH : CAUTION_COPY_EN)
  const cautionActions = document.createElement('div')
  cautionActions.className = css.bootCautionActions ?? ''
  for (const action of ['decline', 'accept'] as const) {
    const button = document.createElement('button')
    button.className = css.bootCautionButton ?? ''
    button.dataset.bootAction = action
    button.type = 'button'
    setText(button, () => action === 'decline'
      ? isChinese() ? '不同意' : 'Decline'
      : isChinese() ? '同意' : 'Agree')
    cautionActions.append(button)
  }
  cautionContent.append(cautionHeading, cautionCopy, cautionActions)
  cautionWindow.append(cautionWindowTitle, cautionContent)
  caution.append(cautionBackground, cautionWindow)
  overlay.append(caution)

  const blueScreen = document.createElement('section')
  blueScreen.className = css.shutdownBlueScreen ?? ''
  blueScreen.dataset.bootPart = 'blue-screen'
  const blueScreenCopy = document.createElement('div')
  blueScreenCopy.className = css.shutdownBlueScreenCopy ?? ''
  blueScreenCopy.dataset.shutdownBlueScreenCopy = ''
  blueScreenCopy.textContent = `A problem has been detected and Windose20 has been shut down
to prevent damage to your Internet Angel desktop.

If this is the first time you've seen this Stop error screen,
the current DSH session has already been saved safely.

Check JINE for unfinished messages. Remove any newly installed
memories or harmful thoughts. If problems continue, ask Ame to
restart Windose20 and try the session again.

Technical information:

*** STOP: 0x0000007B (0x0000AME, 0x0000JINE, 0x0000DSH)

Refresh this tab to restart Windose20.`
  blueScreen.append(blueScreenCopy)
  overlay.append(blueScreen)
  overlay.querySelectorAll<HTMLElement>('[data-boot-part]').forEach((part) => {
    part.style.pointerEvents = 'none'
  })
  return overlay
}

/**
 * Locks the official appearance control to the game's intentionally bright
 * desktop. All preference writes still go through DSH's theme service.
 */
export function installLightModeLock(ctx: Context, sfx?: Sfx): LightModeLock {
  const body = document.body
  const tooltip = makeTooltip()
  body.append(tooltip)

  let activeTooltipTarget: HTMLElement | null = null
  let rebooting = false
  let bootOverlay: HTMLDivElement | null = null
  const dshVersion = typeof __DSH_VERSION__ === 'string' ? __DSH_VERSION__ : 'DSH'
  let tooltipTimer: number | null = null
  let themeAdoptionTimer: number | null = null
  const timers = new Set<number>()
  let tooltipPointer = { x: 0, y: 0 }

  const positionTooltip = (x: number, y: number): void => {
    tooltipPointer = { x, y }
    const balloon = tooltip.querySelector<HTMLElement>(`.${css.brightTooltipBalloon ?? ''}`)
    const balloonWidth = balloon?.offsetWidth ?? 0
    const balloonHeight = balloon?.offsetHeight ?? 0
    // The original tutorial cat sits just above-right of the pointer while the
    // nine-slice balloon grows left/up from it. Measure the rendered copy so a
    // short hint no longer reserves the old fixed 314x114 rectangle.
    const width = Math.max(62, balloonWidth + 62)
    const height = Math.max(64, balloonHeight)
    tooltip.style.width = `${width}px`
    tooltip.style.height = `${height}px`
    const preferredLeft = x - (width - 62)
    const preferredTop = y - height
    const left = Math.max(9, Math.min(window.innerWidth - width - 9, preferredLeft))
    const top = Math.max(9, Math.min(window.innerHeight - height - 9, preferredTop))
    tooltip.style.left = `${Math.round(left)}px`
    tooltip.style.top = `${Math.round(top)}px`
  }

  const findTarget = (target: EventTarget | null): HTMLElement | null => target instanceof Element
    ? target.closest<HTMLElement>(`[${TOOLTIP_TARGET}]`)
    : null

  const onPointerOver = (event: PointerEvent): void => {
    const target = findTarget(event.target)
    if (target === null) return
    if (target === activeTooltipTarget) return
    if (tooltipTimer !== null) window.clearTimeout(tooltipTimer)
    activeTooltipTarget = target
    positionTooltip(event.clientX, event.clientY)
    tooltipTimer = window.setTimeout(() => {
      tooltipTimer = null
      if (activeTooltipTarget !== target) return
      tooltip.querySelector<HTMLElement>(`.${css.brightTooltipCopy ?? ''}`)!.textContent = tooltipCopy(target)
      positionTooltip(tooltipPointer.x, tooltipPointer.y)
      tooltip.setAttribute('aria-hidden', 'false')
      tooltip.dataset.visible = ''
      const hint = target.getAttribute(TOOLTIP_TARGET) ?? ''
      sfx?.play(hint.startsWith('tutorial_') ? 'popTutorial' : 'popTooltip')
    }, 150)
  }
  const onPointerMove = (event: PointerEvent): void => {
    if (activeTooltipTarget !== null) positionTooltip(event.clientX, event.clientY)
  }
  const onPointerOut = (event: PointerEvent): void => {
    if (activeTooltipTarget === null) return
    const related = event.relatedTarget
    if (related instanceof Node && activeTooltipTarget.contains(related)) return
    activeTooltipTarget = null
    if (tooltipTimer !== null) window.clearTimeout(tooltipTimer)
    tooltipTimer = null
    tooltip.removeAttribute('data-visible')
    tooltip.setAttribute('aria-hidden', 'true')
  }
  const blockDarkChoice = (event: Event): void => {
    const target = event.target instanceof Element
      ? event.target.closest<HTMLElement>(`[${THEME_CHOICE}='dark']`)
      : null
    if (target === null) return
    event.preventDefault()
    event.stopImmediatePropagation()
  }

  const syncSettings = (): void => {
    const dialog = document.querySelector<HTMLElement>("[data-slot='sidebar.settings'] [role='dialog']")
      ?? document.querySelector<HTMLElement>("[role='dialog']")
    if (dialog === null) return

    const buttons = [...dialog.querySelectorAll<HTMLButtonElement>('button')]
    const light = buttons.find(button => ['浅色', '光明', 'Light'].includes(textOf(button)))
    const dark = buttons.find(button => ['深色', '黑暗', 'Dark', 'Darkness'].includes(textOf(button)))
    if (light !== undefined && dark !== undefined) {
      const english = isEnglishUi(textOf(light), textOf(dark))
      replaceChoiceLabel(light, ['浅色', '光明', 'Light'], english ? 'Light' : '光明')
      replaceChoiceLabel(dark, ['深色', '黑暗', 'Dark', 'Darkness'], english ? 'Darkness' : '黑暗')
      light.setAttribute(THEME_CHOICE, 'light')
      dark.setAttribute(THEME_CHOICE, 'dark')
      dark.setAttribute(TOOLTIP_TARGET, 'darkness')
      if (dark.getAttribute('aria-disabled') !== 'true') dark.setAttribute('aria-disabled', 'true')
      dark.disabled = true
      dark.tabIndex = -1
    }

  }

  const startBootSequence = (forceLight: boolean, outcome: 'restart' | 'shutdown' | 'webcam-bomb' = 'restart'): void => {
    if (rebooting) return
    if (themeAdoptionTimer !== null) {
      window.clearTimeout(themeAdoptionTimer)
      themeAdoptionTimer = null
    }
    rebooting = true
    bootOverlay = makeBootOverlay(dshVersion)
    body.append(bootOverlay)
    if (outcome !== 'webcam-bomb') sfx?.play('biosPiko')

    if (forceLight) {
      const theme = ctx.get('theme') as ThemeBridge | undefined
      if (theme !== undefined) theme.setTheme('light')
      else document.querySelector<HTMLButtonElement>(`[${THEME_CHOICE}='light']`)?.click()
    }

    const schedule = (callback: () => void, delay: number): void => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }

    const clearBootTimers = (): void => {
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
    }
    const closeTab = (): void => {
      clearBootTimers()
      if (navigator.userAgent.toLowerCase().includes('jsdom')) {
        bootOverlay?.remove()
        bootOverlay = null
        rebooting = false
        return
      }
      window.open('', '_self')?.close()
      window.close()
      window.setTimeout(() => {
        if (!window.closed) window.location.replace('about:blank')
      }, 0)
    }
    const showShutdownBlueScreen = (): void => {
      clearBootTimers()
      if (bootOverlay === null) return
      bootOverlay.dataset.bootStage = 'blue-screen'
      bootOverlay.setAttribute('aria-label', 'Windose20 fatal shutdown; refresh the tab to restart')
    }
    if (outcome === 'webcam-bomb') {
      const copy = bootOverlay.querySelector<HTMLElement>('[data-shutdown-blue-screen-copy]')
      if (copy) setText(copy, (copy.textContent ?? '')
        .replace(`If this is the first time you've seen this Stop error screen,
the current DSH session has already been saved safely.`,
        "I can't believe you would do something like this.")
        .replace(`Check JINE for unfinished messages. Remove any newly installed
memories or harmful thoughts. If problems continue, ask Ame to
restart Windose20 and try the session again.`,
        `An unexpected explosive device was detected in the webcam.
Remove all bombs from the camera area before restarting Windose20.`)
        .replace('0x0000007B (0x0000AME, 0x0000JINE, 0x0000DSH)',
          '0x000000B0 (WEBCAM_BOMB_DETECTED, 0x0000BOOM, 0x0000DSH)'))
      showShutdownBlueScreen()
      return
    }
    const finish = (): void => {
      if (outcome === 'shutdown') {
        showShutdownBlueScreen()
        return
      }
      clearBootTimers()
      if (navigator.userAgent.toLowerCase().includes('jsdom')) {
        bootOverlay?.remove()
        bootOverlay = null
        rebooting = false
        return
      }
      window.location.reload()
    }
    const decline = (): void => {
      sfx?.play('piporo')
      if (outcome === 'shutdown') {
        showShutdownBlueScreen()
        return
      }
      closeTab()
    }
    const showCaution = (): void => {
      clearBootTimers()
      if (bootOverlay === null) return
      sfx?.play('bootCaution')
      bootOverlay.dataset.bootStage = 'caution'
      const caution = bootOverlay.querySelector<HTMLElement>("[data-boot-part='caution']")
      if (caution !== null) caution.style.pointerEvents = 'auto'
      caution?.querySelector<HTMLButtonElement>("[data-boot-action='accept']")?.focus()
    }
    const showSplash = (): void => {
      clearBootTimers()
      if (bootOverlay === null) return
      bootOverlay.dataset.bootStage = 'blackout'
      schedule(() => {
        if (bootOverlay !== null) bootOverlay.dataset.bootStage = 'splash'
        sfx?.play('boot')
      }, 50)
      schedule(() => {
        if (bootOverlay !== null) bootOverlay.dataset.bootStage = 'splash-out'
      }, 50 + SPLASH_FADE_IN_MS + SPLASH_HOLD_MS)
      schedule(showCaution, 50 + SPLASH_FADE_IN_MS + SPLASH_HOLD_MS + SPLASH_FADE_OUT_MS)
    }
    const finishBios = (): void => {
      if (outcome === 'shutdown') showShutdownBlueScreen()
      else showSplash()
    }

    const bootCopy = bootOverlay.querySelector<HTMLElement>('[data-boot-copy]')
    schedule(() => sfx?.play('biosHdd'), BIOS_LEAD_IN_MS)
    schedule(() => {
      const startedAt = performance.now()
      const typingTimer = window.setInterval(() => {
        const linearProgress = Math.min(1, (performance.now() - startedAt) / BIOS_TYPING_MS)
        const easedProgress = 1 - (1 - linearProgress) ** 2
        const dotCount = Math.min(BOOT_COPY_DOTS.length, Math.floor(easedProgress * BOOT_COPY_DOTS.length))
        if (bootCopy !== null) {
          bootCopy.textContent = BOOT_COPY_PREFIX + BOOT_COPY_DOTS.slice(0, dotCount)
        }
        if (linearProgress < 1) return
        window.clearInterval(typingTimer)
        timers.delete(typingTimer)
      }, 50)
      timers.add(typingTimer)
    }, BIOS_LEAD_IN_MS)
    schedule(finishBios, BIOS_LEAD_IN_MS + BIOS_TYPING_MS)

    const skipBoot = (): void => {
      const currentStage = bootOverlay?.dataset.bootStage
      if (currentStage === 'blue-screen') return
      if (currentStage === 'bios') finishBios()
      else if (outcome === 'shutdown') showShutdownBlueScreen()
      else if (currentStage !== 'caution') showCaution()
    }
    bootOverlay.querySelectorAll<HTMLButtonElement>('[data-boot-action]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        if (button.dataset.bootAction === 'decline') decline()
        else finish()
      })
    })
    bootOverlay.addEventListener('click', skipBoot)
  }

  const enforceLightMode = (allowInitialSystemSnapshot = false): void => {
    if (!body.hasAttribute(DARK_THEME_ATTRIBUTE)) {
      if (themeAdoptionTimer !== null) window.clearTimeout(themeAdoptionTimer)
      themeAdoptionTimer = null
      return
    }

    const snapshot = (ctx.get('theme') as ThemeBridge | undefined)?.getTheme?.()
    const awaitingHostPreference = snapshot?.preference === 'system'
      && snapshot.revision === 0
      && typeof snapshot.fontSize === 'number'
    if (awaitingHostPreference && !allowInitialSystemSnapshot) {
      if (themeAdoptionTimer === null) {
        themeAdoptionTimer = window.setTimeout(() => {
          themeAdoptionTimer = null
          enforceLightMode(true)
        }, HOST_THEME_ADOPTION_GRACE_MS)
      }
      return
    }

    startBootSequence(true)
  }

  const darkObserver = new MutationObserver(() => {
    enforceLightMode()
  })
  darkObserver.observe(body, { attributes: true, attributeFilter: [DARK_THEME_ATTRIBUTE] })

  document.addEventListener('pointerover', onPointerOver, true)
  document.addEventListener('pointermove', onPointerMove, true)
  document.addEventListener('pointerout', onPointerOut, true)
  document.addEventListener('click', blockDarkChoice, true)
  syncSettings()
  enforceLightMode()

  return {
    syncSettings,
    restart(): void {
      startBootSequence(false)
    },
    shutdown(): void {
      startBootSequence(false, 'shutdown')
    },
    crashWebcam(): void {
      startBootSequence(false, 'webcam-bomb')
    },
    dispose(): void {
      darkObserver.disconnect()
      for (const timer of timers) window.clearTimeout(timer)
      timers.clear()
      if (tooltipTimer !== null) window.clearTimeout(tooltipTimer)
      if (themeAdoptionTimer !== null) window.clearTimeout(themeAdoptionTimer)
      document.removeEventListener('pointerover', onPointerOver, true)
      document.removeEventListener('pointermove', onPointerMove, true)
      document.removeEventListener('pointerout', onPointerOut, true)
      document.removeEventListener('click', blockDarkChoice, true)
      document.querySelectorAll<HTMLElement>(`[${TOOLTIP_TARGET}], [${THEME_CHOICE}]`).forEach((node) => {
        node.removeAttribute(TOOLTIP_TARGET)
        node.removeAttribute(THEME_CHOICE)
      })
      tooltip.remove()
      bootOverlay?.remove()
    },
  }
}
