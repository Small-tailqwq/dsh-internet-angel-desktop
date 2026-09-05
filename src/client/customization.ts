import { t, isChinese, onLocaleChange } from './i18n.ts'
/**
 * Zero-dependency browser seam for dsh-deep-whale/skin-manager.
 *
 * The manager discovers this declaration by dispatching the same custom events
 * used by the published protocol. The skin intentionally does not import the
 * manager package: the skin must stay independently bundleable and hot-unload
 * symmetric. Without the manager installed no one applies the settings, so the
 * audio easter-egg stays at its default (muted) values.
 */
import type { DailyTransitionEmphasis, DailyTransitionWeekday } from './daily-transition.ts'

export const SKIN_CUSTOMIZATION_PROTOCOL = 2 as const
export const REGISTER_EVENT = 'dsh:skin-customization-register-v2'
export const UNREGISTER_EVENT = 'dsh:skin-customization-unregister-v2'
export const READY_EVENT = 'dsh:skin-customization-ready-v2'

interface SettingBase<T> {
  key: string
  label: string
  description?: string
  defaultValue: T
  disabledWhen?: string
  visibleWhen?: { key: string, values: Array<boolean | string | number> }
  legacyValue?: { key: string, map: Record<string, T> }
}

export interface RangeSetting extends SettingBase<number> {
  type: 'range'
  min: number
  max: number
  step?: number
  unit?: string
}

export interface SelectSetting extends SettingBase<string> {
  type: 'select'
  options: Array<{ value: string, label: string }>
}

export interface BooleanSetting extends SettingBase<boolean> {
  type: 'boolean'
}

export interface ColorSetting extends SettingBase<string> {
  type: 'color'
}

export interface CheckboxGroupSetting extends SettingBase<string[]> {
  type: 'checkbox-group'
  options: Array<{ value: string, label: string }>
}

export type SkinSetting = RangeSetting | SelectSetting | BooleanSetting | ColorSetting | CheckboxGroupSetting
export type SkinSettingValue = number | boolean | string | string[]
export type SkinValues = Record<string, SkinSettingValue>

export interface SkinCustomizationState {
  values: SkinValues
  visibility: Record<string, boolean>
}

export interface SkinCustomizationDefinition {
  protocol: typeof SKIN_CUSTOMIZATION_PROTOCOL
  skinId: string
  title: string
  settings: SkinSetting[]
  apply(state: SkinCustomizationState | null): void
}

interface Registration {
  token: object
  definition: SkinCustomizationDefinition
}

function exposeSkinCustomization(
  definition: SkinCustomizationDefinition,
  target: Window = window,
): () => void {
  const token = {}
  const register = (): void => {
    target.dispatchEvent(new CustomEvent<Registration>(REGISTER_EVENT, { detail: { token, definition } }))
  }
  target.addEventListener(READY_EVENT, register)
  register()
  const stopLocale = onLocaleChange(register)
  return () => {
    stopLocale()
    target.removeEventListener(READY_EVENT, register)
    target.dispatchEvent(new CustomEvent<Registration>(UNREGISTER_EVENT, { detail: { token, definition } }))
    definition.apply(null)
  }
}

export interface SkinCustomizationSink {
  setVolumes(bgm: number, se: number): void
  setFont(font: 'dinkie' | 'zpix'): void
  setWebcam(character: 'ame' | 'cho', peakPricing: boolean): void
  setDailyTransition(
    showWeekday: boolean,
    emphasis: DailyTransitionEmphasis,
    emphasizedWeekdays: DailyTransitionWeekday[],
    emphasisColor: string,
  ): void
}

const DAILY_TRANSITION_WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

export function installSkinCustomization(sink: SkinCustomizationSink): () => void {
  const apply = (state: SkinCustomizationState | null): void => {
    if (state === null) {
      sink.setVolumes(0, 0)
      sink.setFont('dinkie')
      sink.setWebcam('ame', false)
      sink.setDailyTransition(true, 'weekend', [], '#ff536f')
      return
    }
    const bgm = typeof state.values.bgmVolume === 'number' ? state.values.bgmVolume : 0
    const se = typeof state.values.sfxVolume === 'number' ? state.values.sfxVolume : 0
    const font = state.values.font === 'zpix' ? 'zpix' : 'dinkie'
    const character = state.values.webcamCharacter === 'cho' ? 'cho' : 'ame'
    const showWeekday = state.values.dailyTransitionWeekdayVisible !== false
    const emphasis: DailyTransitionEmphasis = state.values.dailyTransitionEmphasis === 'custom'
      || state.values.dailyTransitionEmphasis === 'off'
      ? state.values.dailyTransitionEmphasis
      : 'weekend'
    const selectedWeekdays = Array.isArray(state.values.dailyTransitionCustomWeekdays)
      ? state.values.dailyTransitionCustomWeekdays
      : []
    const emphasizedWeekdays = DAILY_TRANSITION_WEEKDAYS
      .filter(weekday => selectedWeekdays.includes(weekday))
    const emphasisColor = typeof state.values.dailyTransitionWeekendColor === 'string'
      && /^#[0-9a-f]{6}$/i.test(state.values.dailyTransitionWeekendColor)
      ? state.values.dailyTransitionWeekendColor
      : '#ff536f'
    sink.setVolumes(bgm, se)
    sink.setFont(font)
    sink.setWebcam(character, state.values.peakPricing === true)
    sink.setDailyTransition(showWeekday, emphasis, emphasizedWeekdays, emphasisColor)
  }

  return exposeSkinCustomization({
    protocol: SKIN_CUSTOMIZATION_PROTOCOL,
    skinId: 'internet-angel-desktop',
    get title() { return t('超绝网络天使桌面') },
    settings: [
      {
        key: 'font',
        type: 'select',
        get label() { return t('界面字体') },
        get description() { return t('Zpix 由 SolidZORO 创作，个人非商业项目免费使用；默认字体保持原有画面。') },
        defaultValue: 'dinkie',
        options: [
          { value: 'dinkie', get label() { return t('DinkieBitmap 9px（默认）') } },
          { value: 'zpix', get label() { return t('Zpix 最像素 12px') } },
        ],
      },
      {
        key: 'dailyTransitionWeekdayVisible',
        type: 'boolean',
        get label() { return t('星期显示') },
        get description() { return t('控制换日历中的星期标签是否显示。') },
        defaultValue: true,
        legacyValue: {
          key: 'dailyTransitionWeekday',
          map: { weekend: true, weekday: true, uniform: false },
        },
      },
      {
        key: 'dailyTransitionEmphasis',
        type: 'select',
        get label() { return t('星期强调') },
        get description() { return t('选择周末、指定星期或关闭日期强调。') },
        defaultValue: 'weekend',
        legacyValue: {
          key: 'dailyTransitionWeekday',
          map: { weekend: 'weekend', weekday: 'off', uniform: 'off' },
        },
        options: [
          { value: 'weekend', get label() { return t('周末') } },
          { value: 'custom', get label() { return t('自定义') } },
          { value: 'off', get label() { return isChinese() ? '关闭' : 'Off' } },
        ],
      },
      {
        key: 'dailyTransitionCustomWeekdays',
        type: 'checkbox-group',
        get label() { return t('强调逻辑') },
        get description() { return t('勾选需要使用强调色的星期。') },
        defaultValue: [],
        visibleWhen: { key: 'dailyTransitionEmphasis', values: ['custom'] },
        options: [
          { value: 'mon', get label() { return t('周一') } },
          { value: 'tue', get label() { return t('周二') } },
          { value: 'wed', get label() { return t('周三') } },
          { value: 'thu', get label() { return t('周四') } },
          { value: 'fri', get label() { return t('周五') } },
          { value: 'sat', get label() { return t('周六') } },
          { value: 'sun', get label() { return t('周日') } },
        ],
      },
      {
        key: 'dailyTransitionWeekendColor',
        type: 'color',
        get label() { return t('强调色') },
        get description() { return t('用于当前强调逻辑命中的日期。') },
        defaultValue: '#ff536f',
        visibleWhen: { key: 'dailyTransitionEmphasis', values: ['weekend', 'custom'] },
      },
      {
        key: 'bgmVolume',
        type: 'range',
        get label() { return t('BGM 音量') },
        get description() { return t('桌面循环 BGM 音量；0 为关闭。') },
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
      },
      {
        key: 'sfxVolume',
        type: 'range',
        get label() { return t('音效音量') },
        get description() { return t('窗口与事件音效音量；0 为关闭。') },
        defaultValue: 0,
        min: 0,
        max: 100,
        step: 1,
        unit: '%',
      },
      {
        key: 'webcamCharacter',
        type: 'select',
        get label() { return t('webcam 角色') },
        get description() { return t('选择常驻 webcam 的直播角色；开启峰谷定价后由高峰时段自动覆盖，手动选择会被锁定。') },
        defaultValue: 'ame',
        disabledWhen: 'peakPricing',
        options: [
          { value: 'ame', get label() { return t('糖糖（Ame）') } },
          { value: 'cho', get label() { return t('超天酱（KAngel）') } },
        ],
      },
      {
        key: 'peakPricing',
        type: 'boolean',
        get label() { return t('峰谷定价自动切换') },
        get description() { return t('北京时间周一至周五 9:00–12:00、14:00–18:00 为高峰，webcam 显示超天酱；其余空闲时段显示糖糖。') },
        defaultValue: false,
      },
    ],
    apply,
  })
}
