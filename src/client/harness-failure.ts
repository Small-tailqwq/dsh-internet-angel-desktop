const HARNESS_FAILURE_ATTRIBUTE = 'data-ngo-harness-failure'
const HARNESS_BOOT_SELECTOR = '[data-dsh-boot]'
const FAILURE_COPY = 'Failed to load plugins'

/** Project the framework-owned fatal boot report into the skin's blue-screen state. */
export function installHarnessFailureBlueScreen(): () => void {
  const sync = (): void => {
    const boots = [...document.querySelectorAll<HTMLElement>(HARNESS_BOOT_SELECTOR)]
    const active = boots.find(boot => (boot.textContent ?? '').includes(FAILURE_COPY))
    boots.forEach((boot) => {
      const failed = (boot.textContent ?? '').includes(FAILURE_COPY)
      boot.toggleAttribute(HARNESS_FAILURE_ATTRIBUTE, failed)
    })
    document.body.toggleAttribute(HARNESS_FAILURE_ATTRIBUTE, active !== undefined)
    active?.setAttribute('role', 'alert')
    active?.setAttribute('aria-live', 'assertive')
  }

  const observer = new MutationObserver(sync)
  observer.observe(document.body, { childList: true, subtree: true, characterData: true })
  sync()

  return () => {
    observer.disconnect()
    document.body.removeAttribute(HARNESS_FAILURE_ATTRIBUTE)
    document.querySelectorAll<HTMLElement>(`[${HARNESS_FAILURE_ATTRIBUTE}]`).forEach((node) => {
      node.removeAttribute(HARNESS_FAILURE_ATTRIBUTE)
    })
  }
}
