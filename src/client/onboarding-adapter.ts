import { isChinese, setText, setAttr } from './i18n.ts'
const ONBOARDING_SURFACE = 'data-ngo-onboarding-surface'
const ONBOARDING_ACTION = 'data-ngo-onboarding-action'
const LOGIN_FIELDS = 'data-ngo-login-fields'
const LOGIN_CARD = 'data-ngo-login-card'
const LOGIN_EDITOR = 'data-ngo-login-editor'
const LOGIN_FIELD = 'data-ngo-login-field'
const LOGIN_API_KEY = 'data-ngo-login-api-key'

type OnboardingKind = 'notice' | 'login'

function setOwnedAttribute(
  owned: Set<Element>,
  element: Element | null | undefined,
  name: string,
  value = '',
): void {
  if (element === null || element === undefined) return
  element.setAttribute(name, value)
  owned.add(element)
}

function decorateSurface(
  owned: Set<Element>,
  section: HTMLElement,
  kind: OnboardingKind,
): void {
  setOwnedAttribute(owned, section, ONBOARDING_SURFACE, kind)
  setOwnedAttribute(owned, section.closest("[role='presentation']"), ONBOARDING_SURFACE, kind)
}

function makeLoginFields(): HTMLDivElement {
  const fields = document.createElement('div')
  fields.setAttribute(LOGIN_FIELDS, '')
  fields.setAttribute('aria-hidden', 'true')

  const account = document.createElement('div')
  account.dataset.ngoLoginRow = 'account'
  const accountLabel = document.createElement('span')
  setText(accountLabel, () => isChinese() ? '账号' : 'ACCOUNT')
  const accountValue = document.createElement('strong')
  accountValue.textContent = 'DeepSeek'
  account.append(accountLabel, accountValue)

  const password = document.createElement('div')
  password.dataset.ngoLoginRow = 'password'
  const passwordLabel = document.createElement('span')
  setText(passwordLabel, () => isChinese() ? '密码' : 'PASSWORD')
  const passwordValue = document.createElement('strong')
  passwordValue.textContent = '••••••••••••'
  password.append(passwordLabel, passwordValue)

  fields.append(account, password)
  return fields
}

function decorateWelcome(owned: Set<Element>): void {
  const title = document.getElementById('welcome-notice-title')
  const section = title?.closest<HTMLElement>("section[role='region']")
  if (section === undefined || section === null) return
  decorateSurface(owned, section, 'notice')
  const action = section.querySelector<HTMLButtonElement>('button')
  setOwnedAttribute(owned, action, ONBOARDING_ACTION, 'accept')
}

function decorateLoginPrompt(owned: Set<Element>, ownedNodes: Set<Element>): void {
  const title = document.getElementById('deepseek-onboarding-title')
  const section = title?.closest<HTMLElement>("section[role='region']")
  if (section === undefined || section === null) return
  decorateSurface(owned, section, 'login')

  if (section.querySelector(`[${LOGIN_FIELDS}]`) === null) {
    const fields = makeLoginFields()
    section.querySelector('p')?.after(fields)
    ownedNodes.add(fields)
  }

  const buttons = [...section.querySelectorAll<HTMLButtonElement>('button')]
  const guest = buttons.at(0)
  const login = buttons.at(-1)
  setOwnedAttribute(owned, guest, ONBOARDING_ACTION, 'guest')
  setOwnedAttribute(owned, login, ONBOARDING_ACTION, 'login')
  if (guest !== undefined) setAttr(guest, 'data-ngo-onboarding-label', () => isChinese() ? '游客登录' : 'Guest')
  if (login !== undefined) setAttr(login, 'data-ngo-onboarding-label', () => isChinese() ? '输入 API KEY' : 'Enter API Key')
}

function isDeepSeekEditor(editor: HTMLElement): boolean {
  const copy = (editor.textContent ?? '').replace(/\s+/g, ' ')
  return /deepseek/i.test(copy)
}

function decorateApiKeyEditor(owned: Set<Element>): void {
  const settings = document.querySelector<HTMLElement>("[data-slot='sidebar.settings']")
  if (settings === null) return
  for (const input of settings.querySelectorAll<HTMLInputElement>("input[type='password']")) {
    const field = input.parentElement
    const editor = field?.parentElement
    if (field === null || field === undefined || editor === null || editor === undefined) continue
    if (!isDeepSeekEditor(editor)) continue
    setOwnedAttribute(owned, input, LOGIN_API_KEY)
    setOwnedAttribute(owned, field, LOGIN_FIELD)
    setOwnedAttribute(owned, editor, LOGIN_EDITOR)
    setOwnedAttribute(owned, editor.closest('li'), LOGIN_CARD)
  }
}

/**
 * Projects DSH-owned first-run controls into the game's caution/login chrome
 * without replacing their buttons, secret input, persistence or callbacks.
 */
export function installOnboardingAdapter(): () => void {
  const owned = new Set<Element>()
  const ownedNodes = new Set<Element>()
  const sync = (): void => {
    decorateWelcome(owned)
    decorateLoginPrompt(owned, ownedNodes)
    decorateApiKeyEditor(owned)
  }
  const observer = new MutationObserver(sync)
  observer.observe(document.body, { childList: true, subtree: true })
  sync()

  return () => {
    observer.disconnect()
    for (const node of ownedNodes) node.remove()
    for (const element of owned) {
      element.removeAttribute(ONBOARDING_SURFACE)
      element.removeAttribute(ONBOARDING_ACTION)
      element.removeAttribute(LOGIN_CARD)
      element.removeAttribute(LOGIN_EDITOR)
      element.removeAttribute(LOGIN_FIELD)
      element.removeAttribute(LOGIN_API_KEY)
      element.removeAttribute('data-ngo-onboarding-label')
    }
  }
}
