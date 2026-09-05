import { t, setText, setAttr, isChinese, resolveText, installLocale, onLocaleChange, type UiText } from './i18n.ts'
/**
 * Internet Angel Desktop keeps DSH's official controls as the source of truth,
 * but projects their visible transcript into game-shaped JINE, livestream and
 * POKETTER surfaces. The projection is presentation-only: no conversation data
 * is copied back into DSH and every observer/listener is retracted on unload.
 */
import type { Context } from 'cordis'
import {
  NGO_BALLOON,
  NGO_CHAT_BACKGROUND,
  NGO_CURSOR,
  NGO_CURSOR_DIAGONAL_1,
  NGO_CURSOR_DIAGONAL_2,
  NGO_CURSOR_HORIZONTAL,
  NGO_CURSOR_VERTICAL,
  NGO_ICON_INTERNET,
  NGO_ICON_JINE,
  NGO_ICON_MEDICINE,
  NGO_ICON_SLEEP,
  NGO_ICON_STREAM,
  NGO_ICON_TODO,
  NGO_JINE_AME,
  NGO_NOTIFICATION,
  NGO_POWER_ITEM_BEAR,
  NGO_POWER_ITEM_HEART,
  NGO_POWER_ITEM_MENDAKO,
  NGO_POWER_ITEM_PIEN,
  NGO_POWER_ITEM_TEA,
  NGO_STATUS_FOLLOWER,
  NGO_STATUS_LOVE,
  NGO_STATUS_STRESS,
  NGO_STATUS_YAMI,
  NGO_BASE_BUTTON,
  NGO_BASE_BUTTON_DISABLED,
  NGO_BOOT_CAUTION_BACKGROUND,
  NGO_BOOT_CAUTION_BUTTON,
  NGO_BOOT_CAUTION_BUTTON_HOVERED,
  NGO_BOOT_CAUTION_BUTTON_PRESSED,
  NGO_BOOT_CAUTION_FRAME,
  NGO_BOOT_CAUTION_ICON,
  NGO_BOOT_LOGIN,
  NGO_SAVE_FILE,
  NGO_FOOTER,
  NGO_START_BUTTON,
  NGO_START_MENU,
  NGO_START_PRESSED,
  NGO_START_SELECTED,
  NGO_TASKBAR_JINE,
  NGO_TASKBAR_POKETTER,
  NGO_TASKBAR_TASKMANAGER,
  NGO_TASKBAR_WINDOW,
  NGO_TASKBAR_WINDOW_PRESSED,
  NGO_TODO_COMPLETED,
  NGO_TODO_PROGRESS_0,
  NGO_TODO_PROGRESS_1,
  NGO_TODO_PROGRESS_2,
  NGO_TODO_PROGRESS_3,
  NGO_TODO_PROGRESS_4,
  NGO_TODO_PROGRESS_5,
  NGO_TODO_PROGRESS_6,
  NGO_TODO_PROGRESS_7,
  NGO_GOAL_CANCEL,
  NGO_GOAL_DELETE,
  NGO_GOAL_EDIT,
  NGO_GOAL_PAUSE,
  NGO_GOAL_RESUME,
  NGO_GOAL_SAVE,
  NGO_GOAL_TARGET,
  NGO_WEB_ICON,
  NGO_WEB_ICON_192,
  NGO_WEB_ICON_512,
  NGO_WEBCAM_BACKGROUND,
  NGO_WEBCAM_SCREENSAVER_1,
  NGO_WEBCAM_SCREENSAVER_2,
  NGO_WEBCAM_SCREENSAVER_3,
  NGO_WEBCAM_CHO_IDLE_0,
  NGO_WEBCAM_CHO_IDLE_1,
  NGO_WEBCAM_CHO_SMILE_0,
  NGO_WEBCAM_CHO_SMILE_1,
  NGO_WEBCAM_CHO_SMILE_2,
  NGO_WEBCAM_HAND,
  NGO_WEBCAM_IDLE_0,
  NGO_WEBCAM_IDLE_1,
  NGO_WEBCAM_PAT_AUDIO,
  NGO_WEBCAM_SMILE_0,
  NGO_WEBCAM_SMILE_1,
  NGO_WEBCAM_SMILE_2,
  NGO_WEBCAM_AME_OUT_000,
  NGO_WEBCAM_AME_OUT_001,
  NGO_WEBCAM_AME_OUT_002,
  NGO_WEBCAM_AME_OUT_003,
  NGO_WEBCAM_AME_OUT_004,
  NGO_WEBCAM_AME_OUT_005,
  NGO_WEBCAM_AME_OUT_006,
  NGO_WEBCAM_AME_OUT_007,
  NGO_WEBCAM_AME_OUT_008,
  NGO_WEBCAM_AME_OUT_009,
  NGO_WEBCAM_AME_OUT_010,
  NGO_WEBCAM_AME_OUT_011,
  NGO_WEBCAM_AME_OUT_012,
  NGO_WEBCAM_AME_OUT_013,
  NGO_WEBCAM_AME_IDLENORMAL_000,
  NGO_WALLPAPER,
  NGO_WINDOW_FRAME,
  NGO_WINDOW_FRAME_INACTIVE,
  NGO_WINDOW_CLOSE,
  NGO_WINDOW_MAXIMIZE,
  NGO_WINDOW_MINIMIZE,
  NGO_DAY_BUTTON,
  NGO_DAY_PASSING_HEART,
  NGO_WATCH_EVENING,
  NGO_WATCH_NIGHT,
  NGO_WATCH_NOON,
  NGO_FONT_DINKIE_9PX,
  NGO_FONT_ZPIX,
  NGO_SIDE_DEFAULT,
  NGO_SIDE_EVENING,
  NGO_SIDE_NIGHT,
  NGO_SIDE_NOON,
  NGO_SE_BIOS_HDD,
  NGO_SE_BIOS_PIKO,
  NGO_SE_BOOT,
  NGO_SE_BOOT_CAUTION,
  NGO_SE_COMMAND_EXECUTE,
  NGO_SE_HAISIN_SUPERCHAT,
  NGO_SE_JINE_RECIEVE,
  NGO_SE_JINE_SEND_STAMP,
  NGO_SE_KARI,
  NGO_SE_NADENADE_1,
  NGO_SE_NOTIFICATION,
  NGO_SE_PIYO,
  NGO_SE_PER,
  NGO_SE_PILL_GUIIIN,
  NGO_SE_PIPORO,
  NGO_SE_PIRODOWN,
  NGO_SE_POKO,
  NGO_SE_POP_TOOLTIP,
  NGO_SE_POP_TUTORIAL,
  NGO_SE_STATUS_DOWN,
  NGO_SE_STATUS_SHOWDIFF,
  NGO_SE_STATUS_UP,
  NGO_SE_TWEET_CHANGE_TOP,
  NGO_SE_TWEET_KUSOREP,
  NGO_SE_TWEET_LOAD,
  NGO_SE_WINDOW_CLOSE,
  NGO_BGM_MAINLOOP,
  NGO_SLIDER_THUMB,
  ISAAC_GAMEKID,
  ISAAC_GAMEKID_CHEW,
  ISAAC_PILL_SHEET,
  ISAAC_SLOT_BODY_0,
  ISAAC_SLOT_BODY_1,
  ISAAC_SLOT_BODY_2,
  ISAAC_SLOT_COIN,
  ISAAC_SLOT_ICON_00,
  ISAAC_SLOT_ICON_02,
  ISAAC_SLOT_ICON_05,
  ISAAC_BLUE_SPIDER,
  ISAAC_BLUE_SPIDER_WALK,
  ISAAC_TAROT_CARD,
  ISAAC_TAROT_FRONTS,
  ISAAC_SLOT_BROKEN,
  ISAAC_TROLL_BOMB_TIMELINE,
  ISAAC_BOMB_DROP_0,
  ISAAC_BOMB_DROP_1,
  ISAAC_BOMB_EXPLODE_0,
  ISAAC_BOMB_EXPLODE_1,
  ISAAC_BOMB_EXPLODE_2,
  STEAM_ACHIEVEMENT,
  STEAM_ACHIEVEMENT_MASK_ROOT,
  STEAM_ACHIEVEMENT_MASK_ROTATE,
  ISAAC_SLOT_ICON_08,
  ISAAC_SLOT_ICON_09,
  ISAAC_SLOT_ICON_10,
  ISAAC_SLOT_ICON_11,
  ISAAC_SLOT_ICON_12,
  ISAAC_SLOT_ICON_13,
  ISAAC_SLOT_PULL,
  ISAAC_SLOT_SPAWN,
  ISAAC_SLOT_SPIN_LOOP,
  ISAAC_SLOT_STOP,
  ISAAC_VOICE_POWER_PILL,
  ISAAC_VOICE_RETRO_VISION,
  MINECRAFT_DRINK,
  MINECRAFT_EFFECT_BLINDNESS,
  MINECRAFT_EFFECT_NAUSEA,
  MINECRAFT_MILK_BUCKET,
  MINECRAFT_SUSPICIOUS_STEW,
  MINECRAFT_SUSPICIOUS_STEW_EAT,
  TERRARIA_BUFF_GRAVITATION,
  TERRARIA_GRAVITY_POTION,
  TERRARIA_GRAVITY_POTION_USE,
  TERRARIA_RED_POTION,
  TERRARIA_DEBUFF_BLEEDING,
  TERRARIA_DEBUFF_BROKEN_ARMOR,
  TERRARIA_DEBUFF_CONFUSED,
  TERRARIA_DEBUFF_CURSED,
  TERRARIA_DEBUFF_DARKNESS,
  TERRARIA_DEBUFF_ON_FIRE,
  TERRARIA_DEBUFF_POISONED,
  TERRARIA_DEBUFF_SILENCED,
  TERRARIA_DEBUFF_SLOW,
  TERRARIA_DEBUFF_SUFFOCATION,
  TERRARIA_DEBUFF_WEAK,
} from './art.generated.ts'
import { createSfx, type Sfx, type SfxName } from './sfx.ts'
import {
  installWebcamPoseLoop,
  type WebcamPose,
} from './webcam-poses.ts'
import { SEQUENCES } from './webcam-sequences.ts'
import { installSkinCustomization } from './customization.ts'
import css from './skin.module.css'
import {
  buildLiveComment,
  buildLiveEmpty,
  buildLiveSurface,
  setLiveState,
  type LiveSurface,
} from './live-surface.ts'
import liveCss from './live-surface.module.css'
import {
  createPoketterHeader,
  decoratePoketterStage,
  poketterCss,
  renderPoketter,
  type PoketterIdentity,
} from './poketter-surface.ts'
import { createDesktopWindowManager, getDesktopLayoutRect, type ManagedWindow } from './window-manager.ts'
import { installLightModeLock } from './light-mode-lock.ts'
import { installHarnessFailureBlueScreen } from './harness-failure.ts'
import { createPomodoroController, type PomodoroController, type PomodoroSnapshot } from './pomodoro.ts'
import { buildMedicineSlot, MEDICINES, type MedicineDefinition, type MedicineEffect } from './medicine-slot.ts'
import { createSlotRewards, WEB_ICON } from './slot-rewards.ts'
import rewardCss from './slot-rewards.module.css'
import {
  createMedicineEffects,
  type MedicineBuff,
  type MedicineBuffId,
  type SuspiciousStewOutcome,
} from './medicine-effects.ts'
import medicineCss from './medicine-slot.module.css'
import { installOnboardingAdapter } from './onboarding-adapter.ts'
import {
  installDailyTransition,
  type DailyTransitionEmphasis,
  type DailyTransitionWeekday,
} from './daily-transition.ts'

const BODY_ATTRIBUTE = 'data-dsh-internet-angel-desktop'
const SAVE_ATTRIBUTE = 'data-ngo-save-open'
const START_ATTRIBUTE = 'data-ngo-start-open'
const SETTINGS_ATTRIBUTE = 'data-ngo-settings-open'
const SETTINGS_ACTIVE_ATTRIBUTE = 'data-ngo-settings-active'
const FONT_ATTRIBUTE = 'data-ngo-font'
const PHASE_ATTRIBUTE = 'data-ngo-phase'
const SIDE_SCENE_ATTRIBUTE = 'data-ngo-side-scene'
const SCHEDULE_CATALOG_ATTRIBUTE = 'data-ngo-schedule-catalog'
const MEDICINE_CONSENT_STORAGE = 'ngo:medicine-consent:v1'
const PROJECTION_SOUND_EVENTS_STORAGE = 'ngo:projection-sound-events:v1'
const PROJECTION_SOUND_EVENT_LIMIT = 128
let nextScheduleCatalogLease = 0
const PROJECTION_DELAY_MS = 96
const QUEUE_FALLBACK_DELAY_MS = PROJECTION_DELAY_MS * 3
const WSS_BILIBILI_URL = 'https://space.bilibili.com/1365540467'
const WSS_YOUTUBE_URL = 'https://www.youtube.com/@wssplayground'
type DesktopNoticeTarget = 'jine' | 'status' | 'pomodoro'

type SubagentMode = 'one-shot' | 'continuable'

interface SubagentAddress {
  parentSessionId: string
  childSessionId: string
  mode: SubagentMode
}

interface SubagentCatalogEntry {
  kind: 'child' | 'diagnostic'
  id: string
  label?: string
  mode?: SubagentMode
  activity?: 'running' | 'inactive'
}

interface SubagentCatalogSnapshot {
  entries: readonly SubagentCatalogEntry[]
  state: 'loading' | 'ready' | 'error'
}

interface SessionSummary {
  id: string
  displayTitle: string
  parentId?: string
  origin?: 'subagent'
  running: boolean
  pendingInteraction?: 'approval' | 'plan-review' | 'question'
  completed?: boolean
  blank?: boolean
  updatedAt?: number
  projectionValues?: {
    schedule?: readonly unknown[]
  }
}

interface SessionListSnapshot {
  ids?: readonly string[]
  byId: Readonly<Record<string, SessionSummary>>
  current?: string
  phase?: 'pending' | 'ready'
  currentAddress?: SubagentAddress
  subagentsByParent: Readonly<Record<string, SubagentCatalogSnapshot>>
}

interface SnapshotStore<T> {
  getSnapshot(): T
  subscribe(listener: () => void): () => void
}

interface SessionsBridge {
  list: SnapshotStore<SessionListSnapshot>
  open(id: string): void
  refresh?(): Promise<void>
  openSubagent(address: SubagentAddress): void
  refreshSubagents(parentSessionId: string): Promise<void>
  setSubagentCatalogOpen(parentSessionId: string, open: boolean): void
}

interface WorkspaceSummary {
  workspaceId: string
  title: string
  sessionIds: readonly string[]
}

interface WorkspaceListSnapshot {
  items: readonly WorkspaceSummary[]
  archivedSessionIds?: readonly string[]
}

interface WorkspacesBridge {
  list: SnapshotStore<WorkspaceListSnapshot>
  startSession?(workspaceId?: string): void
}

interface UiWorkspaceBridge {
  startSession(workspaceId?: string): void
}

interface SubagentIdentity {
  parentSessionId: string
  sessionId: string
  label: string
  displayName: string
  handle: string
  mode: SubagentMode
  running: boolean
}

interface SubagentContact extends SubagentIdentity {
  selected: boolean
}

interface SubagentViewModel {
  parentSessionId?: string
  rootSessionId?: string
  rootLabel: string
  catalogState: 'unavailable' | 'loading' | 'ready' | 'error'
  contacts: readonly SubagentContact[]
  selected?: SubagentIdentity
}

const SUBAGENT_POKETTER_AVATAR = NGO_WEBCAM_CHO_IDLE_0.cssUrl

interface DesktopSurfaces {
  scene: HTMLDivElement
  liveFeed: HTMLDivElement
  liveSurface: LiveSurface
  tweetFeed: HTMLDivElement
  jineFeed: HTMLDivElement
  jineSessionToggle: HTMLButtonElement
  jineSessionMenu: HTMLDivElement
  internetSearchInput: HTMLInputElement
  internetSearchResults: HTMLDivElement
  internetSearchStatus: HTMLDivElement
  taskFeed: HTMLDivElement
  todoList: HTMLUListElement
  connectionTray: HTMLElement
  connectionButton: HTMLButtonElement
  connectionPopover: HTMLElement
  connectionStatus: HTMLElement
  connectionAction: HTMLButtonElement
  clockButton: HTMLButtonElement
  clockIcon: HTMLImageElement
  clockLabel: HTMLSpanElement
  startButton: HTMLButtonElement
  startMenu: HTMLElement
  startNewButton: HTMLButtonElement
  startContinueButton: HTMLButtonElement
  startControlButton: HTMLButtonElement
  startRestartButton: HTMLButtonElement
  startShutdownButton: HTMLButtonElement
  settingsWindow: HTMLElement
  pictureWindow: HTMLElement
  pictureGrid: HTMLElement
  pictureEmpty: HTMLElement
  imageViewerWindow: HTMLElement
  imageViewerStage: HTMLElement
  imageViewerImage: HTMLImageElement
  imageViewerError: HTMLElement
  saveWindow: HTMLElement
  saveProgress: HTMLElement
  saveProgressTrack: HTMLElement
  saveWorkspaceCreate: HTMLButtonElement
  saveData: HTMLElement
  desktopNotice: HTMLButtonElement
  desktopNoticeIcon: HTMLImageElement
  desktopNoticeText: HTMLSpanElement
  jineTaskButton: HTMLButtonElement
  statusTaskButton: HTMLButtonElement
  pomodoroDisplay: HTMLElement
  pomodoroPhase: HTMLElement
  pomodoroHint: HTMLElement
  pomodoroToggle: HTMLButtonElement
  pomodoroSkip: HTMLButtonElement
  pomodoroReset: HTMLButtonElement
  pomodoroPreset25: HTMLButtonElement
  pomodoroPreset50: HTMLButtonElement
  pomodoroFocusInput: HTMLInputElement
  pomodoroBreakInput: HTMLInputElement
  pomodoroApply: HTMLButtonElement
  pomodoroTaskLabel: HTMLElement
  pomodoroTray: HTMLButtonElement
  pomodoroShortcutLabel: HTMLElement
  medicineShortcut: HTMLButtonElement
  medicineConsent: HTMLElement
  medicineConsentAccept: HTMLButtonElement
  medicineConsentDecline: HTMLButtonElement
  selectTaskManagerTab(view: 'process' | 'stats'): void
  windows: ManagedWindow[]
  setWebcamCharacter(character: WebcamCharacter): void
  /** Game RandomizeAmeAnimation semantics: re-roll the looping webcam pose. */
  rollWebcamPose(): void
  playWebcamBreakPose(): void
  disposeWebcam: () => void
  disposeMedicine: () => void
}

const ART_PROPERTIES = new Map<string, string>([
  ['--ngo-wallpaper', NGO_WALLPAPER.cssUrl],
  ['--ngo-cursor', NGO_CURSOR.cssUrl],
  ['--ngo-cursor-horizontal', NGO_CURSOR_HORIZONTAL.cssUrl],
  ['--ngo-cursor-vertical', NGO_CURSOR_VERTICAL.cssUrl],
  ['--ngo-cursor-diagonal-1', NGO_CURSOR_DIAGONAL_1.cssUrl],
  ['--ngo-cursor-diagonal-2', NGO_CURSOR_DIAGONAL_2.cssUrl],
  ['--ngo-window-frame', NGO_WINDOW_FRAME.cssUrl],
  ['--ngo-window-frame-inactive', NGO_WINDOW_FRAME_INACTIVE.cssUrl],
  ['--ngo-window-minimize', NGO_WINDOW_MINIMIZE.cssUrl],
  ['--ngo-window-maximize', NGO_WINDOW_MAXIMIZE.cssUrl],
  ['--ngo-window-close', NGO_WINDOW_CLOSE.cssUrl],
  ['--ngo-side-default', NGO_SIDE_DEFAULT.cssUrl],
  ['--ngo-side-noon', NGO_SIDE_NOON.cssUrl],
  ['--ngo-side-evening', NGO_SIDE_EVENING.cssUrl],
  ['--ngo-side-night', NGO_SIDE_NIGHT.cssUrl],
  ['--ngo-chat-background', NGO_CHAT_BACKGROUND.cssUrl],
  ['--ngo-balloon', NGO_BALLOON.cssUrl],
  ['--ngo-notification', NGO_NOTIFICATION.cssUrl],
  ['--ngo-webcam-hand', NGO_WEBCAM_HAND.cssUrl],
  ['--ngo-footer', NGO_FOOTER.cssUrl],
  ['--ngo-base-button', NGO_BASE_BUTTON.cssUrl],
  ['--ngo-base-button-disabled', NGO_BASE_BUTTON_DISABLED.cssUrl],
  ['--ngo-boot-caution-background', NGO_BOOT_CAUTION_BACKGROUND.cssUrl],
  ['--ngo-boot-caution-button', NGO_BOOT_CAUTION_BUTTON.cssUrl],
  ['--ngo-boot-caution-button-hovered', NGO_BOOT_CAUTION_BUTTON_HOVERED.cssUrl],
  ['--ngo-boot-caution-button-pressed', NGO_BOOT_CAUTION_BUTTON_PRESSED.cssUrl],
  ['--ngo-boot-caution-frame', NGO_BOOT_CAUTION_FRAME.cssUrl],
  ['--ngo-boot-caution-icon', NGO_BOOT_CAUTION_ICON.cssUrl],
  ['--ngo-boot-login', NGO_BOOT_LOGIN.cssUrl],
  ['--ngo-start-menu', NGO_START_MENU.cssUrl],
  ['--ngo-start-button', NGO_START_BUTTON.cssUrl],
  ['--ngo-start-pressed', NGO_START_PRESSED.cssUrl],
  ['--ngo-start-selected', NGO_START_SELECTED.cssUrl],
  ['--ngo-day-button', NGO_DAY_BUTTON.cssUrl],
  ['--ngo-taskbar-window', NGO_TASKBAR_WINDOW.cssUrl],
  ['--ngo-taskbar-window-pressed', NGO_TASKBAR_WINDOW_PRESSED.cssUrl],
  ['--ngo-slider-thumb', NGO_SLIDER_THUMB.cssUrl],
])

const TODO_PROGRESS_FRAMES = [
  NGO_TODO_PROGRESS_0,
  NGO_TODO_PROGRESS_1,
  NGO_TODO_PROGRESS_2,
  NGO_TODO_PROGRESS_3,
  NGO_TODO_PROGRESS_4,
  NGO_TODO_PROGRESS_5,
  NGO_TODO_PROGRESS_6,
  NGO_TODO_PROGRESS_7,
] as const

type WebcamCharacter = 'ame' | 'cho'

interface WebcamCharacterSet {
  label: string
  idle: readonly [string, string]
  smile: readonly [string, string, string]
}

const WEBCAM_CHARACTERS: Record<WebcamCharacter, WebcamCharacterSet> = {
  ame: {
    label: '糖糖',
    idle: [NGO_WEBCAM_IDLE_0.dataUri, NGO_WEBCAM_IDLE_1.dataUri],
    smile: [NGO_WEBCAM_SMILE_0.dataUri, NGO_WEBCAM_SMILE_1.dataUri, NGO_WEBCAM_SMILE_2.dataUri],
  },
  cho: {
    label: '超天酱',
    idle: [NGO_WEBCAM_CHO_IDLE_0.dataUri, NGO_WEBCAM_CHO_IDLE_1.dataUri],
    smile: [NGO_WEBCAM_CHO_SMILE_0.dataUri, NGO_WEBCAM_CHO_SMILE_1.dataUri, NGO_WEBCAM_CHO_SMILE_2.dataUri],
  },
}

/**
 * Autonomous webcam poses mirrored from the game's WebCamManager and KAngel
 * stream set. Ame's normal pool is the exact nine-entry, equal-probability
 * RandomizeAmeAnimation pool; frame order and timing come from the extracted
 * Addressables AnimationClip curves.
 */
const AME_POSES: readonly WebcamPose[] = [
  // Base layer pose: the two-frame blink idle owns the idle/smile layers.
  { id: 'idle', frames: [], end: 'loop', weight: 1, base: true },
  {
    id: 'handspinner1',
    frames: SEQUENCES.handspinner1,
    end: 'loop',
    relayTo: 'handspinner2',
    weight: 1,
  },
  {
    id: 'handspinner2',
    frames: SEQUENCES.handspinner2,
    end: 'loop',
    weight: 0,
  },
  {
    id: 'headphone',
    frames: SEQUENCES.headphone,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'nail',
    frames: SEQUENCES.nail,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'selfie',
    frames: SEQUENCES.selfie,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'sleep',
    frames: SEQUENCES.sleep,
    end: 'loop',
    weight: 0.9,
  },
  {
    id: 'vocaltrain',
    frames: SEQUENCES.vocaltrain,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'idlenormal',
    frames: SEQUENCES.idlenormal,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'idlehappy',
    frames: SEQUENCES.idlehappy,
    end: 'loop',
    weight: 1,
  },
  {
    id: 'henoji',
    frames: SEQUENCES.henoji,
    end: 'hold',
    weight: 0,
  },
]

const AME_HENOJI_POSE = AME_POSES.find(pose => pose.id === 'henoji')!

// `stream_ame_out_a`: the complete, safe chair-leave clip. It ends before any
// action-specific follow-up and deliberately holds on the empty-room frame.
const AME_BREAK_POSE: WebcamPose = {
  id: 'pomodoro-leave',
  frames: [
    { src: NGO_WEBCAM_AME_IDLENORMAL_000.dataUri, ms: 83 },
    { src: NGO_WEBCAM_AME_OUT_000.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_001.dataUri, ms: 84 },
    { src: NGO_WEBCAM_AME_OUT_002.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_003.dataUri, ms: 133 },
    { src: NGO_WEBCAM_AME_OUT_004.dataUri, ms: 83 },
    { src: NGO_WEBCAM_AME_OUT_005.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_006.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_007.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_008.dataUri, ms: 84 },
    { src: NGO_WEBCAM_AME_OUT_009.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_010.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_011.dataUri, ms: 83 },
    { src: NGO_WEBCAM_AME_OUT_012.dataUri, ms: 100 },
    { src: NGO_WEBCAM_AME_OUT_013.dataUri, ms: 750 },
  ],
  end: 'hold',
  weight: 0,
}

const CHO_POSES: readonly WebcamPose[] = [
  // KAngel live-action set (TenchanView stream content): the default 光明
  // live idle (akaruku), 安心-mode stream pictures (yukkuri_*), the 超天
  // entry (su), chat reactions (superchat/fever) and performance poses.
  // Live default gets the highest weight; reactions stay low-frequency.
  {
    id: 'akaruku',
    frames: SEQUENCES.akaruku,
    end: 'loop',
    weight: 1.6,
  },
  {
    // 安心-mode stream picture (the "news" frame set): only late at night.
    id: 'yukkuriIdle',
    frames: SEQUENCES.yukkuriIdle,
    end: 'loop',
    weight: 1.4,
    nightOnly: true,
  },
  {
    id: 'yukkuriSmile',
    frames: SEQUENCES.yukkuriSmile,
    end: 'replay',
    weight: 1,
    nightOnly: true,
  },
  {
    // 失去表情、空洞麻木/沉重话题（catalog: stream_cho_su）
    id: 'su',
    frames: SEQUENCES.su,
    end: 'loop',
    weight: 0.5,
  },
  {
    id: 'yukkuriTeach',
    frames: SEQUENCES.yukkuriTeach,
    end: 'loop',
    weight: 0.6,
    nightOnly: true,
  },
  {
    id: 'pray',
    frames: SEQUENCES.pray,
    end: 'loop',
    weight: 0.7,
  },
  {
    id: 'sleepy',
    frames: SEQUENCES.sleepy,
    end: 'replay',
    weight: 0.5,
  },
  {
    id: 'superchat',
    frames: SEQUENCES.superchat,
    end: 'replay',
    weight: 0.5,
  },
  {
    id: 'fever',
    frames: SEQUENCES.superchat,
    end: 'loop',
    weight: 0.4,
  },
  {
    id: 'suSuperchat',
    frames: SEQUENCES.suSuperchat,
    end: 'replay',
    weight: 0.3,
  },
]
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

function makeTitle(title: UiText): HTMLDivElement {
  const bar = element('div', css.titleBar ?? '')
  bar.dataset.windowDrag = ''
  const mark = element('span', css.titleMark ?? '')
  const label = element('span', css.titleText ?? '', title)
  const controls = element('span', css.windowControls ?? '')
  controls.dataset.windowControls = ''
  for (const [action, symbol, label] of [
    ['minimize', '_', '最小化'],
    ['maximize', '□', '最大化或还原'],
    ['close', '×', '关闭'],
  ] as const) {
    const button = element('button', css.windowControl ?? '', symbol)
    button.type = 'button'
    button.dataset.windowAction = action
    setAttr(button, 'aria-label', () => `${resolveText(title)}: ${t(label)}`)
    controls.append(button)
  }
  bar.append(mark, label, controls)
  return bar
}

function makeWindow(id: string, title: UiText, className: string): { window: HTMLElement; body: HTMLDivElement } {
  const window = element('section', `${css.window ?? ''} ${className}`)
  window.dataset.windowId = id
  const body = element('div', css.windowBody ?? '')
  window.append(makeTitle(title), body)
  for (const direction of ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'] as const) {
    const handle = element('span', css.resizeHandle ?? '')
    handle.dataset.windowResize = direction
    handle.setAttribute('aria-hidden', 'true')
    window.append(handle)
  }
  return { window, body }
}

function makeShortcut(label: UiText, src: string): HTMLButtonElement {
  const shortcut = element('button', css.shortcut ?? '')
  shortcut.type = 'button'
  const image = element('img', css.shortcutIcon ?? '')
  image.src = src
  image.alt = ''
  shortcut.append(image, element('span', css.shortcutLabel ?? '', label))
  return shortcut
}

function makeStatusRow(
  src: string,
  metric: 'tokens' | 'cache' | 'context' | 'access',
  label: UiText,
  value: string,
  tooltipId: string,
  tooltipZh: string,
  tooltipEn: string,
): HTMLDivElement {
  const row = element('div', css.statusRow ?? '')
  row.dataset.ngoTaskMetric = metric
  row.dataset.ngoBrightTooltip = tooltipId
  row.dataset.ngoTooltipZh = tooltipZh
  row.dataset.ngoTooltipEn = tooltipEn
  const image = element('img', css.statusIcon ?? '')
  image.src = src
  image.alt = ''
  const copy = element('span', css.statusCopy ?? '')
  const valueNode = element('strong', css.statusValue ?? '', value)
  valueNode.dataset.ngoTaskMetricValue = ''
  copy.append(element('small', css.statusLabel ?? '', label), valueNode)
  const meter = element('span', css.statusMeter ?? '')
  meter.dataset.ngoTaskMetricMeter = ''
  meter.setAttribute('role', 'progressbar')
  meter.setAttribute('aria-valuemin', '0')
  meter.setAttribute('aria-valuemax', '100')
  row.append(image, copy, meter)
  return row
}

function buildDesktop(sfx: Sfx | undefined, onWebcamBomb: () => void): DesktopSurfaces {
  const scene = element('div', css.scene ?? '')
  scene.dataset.skinChrome = 'scene'
  const fontFace = element('style', '')
  fontFace.dataset.skinFont = 'interface'
  setText(fontFace, [
    `@font-face{font-family:'NgoDinkieBitmap9';src:url(${JSON.stringify(NGO_FONT_DINKIE_9PX.dataUri)}) format('woff2');font-style:normal;font-weight:400;font-display:swap}`,
    `@font-face{font-family:'NgoZpix';src:url(${JSON.stringify(NGO_FONT_ZPIX.dataUri)}) format('woff2');font-style:normal;font-weight:400;font-display:swap}`,
  ].join(''))

  const sideLeft = element('div', `${css.sideBackdrop ?? ''} ${css.sideLeft ?? ''}`)
  const sideRight = element('div', `${css.sideBackdrop ?? ''} ${css.sideRight ?? ''}`)
  sideLeft.setAttribute('aria-hidden', 'true')
  sideRight.setAttribute('aria-hidden', 'true')

  const shortcuts = element('div', css.shortcuts ?? '')
  const streamShortcut = makeShortcut(() => t('直播'), NGO_ICON_STREAM.dataUri)
  const jineShortcut = makeShortcut('JINE', NGO_ICON_JINE.dataUri)
  const internetShortcut = makeShortcut(() => t('因特网'), NGO_ICON_INTERNET.dataUri)
  const todoShortcut = makeShortcut(() => t('代办'), NGO_ICON_TODO.dataUri)
  const pomodoroShortcut = makeShortcut(() => t('番茄钟'), NGO_ICON_SLEEP.dataUri)
  const medicineShortcut = makeShortcut(() => t('吃药'), NGO_ICON_MEDICINE.dataUri)
  shortcuts.append(
    streamShortcut,
    jineShortcut,
    internetShortcut,
    todoShortcut,
    pomodoroShortcut,
    medicineShortcut,
  )

  // Rebuild the original webcam from the supplied community reference's
  // verified 696x454 room and idle frames. Transcript projection remains in
  // the independent LIVE surface below.
  const webcam = makeWindow('webcam', 'webcam', css.liveWindow ?? '')
  const webcamStage = element('div', css.liveStage ?? '')
  const webcamBackground = element('img', css.webcamLayer ?? '')
  webcamBackground.src = NGO_WEBCAM_BACKGROUND.dataUri
  webcamBackground.alt = ''
  const webcamScreensavers = [
    NGO_WEBCAM_SCREENSAVER_1.dataUri,
    NGO_WEBCAM_SCREENSAVER_2.dataUri,
    NGO_WEBCAM_SCREENSAVER_3.dataUri,
  ] as const
  const webcamScreensaver = element('img', `${css.webcamLayer ?? ''} ${css.webcamScreensaver ?? ''}`)
  webcamScreensaver.alt = ''
  webcamScreensaver.setAttribute('aria-hidden', 'true')
  const randomizeWebcamScreensaver = (): void => {
    const index = Math.floor(Math.random() * webcamScreensavers.length)
    webcamScreensaver.src = webcamScreensavers[index]!
    webcamScreensaver.dataset.webcamScreensaver = String(index + 1)
  }
  // App_Webcam.Start calls bgView immediately, which selects one of the three
  // full-canvas transparent monitor overlays with Random.Range(0, 3).
  randomizeWebcamScreensaver()
  const streamer = element('img', `${css.webcamLayer ?? ''} ${css.streamer ?? ''}`)
  streamer.src = NGO_WEBCAM_IDLE_0.dataUri
  streamer.alt = ''
  streamer.dataset.webcamRole = ''
  const streamerBlink = element('img', `${css.webcamLayer ?? ''} ${css.streamer ?? ''} ${css.streamerBlink ?? ''}`)
  streamerBlink.src = NGO_WEBCAM_IDLE_1.dataUri
  streamerBlink.alt = ''
  streamerBlink.setAttribute('aria-hidden', 'true')
  const smileBase = element('img', `${css.webcamLayer ?? ''} ${css.streamerReaction ?? ''} ${css.streamerReactionBase ?? ''}`)
  smileBase.src = NGO_WEBCAM_SMILE_0.dataUri
  smileBase.alt = ''
  smileBase.setAttribute('aria-hidden', 'true')
  const smileBlink = element('img', `${css.webcamLayer ?? ''} ${css.streamerReaction ?? ''} ${css.streamerReactionBlink ?? ''}`)
  smileBlink.src = NGO_WEBCAM_SMILE_1.dataUri
  smileBlink.alt = ''
  smileBlink.setAttribute('aria-hidden', 'true')
  const smileHappy = element('img', `${css.webcamLayer ?? ''} ${css.streamerReaction ?? ''} ${css.streamerReactionHappy ?? ''}`)
  smileHappy.src = NGO_WEBCAM_SMILE_2.dataUri
  smileHappy.alt = ''
  smileHappy.setAttribute('aria-hidden', 'true')
  const headHitbox = element('button', css.webcamHeadHitbox ?? '')
  headHitbox.type = 'button'
  headHitbox.dataset.webcamInteraction = 'pat'
  headHitbox.dataset.webcamPatCount = '0'
  setAttr(headHitbox, 'aria-label', () => t('摸摸糖糖的头'))
  headHitbox.style.setProperty('cursor', `${NGO_WEBCAM_HAND.cssUrl} 0 0, pointer`, 'important')
  let patAudio: HTMLAudioElement | null = null
  let patCount = 0
  // The autonomous pose layer: covers the idle/smile stack while a game base
  // pose plays; hidden while the head-pat reaction owns the screen.
  const webcamPose = element('img', `${css.webcamLayer ?? ''} ${css.webcamPose ?? ''}`)
  webcamPose.dataset.webcamPoseImg = ''
  webcamPose.alt = ''
  webcamPose.setAttribute('aria-hidden', 'true')
  const poseLoop = installWebcamPoseLoop({
    stage: webcamStage,
    poseImage: webcamPose,
    sets: { ame: AME_POSES, cho: CHO_POSES },
  })
  const stopPat = (): void => {
    // The game's head-pat replaces the base animation with the looping
    // stream_ame_smile until the next RandomizeAmeAnimation; there is no
    // automatic return to idle (see webcam-poses.ts).
    webcamStage.removeAttribute('data-webcam-patting')
  }
  let webcamCharacterFallbackFrame: number | undefined
  const setWebcamCharacter = (character: WebcamCharacter): void => {
    if (webcamCharacterFallbackFrame !== undefined) {
      window.cancelAnimationFrame(webcamCharacterFallbackFrame)
      webcamCharacterFallbackFrame = undefined
    }
    const set = WEBCAM_CHARACTERS[character]
    webcamStage.dataset.webcamCharacter = character
    streamer.src = set.idle[0]
    streamerBlink.src = set.idle[1]
    smileBase.src = set.smile[0]
    smileBlink.src = set.smile[1]
    smileHappy.src = set.smile[2]
    setAttr(headHitbox, 'aria-label', () => t("摸摸{0}的头", t(set.label)))
    // Head-pat (App_Webcam.Nade) only exists for Ame; KAngel's live view is
    // streaming-only, so the hitbox is disabled in cho mode.
    headHitbox.disabled = character === 'cho'
    poseLoop.setCharacter(character)
  }
  // Let the synchronously loaded customization registry commit the persisted
  // character before the first pose roll. Without skin-manager, Ame starts on
  // the next frame as the standalone default.
  webcamCharacterFallbackFrame = window.requestAnimationFrame(() => {
    webcamCharacterFallbackFrame = undefined
    setWebcamCharacter('ame')
  })
  const playPat = (): void => {
    // Game App_Webcam.Nade: every head-pat plays the sound and re-fires the
    // happy() base-animation swap (no-op when the smile is already showing).
    webcamStage.setAttribute('data-webcam-patting', '')
    poseLoop.suppress()
    patCount += 1
    headHitbox.dataset.webcamPatCount = String(patCount)
    if (patAudio === null && typeof Audio !== 'undefined') {
      patAudio = new Audio(NGO_WEBCAM_PAT_AUDIO.dataUri)
      patAudio.preload = 'auto'
      patAudio.volume = 0.2
    }
    if (patAudio !== null) {
      patAudio.volume = (sfx?.getSeVolume() ?? 0) * 0.2
      try {
        patAudio.currentTime = 0
        patAudio.play().catch(() => {})
      } catch {}
    }
  }
  const playPatFromKeyboard = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    playPat()
  }
  headHitbox.addEventListener('click', playPat)
  headHitbox.addEventListener('keydown', playPatFromKeyboard)
  webcamStage.dataset.skinSurface = 'webcam-stage'
  webcamStage.append(
    webcamBackground,
    webcamScreensaver,
    streamer,
    streamerBlink,
    smileBase,
    smileBlink,
    smileHappy,
    webcamPose,
    headHitbox,
  )
  webcam.body.append(webcamStage)

  const live = makeWindow('live', 'LIVE', liveCss.liveWindow ?? '')
  const liveSurface = buildLiveSurface()
  live.body.append(liveSurface.surface)

  const tweet = makeWindow('tweet', () => t('推博'), poketterCss.window ?? '')
  const tweetHeader = createPoketterHeader()
  const tweetSheet = element('div', poketterCss.sheet ?? '')
  const tweetFeed = element('div', poketterCss.feed ?? '')
  tweet.body.classList.add(poketterCss.body ?? '')
  decoratePoketterStage(tweet.body)
  tweetFeed.dataset.skinSurface = 'tweet-feed'
  tweetSheet.append(tweetFeed)
  tweet.body.append(tweetHeader, tweetSheet)

  const jine = makeWindow('jine', 'JINE', css.jineWindow ?? '')
  const jineFeed = element('div', css.jineFeed ?? '')
  jineFeed.dataset.skinSurface = 'jine-feed'
  jine.body.append(jineFeed)
  const jineSessionToggle = element(
    'button',
    `${css.windowControl ?? ''} ${css.jineSessionToggle ?? ''}`,
    () => t('主'),
  )
  jineSessionToggle.type = 'button'
  jineSessionToggle.dataset.jineSessionToggle = ''
  jineSessionToggle.dataset.windowAction = 'session'
  jineSessionToggle.hidden = true
  setAttr(jineSessionToggle, 'aria-label', () => t('选择 JINE 会话'))
  jineSessionToggle.setAttribute('aria-expanded', 'false')
  const jineControls = jine.window.querySelector<HTMLElement>('[data-window-controls]')
  jineControls?.insertBefore(jineSessionToggle, jineControls.firstChild)
  const jineSessionMenu = element('div', css.jineSessionMenu ?? '')
  jineSessionMenu.dataset.jineSessionMenu = ''
  jineSessionMenu.hidden = true
  jineSessionMenu.setAttribute('role', 'menu')
  jine.window.append(jineSessionMenu)

  // AppType.Internet is kept as a lightweight homage rather than recreating
  // the original game's mature action system. It promotes WSS Playground and
  // gives DSH a useful, local-only JINE history search surface.
  const internet = makeWindow('internet', () => t('因特网'), css.internetWindow ?? '')
  const internetHome = element('div', css.internetHome ?? '')
  const internetHeading = element('div', css.internetHeading ?? '', 'INTERNET ANGEL LINK')
  const internetIntro = element('p', css.internetIntro ?? '', () => t('连接官方频道，或在这段回忆里寻找一句话。'))
  const officialChannel = element('a', css.internetOfficial ?? '')
  setAttr(officialChannel, 'href', () => isChinese() ? WSS_BILIBILI_URL : WSS_YOUTUBE_URL)
  officialChannel.target = '_blank'
  officialChannel.rel = 'noopener noreferrer'
  setAttr(officialChannel, 'data-internet-official', () => isChinese() ? 'bilibili' : 'youtube')
  const officialMark = element('span', css.internetOfficialMark ?? '', '▶')
  officialMark.setAttribute('aria-hidden', 'true')
  const officialCopy = element('span', css.internetOfficialCopy ?? '')
  officialCopy.append(
    element('strong', '', () => t('官方直播间')),
    element('small', '', () => t('前往 WSS Playground · bilibili')),
  )
  officialChannel.append(officialMark, officialCopy)
  const internetSearch = element('form', css.internetSearch ?? '')
  internetSearch.dataset.internetSearch = ''
  const internetSearchLabel = element('label', css.internetSearchLabel ?? '', () => t('对话搜索'))
  const internetSearchRow = element('div', css.internetSearchRow ?? '')
  const internetSearchInput = element('input', css.internetSearchInput ?? '')
  internetSearchInput.type = 'search'
  setAttr(internetSearchInput, 'placeholder', () => t('搜索 JINE 聊天记录…'))
  internetSearchInput.autocomplete = 'off'
  setAttr(internetSearchInput, 'aria-label', () => t('搜索 JINE 聊天记录'))
  const internetSearchButton = element('button', css.internetSearchButton ?? '', () => t('搜索'))
  internetSearchButton.type = 'submit'
  internetSearchRow.append(internetSearchInput, internetSearchButton)
  const internetSearchStatus = element('div', css.internetSearchStatus ?? '', () => t('输入关键词，寻找当前会话中的 JINE 气泡。'))
  internetSearchStatus.setAttribute('aria-live', 'polite')
  const internetSearchResults = element('div', css.internetSearchResults ?? '')
  internetSearchResults.dataset.internetSearchResults = ''
  internetSearch.append(internetSearchLabel, internetSearchRow, internetSearchStatus, internetSearchResults)
  internetHome.append(internetHeading, internetIntro, officialChannel, internetSearch)
  internet.body.append(internetHome)

  const todo = makeWindow('todo', () => t('代办'), css.todoWindow ?? '')
  const todoPaper = element('div', css.todoPaper ?? '')
  const todoList = element('ul', css.todoList ?? '')
  todoList.dataset.skinSurface = 'todo-list'
  todoPaper.append(todoList)
  todo.body.append(todoPaper)

  const pomodoro = makeWindow('pomodoro', () => t('番茄钟'), css.pomodoroWindow ?? '')
  const pomodoroPanel = element('div', css.pomodoroPanel ?? '')
  const pomodoroPhase = element('div', css.pomodoroPhase ?? '', () => t('专注时间'))
  const pomodoroDisplay = element('output', css.pomodoroDisplay ?? '', '25:00')
  pomodoroDisplay.setAttribute('aria-live', 'polite')
  const pomodoroHint = element('p', css.pomodoroHint ?? '', () => t('开始一轮专注，结束后记得离开座位走一走。'))
  const pomodoroControls = element('div', css.pomodoroControls ?? '')
  const pomodoroToggle = element('button', css.pomodoroButton ?? '', () => t('启动计时'))
  const pomodoroSkip = element('button', css.pomodoroButton ?? '', () => t('跳过'))
  const pomodoroReset = element('button', css.pomodoroButton ?? '', () => t('重置'))
  for (const button of [pomodoroToggle, pomodoroSkip, pomodoroReset]) button.type = 'button'
  pomodoroControls.append(pomodoroToggle, pomodoroSkip, pomodoroReset)
  const pomodoroPresets = element('div', css.pomodoroPresets ?? '')
  const pomodoroPreset25 = element('button', css.pomodoroPreset ?? '', '25 + 5')
  const pomodoroPreset50 = element('button', css.pomodoroPreset ?? '', '50 + 10')
  pomodoroPreset25.type = 'button'
  pomodoroPreset50.type = 'button'
  pomodoroPresets.append(pomodoroPreset25, pomodoroPreset50)
  const pomodoroCustom = element('div', css.pomodoroCustom ?? '')
  const pomodoroFocusLabel = element('label', css.pomodoroField ?? '', () => t('专注'))
  const pomodoroFocusInput = element('input', css.pomodoroInput ?? '')
  pomodoroFocusInput.type = 'number'
  pomodoroFocusInput.min = '1'
  pomodoroFocusInput.max = '180'
  pomodoroFocusInput.value = '25'
  pomodoroFocusLabel.append(pomodoroFocusInput, element('span', '', () => t(' 分')))
  const pomodoroBreakLabel = element('label', css.pomodoroField ?? '', () => t('休息'))
  const pomodoroBreakInput = element('input', css.pomodoroInput ?? '')
  pomodoroBreakInput.type = 'number'
  pomodoroBreakInput.min = '1'
  pomodoroBreakInput.max = '180'
  pomodoroBreakInput.value = '5'
  pomodoroBreakLabel.append(pomodoroBreakInput, element('span', '', () => t(' 分')))
  const pomodoroApply = element('button', css.pomodoroPencil ?? '', '✎')
  pomodoroApply.type = 'button'
  setAttr(pomodoroApply, 'title', () => t('应用自定义时长'))
  setAttr(pomodoroApply, 'aria-label', () => t('应用自定义番茄钟时长'))
  pomodoroCustom.append(pomodoroFocusLabel, pomodoroBreakLabel, pomodoroApply)
  pomodoroPanel.append(
    pomodoroPhase,
    pomodoroDisplay,
    pomodoroHint,
    pomodoroControls,
    pomodoroPresets,
    pomodoroCustom,
  )
  pomodoro.body.append(pomodoroPanel)

  const status = makeWindow('status', () => t('任务管理器'), css.statusWindow ?? '')
  const taskManagerTabs = element('div', css.taskManagerTabs ?? '')
  taskManagerTabs.setAttribute('role', 'tablist')
  const taskProcessTab = element('button', css.taskManagerTab ?? '', () => t('进程'))
  const taskStatsTab = element('button', css.taskManagerTab ?? '', () => t('状态'))
  const taskFeed = element('div', css.taskManagerFeed ?? '')
  const taskStats = element('div', css.taskManagerStats ?? '')
  taskProcessTab.type = 'button'
  taskStatsTab.type = 'button'
  taskProcessTab.setAttribute('role', 'tab')
  taskStatsTab.setAttribute('role', 'tab')
  taskProcessTab.setAttribute('aria-selected', 'false')
  taskStatsTab.setAttribute('aria-selected', 'true')
  taskFeed.dataset.skinSurface = 'task-manager-feed'
  taskFeed.setAttribute('role', 'tabpanel')
  taskStats.setAttribute('role', 'tabpanel')
  taskFeed.hidden = true
  const selectTaskManagerTab = (view: 'process' | 'stats'): void => {
    const process = view === 'process'
    taskProcessTab.setAttribute('aria-selected', String(process))
    taskStatsTab.setAttribute('aria-selected', String(!process))
    taskFeed.hidden = !process
    taskStats.hidden = process
  }
  taskProcessTab.addEventListener('click', () => selectTaskManagerTab('process'))
  taskStatsTab.addEventListener('click', () => selectTaskManagerTab('stats'))
  taskManagerTabs.append(taskProcessTab, taskStatsTab)
  taskStats.append(
    makeStatusRow(
      NGO_STATUS_FOLLOWER.dataUri,
      'tokens',
      () => t('TOKEN数'),
      '0',
      'tutorial_follower',
      '这是我们一路消耗的 TOKEN 数。\n越聊越多，也是共同留下的足迹！',
      'The TOKENs we have spent together. Every chat leaves the number a little bigger!',
    ),
    makeStatusRow(
      NGO_STATUS_LOVE.dataUri,
      'cache',
      () => t('缓存命中率'),
      '--',
      'tutorial_love',
      '这是我们之间的默契度。\n越高，就越能接住彼此说过的话（心）',
      'This is how in sync we are. The higher it gets, the better I remember our rhythm!',
    ),
    makeStatusRow(
      NGO_STATUS_STRESS.dataUri,
      'context',
      () => t('上下文占用'),
      '0 / 100',
      'tutorial_stress',
      '脑袋里已经塞了多少东西。\n太满的话，就该稍微整理一下啦。',
      'How full my head is right now. If it gets too crowded, it is time to tidy things up.',
    ),
    makeStatusRow(
      NGO_STATUS_YAMI.dataUri,
      'access',
      () => t('权限深度'),
      '--',
      'tutorial_yami',
      '代表我能把手伸到多远。\n越深，我能替你做的事就越多——也要更小心哦！',
      'How far I can reach. Deeper access lets me do more for you, so we should be more careful too!',
    ),
  )
  status.body.append(taskManagerTabs, taskFeed, taskStats)

  const medicineBuffTray = element('aside', medicineCss.medicineBuffTray ?? '')
  medicineBuffTray.dataset.medicineBuffTray = ''
  setAttr(medicineBuffTray, 'aria-label', () => t('药物状态'))
  const minecraftBuffBar = element('section', medicineCss.minecraftBuffBar ?? '')
  minecraftBuffBar.dataset.minecraftBuffBar = ''
  minecraftBuffBar.hidden = true
  const terrariaBuffBar = element('section', medicineCss.terrariaBuffBar ?? '')
  terrariaBuffBar.dataset.terrariaBuffBar = ''
  terrariaBuffBar.hidden = true
  medicineBuffTray.append(minecraftBuffBar, terrariaBuffBar)
  const medicineBuffIcons: Record<MedicineBuffId, string> = {
    'minecraft-blindness': MINECRAFT_EFFECT_BLINDNESS.dataUri,
    'minecraft-nausea': MINECRAFT_EFFECT_NAUSEA.dataUri,
    'terraria-gravity': TERRARIA_BUFF_GRAVITATION.dataUri,
    'terraria-poisoned': TERRARIA_DEBUFF_POISONED.dataUri,
    'terraria-darkness': TERRARIA_DEBUFF_DARKNESS.dataUri,
    'terraria-cursed': TERRARIA_DEBUFF_CURSED.dataUri,
    'terraria-on-fire': TERRARIA_DEBUFF_ON_FIRE.dataUri,
    'terraria-bleeding': TERRARIA_DEBUFF_BLEEDING.dataUri,
    'terraria-confused': TERRARIA_DEBUFF_CONFUSED.dataUri,
    'terraria-slow': TERRARIA_DEBUFF_SLOW.dataUri,
    'terraria-weak': TERRARIA_DEBUFF_WEAK.dataUri,
    'terraria-silenced': TERRARIA_DEBUFF_SILENCED.dataUri,
    'terraria-broken-armor': TERRARIA_DEBUFF_BROKEN_ARMOR.dataUri,
    'terraria-suffocation': TERRARIA_DEBUFF_SUFFOCATION.dataUri,
  }
  const medicineBuffTimes = new Set<HTMLElement>()
  const updateMedicineBuffTimes = (): void => {
    const now = Date.now()
    for (const node of medicineBuffTimes) {
      const expiresAt = Number(node.dataset.buffExpiresAt)
      setText(node, Number.isFinite(expiresAt) ? `${Math.max(0, Math.ceil((expiresAt - now) / 1_000))}s` : '∞')
    }
  }
  const renderMedicineBuffs = (buffs: readonly MedicineBuff[]): void => {
    medicineBuffTimes.clear()
    minecraftBuffBar.replaceChildren()
    terrariaBuffBar.replaceChildren()
    for (const buff of buffs) {
      const item = element('div', medicineCss.medicineBuff ?? '')
      item.dataset.medicineBuff = buff.id
      setAttr(item, 'title', () => t(buff.label))
      const icon = element('img', medicineCss.medicineBuffIcon ?? '')
      icon.src = medicineBuffIcons[buff.id]
      icon.alt = ''
      icon.setAttribute('aria-hidden', 'true')
      const time = element('span', medicineCss.medicineBuffTime ?? '')
      if (buff.expiresAt !== null) time.dataset.buffExpiresAt = String(buff.expiresAt)
      setText(time, buff.expiresAt === null ? '∞' : '')
      item.append(icon, time)
      medicineBuffTimes.add(time)
      ;(buff.game === 'minecraft' ? minecraftBuffBar : terrariaBuffBar).append(item)
    }
    minecraftBuffBar.hidden = minecraftBuffBar.childElementCount === 0
    terrariaBuffBar.hidden = terrariaBuffBar.childElementCount === 0
    updateMedicineBuffTimes()
  }
  const medicineBuffClock = window.setInterval(updateMedicineBuffTimes, 250)

  const medicine = makeWindow('medicine', () => t('吃药'), medicineCss.medicineWindow ?? '')
  let medicineEffectsStorage: Storage | undefined
  try { medicineEffectsStorage = window.localStorage } catch {}
  const medicineEffects = createMedicineEffects(medicineCss, {
    gamekidSprite: ISAAC_GAMEKID.dataUri,
    medicineRoot: medicine.body,
    medicineLauncher: medicineShortcut,
    cursorSprite: NGO_CURSOR.dataUri,
    onBuffsChange: renderMedicineBuffs,
    ...(medicineEffectsStorage === undefined ? {} : { storage: medicineEffectsStorage }),
    powerConsumableSprites: [
      NGO_POWER_ITEM_PIEN.dataUri,
      NGO_POWER_ITEM_HEART.dataUri,
      NGO_POWER_ITEM_BEAR.dataUri,
      NGO_POWER_ITEM_MENDAKO.dataUri,
      NGO_POWER_ITEM_TEA.dataUri,
    ],
    onPowerConsume: () => sfx?.play('isaacGamekidChew'),
  })
  const consumeMedicine = (medicineDefinition: MedicineDefinition, stewOutcome?: SuspiciousStewOutcome): void => {
    if (medicineDefinition.id === 'power-pill') {
      sfx?.play('isaacVoicePowerPill')
    } else if (medicineDefinition.id === 'retro-vision') {
      sfx?.play('isaacVoiceRetroVision')
    } else if (medicineDefinition.id === 'gravity-potion') {
      sfx?.play('terrariaGravityPotionUse')
    } else if (medicineDefinition.id === 'suspicious-stew') {
      if (sfx === undefined) medicineEffects.activate(medicineDefinition.id, stewOutcome)
      else void sfx.playAndWait('minecraftSuspiciousStewEat')
        .then(() => medicineEffects.activate(medicineDefinition.id, stewOutcome))
      return
    } else if (medicineDefinition.id === 'red-potion') {
      if (sfx === undefined) medicineEffects.activate(medicineDefinition.id)
      else void sfx.playAndWait('terrariaGravityPotionUse').then(() => medicineEffects.activate(medicineDefinition.id))
      return
    } else {
      if (sfx === undefined) medicineEffects.activate(medicineDefinition.id)
      else void sfx.playAndWait('minecraftDrink').then(() => medicineEffects.activate(medicineDefinition.id))
      return
    }
    medicineEffects.activate(medicineDefinition.id)
  }
  const slotRewards = createSlotRewards(rewardCss, {
    desktop: scene, internet: internetShortcut, origin: medicineShortcut,
    spiderSprite: ISAAC_BLUE_SPIDER_WALK.dataUri,
    webIcon: WEB_ICON, cardSprite: ISAAC_TAROT_FRONTS.dataUri, bombSprite: ISAAC_TROLL_BOMB_TIMELINE.dataUri,
    machine: () => medicineSlot,
    webcam: webcamStage,
    onWebcamBomb,
    onBombGrab: () => {
      for (const name of ['isaacBombExplode0', 'isaacBombExplode1', 'isaacBombExplode2'] as const) sfx?.prepareStutter(name)
    },
    achievementMasks: [STEAM_ACHIEVEMENT_MASK_ROOT.dataUri, STEAM_ACHIEVEMENT_MASK_ROTATE.dataUri],
    onAchievement: () => sfx?.play('steamAchievement'),
    onBombSound: event => {
      const sounds = event === 'drop'
        ? ['isaacBombDrop0', 'isaacBombDrop1'] as const
        : ['isaacBombExplode0', 'isaacBombExplode1', 'isaacBombExplode2'] as const
      const name = sounds[Math.floor(Math.random() * sounds.length)]!
      if (event === 'explode-glitch') sfx?.playStutter(name)
      else sfx?.play(name)
    },
  })
  const medicineSlot = buildMedicineSlot(medicineCss, {
    assets: {
      brokenBody: ISAAC_SLOT_BROKEN.dataUri,
      bodies: [ISAAC_SLOT_BODY_0.dataUri, ISAAC_SLOT_BODY_1.dataUri, ISAAC_SLOT_BODY_2.dataUri],
      icons: {
        0: ISAAC_SLOT_ICON_00.dataUri,
        2: ISAAC_SLOT_ICON_02.dataUri,
        5: ISAAC_SLOT_ICON_05.dataUri,
        8: ISAAC_SLOT_ICON_08.dataUri,
        9: ISAAC_SLOT_ICON_09.dataUri,
        10: ISAAC_SLOT_ICON_10.dataUri,
        11: ISAAC_SLOT_ICON_11.dataUri,
        12: ISAAC_SLOT_ICON_12.dataUri,
        13: ISAAC_SLOT_ICON_13.dataUri,
      },
      pillSheet: ISAAC_PILL_SHEET.dataUri,
      rewardIcons: { card: ISAAC_TAROT_CARD.dataUri, spiders: ISAAC_BLUE_SPIDER.dataUri, bomb: ISAAC_SLOT_ICON_02.dataUri },
      medicineIcons: {
        'gravity-potion': TERRARIA_GRAVITY_POTION.dataUri,
        'suspicious-stew': MINECRAFT_SUSPICIOUS_STEW.dataUri,
        'red-potion': TERRARIA_RED_POTION.dataUri,
        'milk-bucket': MINECRAFT_MILK_BUCKET.dataUri,
      },
    },
    sounds: {
      play(name) {
        const mapped = {
          coin: 'isaacSlotCoin',
          pull: 'isaacSlotPull',
          stop: 'isaacSlotStop',
          spawn: 'isaacSlotSpawn',
        } as const
        sfx?.play(mapped[name])
      },
      playLoop: () => sfx?.playLoop('isaacSlotSpin', 0.55),
      stop: () => sfx?.stop('isaacSlotSpin'),
    },
    milkBiasActive: () => medicineEffects.isActive('red-potion'),
    onTake: consumeMedicine,
    onBonus: slotRewards.award,
  })
  medicine.body.append(medicineSlot.root)

  const medicineConsent = element('div', medicineCss.medicineConsentOverlay ?? '')
  medicineConsent.dataset.medicineConsent = ''
  medicineConsent.hidden = true
  const medicineConsentDialog = element('section', medicineCss.medicineConsentDialog ?? '')
  medicineConsentDialog.setAttribute('role', 'alertdialog')
  medicineConsentDialog.setAttribute('aria-modal', 'true')
  medicineConsentDialog.setAttribute('aria-labelledby', 'ngo-medicine-consent-title')
  medicineConsentDialog.setAttribute('aria-describedby', 'ngo-medicine-consent-copy')
  const medicineConsentTitle = element('h2', medicineCss.medicineConsentTitle ?? '', () => t('使用须知'))
  medicineConsentTitle.id = 'ngo-medicine-consent-title'
  const medicineConsentCopy = element(
    'p',
    medicineCss.medicineConsentCopy ?? '',
    () => t('本功能纯属娱乐，其中可能出现各种其他游戏的内容或者要素。内置功能与 DSH 或《主播女孩重度依赖》无任何关系，且不作为任何药用建议，请勿当真。点击确认代表你理解并同意。'),
  )
  medicineConsentCopy.id = 'ngo-medicine-consent-copy'
  const medicineConsentActions = element('div', medicineCss.medicineConsentActions ?? '')
  const medicineConsentDecline = element('button', medicineCss.medicineConsentDecline ?? '', () => t('不同意'))
  medicineConsentDecline.type = 'button'
  medicineConsentDecline.dataset.medicineConsentAction = 'decline'
  const medicineConsentAccept = element('button', medicineCss.medicineConsentAccept ?? '', () => t('确认'))
  medicineConsentAccept.type = 'button'
  medicineConsentAccept.dataset.medicineConsentAction = 'accept'
  medicineConsentActions.append(medicineConsentDecline, medicineConsentAccept)
  medicineConsentDialog.append(medicineConsentTitle, medicineConsentCopy, medicineConsentActions)
  medicineConsent.append(medicineConsentDialog)

  let medicineTestControls: HTMLElement | null = null
  const medicineTestParams = new URLSearchParams(window.location.search)
  if (medicineTestParams.has('medicine-test') || medicineTestParams.has('medicineTest')) {
    const panel = element('section', medicineCss.medicineTestControls ?? '')
    panel.dataset.medicineTestControls = ''
    const title = element('strong', medicineCss.medicineTestTitle ?? '', 'MEDICINE TEST')
    const triggerGrid = element('div', medicineCss.medicineTestGrid ?? '')
    const medicineById = (id: MedicineEffect): MedicineDefinition => MEDICINES.find(item => item.id === id)!
    const triggers: readonly {
      label: string
      medicine: MedicineDefinition
      stewOutcome?: SuspiciousStewOutcome
    }[] = [
      { label: '大力丸', medicine: medicineById('power-pill') },
      { label: '复古视野', medicine: medicineById('retro-vision') },
      { label: '重力药水', medicine: medicineById('gravity-potion') },
      { label: '炖菜：失明', medicine: medicineById('suspicious-stew'), stewOutcome: 'blindness' },
      { label: '炖菜：反胃', medicine: medicineById('suspicious-stew'), stewOutcome: 'nausea' },
      { label: '红药水', medicine: medicineById('red-potion') },
      { label: '牛奶', medicine: medicineById('milk-bucket') },
    ]
    for (const trigger of triggers) {
      const button = element('button', medicineCss.medicineTestButton ?? '', () => t(trigger.label))
      button.type = 'button'
      button.dataset.medicineTestTrigger = trigger.medicine.id
      if (trigger.stewOutcome !== undefined) button.dataset.stewOutcome = trigger.stewOutcome
      button.addEventListener('click', () => consumeMedicine(trigger.medicine, trigger.stewOutcome))
      triggerGrid.append(button)
    }
    const combo = element('button', medicineCss.medicineTestCombo ?? '', () => t('组合：复古 + 反胃'))
    combo.type = 'button'
    combo.dataset.medicineTestCombo = 'retro-nausea'
    combo.addEventListener('click', () => {
      consumeMedicine(medicineById('retro-vision'))
      consumeMedicine(medicineById('suspicious-stew'), 'nausea')
    })
    for (const [reward, label] of [['spiders', '蓝蜘蛛 × 2'], ['card', '塔罗牌'], ['bomb', '恶作剧炸弹']] as const) {
      const button = element('button', medicineCss.medicineTestButton ?? '', () => t(label))
      button.type = 'button'
      button.addEventListener('click', () => slotRewards.award(reward))
      triggerGrid.append(button)
    }
    const soundLabel = element('label', medicineCss.medicineTestButton ?? '', () => t('测试音效 '))
    const soundVolume = document.createElement('input')
    soundVolume.type = 'range'
    soundVolume.min = '0'
    soundVolume.max = '100'
    soundVolume.value = '40'
    setAttr(soundVolume, 'aria-label', () => t('测试音效音量'))
    sfx?.setSeVolume(40)
    soundVolume.addEventListener('input', () => sfx?.setSeVolume(Number(soundVolume.value)))
    soundLabel.append(soundVolume)
    const achievementPreview = element('button', medicineCss.medicineTestButton ?? '', () => t('重播成就（含音效）'))
    achievementPreview.type = 'button'
    achievementPreview.addEventListener('click', slotRewards.previewAchievement)
    triggerGrid.append(achievementPreview)
    panel.append(title, soundLabel, triggerGrid, combo)
    document.documentElement.append(panel)
    medicineTestControls = panel
  }

  const settings = makeWindow('settings', () => t('控制面板'), css.settingsWindow ?? '')

  // 「我的图片」: album grid window (MyPicture). Clicking a thumb opens the
  // separate ImageViewer window below (MyPictureContentView.cs:26-28:
  // NewWindow(AppType.ImageViewer) + SetData).
  const pictures = makeWindow('pictures', () => t('我的图片'), css.picturesWindow ?? '')
  const pictureGrid = element('div', css.pictureGrid ?? '')
  pictureGrid.dataset.skinSurface = 'picture-grid'
  const pictureEmpty = element('div', css.pictureEmpty ?? '', () => t('相册为空——点击 JINE 消息中的图片查看'))
  pictures.body.append(pictureGrid, pictureEmpty)

  // ImageViewer 700x480 (apps_table), black stage, 1s mask-reveal animation
  // (ImageViewer.cs Show(): padding height->0, Ease.InCubic).
  const imageViewer = makeWindow('image-viewer', () => t('图片'), css.imageViewerWindow ?? '')
  const imageViewerStage = element('div', css.imageViewerStage ?? '')
  imageViewerStage.dataset.skinSurface = 'image-viewer-stage'
  const imageViewerImage = element('img', css.imageViewerImage ?? '')
  setAttr(imageViewerImage, 'alt', () => t('图片查看'))
  const imageViewerError = element('div', css.imageViewerError ?? '', () => t('图片加载失败'))
  imageViewerStage.append(imageViewerImage, imageViewerError)
  imageViewer.body.append(imageViewerStage)

  // App_Load / App_LoadDataComponent, reconstructed from the shipped prefab:
  // 1311x918 content, 100px ending strip and three 200px Data rows. DSH's
  // official session tree remains authoritative and is projected into the
  // DataPrefab-shaped buttons later in apply().
  const save = makeWindow('save', () => t('继续游戏'), css.saveWindow ?? '')
  save.window.id = 'ngo-save-manager'
  const saveProgress = element('nav', css.saveProgress ?? '')
  setAttr(saveProgress, 'aria-label', () => t('工作区快速导航'))
  const saveProgressTrack = element('div', css.saveProgressTrack ?? '')
  const saveWorkspaceCreate = element('button', css.saveWorkspaceCreate ?? '', () => t('账号转生'))
  saveWorkspaceCreate.type = 'button'
  setAttr(saveWorkspaceCreate, 'title', () => t('新建工作区'))
  saveProgress.append(saveProgressTrack, saveWorkspaceCreate)
  const saveData = element('div', css.saveData ?? '')
  save.body.append(saveProgress, saveData)

  const startMenu = element('menu', css.startMenu ?? '')
  setAttr(startMenu, 'aria-label', () => t('开始菜单'))
  const startMenuBrand = element('span', css.startMenuBrand ?? '', 'Needy Girl Overdose')
  startMenuBrand.setAttribute('aria-hidden', 'true')
  const startNewButton = element('button', css.startMenuButton ?? '', () => t('从头开始'))
  const startContinueButton = element('button', css.startMenuButton ?? '', () => t('继续游戏'))
  const startPicturesButton = element('button', css.startMenuButton ?? '', () => t('我的图片'))
  const startControlButton = element('button', css.startMenuButton ?? '', () => t('控制面板'))
  const startRestartButton = element('button', css.startMenuButton ?? '', () => t('重新启动'))
  const startShutdownButton = element('button', css.startMenuButton ?? '', () => t('关机'))
  startShutdownButton.dataset.startShutdown = ''
  for (const button of [
    startNewButton,
    startContinueButton,
    startPicturesButton,
    startControlButton,
    startRestartButton,
    startShutdownButton,
  ]) button.type = 'button'
  startMenu.append(
    startMenuBrand,
    startNewButton,
    startContinueButton,
    startPicturesButton,
    startControlButton,
    startRestartButton,
    startShutdownButton,
  )

  const taskbar = element('div', css.taskbar ?? '')
  taskbar.dataset.ngoTaskbar = ''
  const startButton = element('button', css.startButton ?? '', () => t('开始'))
  startButton.type = 'button'
  startButton.setAttribute('aria-controls', 'ngo-start-menu')
  startButton.setAttribute('aria-expanded', 'false')
  startMenu.id = 'ngo-start-menu'
  const quickLaunch = element('div', css.quickLaunch ?? '')
  const makeQuickLaunch = (label: UiText, src: string): HTMLButtonElement => {
    const button = element('button', css.quickLaunchButton ?? '')
    button.type = 'button'
    button.dataset.quickLaunch = resolveText(label).toLowerCase()
    setAttr(button, 'aria-label', label)
    const image = element('img', css.quickLaunchIcon ?? '')
    image.src = src
    image.alt = ''
    button.append(image)
    return button
  }
  const poketterQuickLaunch = makeQuickLaunch(() => t('推博'), NGO_TASKBAR_POKETTER.dataUri)
  const jineQuickLaunch = makeQuickLaunch('JINE', NGO_TASKBAR_JINE.dataUri)
  const statusQuickLaunch = makeQuickLaunch(() => t('任务管理器'), NGO_TASKBAR_TASKMANAGER.dataUri)
  quickLaunch.append(poketterQuickLaunch, jineQuickLaunch, statusQuickLaunch)
  const tasks = element('div', css.taskItems ?? '')
  const makeTaskItem = (label: UiText): HTMLButtonElement => {
    const button = element('button', css.taskItem ?? '')
    const mark = element('span', css.taskItemMark ?? '')
    const text = element('span', css.taskItemLabel ?? '', label)
    mark.setAttribute('aria-hidden', 'true')
    button.append(mark, text)
    return button
  }
  const statusTask = makeTaskItem(() => t('任务管理器'))
  const jineTask = makeTaskItem('JINE')
  const webcamTask = makeTaskItem('webcam')
  const liveTask = makeTaskItem('LIVE')
  const internetTask = makeTaskItem(() => t('因特网'))
  const tweetTask = makeTaskItem(() => t('推博'))
  const settingsTask = makeTaskItem(() => t('控制面板'))
  const todoTask = makeTaskItem(() => t('代办'))
  const pomodoroTask = makeTaskItem(() => t('番茄钟'))
  const medicineTask = makeTaskItem(() => t('吃药'))
  const pomodoroTaskLabel = pomodoroTask.lastElementChild as HTMLElement
  const pomodoroTray = element('button', css.pomodoroTray ?? '')
  pomodoroTray.type = 'button'
  pomodoroTray.hidden = true
  setAttr(pomodoroTray, 'title', () => t('番茄钟'))
  const pictureTask = makeTaskItem(() => t('我的图片'))
  const imageViewerTask = makeTaskItem(() => t('图片'))
  const saveTask = makeTaskItem(() => t('继续游戏'))
  tasks.append(statusTask, jineTask, webcamTask, liveTask, internetTask, tweetTask, todoTask, pomodoroTask, medicineTask, settingsTask, pictureTask, imageViewerTask, saveTask)
  const clockButton = element('button', css.dayButton ?? '')
  clockButton.type = 'button'
  clockButton.setAttribute('aria-controls', 'ngo-save-manager')
  clockButton.setAttribute('aria-expanded', 'false')
  setAttr(clockButton, 'title', () => t('打开会话与存档'))
  const clockIcon = element('img', css.dayIcon ?? '')
  clockIcon.src = NGO_WATCH_NOON.dataUri
  clockIcon.alt = ''
  clockIcon.setAttribute('aria-hidden', 'true')
  const clockLabel = element('span', css.dayLabel ?? '', '--:--')
  clockButton.append(clockIcon, clockLabel)

  const connectionTray = element('div', css.connectionTray ?? '')
  connectionTray.hidden = true
  const connectionButton = element('button', css.connectionButton ?? '')
  connectionButton.type = 'button'
  connectionButton.dataset.connectionPhase = 'connected'
  connectionButton.setAttribute('aria-controls', 'ngo-connection-popover')
  connectionButton.setAttribute('aria-expanded', 'false')
  setAttr(connectionButton, 'aria-label', () => t('网络连接正常，查看连接状态'))
  const connectionSignal = element('span', css.connectionSignal ?? '')
  connectionSignal.setAttribute('aria-hidden', 'true')
  for (let index = 0; index < 4; index += 1) {
    const bar = element('span', css.connectionSignalBar ?? '')
    bar.dataset.connectionSignalBar = String(index + 1)
    connectionSignal.append(bar)
  }
  connectionButton.append(connectionSignal)

  const connectionPopover = element('section', css.connectionPopover ?? '')
  connectionPopover.id = 'ngo-connection-popover'
  connectionPopover.hidden = true
  connectionPopover.setAttribute('role', 'dialog')
  setAttr(connectionPopover, 'aria-label', () => t('连接状态'))
  const connectionTitle = element('strong', css.connectionTitle ?? '', () => t('网络连接'))
  const connectionStatus = element('p', css.connectionStatus ?? '', () => t('连接正常'))
  connectionStatus.setAttribute('aria-live', 'polite')
  const connectionAction = element('button', css.connectionAction ?? '', () => t('重新连接'))
  connectionAction.type = 'button'
  connectionAction.hidden = true
  connectionPopover.append(connectionTitle, connectionStatus, connectionAction)
  connectionTray.append(connectionButton, connectionPopover)

  taskbar.append(startButton, quickLaunch, tasks, connectionTray, pomodoroTray, clockButton)

  const desktopNotice = element('button', css.desktopNotice ?? '')
  desktopNotice.type = 'button'
  desktopNotice.hidden = true
  desktopNotice.dataset.desktopNotice = ''
  const desktopNoticeIcon = element('img', css.desktopNoticeMark ?? '')
  desktopNoticeIcon.src = NGO_ICON_JINE.dataUri
  desktopNoticeIcon.alt = ''
  desktopNoticeIcon.setAttribute('aria-hidden', 'true')
  const desktopNoticeText = element('span', css.desktopNoticeText ?? '')
  desktopNotice.append(desktopNoticeIcon, desktopNoticeText)

  scene.append(
    fontFace,
    sideLeft,
    sideRight,
    shortcuts,
    webcam.window,
    live.window,
    internet.window,
    tweet.window,
    jine.window,
    todo.window,
    pomodoro.window,
    medicine.window,
    medicineConsent,
    status.window,
    settings.window,
    pictures.window,
    imageViewer.window,
    save.window,
    startMenu,
    medicineBuffTray,
    desktopNotice,
    taskbar,
  )
  return {
    scene,
    liveFeed: liveSurface.feed,
    liveSurface,
    tweetFeed,
    jineFeed,
    jineSessionToggle,
    jineSessionMenu,
    internetSearchInput,
    internetSearchResults,
    internetSearchStatus,
    taskFeed,
    todoList,
    connectionTray,
    connectionButton,
    connectionPopover,
    connectionStatus,
    connectionAction,
    clockButton,
    clockIcon,
    clockLabel,
    startButton,
    startMenu,
    startNewButton,
    startContinueButton,
    startControlButton,
    startRestartButton,
    startShutdownButton,
    settingsWindow: settings.window,
    pictureWindow: pictures.window,
    pictureGrid,
    pictureEmpty,
    imageViewerWindow: imageViewer.window,
    imageViewerStage,
    imageViewerImage,
    imageViewerError,
    saveWindow: save.window,
    saveProgress,
    saveProgressTrack,
    saveWorkspaceCreate,
    saveData,
    desktopNotice,
    desktopNoticeIcon,
    desktopNoticeText,
    jineTaskButton: jineTask,
    statusTaskButton: statusTask,
    pomodoroDisplay,
    pomodoroPhase,
    pomodoroHint,
    pomodoroToggle,
    pomodoroSkip,
    pomodoroReset,
    pomodoroPreset25,
    pomodoroPreset50,
    pomodoroFocusInput,
    pomodoroBreakInput,
    pomodoroApply,
    pomodoroTaskLabel,
    pomodoroTray,
    pomodoroShortcutLabel: pomodoroShortcut.lastElementChild as HTMLElement,
    medicineShortcut,
    medicineConsent,
    medicineConsentAccept,
    medicineConsentDecline,
    selectTaskManagerTab,
    setWebcamCharacter,
    rollWebcamPose: () => {
      const rollCount = Number(webcamStage.dataset.webcamPoseRollCount ?? '0') + 1
      webcamStage.dataset.webcamPoseRollCount = String(rollCount)
      poseLoop.roll()
    },
    playWebcamBreakPose: () => poseLoop.hold(AME_BREAK_POSE),
    disposeWebcam: () => {
      if (webcamCharacterFallbackFrame !== undefined) {
        window.cancelAnimationFrame(webcamCharacterFallbackFrame)
        webcamCharacterFallbackFrame = undefined
      }
      stopPat()
      poseLoop.dispose()
      headHitbox.removeEventListener('click', playPat)
      headHitbox.removeEventListener('keydown', playPatFromKeyboard)
      if (patAudio !== null) {
        try { patAudio.pause() } catch {}
        patAudio.src = ''
      }
    },
    disposeMedicine: () => {
      window.clearInterval(medicineBuffClock)
      medicineTestControls?.remove()
      medicineSlot.dispose()
      slotRewards.dispose()
      medicineEffects.dispose()
    },
    windows: [
      {
        id: 'webcam',
        element: webcam.window,
        taskButton: webcamTask,
        recoverOnDismiss: true,
        onDismissRecovered: (action) => {
          // Closing destroys and recreates App_Webcam, so Start/bgView rolls a
          // new monitor screensaver. Minimize only reactivates the same object.
          if (action === 'close') randomizeWebcamScreensaver()
          if (webcamStage.dataset.webcamCharacter === 'ame') {
            poseLoop.react(AME_HENOJI_POSE, 1800)
          }
        },
      },
      {
        id: 'live',
        element: live.window,
        taskButton: liveTask,
        initialState: 'closed',
        openers: [streamShortcut],
      },
      {
        id: 'internet',
        element: internet.window,
        taskButton: internetTask,
        initialState: 'closed',
        openers: [internetShortcut],
      },
      {
        id: 'tweet',
        element: tweet.window,
        taskButton: tweetTask,
        initialState: 'closed',
        openers: [poketterQuickLaunch],
      },
      {
        id: 'jine',
        element: jine.window,
        taskButton: jineTask,
        initialState: 'closed',
        openers: [jineShortcut, jineQuickLaunch],
      },
      {
        id: 'todo',
        element: todo.window,
        taskButton: todoTask,
        initialState: 'closed',
        openers: [todoShortcut],
      },
      {
        id: 'pomodoro',
        element: pomodoro.window,
        taskButton: pomodoroTask,
        initialState: 'closed',
        openers: [pomodoroShortcut, pomodoroTray],
      },
      {
        id: 'medicine',
        element: medicine.window,
        taskButton: medicineTask,
        initialState: 'closed',
      },
      { id: 'status', element: status.window, taskButton: statusTask, openers: [statusQuickLaunch] },
      {
        id: 'settings',
        element: settings.window,
        taskButton: settingsTask,
        initialState: 'closed',
        openers: [startControlButton],
        followerSelector: "[data-slot='sidebar.settings'] [role='dialog']",
        followerInset: { top: 42, right: 12, bottom: 22, left: 8 },
      },
      {
        id: 'pictures',
        element: pictures.window,
        taskButton: pictureTask,
        initialState: 'closed',
        openers: [startPicturesButton],
      },
      {
        id: 'image-viewer',
        element: imageViewer.window,
        taskButton: imageViewerTask,
        initialState: 'closed',
      },
      {
        id: 'save',
        element: save.window,
        taskButton: saveTask,
        initialState: 'closed',
      },
    ],
  }
}

function normalizedText(node: Element): string {
  return (node.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function parseCompactTokens(value: string, suffix: string): number {
  const amount = Number(value.replaceAll(',', ''))
  if (!Number.isFinite(amount)) return 0
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[suffix.toUpperCase()] ?? 1
  return amount * multiplier
}

function formatTokenCount(value: number): string {
  return String(Math.max(0, Math.round(value)))
}

function appendEmpty(surface: HTMLElement, text: string): void {
  surface.append(element('div', css.emptySurface ?? '', text))
}

function questionConfirmButton(root: Element): HTMLButtonElement | null {
  const section = root.querySelector(':scope > section')
  const footer = section?.querySelector(':scope > footer')
  return footer === null || footer === undefined
    ? null
    : [...footer.querySelectorAll<HTMLButtonElement>('button')].at(-1) ?? null
}

function syncQuestionCustomRow(row: HTMLElement, forceOpen = false): void {
  const input = row.querySelector<HTMLTextAreaElement>('[data-ngo-question-custom-input], textarea')
  if (input === null) return
  const hadValue = row.hasAttribute('data-ngo-custom-value')
  const hasValue = input.value.trim() !== ''
  const focused = row.contains(document.activeElement)
  // Preserve a newly opened empty editor while the user is interacting with
  // it, but do not let that sticky open state survive the host clearing a
  // previously selected custom answer after another option is chosen.
  const keepEmptyEditorOpen = row.hasAttribute('data-ngo-custom-open') && !hadValue
  row.toggleAttribute('data-ngo-custom-value', hasValue)
  row.toggleAttribute('data-ngo-custom-open', forceOpen || hasValue || focused || keepEmptyEditorOpen)
}

function resizeQuestionCustomInput(input: HTMLTextAreaElement): void {
  const row = input.closest<HTMLElement>('[data-ngo-question-custom]')
  if (row === null) return
  // The collapsed editor has zero available width. Measuring it there makes
  // every character wrap and falsely drives the bubble to its 110px cap.
  if (!row.hasAttribute('data-ngo-custom-open') && input.value.trim() === '') {
    row.style.setProperty('--ngo-question-custom-height', '24px')
    return
  }
  // Reset the viewport before reading scrollHeight; otherwise a previously
  // tall explicit height becomes scrollHeight's floor and deletion never shrinks.
  row.style.setProperty('--ngo-question-custom-height', '24px')
  const height = Math.min(110, Math.max(24, input.scrollHeight || 24))
  row.style.setProperty('--ngo-question-custom-height', `${height}px`)
}

function syncNativeQuestionInput(editor: HTMLTextAreaElement): void {
  const row = editor.closest<HTMLElement>('[data-ngo-question-custom]')
  const native = row?.querySelector<HTMLInputElement>('[data-ngo-question-custom-native]')
  const wireValue = editor.value.replace(/\r?\n/g, '\u2028')
  if (native === null || native === undefined || native.value === wireValue) return
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(native, wireValue)
  native.dispatchEvent(new Event('input', { bubbles: true }))
}

/** Mark the stable semantic pieces of the host QuestionComposer. The skin
 * keeps every native React handler and only adapts the presentation. */
function decorateQuestionComposers(): void {
  for (const seat of document.querySelectorAll<HTMLElement>('[data-composer-seat]')) {
    seat.toggleAttribute('data-ngo-question-seat', seat.querySelector('[data-question-key]') !== null)
  }
  for (const root of document.querySelectorAll<HTMLElement>('[data-question-key]')) {
    const header = root.querySelector<HTMLElement>(':scope > section > header')
    if (header !== null) {
      let avatar = header.querySelector<HTMLImageElement>(':scope > [data-ngo-question-avatar]')
      if (avatar === null) {
        avatar = element('img', css.questionAvatar ?? '')
        avatar.dataset.ngoQuestionAvatar = ''
        avatar.src = NGO_JINE_AME.dataUri
        avatar.alt = ''
        avatar.setAttribute('aria-hidden', 'true')
        header.prepend(avatar)
      }
    }
    const group = root.querySelector<HTMLElement>("[role='radiogroup'], [role='group']")
    if (group === null) continue
    root.dataset.ngoQuestionMode = group.getAttribute('role') === 'group' ? 'multi' : 'single'
    for (const option of group.querySelectorAll<HTMLElement>("button[role='radio'], button[role='checkbox']")) {
      option.dataset.ngoQuestionOption = ''
      const copy = option.children.item(1)
      if (copy instanceof HTMLElement) {
        copy.dataset.ngoQuestionOptionCopy = ''
        let detail = option.querySelector<HTMLElement>(':scope > [data-ngo-question-option-detail]')
        if (detail === null) {
          detail = element('span', css.questionOptionDetail ?? '')
          detail.dataset.ngoQuestionOptionDetail = ''
          detail.setAttribute('aria-hidden', 'true')
          option.append(detail)
        }
        const detailText = normalizedText(copy)
        const checked = option.getAttribute('aria-checked') === 'true' ? 'true' : 'false'
        if (detail.dataset.ngoQuestionOptionDetailText !== detailText
          || detail.dataset.ngoQuestionOptionDetailChecked !== checked
          || detail.children.length < 2) {
          const marker = option.children.item(0)
          detail.replaceChildren(...[marker, copy]
            .filter((node): node is Element => node instanceof Element)
            .map(node => node.cloneNode(true)))
          detail.dataset.ngoQuestionOptionDetailText = detailText
          detail.dataset.ngoQuestionOptionDetailChecked = checked
        }
      }
    }
    const customRow = [...group.children]
      .find(child => child instanceof HTMLElement
        && child.querySelector("textarea, input[type='text']") !== null)
    if (customRow instanceof HTMLElement) {
      customRow.dataset.ngoQuestionCustom = ''
      const pencil = customRow.firstElementChild
      if (pencil instanceof HTMLElement) pencil.dataset.ngoQuestionPencil = ''
      const nativeInput = customRow.querySelector<HTMLInputElement>("input[type='text']")
      let input = customRow.querySelector<HTMLTextAreaElement>('textarea')
      if (nativeInput !== null) {
        nativeInput.dataset.ngoQuestionCustomNative = ''
        let editor = customRow.querySelector<HTMLTextAreaElement>('[data-ngo-question-custom-editor]')
        if (editor === null) {
          editor = element('textarea', css.questionCustomEditor ?? '')
          editor.dataset.ngoQuestionCustomEditor = ''
          editor.rows = 1
          editor.setAttribute('aria-label', nativeInput.getAttribute('aria-label') ?? nativeInput.placeholder)
          nativeInput.insertAdjacentElement('afterend', editor)
        }
        const editorValue = nativeInput.value.replace(/\u2028/g, '\n')
        if (document.activeElement !== editor && editor.value !== editorValue) editor.value = editorValue
        editor.placeholder = nativeInput.placeholder
        editor.disabled = nativeInput.disabled
        input = editor
      }
      if (input !== null) {
        input.dataset.ngoQuestionCustomInput = ''
        const inputBody = input.parentElement
        if (inputBody instanceof HTMLElement && inputBody !== customRow) {
          inputBody.dataset.ngoQuestionCustomBody = ''
          for (const sibling of inputBody.children) {
            if (sibling instanceof HTMLElement && sibling !== input
              && sibling.getAttribute('aria-hidden') === 'true') {
              sibling.dataset.ngoQuestionCustomMirror = ''
            }
          }
        }
      }
      syncQuestionCustomRow(customRow)
      if (input !== null) resizeQuestionCustomInput(input)
    }
    const confirm = questionConfirmButton(root)
    if (confirm !== null) {
      confirm.dataset.ngoQuestionConfirm = ''
      setAttr(confirm, 'data-ngo-question-confirm-label', () => /下一|next/i.test(normalizedText(confirm)) ? t('下一题 →') : t('确定 ✓'))
    }
  }
}

function clearQuestionDecorations(): void {
  document.querySelectorAll<HTMLElement>('[data-ngo-question-avatar], [data-ngo-question-option-detail]')
    .forEach(node => node.remove())
  document.querySelectorAll<HTMLElement>('[data-ngo-question-seat]')
    .forEach(node => node.removeAttribute('data-ngo-question-seat'))
  document.querySelectorAll<HTMLElement>('[data-ngo-question-mode]')
    .forEach(node => node.removeAttribute('data-ngo-question-mode'))
  document.querySelectorAll<HTMLElement>('[data-ngo-question-custom]')
    .forEach(row => row.style.removeProperty('--ngo-question-custom-height'))
  document.querySelectorAll<HTMLElement>('[data-ngo-question-custom-editor]').forEach(node => node.remove())
  for (const attribute of [
    'data-ngo-question-option',
    'data-ngo-question-option-copy',
    'data-ngo-question-keyboard-focus',
    'data-ngo-question-custom',
    'data-ngo-question-pencil',
    'data-ngo-question-custom-body',
    'data-ngo-question-custom-mirror',
    'data-ngo-question-custom-input',
    'data-ngo-question-custom-native',
    'data-ngo-custom-value',
    'data-ngo-custom-open',
    'data-ngo-question-confirm',
    'data-ngo-question-confirm-label',
  ]) {
    document.querySelectorAll<HTMLElement>(`[${attribute}]`).forEach(node => node.removeAttribute(attribute))
  }
}

interface JineProjection {
  text: string
  imageSrcs: string[]
  time: string
  read: boolean
}

interface ConversationTurn {
  userRow: Element | undefined
  assistantSteps: Element[]
  flowRows: Element[]
  turnTail: Element | undefined
  intermediateMarkdowns: Element[]
  finalMarkdown: Element | undefined
  complete: boolean
  time: string
  order: number
}

interface QuestionExchange {
  index: number
  question: string
  answers: string[]
  skipped: boolean
}

interface QuestionTranscript {
  requestKey: string
  flowKey: string
  flowRow?: Element | undefined
  exchanges: QuestionExchange[]
  complete: boolean
  submitRequested: boolean
  completedAt?: number | undefined
}

interface QuestionTranscriptStore {
  version: 2
  conversations: Record<string, QuestionTranscript[]>
}

const LEGACY_QUESTION_TRANSCRIPT_STORAGE = 'dsh:internet-angel-desktop:question-transcripts:v1'
const QUESTION_TRANSCRIPT_STORAGE = 'dsh:internet-angel-desktop:question-transcripts:v2'
const QUESTION_TRANSCRIPT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000
const QUESTION_TRANSCRIPT_MAX_RECORDS = 256
const QUESTION_TRANSCRIPT_MAX_STORAGE_CHARS = 750_000

function legacyQuestionTranscriptStorageKey(): string {
  return `${LEGACY_QUESTION_TRANSCRIPT_STORAGE}:${window.location.href}`
}

function questionFlowOwner(node: Element): Element | undefined {
  let owner = node.closest('[data-chat-flow-kind]') ?? undefined
  let parent = owner?.parentElement?.closest('[data-chat-flow-kind]') ?? undefined
  while (parent !== undefined) {
    owner = parent
    parent = owner.parentElement?.closest('[data-chat-flow-kind]') ?? undefined
  }
  return owner
}

function activeQuestionFlow(): Element | undefined {
  const tool = [...document.querySelectorAll<HTMLElement>("[data-tool='ask_user_question']")].at(-1)
  return tool === undefined ? undefined : questionFlowOwner(tool)
}

function questionPage(root: Element): { index: number; total: number } {
  const heading = root.querySelector<HTMLElement>('h2[id]')
  const idIndex = heading?.id.match(/-(\d+)$/)?.[1]
  const progress = normalizedText(root.querySelector('footer') ?? root).match(/(\d+)\s*\/\s*(\d+)/)
  return {
    index: idIndex === undefined ? Math.max(0, Number(progress?.[1] ?? 1) - 1) : Number(idIndex),
    total: Number(progress?.[2] ?? 1),
  }
}

function readQuestionExchange(root: Element): QuestionExchange {
  const page = questionPage(root)
  const answers = [...root.querySelectorAll<HTMLElement>("button[aria-checked='true']")]
    .map(option => option.getAttribute('aria-label') ?? normalizedText(option))
    .filter(answer => answer !== '')
  const custom = root.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    "[role='group'] [data-ngo-question-custom-editor], [role='radiogroup'] [data-ngo-question-custom-editor], [role='group'] textarea, [role='radiogroup'] textarea, [role='group'] input, [role='radiogroup'] input",
  )?.value.trim() ?? ''
  if (custom !== '') answers.push(custom)
  return {
    index: page.index,
    question: normalizedText(root.querySelector('h2') ?? root.querySelector('header') ?? root),
    answers: [...new Set(answers)],
    skipped: false,
  }
}

function validQuestionTranscript(value: unknown, requireCompletedAt = false): value is QuestionTranscript {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<QuestionTranscript>
  return typeof candidate.requestKey === 'string' && typeof candidate.flowKey === 'string'
    && candidate.complete === true && Array.isArray(candidate.exchanges)
    && (!requireCompletedAt || (typeof candidate.completedAt === 'number' && Number.isFinite(candidate.completedAt)))
    && candidate.exchanges.every(exchange => typeof exchange === 'object' && exchange !== null
      && typeof (exchange as QuestionExchange).index === 'number'
      && typeof (exchange as QuestionExchange).question === 'string'
      && Array.isArray((exchange as QuestionExchange).answers)
      && (exchange as QuestionExchange).answers.every(answer => typeof answer === 'string')
      && typeof (exchange as QuestionExchange).skipped === 'boolean')
}

function compactQuestionTranscriptStore(store: QuestionTranscriptStore, now = Date.now()): QuestionTranscriptStore {
  const cutoff = now - QUESTION_TRANSCRIPT_RETENTION_MS
  const entries = Object.entries(store.conversations).flatMap(([conversation, records]) => records
    .filter(record => validQuestionTranscript(record, true) && record.completedAt! >= cutoff)
    .map(record => ({
      conversation,
      record: {
        ...record,
        completedAt: Math.min(record.completedAt!, now),
        submitRequested: false,
      },
    })))
    .sort((a, b) => b.record.completedAt! - a.record.completedAt!)

  const unique = new Map<string, (typeof entries)[number]>()
  for (const entry of entries) {
    const identity = `${entry.conversation}\u0000${entry.record.flowKey}\u0000${entry.record.requestKey}`
    if (!unique.has(identity)) unique.set(identity, entry)
  }
  const kept = [...unique.values()].slice(0, QUESTION_TRANSCRIPT_MAX_RECORDS)
  const build = (): QuestionTranscriptStore => {
    const conversations: Record<string, QuestionTranscript[]> = {}
    for (const { conversation, record } of [...kept].reverse()) {
      ;(conversations[conversation] ??= []).push(record)
    }
    return { version: 2, conversations }
  }
  let compacted = build()
  while (kept.length > 0 && JSON.stringify(compacted).length > QUESTION_TRANSCRIPT_MAX_STORAGE_CHARS) {
    kept.pop()
    compacted = build()
  }
  return compacted
}

function readQuestionTranscriptStore(now = Date.now()): QuestionTranscriptStore {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(QUESTION_TRANSCRIPT_STORAGE) ?? 'null')
    if (typeof parsed === 'object' && parsed !== null && (parsed as Partial<QuestionTranscriptStore>).version === 2) {
      const conversations = (parsed as Partial<QuestionTranscriptStore>).conversations
      if (typeof conversations === 'object' && conversations !== null) {
        const validConversations: Record<string, QuestionTranscript[]> = {}
        for (const [conversation, records] of Object.entries(conversations)) {
          if (Array.isArray(records)) validConversations[conversation] = records.filter(record => validQuestionTranscript(record, true))
        }
        return compactQuestionTranscriptStore({ version: 2, conversations: validConversations }, now)
      }
    }
  } catch {
    // Storage is an enhancement; restricted browser contexts keep the live ledger.
  }
  return { version: 2, conversations: {} }
}

function writeQuestionTranscriptStore(store: QuestionTranscriptStore): boolean {
  try {
    const compacted = compactQuestionTranscriptStore(store)
    if (Object.keys(compacted.conversations).length === 0) window.localStorage.removeItem(QUESTION_TRANSCRIPT_STORAGE)
    else window.localStorage.setItem(QUESTION_TRANSCRIPT_STORAGE, JSON.stringify(compacted))
    return true
  } catch {
    return false
  }
}

function createQuestionTranscriptLedger(): {
  records: () => readonly QuestionTranscript[]
  sync: () => void
  capture: (root: Element) => QuestionTranscript
  chooseSingle: (option: HTMLElement) => void
  skip: (root: Element) => void
  requestSubmit: (root: Element) => void
} {
  const conversationKey = window.location.href
  const initialStore = readQuestionTranscriptStore()
  let stored = initialStore.conversations[conversationKey] ?? []
  let migratedLegacy = false
  try {
    const parsed: unknown = JSON.parse(window.sessionStorage.getItem(legacyQuestionTranscriptStorageKey()) ?? '[]')
    if (Array.isArray(parsed)) {
      const migratedAt = Date.now()
      const legacy = parsed.filter(record => validQuestionTranscript(record)).map(record => ({
        ...record,
        completedAt: migratedAt,
        submitRequested: false,
      }))
      stored = [...stored, ...legacy]
      migratedLegacy = legacy.length > 0
    }
  } catch {
    // Storage is an enhancement; restricted browser contexts keep the live ledger.
  }
  initialStore.conversations[conversationKey] = stored
  const normalizedInitialStore = compactQuestionTranscriptStore(initialStore)
  stored = normalizedInitialStore.conversations[conversationKey] ?? []
  if (writeQuestionTranscriptStore(normalizedInitialStore) && migratedLegacy) {
    try {
      window.sessionStorage.removeItem(legacyQuestionTranscriptStorageKey())
    } catch {
      // Ignore legacy cleanup when session storage is restricted.
    }
  }
  let transcripts = [...stored]
  let active: QuestionTranscript | undefined

  const save = (): void => {
    const latest = readQuestionTranscriptStore()
    const durable = transcripts.filter(record => record.complete).map(({ flowRow: _flowRow, ...record }) => ({
      ...record,
      completedAt: record.completedAt ?? Date.now(),
      submitRequested: false,
    }))
    latest.conversations[conversationKey] = [...(latest.conversations[conversationKey] ?? []), ...durable]
    if (writeQuestionTranscriptStore(latest)) {
      try {
        window.sessionStorage.removeItem(legacyQuestionTranscriptStorageKey())
      } catch {
        // Ignore legacy cleanup when session storage is restricted.
      }
    }
  }
  const upsertExchange = (record: QuestionTranscript, exchange: QuestionExchange): void => {
    const current = record.exchanges.findIndex(item => item.index === exchange.index)
    if (current === -1) record.exchanges.push(exchange)
    else record.exchanges[current] = exchange
    record.exchanges.sort((a, b) => a.index - b.index)
  }
  const ensure = (root: Element): QuestionTranscript => {
    const requestKey = root.getAttribute('data-question-key') ?? ''
    if (active?.requestKey === requestKey) return active
    const flowRow = activeQuestionFlow()
    const flowKey = flowRow?.getAttribute('data-chat-flow-key') ?? requestKey
    const record = transcripts.find(record => !record.complete && record.requestKey === requestKey)
      ?? { requestKey, flowKey, flowRow, exchanges: [], complete: false, submitRequested: false }
    record.flowRow = flowRow
    if (flowKey !== '') record.flowKey = flowKey
    if (!transcripts.includes(record)) transcripts.push(record)
    active = record
    return record
  }
  const capture = (root: Element): QuestionTranscript => {
    const record = ensure(root)
    const next = readQuestionExchange(root)
    const previous = record.exchanges.find(exchange => exchange.index === next.index)
    if (previous?.skipped === true && next.answers.length === 0) next.skipped = true
    upsertExchange(record, next)
    return record
  }
  const sync = (): void => {
    const root = document.querySelector<HTMLElement>('[data-question-key]')
    if (root !== null) {
      if (active !== undefined && active.requestKey !== root.dataset.questionKey) {
        if (active.submitRequested) {
          active.complete = true
          active.completedAt = Date.now()
          save()
        } else if (!active.complete) {
          transcripts.splice(transcripts.indexOf(active), 1)
        }
        active = undefined
      }
      capture(root)
      return
    }
    if (active === undefined) return
    if (active.submitRequested) {
      active.complete = true
      active.completedAt = Date.now()
      save()
    } else {
      transcripts.splice(transcripts.indexOf(active), 1)
    }
    active = undefined
  }
  const chooseSingle = (option: HTMLElement): void => {
    const root = option.closest<HTMLElement>('[data-question-key]')
    if (root === null) return
    const record = capture(root)
    const exchange = readQuestionExchange(root)
    exchange.answers = [option.getAttribute('aria-label') ?? normalizedText(option)].filter(Boolean)
    upsertExchange(record, exchange)
  }
  const skip = (root: Element): void => {
    const record = capture(root)
    const exchange = readQuestionExchange(root)
    exchange.answers = []
    exchange.skipped = true
    upsertExchange(record, exchange)
    if (questionPage(root).index >= questionPage(root).total - 1) record.submitRequested = true
  }
  const requestSubmit = (root: Element): void => {
    const record = capture(root)
    if (questionPage(root).index >= questionPage(root).total - 1) record.submitRequested = true
  }
  const records = (): readonly QuestionTranscript[] => {
    const cutoff = Date.now() - QUESTION_TRANSCRIPT_RETENTION_MS
    const previousLength = transcripts.length
    transcripts = transcripts.filter(record => !record.complete || (record.completedAt ?? 0) >= cutoff)
    if (transcripts.length !== previousLength) save()
    return transcripts
  }
  return { records, sync, capture, chooseSingle, skip, requestSubmit }
}

function userMessageRead(row: Element): boolean {
  let next = row.nextElementSibling
  while (next !== null) {
    const kind = next.getAttribute('data-chat-flow-kind')
    if (kind === 'user' || kind === 'steering') return false
    if (kind === 'assistant-step') return true
    next = next.nextElementSibling
  }
  return false
}

function projectUserMessage(row: Element): JineProjection {
  const chrome = row.querySelector('[data-actions-reveal]') ?? row
  const timeNode = chrome.querySelector("span[class*='timeStart'], span[class*='timeEnd']")
  // Newer DSH hosts expose the attachment slot explicitly. Fall back to all
  // row images for older hosts, while preserving every attachment in DOM order.
  const slottedImages = [...chrome.querySelectorAll("[data-slot='conversation.message.images'] img")]
  const images = slottedImages.length > 0 ? slottedImages : [...chrome.querySelectorAll('img')]
  const imageSrcs = images
    .map(image => image.getAttribute('src') ?? '')
    .filter(src => src !== '')
  // UserStyleBubble nests the text under userRow/userStack, with actions
  // beside the stack. The first div can therefore contain both text and time.
  const bubble = chrome.querySelector("[class$='_bubble'], [class*='_bubble_']")
  const content = (bubble ?? chrome).cloneNode(true) as Element
  if (bubble === null) {
    content.querySelectorAll("span[class*='timeStart'], span[class*='timeEnd'], [class$='_actions'], [class*='_actions_'], button")
      .forEach(node => node.remove())
  }
  return {
    text: normalizedText(content),
    imageSrcs,
    time: timeNode === null ? '' : normalizedText(timeNode),
    read: userMessageRead(row),
  }
}

function topLevelFlowRows(): Element[] {
  return [...document.querySelectorAll('[data-chat-flow-kind]')]
    .filter(row => row.parentElement?.closest('[data-chat-flow-kind]') === null)
}

function stepIsRunning(step: Element): boolean {
  return step.matches("[data-state='running'], [data-streaming='true']")
    || step.querySelector("[data-state='running'], [data-streaming='true']") !== null
}

function stepMarkdowns(step: Element): Element[] {
  return [...step.querySelectorAll("[class*='_markdown_']")]
}

function collectConversationTurns(): ConversationTurn[] {
  const turns: ConversationTurn[] = []
  let current: {
    userRow?: Element
    assistantSteps: Element[]
    flowRows: Element[]
    turnTail?: Element
  } | undefined

  const finish = (followedByUser: boolean): void => {
    if (current === undefined) return
    const markdowns = current.assistantSteps.flatMap(stepMarkdowns)
    const complete = followedByUser || current.turnTail !== undefined
    const finalMarkdown = complete ? markdowns.at(-1) : undefined
    const intermediateMarkdowns = finalMarkdown === undefined ? markdowns : markdowns.slice(0, -1)
    const projectedUser = current.userRow === undefined ? undefined : projectUserMessage(current.userRow)
    turns.push({
      userRow: current.userRow,
      assistantSteps: current.assistantSteps,
      flowRows: current.flowRows,
      turnTail: current.turnTail,
      intermediateMarkdowns,
      finalMarkdown,
      complete,
      time: projectedUser?.time ?? '',
      order: turns.length + 1,
    })
  }

  for (const row of topLevelFlowRows()) {
    const kind = row.getAttribute('data-chat-flow-kind')
    if (kind === 'user') {
      finish(true)
      current = { userRow: row, assistantSteps: [], flowRows: [] }
    } else if (kind === 'assistant-step') {
      current ??= { assistantSteps: [], flowRows: [] }
      current.assistantSteps.push(row)
      current.flowRows.push(row)
    } else if (kind === 'turn-tail') {
      current ??= { assistantSteps: [], flowRows: [] }
      current.turnTail = row
    } else if (kind !== 'steering' && kind !== 'turn-tail') {
      current ??= { assistantSteps: [], flowRows: [] }
      current.flowRows.push(row)
    }
  }
  finish(false)
  return turns
}

/** Interrupted-turn steering the host has not committed yet: while the agent
 * is still working, a new user message renders as a UserStyleBubble with
 * only [data-pending-steering] (no [data-chat-flow-kind]). Once admitted it
 * becomes a durable data-chat-flow-kind="steering" row. */
function pendingSteeringRows(): Element[] {
  return [...document.querySelectorAll('[data-chat-flow] [data-pending-steering]')]
}

/** QueueDock owns the authoritative edit/remove/steer handlers. Keep its
 * React nodes in place and project only interactive proxies into JINE. A
 * collapsed multi-row dock does not mount its <li> children, so expand it
 * once before reading; the dock stays available as a fallback whenever JINE
 * is minimized or closed. */
function queuedMessageRows(): HTMLElement[] {
  const dock = document.querySelector<HTMLElement>('[data-queue-dock]')
  if (dock === null) return []
  const header = dock.querySelector<HTMLButtonElement>('button[aria-controls][aria-expanded]')
  if (header?.getAttribute('aria-expanded') === 'false' && !header.disabled) header.click()
  return [...dock.querySelectorAll<HTMLElement>('ul > li')]
}

function queuedMessageText(row: HTMLElement): string {
  const editor = row.querySelector<HTMLInputElement>('input')
  if (editor !== null) return editor.value
  const preview = [...row.children].find(child => child instanceof HTMLSpanElement
    && child.querySelector('svg') === null)
  return preview === undefined ? normalizedText(row) : normalizedText(preview)
}

function syncQueuedEditor(source: HTMLInputElement, value: string): void {
  if (source.value === value) return
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(source, value)
  source.dispatchEvent(new Event('input', { bubbles: true }))
}

function projectionFingerprint(row: Element): string {
  const message = projectUserMessage(row)
  return `${message.text}\u0000${JSON.stringify(message.imageSrcs)}`
}

/** The host pages history at PAGE_MESSAGES entries per page behind its own
 * "load earlier" row; the JINE feed is a separate scroller that never shows
 * that button. While the feed is flush to the top, click the host button so
 * one older page prepends. The chain only continues when the host's head
 * anchor actually changed (a page landed); button.disabled guards the
 * in-flight window, so an idle host cannot be clicked in a tight loop.
 *
 * The paging row has no public data attribute. Identify its stable structural
 * position instead of its CSS Module class: production builds may emit names
 * such as `Md3f7G_older`, which do not contain the development-only
 * `_older_` substring. Settled flow rows carry data-chat-flow-key/kind, while
 * the paging row is a direct pre-flow wrapper around one button. */
let lastPagedHeadKey: string | undefined

function headFlowKey(): string {
  return document.querySelector('[data-chat-flow] [data-chat-anchor-key]')?.getAttribute('data-chat-anchor-key') ?? ''
}

function hostLoadOlderButton(): HTMLButtonElement | null {
  const button = document.querySelector<HTMLButtonElement>(
    '[data-chat-flow] > :not([data-chat-flow-key]):not([data-chat-flow-kind]) > button[type="button"]:only-child',
  )
  return button
}

function triggerHostLoadOlder(surface: HTMLElement): void {
  if (surface.scrollTop > 0) {
    // Leaving the top ends the paging chain; the next flush-to-top is a fresh intent.
    lastPagedHeadKey = undefined
    return
  }
  const button = hostLoadOlderButton()
  if (button === null || button.disabled) return
  const head = headFlowKey()
  if (head !== '' && head === lastPagedHeadKey) return
  lastPagedHeadKey = head
  button.click()
}

function appendJineTime(surface: HTMLElement, timeText: string, previousTime: string): string {
  if (timeText === '' || timeText === previousTime) return previousTime
  const time = element('div', css.jineTime ?? '', timeText)
  time.dataset.jineTime = ''
  surface.append(time)
  return timeText
}

type JineCommandState = 'running' | 'completed' | 'failed'

function jineCommandState(row: Element): JineCommandState {
  const state = (row.matches('[data-state]') ? row : row.querySelector('[data-state]'))
    ?.getAttribute('data-state')
  if (state === 'running') return 'running'
  if (state === 'error' || state === 'fault') return 'failed'
  return 'completed'
}

/** Slash commands are their own durable flow nodes rather than user messages.
 * Project their lifecycle as the same neutral, centred capsule used for time
 * separators so a standalone command cannot disappear from JINE. */
function appendCommandJine(surface: HTMLElement, row: Element): void {
  const kind = row.getAttribute('data-chat-flow-kind')
  if (kind !== 'command' && kind !== 'manual-compaction') return
  const state = jineCommandState(row)
  const isCompaction = kind === 'manual-compaction'
  const copy = isCompaction
    ? state === 'running' ? t('正在压缩上下文…')
      : state === 'failed' ? t('上下文压缩失败')
        : row.querySelector('[data-compaction-icon="context"]') !== null
          ? t('上下文已压缩')
          : t('压缩命令已完成')
    : state === 'running' ? t('正在执行命令…')
      : state === 'failed' ? t('命令执行失败')
        : t('命令执行完成')
  const status = element('button', `${css.jineTime ?? ''} ${css.jineCommandStatus ?? ''}`, copy)
  status.type = 'button'
  status.dataset.jineCommandStatus = state
  status.dataset.jineTaskLink = ''
  status.title = normalizedText(row)
  surface.append(status)
}

function appendUserJine(surface: HTMLElement, row: Element): void {
  const message = projectUserMessage(row)
  if (message.text === '' && message.imageSrcs.length === 0) return
  const item = element('div', css.jineMessage ?? '')
  item.dataset.jineMessage = ''
  item.dataset.jineSpeaker = 'user'
  setAttr(item, 'data-jine-search-text', () => message.text !== '' ? message.text : t('[图片]'))
  // Reference jine-me-wrap: the fit-content box whose left edge is the bubble's
  // left edge, so the absolute read receipt below always hugs the bubble even
  // when the row's own width is clamped by the feed.
  const wrap = element('div', css.jineUserWrap ?? '')
  wrap.dataset.jineUserWrap = ''
  const bubble = element('div', css.jineBubble ?? '')
  if (message.text !== '') setText(bubble, message.text)
  for (const imageSrc of message.imageSrcs) {
    const image = element('img', css.jineImage ?? '')
    image.src = imageSrc
    setAttr(image, 'alt', () => t('[图片]'))
    image.dataset.jineImage = ''
    bubble.append(image)
  }
  wrap.append(bubble)
  if (message.read) {
    const receipt = element('small', css.jineReceipt ?? '', () => t('已读'))
    receipt.dataset.jineReceipt = ''
    wrap.append(receipt)
  }
  item.append(wrap)
  surface.append(item)
}

function appendQueuedUserJine(surface: HTMLElement, sourceRow: HTMLElement): void {
  const text = queuedMessageText(sourceRow)
  if (text === '') return
  const item = element('div', `${css.jineMessage ?? ''} ${css.jineQueuedMessage ?? ''}`)
  item.dataset.jineMessage = ''
  item.dataset.jineSpeaker = 'user'
  item.dataset.jineQueued = ''
  item.dataset.jineSearchText = text
  const wrap = element('div', css.jineUserWrap ?? '')
  wrap.dataset.jineUserWrap = ''
  const bubble = element('div', `${css.jineBubble ?? ''} ${css.jineQueuedBubble ?? ''}`)
  bubble.dataset.jineQueuedBubble = ''
  const sourceEditor = sourceRow.querySelector<HTMLInputElement>('input')
  const transferEditorFocus = sourceEditor !== null
    && sourceEditor === document.activeElement
    && document.body.hasAttribute('data-ngo-jine-open')
  const sourceSelection = sourceEditor === null
    ? undefined
    : { start: sourceEditor.selectionStart, end: sourceEditor.selectionEnd }
  let editor: HTMLInputElement | undefined
  if (sourceEditor === null) {
    setText(bubble, text)
  } else {
    editor = element('input', css.jineQueueEditor ?? '')
    editor.type = 'text'
    editor.value = sourceEditor.value
    setAttr(editor, 'aria-label', () => sourceEditor.getAttribute('aria-label') ?? t('编辑排队消息'))
    editor.dataset.jineQueueEditor = ''
    editor.addEventListener('input', () => { syncQueuedEditor(sourceEditor, editor!.value) })
    bubble.append(editor)
  }
  const actions = element('div', css.jineQueueActions ?? '')
  actions.dataset.jineQueueActions = ''
  const state = element('small', css.jineQueueState ?? '', () => sourceEditor === null ? t('排队中') : t('正在编辑'))
  state.dataset.jineQueueState = ''
  actions.append(state)
  const sourceActions = [...sourceRow.querySelectorAll<HTMLButtonElement>('button')]
  const proxies: HTMLButtonElement[] = []
  sourceActions.forEach((sourceAction, index) => {
    const proxy = element('button', css.jineQueueAction ?? '')
    proxy.type = 'button'
    proxy.disabled = sourceAction.disabled
    const label = sourceAction.getAttribute('aria-label') ?? sourceAction.title
    if (label !== '') {
      proxy.setAttribute('aria-label', label)
      proxy.title = label
    }
    const icon = sourceAction.firstElementChild?.cloneNode(true)
    if (icon !== undefined) proxy.append(icon)
    else setText(proxy, String(index + 1))
    proxy.addEventListener('click', () => {
      if (editor !== undefined) {
        const currentEditor = sourceRow.querySelector<HTMLInputElement>('input')
        if (currentEditor !== null) syncQueuedEditor(currentEditor, editor.value)
      }
      const currentAction = sourceRow.querySelectorAll<HTMLButtonElement>('button')[index]
      if (currentAction !== undefined && !currentAction.disabled) currentAction.click()
    })
    proxies.push(proxy)
    actions.append(proxy)
  })
  if (editor !== undefined) {
    editor.addEventListener('input', () => {
      const sourceSave = sourceRow.querySelector<HTMLButtonElement>('button')
      if (proxies[0] !== undefined) proxies[0].disabled = editor!.value.trim() === '' || sourceSave?.disabled === true
    })
    editor.addEventListener('keydown', (event) => {
      if (event.isComposing) return
      if (event.key === 'Enter') {
        event.preventDefault()
        proxies[0]?.click()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        proxies[1]?.click()
      }
    })
  }
  wrap.append(bubble, actions)
  item.append(wrap)
  surface.append(item)
  if (editor !== undefined && transferEditorFocus) {
    editor.focus()
    if (sourceSelection !== undefined && sourceSelection.start !== null && sourceSelection.end !== null) {
      editor.setSelectionRange(sourceSelection.start, sourceSelection.end)
    }
  }
}

function appendAmeJine(surface: HTMLElement, source: Element, identity?: SubagentIdentity): void {
  const text = normalizedText(source)
  if (text === '') return
  appendAmeTextJine(surface, text, false, identity)
}

function appendAmeTextJine(
  surface: HTMLElement,
  text: string,
  question = false,
  identity?: SubagentIdentity,
): void {
  const item = element('div', `${css.jineMessage ?? ''} ${css.jineAssistantMessage ?? ''}`)
  item.dataset.jineMessage = ''
  item.dataset.jineSpeaker = identity === undefined ? 'ame' : 'subagent'
  item.dataset.jineSearchText = text
  if (identity !== undefined) item.dataset.subagentSession = identity.sessionId
  if (question) item.dataset.jineQuestion = ''
  const avatar = identity === undefined
    ? element('img', css.jineAssistantAvatar ?? '')
    : element('span', `${css.jineAssistantAvatar ?? ''} ${css.subagentIdentityAvatar ?? ''}`)
  if (avatar instanceof HTMLImageElement) {
    avatar.src = NGO_JINE_AME.dataUri
    avatar.alt = ''
  } else {
    avatar.style.backgroundImage = SUBAGENT_POKETTER_AVATAR
    avatar.setAttribute('aria-hidden', 'true')
  }
  const main = element('div', css.jineAssistantMain ?? '')
  if (identity !== undefined) {
    main.append(element('small', css.subagentMessageIdentity ?? '', `${identity.displayName} @${identity.handle}`))
  }
  main.append(element('div', `${css.jineBubble ?? ''} ${css.jineAssistantBubble ?? ''}`, text))
  item.append(avatar, main)
  surface.append(item)
}

function appendQuestionAnswersJine(surface: HTMLElement, exchange: QuestionExchange, complete: boolean): void {
  const answers = exchange.skipped ? [t('跳过了这个问题')] : exchange.answers
  if (answers.length === 0) return
  const item = element('div', css.jineMessage ?? '')
  item.dataset.jineMessage = ''
  item.dataset.jineSpeaker = 'user'
  item.dataset.jineQuestionAnswer = ''
  item.dataset.jineSearchText = answers.join(' ')
  const wrap = element('div', css.jineUserWrap ?? '')
  wrap.dataset.jineUserWrap = ''
  for (const answer of answers) {
    const bubble = element('div', css.jineBubble ?? '', answer)
    bubble.dataset.jineQuestionAnswerBubble = ''
    wrap.append(bubble)
  }
  if (complete) {
    const receipt = element('small', css.jineReceipt ?? '', () => t('已读'))
    receipt.dataset.jineReceipt = ''
    wrap.append(receipt)
  }
  item.append(wrap)
  surface.append(item)
}

function appendQuestionTranscript(
  surface: HTMLElement,
  transcript: QuestionTranscript,
  identity?: SubagentIdentity,
): void {
  for (const exchange of transcript.exchanges) {
    if (exchange.question === '') continue
    appendAmeTextJine(surface, exchange.question, true, identity)
    appendQuestionAnswersJine(surface, exchange, transcript.complete)
  }
}

function appendJineWorkStatus(surface: HTMLElement, waiting: boolean): void {
  const status = element('button', css.jineWorkStatus ?? '', () => waiting
    ? t('正在等你选择…')
    : t('正在处理…　查看任务管理器'))
  status.type = 'button'
  status.dataset.jineTaskLink = ''
  status.dataset.jineWorkState = waiting ? 'waiting' : 'running'
  surface.append(status)
}

function projectJine(
  surface: HTMLElement,
  turns: readonly ConversationTurn[],
  questionTranscripts: readonly QuestionTranscript[],
  identity?: SubagentIdentity,
): void {
  // A streamed host update may schedule this projection between pointerdown
  // and click (or between keyboard down/up). Replacing the feed in that window
  // disconnects the action target and the browser correctly drops activation.
  if (surface.hasAttribute('data-jine-interaction-active')) return
  const focusedQueueEditor = surface.querySelector<HTMLInputElement>('[data-jine-queue-editor]:focus')
  // Streaming assistant text mutates frequently. Do not replace the focused
  // queue editor on every token; the next source QueueDock transition (save,
  // cancel, or removal) clears its editor and resumes normal projection.
  if (focusedQueueEditor !== null
    && document.querySelector('[data-queue-dock] input') !== null) return
  const distanceFromBottom = surface.scrollHeight - surface.scrollTop - surface.clientHeight
  // A newly restored window is not measurable until its first painted frame.
  // Its stale hidden-state scrollTop is not a reader intent; keep the explicit
  // open anchor until the window has settled instead of preserving history.
  const followLatest = surface.hasAttribute('data-jine-open-anchor') || distanceFromBottom <= 24
  const previousTop = surface.scrollTop
  surface.replaceChildren()
  let previousTime = ''
  const rows = topLevelFlowRows()
  let lastCommittedHuman: Element | undefined
  for (const row of rows) {
    const kind = row.getAttribute('data-chat-flow-kind')
    if (kind === 'user' || kind === 'steering') {
      const message = projectUserMessage(row)
      previousTime = appendJineTime(surface, message.time, previousTime)
      appendUserJine(surface, row)
      lastCommittedHuman = row
    } else if (kind === 'assistant-step') {
      // Once an assistant Markdown has appeared in JINE it remains part of the
      // conversation. A later summary/final answer appends another bubble;
      // it must not make the preceding bubble look "recalled".
      stepMarkdowns(row).forEach(markdown => { appendAmeJine(surface, markdown, identity) })
    } else if (kind === 'command' || kind === 'manual-compaction') {
      appendCommandJine(surface, row)
    }
    for (const transcript of questionTranscripts) {
      if (!transcript.complete) continue
      const flowKey = row.getAttribute('data-chat-flow-key')
      if (transcript.flowRow === row || (flowKey !== null && flowKey === transcript.flowKey)) {
        appendQuestionTranscript(surface, transcript, identity)
      }
    }
  }
  // Interrupting messages render as pending steering until the host admits
  // them as durable steering nodes; project them as the latest bubbles. Skip only the
  // transient overlap where the durable steering row already shows the same text.
  const lastFingerprint = lastCommittedHuman === undefined ? null : projectionFingerprint(lastCommittedHuman)
  for (const row of pendingSteeringRows()) {
    if (lastFingerprint !== null && projectionFingerprint(row) === lastFingerprint) continue
    const message = projectUserMessage(row)
    previousTime = appendJineTime(surface, message.time, previousTime)
    appendUserJine(surface, row)
  }
  const queuedRows = queuedMessageRows()
  // Never hide the authoritative QueueDock until its rows have actually been
  // projected. This leaves the host dock visible as a no-black-hole fallback
  // during React's collapsed-list expansion or an unexpected DOM change.
  document.body.toggleAttribute('data-ngo-jine-has-queue', queuedRows.length > 0)
  for (const row of queuedRows) appendQueuedUserJine(surface, row)
  const activeTurn = turns.at(-1)
  if (activeTurn !== undefined && !activeTurn.complete) {
    appendJineWorkStatus(surface, document.querySelector('[data-question-key]') !== null)
  }
  if (surface.childElementCount === 0) appendEmpty(surface, identity === undefined
    ? t('等待你的第一条 JINE 消息…')
    : t("等待 @{0} 的第一条消息…", identity.handle))
  surface.scrollTop = followLatest ? surface.scrollHeight : previousTop
}

type TodoStatus = 'completed' | 'in_progress' | 'pending'
type GoalActionKind = 'pause' | 'resume' | 'edit' | 'delete' | 'save' | 'cancel'

const GOAL_ACTION_ICONS = {
  pause: NGO_GOAL_PAUSE,
  resume: NGO_GOAL_RESUME,
  edit: NGO_GOAL_EDIT,
  delete: NGO_GOAL_DELETE,
  save: NGO_GOAL_SAVE,
  cancel: NGO_GOAL_CANCEL,
} as const satisfies Record<GoalActionKind, { dataUri: string }>

interface TodoProjectionPresence {
  todo: boolean
  goal: boolean
}

interface GoalEditorRestore {
  focus: boolean
  selectionStart: number | null
  selectionEnd: number | null
}

function todoStatus(row: Element): TodoStatus {
  const status = row.getAttribute('data-status')
  if (status === 'completed' || status === 'in_progress') return status
  return 'pending'
}

function buildTodoGlyph(status: TodoStatus): HTMLElement {
  if (status === 'completed') {
    const image = element('img', css.todoCompleted ?? '')
    image.src = NGO_TODO_COMPLETED.dataUri
    image.alt = ''
    image.dataset.todoGlyph = status
    return image
  }
  if (status === 'in_progress') {
    const animation = element('span', css.todoProgress ?? '')
    animation.dataset.todoGlyph = status
    animation.setAttribute('aria-hidden', 'true')
    TODO_PROGRESS_FRAMES.forEach((frame, index) => {
      const image = element('img', css.todoProgressFrame ?? '')
      image.src = frame.dataUri
      image.alt = ''
      image.style.setProperty('--ngo-todo-frame-index', String(index))
      animation.append(image)
    })
    return animation
  }
  const square = element('span', css.todoPending ?? '')
  square.dataset.todoGlyph = status
  square.setAttribute('aria-hidden', 'true')
  return square
}

function goalActionKind(button: HTMLButtonElement): GoalActionKind | undefined {
  const label = button.getAttribute('aria-label') ?? button.title
  if (/(?:取消|cancel)/i.test(label)) return 'cancel'
  if (/(?:保存|save)/i.test(label)) return 'save'
  if (/(?:暂停|pause)/i.test(label)) return 'pause'
  if (/(?:恢复|resume|play)/i.test(label)) return 'resume'
  if (/(?:清除|删除|clear|delete|remove)/i.test(label)) return 'delete'
  if (/(?:编辑|edit)/i.test(label)) return 'edit'
  return undefined
}

function goalBarSource(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-goal-bar]')
}

function appendGoalProjection(
  surface: HTMLUListElement,
  source: HTMLElement,
  restoreEditor: GoalEditorRestore,
): void {
  const transferEditorFocus = restoreEditor.focus || surface.hasAttribute('data-todo-goal-focus-editor')
  surface.removeAttribute('data-todo-goal-focus-editor')

  const sourceBar = source.firstElementChild
  if (!(sourceBar instanceof HTMLElement)) return
  const sourceEditor = sourceBar.querySelector<HTMLInputElement>('input')
  const sourceError = sourceBar.querySelector<HTMLElement>('[role="alert"]')
  const sourceActions = [...sourceBar.querySelectorAll<HTMLButtonElement>('button')]

  const item = element('li', css.todoGoal ?? '')
  item.dataset.todoGoal = ''
  if (sourceBar.title !== '') item.title = sourceBar.title
  const header = element('div', css.todoGoalHeader ?? '')
  const target = element('img', css.todoGoalTarget ?? '')
  target.src = NGO_GOAL_TARGET.dataUri
  target.alt = ''
  target.setAttribute('aria-hidden', 'true')
  header.append(target, element('strong', css.todoGoalTitle ?? '', 'CURRENT GOAL'))

  const body = element('div', css.todoGoalBody ?? '')
  const actions = element('div', css.todoGoalActions ?? '')
  let editor: HTMLInputElement | undefined

  const appendAction = (sourceAction: HTMLButtonElement): void => {
    const kind = goalActionKind(sourceAction)
    if (kind === undefined) return
    const label = sourceAction.getAttribute('aria-label') ?? sourceAction.title
    const proxy = element('button', css.todoGoalAction ?? '')
    proxy.type = 'button'
    proxy.disabled = sourceAction.disabled
    proxy.dataset.todoGoalAction = kind
    if (label !== '') {
      proxy.setAttribute('aria-label', label)
      proxy.title = label
    }
    const icon = element('img', css.todoGoalActionIcon ?? '')
    icon.src = GOAL_ACTION_ICONS[kind].dataUri
    icon.alt = ''
    icon.setAttribute('aria-hidden', 'true')
    proxy.append(icon)
    proxy.addEventListener('click', () => {
      const currentSource = goalBarSource()
      if (currentSource === null) return
      if (editor !== undefined) {
        const currentEditor = currentSource.querySelector<HTMLInputElement>('input')
        if (currentEditor !== null) syncQueuedEditor(currentEditor, editor.value)
      }
      const currentAction = [...currentSource.querySelectorAll<HTMLButtonElement>('button')]
        .find(candidate => goalActionKind(candidate) === kind)
      if (currentAction === undefined || currentAction.disabled) return
      if (kind === 'edit') surface.setAttribute('data-todo-goal-focus-editor', '')
      currentAction.click()
      if (kind === 'edit') queueMicrotask(() => {
        if (goalBarSource()?.querySelector('input') == null) return
        projectTodo(surface)
      })
    })
    actions.append(proxy)
  }

  if (sourceEditor === null) {
    const directCopy = [...sourceBar.children]
      .filter((child): child is HTMLSpanElement => child instanceof HTMLSpanElement
        && child.getAttribute('role') !== 'alert'
        && normalizedText(child) !== '')
    const phase = normalizedText(directCopy[0] ?? sourceBar)
    const objective = normalizedText(directCopy[1] ?? sourceBar)
    const phaseNode = element('span', css.todoGoalPhase ?? '', phase)
    header.append(phaseNode)
    const copy = element('p', css.todoGoalObjective ?? '', objective)
    body.append(copy, actions)
  } else {
    header.append(element('span', css.todoGoalPhase ?? '', () => t('编辑中')))
    editor = element('input', css.todoGoalEditor ?? '')
    editor.type = 'text'
    editor.value = sourceEditor.value
    editor.dataset.todoGoalEditor = ''
    setAttr(editor, 'aria-label', () => sourceEditor.getAttribute('aria-label') ?? t('目标内容'))
    editor.addEventListener('input', () => {
      const currentEditor = goalBarSource()?.querySelector<HTMLInputElement>('input')
      if (currentEditor !== null && currentEditor !== undefined) syncQueuedEditor(currentEditor, editor!.value)
      const save = actions.querySelector<HTMLButtonElement>('[data-todo-goal-action="save"]')
      if (save !== null) save.disabled = editor!.value.trim() === ''
    })
    editor.addEventListener('keydown', (event) => {
      if (event.isComposing) return
      if (event.key === 'Enter') {
        event.preventDefault()
        actions.querySelector<HTMLButtonElement>('[data-todo-goal-action="save"]')?.click()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        actions.querySelector<HTMLButtonElement>('[data-todo-goal-action="cancel"]')?.click()
      }
    })
    body.append(editor, actions)
  }
  sourceActions.forEach(appendAction)
  if (editor !== undefined) {
    const save = actions.querySelector<HTMLButtonElement>('[data-todo-goal-action="save"]')
    if (save !== null) save.disabled = editor.value.trim() === '' || save.disabled
  }
  if (sourceError !== null) {
    const error = element('small', css.todoGoalError ?? '', normalizedText(sourceError))
    error.setAttribute('role', 'alert')
    body.append(error)
  }
  item.append(header, body)
  surface.append(item)

  if (editor !== undefined && transferEditorFocus) {
    editor.focus()
    if (restoreEditor.selectionStart !== null && restoreEditor.selectionEnd !== null) {
      editor.setSelectionRange(restoreEditor.selectionStart, restoreEditor.selectionEnd)
    }
  }
}

function projectTodo(surface: HTMLUListElement): TodoProjectionPresence {
  const source = document.querySelector('[data-testid="todo-panel"]')
  const goal = goalBarSource()
  const previousGoalEditor = surface.querySelector<HTMLInputElement>('[data-todo-goal-editor]')
  const restoreEditor: GoalEditorRestore = {
    focus: previousGoalEditor === document.activeElement,
    selectionStart: previousGoalEditor?.selectionStart ?? null,
    selectionEnd: previousGoalEditor?.selectionEnd ?? null,
  }
  surface.replaceChildren()
  if (goal !== null) appendGoalProjection(surface, goal, restoreEditor)
  if (source === null) {
    if (goal === null) surface.append(element('li', css.todoEmpty ?? '', () => t('今天没有代办♡')))
    else surface.append(element('li', css.todoEmpty ?? '', () => t('今天没有其他代办♡')))
    return { todo: false, goal: goal !== null }
  }

  const toggle = source.querySelector<HTMLButtonElement>('button[aria-expanded]')
  if (toggle?.getAttribute('aria-expanded') === 'false') toggle.click()
  const rows = [...source.querySelectorAll('li[data-status]')]
  for (const row of rows) {
    const status = todoStatus(row)
    const item = element('li', css.todoItem ?? '')
    item.dataset.todoStatus = status
    const copySource = row.lastElementChild ?? row
    item.append(buildTodoGlyph(status), element('span', css.todoCopy ?? '', normalizedText(copySource)))
    surface.append(item)
  }
  if (rows.length === 0) surface.append(element('li', css.todoEmpty ?? '', () => t('正在读取代办…')))
  return { todo: true, goal: goal !== null }
}

type TaskManagerState = 'queued' | 'running' | 'waiting' | 'completed'
type TaskStepKind = 'think' | 'read' | 'write' | 'skill' | 'run' | 'tool' | 'update'

const TASK_STEP_LABELS: Record<TaskStepKind, string> = {
  think: 'THINK',
  read: 'READ',
  write: 'WRITE',
  skill: 'SKILL',
  run: 'RUN',
  tool: 'TOOL',
  update: 'UPDATE',
}

function taskManagerState(turn: ConversationTurn, latest: boolean): TaskManagerState {
  if (latest && document.querySelector('[data-question-key]') !== null) return 'waiting'
  if (turn.complete) return 'completed'
  return turn.flowRows.length === 0 ? 'queued' : 'running'
}

function taskManagerStateLabel(state: TaskManagerState): string {
  if (state === 'completed') return t('已完成')
  if (state === 'running') return t('运行中')
  if (state === 'waiting') return t('等待选择')
  return t('排队中')
}

function taskManagerTitle(turn: ConversationTurn): string {
  if (turn.userRow === undefined) return t("第 {0} 轮 · 会话任务", turn.order)
  const message = projectUserMessage(turn.userRow)
  const text = message.text || (message.imageSrcs.length > 0 ? t("[{0} 张图片]", message.imageSrcs.length) : t('用户任务'))
  return t("第 {0} 轮 · {1}", turn.order, text.slice(0, 54))
}

function taskStepKind(source: Element): TaskStepKind {
  if (source.matches("[data-variant='think']")) return 'think'

  const flowKind = source.closest('[data-chat-flow-kind]')?.getAttribute('data-chat-flow-kind') ?? ''
  const toolRoot = source.matches('[data-tool]') ? source : source.querySelector('[data-tool]')
  const variant = toolRoot?.getAttribute('data-variant')?.toLocaleLowerCase() ?? ''
  const toolName = toolRoot?.getAttribute('data-tool')?.toLocaleLowerCase() ?? ''
  const isTool = toolRoot !== null || flowKind === 'tool' || flowKind === 'tool-call'

  if (!isTool) return flowKind === 'command' ? 'run' : 'update'
  if (toolName.includes('skill')) return 'skill'
  if (variant === 'read' || variant === 'search') return 'read'
  if (variant === 'write' || variant === 'edit') return 'write'
  if (variant === 'bash' || variant === 'code') return 'run'
  return 'tool'
}

function taskExecutionEntries(turn: ConversationTurn): Array<{ source: Element; kind: TaskStepKind }> {
  const sources = new Set<Element>()
  for (const step of turn.assistantSteps) {
    if (step.matches("[data-variant='think']")) sources.add(step)
    step.querySelectorAll("[data-variant='think']").forEach(node => sources.add(node))
    step.querySelectorAll("[data-chat-flow-kind]:not([data-chat-flow-kind='assistant-step']):not([data-chat-flow-kind='turn-tail'])")
      .forEach(node => sources.add(node))
  }
  for (const row of turn.flowRows) {
    const kind = row.getAttribute('data-chat-flow-kind')
    if (kind !== 'assistant-step' && kind !== 'turn-tail') sources.add(row)
  }
  turn.intermediateMarkdowns.forEach(markdown => sources.add(markdown))
  return [...sources]
    .sort((left, right) => {
      const position = left.compareDocumentPosition(right)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return 1
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return -1
      return 0
    })
    .map(source => ({ source, kind: taskStepKind(source) }))
}

const TASK_STEP_KEYS = new WeakMap<Element, string>()
const TASK_TURN_KEYS = new WeakMap<Element, string>()
const TASK_OPEN_STATES = new WeakMap<Element, boolean>()
const TASK_STEP_OPEN_STATES = new WeakMap<Element, boolean>()
const TASK_ACTIVE_STEPS = new WeakMap<Element, Element>()
const TASK_THINK_TEXT = new WeakMap<Element, string>()
const TASK_DOM_SOURCES = new WeakMap<HTMLDetailsElement, Element>()
const TASK_STEP_DOM_SOURCES = new WeakMap<HTMLDetailsElement, Element>()
let nextTaskStepKey = 1
let nextTaskTurnKey = 1

function taskStepKey(source: Element): string {
  const current = TASK_STEP_KEYS.get(source)
  if (current !== undefined) return current
  const key = String(nextTaskStepKey++)
  TASK_STEP_KEYS.set(source, key)
  return key
}

function taskTurnKey(source: Element): string {
  const current = TASK_TURN_KEYS.get(source)
  if (current !== undefined) return current
  const key = String(nextTaskTurnKey++)
  TASK_TURN_KEYS.set(source, key)
  return key
}

function taskStepHasWarning(source: Element): boolean {
  const selector = "[data-state='error'], [data-state='fault'], [data-state='failed'], [data-state='warning']"
  return source.matches(selector) || source.querySelector(selector) !== null
}

function taskOpenStateSource(turn: ConversationTurn): Element | undefined {
  return turn.userRow ?? turn.assistantSteps[0] ?? turn.flowRows[0]
}

function taskStepText(source: Element, kind: TaskStepKind): string {
  const toolRoot = source.matches('[data-tool]') ? source : source.querySelector('[data-tool]')
  if (kind === 'think') {
    const disclosure = source.matches("[data-disclosure-row][aria-expanded='false']")
      ? source as HTMLElement
      : source.querySelector<HTMLElement>("[data-disclosure-row][aria-expanded='false']")
    if (disclosure !== null) disclosure.click()
  }
  const thinkBody = kind === 'think'
    ? source.querySelector<HTMLElement>("[class*='thinkBody']")
    : null
  let text = (thinkBody?.textContent ?? (kind === 'think' ? TASK_THINK_TEXT.get(source) : undefined) ?? source.textContent ?? '')
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  if (kind === 'think' && thinkBody !== null && text !== '') TASK_THINK_TEXT.set(source, text)
  const hiddenStatus = toolRoot?.querySelector('[class*="visuallyHidden"]')?.textContent?.trim()
  if (hiddenStatus !== undefined && hiddenStatus !== '' && text.startsWith(hiddenStatus)) {
    text = text.slice(hiddenStatus.length).trimStart()
  }
  const structuredTitle = toolRoot?.querySelector('[class*="_title_"]')?.textContent?.trim()
  const labels: Record<TaskStepKind, string[]> = {
    think: ['Thinking', 'Think', '思考'],
    read: ['Inspect', 'Search', 'Read', '搜索', '读取'],
    write: ['Write', 'Edit', '写入', '编辑'],
    skill: ['Tool call', 'Skills', 'Skill', '技能'],
    run: ['Command', 'Pwsh', 'Bash', 'Code', 'Run', '命令', '执行'],
    tool: ['Mount temporary Plugin', 'Unmount temporary Plugin', 'Tool call', 'Tool', '工具调用', '工具'],
    update: ['Update', '更新'],
  }
  const candidates = structuredTitle === undefined || structuredTitle === ''
    ? labels[kind] : [structuredTitle, ...labels[kind]]
  const label = candidates.find(candidate => text.toLocaleLowerCase().startsWith(candidate.toLocaleLowerCase()))
  if (label === undefined || text.length === label.length) return text
  const remainder = text.slice(label.length)
  if (toolRoot === null && /^[A-Za-z0-9_]/.test(remainder)) return text
  return remainder.replace(/^[\s:：·—–-]+/, '').trimStart()
}

function createTaskManagerTask(): HTMLDetailsElement {
  const task = element('details', css.taskManagerTask ?? '')
  const summary = element('summary', css.taskManagerSummary ?? '')
  const mark = element('span', css.taskManagerMark ?? '')
  const title = element('span', css.taskManagerTitle ?? '')
  const stateText = element('span', css.taskManagerState ?? '')
  title.dataset.taskTitle = ''
  stateText.dataset.taskStateLabel = ''
  mark.setAttribute('aria-hidden', 'true')
  summary.append(mark, title, stateText)
  summary.addEventListener('click', (event) => {
    event.preventDefault()
    task.open = !task.open
    const source = TASK_DOM_SOURCES.get(task)
    if (source !== undefined) TASK_OPEN_STATES.set(source, task.open)
  })
  const steps = element('ol', css.taskManagerSteps ?? '')
  steps.dataset.taskSteps = ''
  task.append(summary, steps)
  return task
}

function createTaskManagerStep(): HTMLLIElement {
  const step = element('li', css.taskManagerStep ?? '')
  const detail = element('details', css.taskManagerStepDetails ?? '')
  const summary = element('summary', css.taskManagerStepSummary ?? '')
  const kind = element('span', css.taskManagerStepKind ?? '')
  const copy = element('span', css.taskManagerStepCopy ?? '')
  const warning = element('span', css.taskManagerStepWarning ?? '')
  const body = element('div', css.taskManagerStepBody ?? '')
  detail.dataset.taskStepDetails = ''
  kind.dataset.taskStepLabel = ''
  copy.dataset.taskStepCopy = ''
  warning.dataset.taskStepWarningLabel = ''
  body.dataset.taskStepBody = ''
  summary.append(kind, copy, warning)
  summary.addEventListener('click', (event) => {
    event.preventDefault()
    detail.open = !detail.open
    const source = TASK_STEP_DOM_SOURCES.get(detail)
    if (source !== undefined) TASK_STEP_OPEN_STATES.set(source, detail.open)
  })
  detail.append(summary, body)
  step.append(detail)
  return step
}

function projectTaskManager(surface: HTMLElement, turns: readonly ConversationTurn[]): void {
  const visibleTurns = turns.slice(-8).reverse()
  const existingTasks = new Map([...surface.querySelectorAll<HTMLDetailsElement>(':scope > details[data-task-key]')]
    .map(task => [task.dataset.taskKey ?? '', task]))
  const retainedTasks = new Set<HTMLDetailsElement>()
  for (const turn of visibleTurns) {
    const latest = turn === turns.at(-1)
    const state = taskManagerState(turn, latest)
    const openStateSource = taskOpenStateSource(turn)
    const key = openStateSource === undefined ? `empty-${turn.order}` : taskTurnKey(openStateSource)
    const task = existingTasks.get(key) ?? createTaskManagerTask()
    retainedTasks.add(task)
    task.dataset.taskKey = key
    task.dataset.taskOrder = String(turn.order)
    task.dataset.taskState = state
    if (openStateSource === undefined) TASK_DOM_SOURCES.delete(task)
    else TASK_DOM_SOURCES.set(task, openStateSource)
    task.open = openStateSource === undefined
      ? state !== 'completed'
      : TASK_OPEN_STATES.get(openStateSource) ?? state !== 'completed'
    setText(task.querySelector<HTMLElement>('[data-task-title]')!, taskManagerTitle(turn))
    setText(task.querySelector<HTMLElement>('[data-task-state-label]')!, taskManagerStateLabel(state))

    const steps = task.querySelector<HTMLOListElement>('[data-task-steps]')!
    const entries = taskExecutionEntries(turn)
      .map(entry => ({ ...entry, fullText: taskStepText(entry.source, entry.kind) }))
      .filter(entry => entry.fullText !== '')
    const activeEntry = latest && !turn.complete
      ? entries.find(entry => stepIsRunning(entry.source)) ?? entries[0]
      : undefined
    const previousActive = openStateSource === undefined ? undefined : TASK_ACTIVE_STEPS.get(openStateSource)
    const activeChanged = activeEntry !== undefined && previousActive !== activeEntry.source
    if (previousActive !== undefined && previousActive !== activeEntry?.source) {
      TASK_STEP_OPEN_STATES.set(previousActive, false)
    }
    if (openStateSource !== undefined) {
      if (activeEntry === undefined) TASK_ACTIVE_STEPS.delete(openStateSource)
      else TASK_ACTIVE_STEPS.set(openStateSource, activeEntry.source)
    }

    const existingSteps = new Map([...steps.querySelectorAll<HTMLLIElement>(':scope > li[data-task-step-key]')]
      .map(step => [step.dataset.taskStepKey ?? '', step]))
    const retainedSteps = new Set<HTMLLIElement>()
    for (const entry of entries) {
      const warning = taskStepHasWarning(entry.source)
      const preview = entry.fullText.replace(/\s+/g, ' ').slice(0, 120)
      const stepKey = taskStepKey(entry.source)
      const step = existingSteps.get(stepKey) ?? createTaskManagerStep()
      retainedSteps.add(step)
      step.dataset.taskStepKey = stepKey
      step.dataset.taskStepKind = entry.kind
      step.toggleAttribute('data-task-step-warning', warning)
      const detail = step.querySelector<HTMLDetailsElement>('[data-task-step-details]')!
      detail.dataset.taskStepKey = stepKey
      TASK_STEP_DOM_SOURCES.set(detail, entry.source)
      const storedOpen = TASK_STEP_OPEN_STATES.get(entry.source)
      detail.open = entry.source === activeEntry?.source
        ? (activeChanged || storedOpen === undefined ? true : storedOpen)
        : storedOpen ?? false
      setText(step.querySelector<HTMLElement>('[data-task-step-label]')!, TASK_STEP_LABELS[entry.kind])
      setText(step.querySelector<HTMLElement>('[data-task-step-copy]')!, preview)
      setText(step.querySelector<HTMLElement>('[data-task-step-warning-label]')!, warning ? '!!!' : '')
      setText(step.querySelector<HTMLElement>('[data-task-step-body]')!, entry.fullText)
      steps.append(step)
    }
    for (const step of existingSteps.values()) {
      if (!retainedSteps.has(step)) step.remove()
    }

    steps.querySelector(':scope > li[data-task-terminal]')?.remove()
    const terminal = element('li', `${css.taskManagerStep ?? ''} ${css.taskManagerTerminal ?? ''}`)
    terminal.dataset.taskTerminal = ''
    terminal.dataset.taskStepKind = 'status'
    const terminalCopy = state === 'completed' ? t('回复已发送至 JINE')
      : state === 'waiting' ? t('等待你在 JINE 中选择')
        : state === 'running' ? t('正在处理…') : t('等待开始…')
    terminal.append(element('span', css.taskManagerStepKind ?? '', 'STATUS'), element('span', css.taskManagerStepCopy ?? '', terminalCopy))
    if (state === 'completed' || state === 'waiting') {
      const openJine = element('button', css.taskManagerLink ?? '', 'JINE')
      openJine.type = 'button'
      openJine.dataset.taskAction = 'jine'
      terminal.append(openJine)
    }
    steps.append(terminal)
    surface.append(task)
  }
  for (const task of existingTasks.values()) {
    if (!retainedTasks.has(task)) task.remove()
  }
  surface.querySelector(':scope > [data-task-manager-empty]')?.remove()
  if (visibleTurns.length === 0) {
    const empty = element('div', css.emptySurface ?? '', () => t('目前没有运行中的任务'))
    empty.dataset.taskManagerEmpty = ''
    surface.append(empty)
  }
}

function projectLive(surface: HTMLElement, liveSurface: LiveSurface): void {
  surface.replaceChildren()
  const entries: Element[] = [
    ...document.querySelectorAll("[data-chat-flow-kind='assistant-step'] [data-variant='think']"),
    ...document.querySelectorAll("[data-chat-flow-kind]:not([data-chat-flow-kind='user']):not([data-chat-flow-kind='assistant-step']):not([data-chat-flow-kind='turn-tail'])"),
  ]
  entries.sort((left, right) => left.compareDocumentPosition(right) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
  let hasEntries = false
  for (const entry of entries.slice(-10)) {
    const text = normalizedText(entry)
    if (text === '') continue
    const flowKind = entry.closest('[data-chat-flow-kind]')?.getAttribute('data-chat-flow-kind')
    const kind = entry.matches('[data-variant="think"]')
      ? 'think'
      : flowKind === 'tool' ? 'tool' : 'update'
    surface.append(buildLiveComment(text.slice(0, 180), kind))
    hasEntries = true
  }
  const running = document.querySelector("[data-chat-flow-kind='assistant-step'] [data-state='running'], [data-chat-flow-kind='assistant-step'] [data-streaming='true']")
  if (running !== null) {
    surface.append(buildLiveComment(() => t('● LIVE · 思考中…'), 'think', true))
    hasEntries = true
  }
  if (!hasEntries) surface.append(buildLiveEmpty(() => t('直播尚未开始')))
  setLiveState(liveSurface, running !== null, hasEntries)
}

function subagentPoketterIdentity(identity?: SubagentIdentity): PoketterIdentity | undefined {
  return identity === undefined ? undefined : {
    avatarCssUrl: SUBAGENT_POKETTER_AVATAR,
    displayName: identity.displayName,
    handle: identity.handle,
  }
}

function projectTweets(
  surface: HTMLElement,
  turns: readonly ConversationTurn[],
  identity?: SubagentIdentity,
): void {
  const poketterIdentity = subagentPoketterIdentity(identity)
  const posts = turns
    .filter((turn): turn is ConversationTurn & { finalMarkdown: Element } => turn.finalMarkdown !== undefined)
    .map(turn => ({
      source: turn.finalMarkdown,
      orderLabel: t("第 {0} 轮", turn.order),
      time: turn.time,
      ...(poketterIdentity === undefined ? {} : { identity: poketterIdentity }),
    }))
    .reverse()
  renderPoketter(surface, posts, css.emptySurface ?? '')
}

/** MyPicture album grid: every image currently projected into JINE, newest
 * first. JINE also owns steering and pending-steering messages, which are not
 * ConversationTurn roots; deriving the album from turns silently omitted
 * those historical attachments even though their JINE thumbnails worked. */
function renderPictureGrid(surfaces: DesktopSurfaces): void {
  const sources: string[] = []
  const messages = [...surfaces.jineFeed.querySelectorAll<HTMLElement>('[data-jine-message]')].reverse()
  for (const message of messages) {
    for (const image of message.querySelectorAll<HTMLImageElement>('img[data-jine-image]')) {
      const src = image.getAttribute('src') ?? ''
      if (src !== '' && !sources.includes(src)) sources.push(src)
    }
  }
  surfaces.pictureGrid.replaceChildren()
  for (const src of sources) {
    const button = element('button', css.pictureThumb ?? '')
    button.type = 'button'
    button.dataset.pictureThumb = ''
    const image = element('img', css.pictureThumbImage ?? '')
    image.src = src
    image.alt = ''
    button.append(image)
    surfaces.pictureGrid.append(button)
  }
}

export type TaskbarClockPeriod = 'noon' | 'evening' | 'night'

export interface TaskbarClockModel {
  text: string
  period: TaskbarClockPeriod
}

function stableSubagentHandle(label: string, sessionId: string): string {
  const readable = label
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 18)
  let hash = 2166136261
  for (const character of sessionId) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  const suffix = (hash >>> 0).toString(36).slice(0, 4).padStart(4, '0')
  return `sub_${readable === '' ? 'agent' : readable}_${suffix}`
}

function subagentIdentity(
  parentSessionId: string,
  entry: SubagentCatalogEntry,
  summary: SessionSummary | undefined,
): SubagentIdentity | undefined {
  if (entry.kind !== 'child' || entry.mode === undefined) return undefined
  const label = entry.label?.trim() || summary?.displayTitle.trim() || entry.id
  return {
    parentSessionId,
    sessionId: entry.id,
    label,
    displayName: `SUB // ${label}`,
    handle: stableSubagentHandle(label, entry.id),
    mode: entry.mode,
    running: entry.activity === 'running' || summary?.running === true,
  }
}

function projectSubagentView(sessions?: SessionsBridge): SubagentViewModel {
  if (sessions === undefined) {
    return { rootLabel: t('主代理'), catalogState: 'unavailable', contacts: [] }
  }
  const snapshot = sessions.list.getSnapshot()
  const currentId = snapshot.current
  const currentSummary = currentId === undefined ? undefined : snapshot.byId[currentId]
  const currentAddress = snapshot.currentAddress
  const parentSessionId = currentAddress?.parentSessionId
    ?? (currentSummary?.origin === 'subagent' ? currentSummary.parentId : currentId)
  if (parentSessionId === undefined) {
    return { rootLabel: t('主代理'), catalogState: 'loading', contacts: [] }
  }
  let rootSessionId = currentAddress?.parentSessionId ?? currentId ?? parentSessionId
  const visited = new Set<string>()
  while (!visited.has(rootSessionId)) {
    visited.add(rootSessionId)
    const summary = snapshot.byId[rootSessionId]
    if (summary?.origin !== 'subagent' || summary.parentId === undefined) break
    rootSessionId = summary.parentId
  }
  const rootLabel = snapshot.byId[rootSessionId]?.displayTitle ?? t('主代理')
  const catalog = snapshot.subagentsByParent[parentSessionId]
  const contacts = (catalog?.entries ?? [])
    .map(entry => subagentIdentity(parentSessionId, entry, snapshot.byId[entry.id]))
    .filter((identity): identity is SubagentIdentity => identity !== undefined)
    .map(identity => ({ ...identity, selected: identity.sessionId === currentId }))
  let selected = contacts.find(contact => contact.selected)
  if (selected === undefined && currentAddress !== undefined && currentId !== undefined) {
    const label = currentSummary?.displayTitle ?? currentId
    selected = {
      parentSessionId,
      sessionId: currentId,
      label,
      displayName: `SUB // ${label}`,
      handle: stableSubagentHandle(label, currentId),
      mode: currentAddress.mode,
      running: currentSummary?.running === true,
      selected: true,
    }
  }
  const base = {
    parentSessionId,
    rootSessionId,
    rootLabel,
    catalogState: catalog?.state ?? 'loading',
    contacts,
  }
  return selected === undefined ? base : { ...base, selected }
}

function renderJineSessionMenu(surface: HTMLElement, model: SubagentViewModel): void {
  const root = element('button', css.subagentContact ?? '')
  root.type = 'button'
  root.setAttribute('role', 'menuitem')
  root.dataset.subagentRoot = model.rootSessionId ?? ''
  root.dataset.subagentSelected = model.selected === undefined ? 'true' : 'false'
  const rootMark = element('span', css.subagentContactPrimaryAvatar ?? '', () => t('主'))
  rootMark.setAttribute('aria-hidden', 'true')
  const rootCopy = element('span', css.subagentContactCopy ?? '')
  rootCopy.append(
    element('strong', css.subagentContactLabel ?? '', model.rootLabel),
    element('small', css.subagentContactStatus ?? '', () => t('主会话')),
  )
  root.append(rootMark, rootCopy)
  const menuContacts = model.selected !== undefined
    && !model.contacts.some(contact => contact.sessionId === model.selected?.sessionId)
    ? [{ ...model.selected, selected: true }, ...model.contacts]
    : model.contacts
  const contacts = menuContacts.map((contact) => {
    const button = element('button', css.subagentContact ?? '')
    button.type = 'button'
    button.setAttribute('role', 'menuitem')
    button.dataset.subagentChild = contact.sessionId
    button.dataset.subagentParent = contact.parentSessionId
    button.dataset.subagentMode = contact.mode
    button.dataset.subagentSelected = String(contact.selected)
    const avatar = element('span', css.subagentContactAvatar ?? '', () => t('子'))
    avatar.setAttribute('aria-hidden', 'true')
    const copy = element('span', css.subagentContactCopy ?? '')
    copy.append(
      element('strong', css.subagentContactLabel ?? '', contact.label),
      element('small', css.subagentContactStatus ?? '', () => contact.running
        ? (t('子会话 · 输入中…'))
        : contact.mode === 'one-shot'
          ? (t('子会话 · 已完成 · 只读'))
          : (t('子会话 · 已完成'))),
    )
    button.append(avatar, copy)
    return button
  })
  const status = element('div', css.jineSessionStatus ?? '', () => model.catalogState === 'unavailable'
    ? t('当前 DSH 未提供会话选择服务')
    : model.catalogState === 'error'
      ? t('子代理列表加载失败')
      : contacts.length === 0 ? (t('暂无子会话')) : '')
  surface.replaceChildren(root, ...contacts, ...(status.textContent === '' ? [] : [status]))
}

/** Local desktop clock using the game's three available watch sprites. */
export function taskbarClockModel(now: Date = new Date()): TaskbarClockModel {
  const hour = now.getHours()
  const period = hour >= 6 && hour < 17 ? 'noon'
    : hour >= 17 && hour < 20 ? 'evening' : 'night'
  const text = `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  return { text, period }
}

function sessionRowTitle(row: Element): string {
  const title = row.querySelector<HTMLElement>(":scope > [class*='title'], :scope > [class*='Title']")
  if (title !== null) return normalizedText(title)
  const directText = [...row.childNodes]
    .filter((node): node is Text => node instanceof Text)
    .map(node => node.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ')
  if (directText !== '') return directText
  return normalizedText(row).replace(/(?:已完成|Completed)$/i, '').trim()
}

/** Semantic identity for the selected DSH session. React may replace the
 * entire sidebar row while applying settings; DOM object identity therefore
 * cannot distinguish a rerender from a real conversation switch. */
function selectedSessionKey(): string {
  const selected = document.querySelector<HTMLElement>("[role='treeitem'][aria-selected='true']")
  if (selected === null) return window.location.href
  const explicit = selected.dataset.sessionId
    ?? selected.dataset.sessionKey
    ?? selected.getAttribute('data-id')
    ?? selected.querySelector<HTMLAnchorElement>('a[href]')?.href
  return `${window.location.href}\u0000${explicit ?? sessionRowTitle(selected)}`
}

const LAST_WEBCAM_SESSION = new WeakMap<DesktopSurfaces, string>()

function syncWebcamPoseSession(surfaces: DesktopSurfaces): void {
  const selected = selectedSessionKey()
  if (LAST_WEBCAM_SESSION.get(surfaces) === selected) return
  LAST_WEBCAM_SESSION.set(surfaces, selected)
  surfaces.rollWebcamPose()
}

interface ConversationNoticeSnapshot {
  sessionKey: string
  complete: boolean
  finalText: string
}

function conversationNoticeSnapshot(turns: readonly ConversationTurn[]): ConversationNoticeSnapshot {
  const latest = turns.at(-1)
  return {
    sessionKey: selectedSessionKey(),
    complete: latest?.complete === true,
    finalText: latest?.finalMarkdown === undefined ? '' : normalizedText(latest.finalMarkdown),
  }
}

/** DSH's authoritative finished-but-unviewed reminder. The status dot has a
 * localized visually-hidden label in each session tree row. */
function completedSessionNotices(): Map<string, string> {
  const completed = new Map<string, string>()
  for (const row of document.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")) {
    const hasCompletionMark = [...row.querySelectorAll<HTMLElement>('span')]
      .some(node => /^(?:已完成|Completed)$/i.test(normalizedText(node)))
    if (!hasCompletionMark) continue
    const title = sessionRowTitle(row) || t('后台会话')
    const explicit = row.dataset.sessionId
      ?? row.dataset.sessionKey
      ?? row.getAttribute('data-id')
      ?? row.querySelector<HTMLAnchorElement>('a[href]')?.href
    completed.set(explicit ?? title, title)
  }
  return completed
}

function projectionSoundFingerprint(kind: string, identity: string): string {
  let hash = 0x811c9dc5
  const source = `${kind}\u0000${identity}`
  for (let index = 0; index < source.length; index++) {
    hash ^= source.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${kind}:${(hash >>> 0).toString(36)}`
}

function createProjectionSoundLedger(storage?: Storage): (kind: string, identity: string) => boolean {
  let remembered: string[] = []
  try {
    const parsed: unknown = JSON.parse(storage?.getItem(PROJECTION_SOUND_EVENTS_STORAGE) ?? '[]')
    if (Array.isArray(parsed)) remembered = parsed.filter((entry): entry is string => typeof entry === 'string')
  } catch {}
  remembered = remembered.slice(-PROJECTION_SOUND_EVENT_LIMIT)
  const seen = new Set(remembered)
  return (kind, identity) => {
    const fingerprint = projectionSoundFingerprint(kind, identity)
    if (seen.has(fingerprint)) return false
    seen.add(fingerprint)
    remembered.push(fingerprint)
    if (remembered.length > PROJECTION_SOUND_EVENT_LIMIT) {
      const expired = remembered.shift()
      if (expired !== undefined) seen.delete(expired)
    }
    try { storage?.setItem(PROJECTION_SOUND_EVENTS_STORAGE, JSON.stringify(remembered)) } catch {}
    return true
  }
}

function updateTaskbarClock(surfaces: DesktopSurfaces, now: Date = new Date()): void {
  const clock = taskbarClockModel(now)
  const icons: Record<TaskbarClockPeriod, string> = {
    noon: NGO_WATCH_NOON.dataUri,
    evening: NGO_WATCH_EVENING.dataUri,
    night: NGO_WATCH_NIGHT.dataUri,
  }
  setText(surfaces.clockLabel, clock.text)
  surfaces.clockIcon.src = icons[clock.period]
  surfaces.clockIcon.dataset.clockPeriod = clock.period
  setAttr(surfaces.clockButton, 'aria-label', () => t("{0}，打开会话与存档", clock.text))
}

const BEIJING_WEEKDAYS: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
}

/** Peak pricing uses Beijing wall-clock time: Mon-Fri 09:00-12:00 and 14:00-18:00. */
function isBeijingPeakHour(now: Date = new Date()): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now)
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
    const weekday = BEIJING_WEEKDAYS[values.weekday ?? ''] ?? 0
    if (weekday < 1 || weekday > 5) return false
    const minutes = Number(values.hour ?? '0') * 60 + Number(values.minute ?? '0')
    return (minutes >= 9 * 60 && minutes < 12 * 60)
      || (minutes >= 14 * 60 && minutes < 18 * 60)
  } catch {
    return false
  }
}

function applyProjection(
  surfaces: DesktopSurfaces,
  questionTranscripts: readonly QuestionTranscript[] = [],
  subagents: SubagentViewModel = {
    rootLabel: t('主代理'),
    catalogState: 'unavailable',
    contacts: [],
  },
): void {
  const phase = document.querySelector('[data-phase]')?.getAttribute('data-phase') ?? 'hero'
  const turns = collectConversationTurns()
  document.body.setAttribute(PHASE_ATTRIBUTE, phase)
  // DSH sessions replace the game's day lifecycle. Re-roll the autonomous
  // webcam pose only when the selected session row changes; process/scene and
  // wall-clock transitions must not interrupt the current pose.
  syncWebcamPoseSession(surfaces)
  projectJine(surfaces.jineFeed, turns, questionTranscripts, subagents.selected)
  projectTaskManager(surfaces.taskFeed, turns)
  projectLive(surfaces.liveFeed, surfaces.liveSurface)
  projectTweets(surfaces.tweetFeed, turns, subagents.selected)
  renderPictureGrid(surfaces)
}

function mutationTouchesProjection(mutation: MutationRecord): boolean {
  const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
  if (target?.closest('[data-chat-flow], [data-phase], [role="tree"], [data-queue-dock]') !== null) return true
  return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node instanceof Element
    && (node.matches('[data-chat-flow], [data-phase], [role="tree"], [data-queue-dock]')
      || node.querySelector('[data-chat-flow], [data-phase], [role="tree"], [data-queue-dock]') !== null))
}

function mutationAddsConversationUser(mutation: MutationRecord): boolean {
  if (mutation.type !== 'childList') return false
  const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
  if (target?.closest('[data-chat-flow]') == null) return false
  return [...mutation.addedNodes].some(node => node instanceof Element
    && (node.matches("[data-chat-flow-kind='user'], [data-chat-flow-kind='steering'], [data-pending-steering]")
      || node.querySelector('[data-pending-steering]') !== null))
}

function mutationTouchesTodo(mutation: MutationRecord): boolean {
  const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
  if (target?.closest('[data-testid="todo-panel"], [data-goal-bar]') !== null) return true
  return [...mutation.addedNodes, ...mutation.removedNodes].some((node) => node instanceof Element
    && (node.matches('[data-testid="todo-panel"], [data-goal-bar]')
      || node.querySelector('[data-testid="todo-panel"], [data-goal-bar]') !== null))
}

/**
 * Snapshot of the shell's /manifest.webmanifest field values, verified on
 * 2026-08-23. Injected inline (instead of fetched) so the swap stays
 * synchronous; only start_url/scope (needed absolute) and the icon list are
 * replaced.
 */
const DSH_MANIFEST_HEAD = {
  id: '/',
  name: 'DeepSeek Harness',
  short_name: 'DSH',
  display: 'fullscreen',
} as const

/** Apply the full desktop shell and register a symmetric hot-unload disposer. */
export function apply(ctx: Context): void {
  const disposeLocale = installLocale()
  const body = document.body
  const scheduleCatalogLease = String(++nextScheduleCatalogLease)
  const ownedScheduleCatalogs = new Set<HTMLElement>()
  const decorateScheduleCatalog = (): void => {
    const outlet = document.querySelector<HTMLElement>("[data-slot='conversation.session.header.actions']")
    if (outlet === null) return
    for (const candidate of outlet.querySelectorAll<HTMLElement>(':scope > div')) {
      const trigger = candidate.querySelector<HTMLButtonElement>(
        ":scope > button[aria-expanded][aria-label]",
      )
      // The alpha.2 schedule trigger is the only header action whose button
      // owns both a leading alarm icon and a trailing chevron directly.
      if (trigger === null
        || trigger.querySelector(':scope > svg:first-child') === null
        || trigger.querySelectorAll(':scope > svg').length < 2) continue
      candidate.setAttribute(SCHEDULE_CATALOG_ATTRIBUTE, scheduleCatalogLease)
      ownedScheduleCatalogs.add(candidate)
    }
  }
  // Chromium picks the first supported <link rel="icon"> in DOM order, so a
  // plain append is shadowed by the shell's static SVG favicon. Remove the host
  // icon instead and restore it at its original position on unload.
  const hostIcons = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]')].map(hostIcon => {
    const anchor = hostIcon.nextSibling
    hostIcon.remove()
    return { hostIcon, anchor }
  })
  const favicon = document.createElement('link')
  favicon.rel = 'icon'
  favicon.type = 'image/png'
  favicon.href = NGO_WEB_ICON.dataUri
  favicon.setAttribute('sizes', '32x32')
  favicon.dataset.skinChrome = 'favicon'
  document.head.append(favicon)
  // Installed/taskbar app icons come from the PWA manifest, not the favicon, so
  // also swap the shell's /manifest.webmanifest icon list for the game icon
  // (192/512 are the sizes Chromium requires for installability). Same restore
  // contract as the favicon: remember the host link's anchor, restore on unload.
  const hostManifests = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="manifest"]')].map(hostManifest => {
    const anchor = hostManifest.nextSibling
    hostManifest.remove()
    return { hostManifest, anchor }
  })
  const manifestIcons: Array<{ src: string; sizes: string; type: string; purpose: string }> = [
    { source: NGO_WEB_ICON_512, sizes: '512x512' },
    { source: NGO_WEB_ICON_192, sizes: '192x192' },
    { source: NGO_WEB_ICON, sizes: '32x32' },
  ].map(({ source, sizes }) => ({ src: source.dataUri, sizes, type: 'image/png', purpose: 'any' }))
  manifestIcons.push({ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' })
  // Chromium's manifest parser must resolve every URL and accepts only
  // http(s) or data schemes; blob: manifests are rejected ("invalid scheme")
  // and relative paths cannot resolve against a blob: base. A data: manifest
  // with absolute start_url/scope and data: icons is verified via CDP
  // Page.getAppManifest (zero errors, installable).
  const manifestUrl = `data:application/manifest+json,${encodeURIComponent(JSON.stringify({
    ...DSH_MANIFEST_HEAD,
    start_url: `${window.location.origin}/`,
    scope: `${window.location.origin}/`,
    icons: manifestIcons,
  }))}`
  const manifestLink = document.createElement('link')
  manifestLink.rel = 'manifest'
  manifestLink.href = manifestUrl
  manifestLink.dataset.skinChrome = 'manifest'
  document.head.append(manifestLink)
  const previousArt = new Map<string, string>()
  for (const [property, value] of ART_PROPERTIES) {
    previousArt.set(property, body.style.getPropertyValue(property))
    body.style.setProperty(property, value)
  }
  body.setAttribute(BODY_ATTRIBUTE, '')

  const sfx = createSfx({
    poko: NGO_SE_POKO.dataUri,
    kari: NGO_SE_KARI.dataUri,
    pirodown: NGO_SE_PIRODOWN.dataUri,
    windowClose: NGO_SE_WINDOW_CLOSE.dataUri,
    commandExecute: NGO_SE_COMMAND_EXECUTE.dataUri,
    popTooltip: NGO_SE_POP_TOOLTIP.dataUri,
    popTutorial: NGO_SE_POP_TUTORIAL.dataUri,
    pillGuiiin: NGO_SE_PILL_GUIIIN.dataUri,
    per: NGO_SE_PER.dataUri,
    biosPiko: NGO_SE_BIOS_PIKO.dataUri,
    biosHdd: NGO_SE_BIOS_HDD.dataUri,
    boot: NGO_SE_BOOT.dataUri,
    bootCaution: NGO_SE_BOOT_CAUTION.dataUri,
    piporo: NGO_SE_PIPORO.dataUri,
    jineReceive: NGO_SE_JINE_RECIEVE.dataUri,
    tweetLoad: NGO_SE_TWEET_LOAD.dataUri,
    tweetChangeTop: NGO_SE_TWEET_CHANGE_TOP.dataUri,
    tweetKusorep: NGO_SE_TWEET_KUSOREP.dataUri,
    statusUp: NGO_SE_STATUS_UP.dataUri,
    statusDown: NGO_SE_STATUS_DOWN.dataUri,
    statusShowDiff: NGO_SE_STATUS_SHOWDIFF.dataUri,
    haisinSuperchat: NGO_SE_HAISIN_SUPERCHAT.dataUri,
    jineSendStamp: NGO_SE_JINE_SEND_STAMP.dataUri,
    nadenade1: NGO_SE_NADENADE_1.dataUri,
    notification: NGO_SE_NOTIFICATION.dataUri,
    piyo: NGO_SE_PIYO.dataUri,
    isaacSlotCoin: ISAAC_SLOT_COIN.dataUri,
    isaacSlotPull: ISAAC_SLOT_PULL.dataUri,
    isaacSlotSpin: ISAAC_SLOT_SPIN_LOOP.dataUri,
    isaacSlotStop: ISAAC_SLOT_STOP.dataUri,
    isaacSlotSpawn: ISAAC_SLOT_SPAWN.dataUri,
    isaacBombDrop0: ISAAC_BOMB_DROP_0.dataUri,
    isaacBombDrop1: ISAAC_BOMB_DROP_1.dataUri,
    isaacBombExplode0: ISAAC_BOMB_EXPLODE_0.dataUri,
    isaacBombExplode1: ISAAC_BOMB_EXPLODE_1.dataUri,
    isaacBombExplode2: ISAAC_BOMB_EXPLODE_2.dataUri,
    steamAchievement: STEAM_ACHIEVEMENT.dataUri,
    isaacVoicePowerPill: ISAAC_VOICE_POWER_PILL.dataUri,
    isaacVoiceRetroVision: ISAAC_VOICE_RETRO_VISION.dataUri,
    isaacGamekidChew: ISAAC_GAMEKID_CHEW.dataUri,
    terrariaGravityPotionUse: TERRARIA_GRAVITY_POTION_USE.dataUri,
    minecraftSuspiciousStewEat: MINECRAFT_SUSPICIOUS_STEW_EAT.dataUri,
    minecraftDrink: MINECRAFT_DRINK.dataUri,
  }, NGO_BGM_MAINLOOP.dataUri)
  const surfaces = buildDesktop(sfx, () => {
    closeStartMenu()
    lightModeLock.crashWebcam()
  })
  body.append(surfaces.scene)
  let clockTimer: number | undefined
  let sideScenePeriod: TaskbarClockPeriod | undefined
  let sideSceneSwapTimer: number | undefined
  let sideSceneReleaseTimer: number | undefined
  const clearSideSceneTransition = (): void => {
    if (sideSceneSwapTimer !== undefined) window.clearTimeout(sideSceneSwapTimer)
    if (sideSceneReleaseTimer !== undefined) window.clearTimeout(sideSceneReleaseTimer)
    sideSceneSwapTimer = undefined
    sideSceneReleaseTimer = undefined
    body.removeAttribute('data-ngo-side-transition')
  }
  const releaseSideSceneTransitionAfter = (duration: number): void => {
    sideSceneReleaseTimer = window.setTimeout(() => {
      sideSceneReleaseTimer = undefined
      body.removeAttribute('data-ngo-side-transition')
    }, duration)
  }
  const syncSideSceneClock = (now: Date): void => {
    const next = taskbarClockModel(now).period
    if (next === sideScenePeriod) return
    clearSideSceneTransition()
    if (sideScenePeriod === undefined) {
      sideScenePeriod = next
      body.setAttribute(SIDE_SCENE_ATTRIBUTE, next)
      return
    }
    sideScenePeriod = next
    if (next === 'noon') {
      // DayAndNight case 0 swaps to Noon while the existing day-passing blur
      // releases for 2.2 seconds and intentionally plays no notification SE.
      body.setAttribute(SIDE_SCENE_ATTRIBUTE, next)
      body.setAttribute('data-ngo-side-transition', 'day-release')
      releaseSideSceneTransitionAfter(2_200)
      return
    }
    // Twilight and Night reproduce DayAndNight's 0.2s blur-in, sprite swap,
    // SE_Notification, then 3.2s OutExpo-like blur release.
    body.setAttribute('data-ngo-side-transition', 'blur-in')
    sfx.play('notification')
    sideSceneSwapTimer = window.setTimeout(() => {
      sideSceneSwapTimer = undefined
      body.setAttribute(SIDE_SCENE_ATTRIBUTE, next)
      body.setAttribute('data-ngo-side-transition', 'blur-out')
      releaseSideSceneTransitionAfter(3_200)
    }, 200)
  }
  const tickClock = (): void => {
    const now = new Date()
    updateTaskbarClock(surfaces, now)
    syncSideSceneClock(now)
    const untilNextMinute = 60_000 - (Date.now() % 60_000) + 16
    clockTimer = window.setTimeout(tickClock, untilNextMinute)
  }
  tickClock()
  // The desktop is a presentation mirror of DSH, not an upload source. Make
  // every raster inside the skin non-draggable so native image drag cannot
  // feed DSH's DropOverlay/composer upload path while the user moves a game
  // icon or one of the projected pictures.
  for (const image of surfaces.scene.querySelectorAll('img')) {
    image.draggable = false
    image.style.setProperty('-webkit-user-drag', 'none')
  }
  const onSkinDragStart = (event: DragEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const skinRoot = target.closest<HTMLElement>('[data-skin-chrome="scene"], [data-ngo-light-boot], [data-ngo-bright-tooltip-popup]')
    if (skinRoot === null) return
    event.preventDefault()
    event.stopPropagation()
    try {
      event.dataTransfer?.setData('text/plain', '')
    } catch {
      // Some synthetic drag events have no DataTransfer; prevention alone is enough.
    }
  }
  document.addEventListener('dragstart', onSkinDragStart, true)
  surfaces.scene.addEventListener('dragstart', onSkinDragStart, true)
  const disposeOnboardingAdapter = installOnboardingAdapter()
  const disposeHarnessFailureBlueScreen = installHarnessFailureBlueScreen()
  const lightModeLock = installLightModeLock(ctx, sfx)
  let sessions: SessionsBridge | undefined
  let workspaces: WorkspacesBridge | undefined
  const jineWindow = surfaces.windows.find(managedWindow => managedWindow.id === 'jine')
  if (jineWindow !== undefined) {
    jineWindow.followerSelector = '[data-composer-seat]'
    jineWindow.followerWidthInset = 20
    jineWindow.followerVerticalAnchor = 'bottom'
    // Current-rect re-anchoring (see window-manager syncFollowers) targets the
    // window's frame, so feed it the .windowBody insets: left 8 / bottom 22.
    jineWindow.followerLeftInset = 8
    jineWindow.followerBottomInset = 22
    jineWindow.onStackChange = layer => body.style.setProperty('--ngo-jine-layer', String(layer + 1))
  }
  const settingsWindow = surfaces.windows.find(managedWindow => managedWindow.id === 'settings')
  if (settingsWindow !== undefined) {
    settingsWindow.onActiveChange = active => body.toggleAttribute(SETTINGS_ACTIVE_ATTRIBUTE, active)
    settingsWindow.onStackChange = layer => body.style.setProperty('--ngo-settings-layer', String(layer + 1))
  }
  const windowManager = createDesktopWindowManager(
    undefined,
    name => sfx.play(name as SfxName),
    name => sfx.stop(name as SfxName),
  )
  for (const managedWindow of surfaces.windows) windowManager.register(managedWindow)
  let medicineConsentGranted = false
  try {
    medicineConsentGranted = window.localStorage.getItem(MEDICINE_CONSENT_STORAGE) === 'accepted'
  } catch {}
  let medicineConsentOpener: HTMLElement | null = null
  const closeMedicineConsent = (): void => {
    surfaces.medicineConsent.hidden = true
    medicineConsentOpener?.focus()
    medicineConsentOpener = null
  }
  const openMedicine = (): void => {
    if (medicineConsentGranted) {
      windowManager.setOpen('medicine', true)
      return
    }
    medicineConsentOpener = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : surfaces.medicineShortcut
    surfaces.medicineConsent.hidden = false
    surfaces.medicineConsentAccept.focus()
  }
  const acceptMedicineConsent = (): void => {
    medicineConsentGranted = true
    try { window.localStorage.setItem(MEDICINE_CONSENT_STORAGE, 'accepted') } catch {}
    surfaces.medicineConsent.hidden = true
    medicineConsentOpener = null
    windowManager.setOpen('medicine', true)
  }
  const declineMedicineConsent = (): void => closeMedicineConsent()
  const dismissMedicineConsentFromKeyboard = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape' || surfaces.medicineConsent.hidden) return
    event.preventDefault()
    closeMedicineConsent()
  }
  surfaces.medicineShortcut.addEventListener('click', openMedicine)
  surfaces.medicineConsentAccept.addEventListener('click', acceptMedicineConsent)
  surfaces.medicineConsentDecline.addEventListener('click', declineMedicineConsent)
  document.addEventListener('keydown', dismissMedicineConsentFromKeyboard)
  const formatPomodoroTime = (remainingMs: number): string => {
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1_000))
    const minutes = Math.floor(totalSeconds / 60)
    return `${String(minutes).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
  }
  const paintPomodoro = (snapshot: PomodoroSnapshot): void => {
    const time = formatPomodoroTime(snapshot.remainingMs)
    const resting = snapshot.phase === 'break'
    setText(surfaces.pomodoroDisplay, time)
    setText(surfaces.pomodoroPhase, () => resting
      ? snapshot.longBreak ? t('长休息时间') : t('休息时间')
      : t('专注时间'))
    setText(surfaces.pomodoroHint, () => resting
      ? t('站起来走一走，喝口水，再看看远处。')
      : t("已完成 {0} 轮；每 4 轮休息 15 分钟。", snapshot.completedFocus))
    setText(surfaces.pomodoroToggle, () => snapshot.running ? t('暂停') : t('启动计时'))
    setText(surfaces.pomodoroTaskLabel, `${resting ? '☕' : '🍅'} ${time}`)
    setText(surfaces.pomodoroTray, `${resting ? '☕' : '🍅'} ${time}`)
    surfaces.pomodoroTray.hidden = !snapshot.running
    setAttr(surfaces.pomodoroTray, 'aria-label', () => t("番茄钟 {0}", time))
    setText(surfaces.pomodoroShortcutLabel, () => snapshot.running ? t("番茄钟 {0}", time) : t('番茄钟'))
    surfaces.pomodoroFocusInput.value = String(snapshot.focusMinutes)
    surfaces.pomodoroBreakInput.value = String(snapshot.breakMinutes)
    surfaces.pomodoroPreset25.toggleAttribute('aria-pressed', snapshot.focusMinutes === 25 && snapshot.breakMinutes === 5)
    surfaces.pomodoroPreset50.toggleAttribute('aria-pressed', snapshot.focusMinutes === 50 && snapshot.breakMinutes === 10)
  }
  let pomodoroStorage: Storage | undefined
  try { pomodoroStorage = window.localStorage } catch {}
  let showPomodoroNotice = (_text: string): void => {}
  const pomodoroOptions = {
    onChange: paintPomodoro,
    onTransition: (transition: { to: 'focus' | 'break'; natural: boolean; longBreak: boolean }): void => {
      if (transition.to === 'break') {
        surfaces.playWebcamBreakPose()
      } else {
        // The game has no matching `stream_ame_in`; ResetAnim restores the
        // base directly. Reversing the leave clip makes the body motion read
        // unnaturally, so keep the original instantaneous return semantics.
        surfaces.rollWebcamPose()
      }
      if (transition.natural) {
        sfx.play('notification')
        surfaces.pomodoroTaskLabel.parentElement?.setAttribute('data-window-attention', '')
        windowManager.setOpen('pomodoro', true)
        showPomodoroNotice(transition.to === 'break'
          ? transition.longBreak ? t('四轮完成，休息 15 分钟吧。') : t('专注结束，起来走走吧。')
          : t('休息结束，回来继续吧。'))
      }
    },
    ...(pomodoroStorage === undefined ? {} : { storage: pomodoroStorage }),
  }
  const pomodoroController: PomodoroController = createPomodoroController(pomodoroOptions)
  const onPomodoroToggle = (): void => {
    surfaces.pomodoroTaskLabel.parentElement?.removeAttribute('data-window-attention')
    pomodoroController.toggle()
  }
  const onPomodoroSkip = (): void => pomodoroController.skip()
  const onPomodoroReset = (): void => {
    pomodoroController.reset()
    surfaces.rollWebcamPose()
  }
  const configurePomodoro = (focus: number, rest: number): void => pomodoroController.configure(focus, rest)
  const onPomodoroPreset25 = (): void => configurePomodoro(25, 5)
  const onPomodoroPreset50 = (): void => configurePomodoro(50, 10)
  const onPomodoroApply = (): void => configurePomodoro(
    Number(surfaces.pomodoroFocusInput.value),
    Number(surfaces.pomodoroBreakInput.value),
  )
  surfaces.pomodoroToggle.addEventListener('click', onPomodoroToggle)
  surfaces.pomodoroSkip.addEventListener('click', onPomodoroSkip)
  surfaces.pomodoroReset.addEventListener('click', onPomodoroReset)
  surfaces.pomodoroPreset25.addEventListener('click', onPomodoroPreset25)
  surfaces.pomodoroPreset50.addEventListener('click', onPomodoroPreset50)
  surfaces.pomodoroApply.addEventListener('click', onPomodoroApply)
  const restoredPomodoro = pomodoroController.snapshot()
  if (restoredPomodoro.phase === 'break' && restoredPomodoro.running) {
    surfaces.playWebcamBreakPose()
  }
  const jineManagedWindow = surfaces.windows.find(managedWindow => managedWindow.id === 'jine')
  const pomodoroManagedWindow = surfaces.windows.find(managedWindow => managedWindow.id === 'pomodoro')
  let unreadJineNotice: { kind: 'question' | 'complete'; text: UiText } | undefined

  const clearDesktopNotice = (): void => {
    surfaces.desktopNotice.hidden = true
    surfaces.desktopNotice.removeAttribute('data-notice-kind')
    surfaces.desktopNotice.removeAttribute('data-window-target')
    surfaces.jineTaskButton.removeAttribute('data-window-attention')
    surfaces.statusTaskButton.removeAttribute('data-window-attention')
    surfaces.pomodoroTaskLabel.parentElement?.removeAttribute('data-window-attention')
  }
  const clearDesktopNoticeFor = (target: DesktopNoticeTarget): void => {
    if (surfaces.desktopNotice.dataset.windowTarget === target) clearDesktopNotice()
  }
  const paintDesktopNotice = (kind: 'question' | 'complete' | 'fault', text: UiText, target: DesktopNoticeTarget): void => {
    surfaces.desktopNotice.hidden = false
    surfaces.desktopNotice.dataset.noticeKind = kind
    surfaces.desktopNotice.dataset.windowTarget = target
    surfaces.desktopNoticeIcon.src = target === 'jine'
      ? NGO_ICON_JINE.dataUri
      : target === 'pomodoro' ? NGO_ICON_SLEEP.dataUri : NGO_TASKBAR_TASKMANAGER.dataUri
    setText(surfaces.desktopNoticeText, text)
    surfaces.jineTaskButton.toggleAttribute('data-window-attention', target === 'jine')
    surfaces.statusTaskButton.toggleAttribute('data-window-attention', target === 'status')
  }
  showPomodoroNotice = text => paintDesktopNotice('complete', text, 'pomodoro')
  const isJineReadContext = (): boolean => document.hasFocus()
    && jineManagedWindow?.element.dataset.windowState === 'open'
    && jineManagedWindow.element.dataset.windowActive === 'true'
  const markJineNoticeRead = (): void => {
    unreadJineNotice = undefined
    clearDesktopNoticeFor('jine')
  }
  const syncJineNoticeVisibility = (): void => {
    if (unreadJineNotice === undefined) return
    if (isJineReadContext()) {
      markJineNoticeRead()
      return
    }
    paintDesktopNotice(unreadJineNotice.kind, unreadJineNotice.text, 'jine')
  }
  const showDesktopNotice = (kind: 'question' | 'complete' | 'fault', text: UiText, target: 'jine' | 'status'): void => {
    if (target === 'jine') {
      if (isJineReadContext()) {
        markJineNoticeRead()
        return
      }
      unreadJineNotice = { kind: kind === 'question' ? 'question' : 'complete', text }
    }
    paintDesktopNotice(kind, text, target)
  }
  const focusJine = (): void => {
    windowManager.setOpen('jine', true)
    markJineNoticeRead()
    document.querySelector<HTMLElement>(
      "[data-question-key] button[role='radio'], [data-question-key] button[role='checkbox'], [data-question-key] textarea",
    )?.focus()
  }
  let internetJumpTimer: number | undefined
  let internetHighlightTimer: number | undefined
  const searchableJineMessages = (): HTMLElement[] => [...surfaces.jineFeed.querySelectorAll<HTMLElement>(
    '[data-jine-message][data-jine-search-text]',
  )]
  const runInternetSearch = (): void => {
    const query = surfaces.internetSearchInput.value.trim()
    surfaces.internetSearchResults.replaceChildren()
    if (query === '') {
      setText(surfaces.internetSearchStatus, () => t('输入关键词，寻找当前会话中的 JINE 气泡。'))
      return
    }
    const normalizedQuery = query.toLocaleLowerCase()
    const messages = searchableJineMessages()
    const matches = messages
      .map((message, index) => ({ message, index, text: message.dataset.jineSearchText ?? '' }))
      .filter(entry => entry.text.toLocaleLowerCase().includes(normalizedQuery))
    setText(surfaces.internetSearchStatus, () => matches.length === 0
      ? t("没有找到“{0}”", query)
      : t("找到 {0} 条记录", matches.length))
    for (const { message, index, text } of matches) {
      const result = element('button', css.internetSearchResult ?? '')
      result.type = 'button'
      result.dataset.internetSearchResult = String(index)
      result.dataset.internetSearchSpeaker = message.dataset.jineSpeaker ?? ''
      result.dataset.internetSearchText = text
      const speaker = message.dataset.jineSpeaker === 'user' ? t('你') : 'JINE'
      result.append(
        element('strong', css.internetSearchResultSpeaker ?? '', speaker),
        element('span', css.internetSearchResultText ?? '', text),
      )
      surfaces.internetSearchResults.append(result)
    }
  }
  const internetSearchForm = surfaces.internetSearchInput.closest<HTMLFormElement>('[data-internet-search]')!
  const onInternetSearchSubmit = (event: SubmitEvent): void => {
    event.preventDefault()
    runInternetSearch()
  }
  const onInternetSearchResultClick = (event: Event): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const result = target.closest<HTMLButtonElement>('[data-internet-search-result]')
    if (result === null) return
    focusJine()
    const messages = searchableJineMessages()
    const index = Number(result.dataset.internetSearchResult)
    const fallbackText = result.dataset.internetSearchText ?? ''
    const fallbackSpeaker = result.dataset.internetSearchSpeaker ?? ''
    const message = messages[index]
      ?? messages.find(candidate => candidate.dataset.jineSpeaker === fallbackSpeaker
        && candidate.dataset.jineSearchText === fallbackText)
    if (message === undefined) {
      setText(surfaces.internetSearchStatus, () => t('这条记录刚刚发生了变化，请重新搜索。'))
      return
    }
    if (internetJumpTimer !== undefined) window.clearTimeout(internetJumpTimer)
    if (internetHighlightTimer !== undefined) window.clearTimeout(internetHighlightTimer)
    message.dataset.jineSearchHit = ''
    internetJumpTimer = window.setTimeout(() => {
      internetJumpTimer = undefined
      surfaces.jineFeed.scrollTop = Math.max(
        0,
        message.offsetTop - (surfaces.jineFeed.clientHeight - message.offsetHeight) / 2,
      )
    }, 80)
    internetHighlightTimer = window.setTimeout(() => {
      internetHighlightTimer = undefined
      message.removeAttribute('data-jine-search-hit')
    }, 1_600)
  }
  internetSearchForm.addEventListener('submit', onInternetSearchSubmit)
  surfaces.internetSearchResults.addEventListener('click', onInternetSearchResultClick)
  const openTaskTarget = (target: string | undefined): void => {
    if (target === 'jine') focusJine()
    else if (target === 'status') {
      surfaces.selectTaskManagerTab('process')
      windowManager.setOpen('status', true)
    } else if (target === 'pomodoro') windowManager.setOpen('pomodoro', true)
    clearDesktopNotice()
    if (target === 'status') syncJineNoticeVisibility()
  }
  const onDesktopNoticeClick = (): void => openTaskTarget(surfaces.desktopNotice.dataset.windowTarget)
  const onTaskManagerLinkClick = (event: MouseEvent): void => {
    const target = event.target
    if (target instanceof Element && target.closest('[data-task-action="jine"]') !== null) focusJine()
  }
  const onJineTaskLinkClick = (event: MouseEvent): void => {
    const target = event.target
    if (target instanceof Element && target.closest('[data-jine-task-link]') !== null) {
      surfaces.selectTaskManagerTab('process')
      windowManager.setOpen('status', true)
    }
  }
  surfaces.desktopNotice.addEventListener('click', onDesktopNoticeClick)
  surfaces.taskFeed.addEventListener('click', onTaskManagerLinkClick)
  surfaces.jineFeed.addEventListener('click', onJineTaskLinkClick)
  const jineNoticeDismissers = [surfaces.jineTaskButton, ...(jineManagedWindow?.openers ?? [])]
  const dismissJineNotice = (): void => markJineNoticeRead()
  for (const opener of jineNoticeDismissers) opener.addEventListener('click', dismissJineNotice)
  jineManagedWindow?.element.addEventListener('pointerdown', dismissJineNotice)
  const pomodoroNoticeDismissers = [
    surfaces.pomodoroTaskLabel.parentElement as HTMLElement,
    ...(pomodoroManagedWindow?.openers ?? []),
  ]
  const dismissPomodoroNotice = (): void => clearDesktopNoticeFor('pomodoro')
  for (const opener of pomodoroNoticeDismissers) opener.addEventListener('click', dismissPomodoroNotice)
  pomodoroManagedWindow?.element.addEventListener('pointerdown', dismissPomodoroNotice)
  const jineFocusObserver = new MutationObserver(syncJineNoticeVisibility)
  if (jineManagedWindow !== undefined) {
    jineFocusObserver.observe(jineManagedWindow.element, {
      attributes: true,
      attributeFilter: ['data-window-active', 'data-window-state'],
    })
  }
  window.addEventListener('focus', syncJineNoticeVisibility)

  // Skin-manager customization: interface font, audio easter-egg and webcam
  // character/peak pricing. Without skin-manager no apply() arrives, so the
  // original Dinkie font and Ame (糖糖) character remain active and audio stays silent.
  let webcamManualCharacter: WebcamCharacter = 'ame'
  let peakPricingEnabled = false
  let dailyTransitionShowWeekday = true
  let dailyTransitionEmphasis: DailyTransitionEmphasis = 'weekend'
  let dailyTransitionEmphasizedWeekdays: DailyTransitionWeekday[] = []
  let dailyTransitionEmphasisColor = '#ff536f'
  let peakPricingTimer: number | undefined
  const clearPeakPricingTimer = (): void => {
    if (peakPricingTimer !== undefined) {
      window.clearInterval(peakPricingTimer)
      peakPricingTimer = undefined
    }
  }
  const applyWebcamCharacter = (): void => {
    const effective = peakPricingEnabled && isBeijingPeakHour() ? 'cho' : webcamManualCharacter
    surfaces.setWebcamCharacter(effective)
  }
  const disposeSkinCustomization = installSkinCustomization({
    setVolumes(bgm, se) {
      sfx.setBgmVolume(bgm)
      sfx.setSeVolume(se)
      // Desktop BGM follows the game's after-login mainloop_normal loop;
      // 0 keeps the whole easter-egg sound layer silent.
      if (bgm > 0) sfx.startBgm()
      else sfx.stopBgm()
      body.style.setProperty('--ngo-bgm-volume', String(bgm))
      body.style.setProperty('--ngo-sfx-volume', String(se))
    },
    setFont(font) {
      if (font === 'zpix') body.setAttribute(FONT_ATTRIBUTE, 'zpix')
      else body.removeAttribute(FONT_ATTRIBUTE)
    },
    setWebcam(character, enabled) {
      webcamManualCharacter = character
      peakPricingEnabled = enabled
      clearPeakPricingTimer()
      if (enabled) {
        peakPricingTimer = window.setInterval(applyWebcamCharacter, 60_000)
      }
      applyWebcamCharacter()
    },
    setDailyTransition(showWeekday, emphasis, emphasizedWeekdays, emphasisColor) {
      dailyTransitionShowWeekday = showWeekday
      dailyTransitionEmphasis = emphasis
      dailyTransitionEmphasizedWeekdays = emphasizedWeekdays
      dailyTransitionEmphasisColor = emphasisColor
    },
  })
  const disposeDailyTransition = installDailyTransition(sfx, NGO_DAY_PASSING_HEART.dataUri, () => ({
    showWeekday: dailyTransitionShowWeekday,
    emphasis: dailyTransitionEmphasis,
    emphasizedWeekdays: dailyTransitionEmphasizedWeekdays,
    emphasisColor: dailyTransitionEmphasisColor,
  }))

  // ImageViewer preview: clicking a JINE image (or an album thumb) opens the
  // separate game viewer window; the picture slides in with the 1s reveal
  // (ImageViewer.cs Show(): mask height -> 0, Ease.InCubic).
  const imageViewerImage = surfaces.imageViewerImage
  const setImageViewerPhase = (phase: 'hidden' | 'reveal' | 'error'): void => {
    surfaces.imageViewerStage.dataset.phase = phase
  }
  const showImageInViewer = (src: string): void => {
    setText(surfaces.imageViewerError, () => t('图片加载失败'))
    setImageViewerPhase('hidden')
    imageViewerImage.onload = () => {
      // Commit the hidden clip-path before revealing, so a same-frame load
      // (cached/data-URI images) still plays the 1s scan transition.
      void imageViewerImage.offsetWidth
      setImageViewerPhase('reveal')
    }
    imageViewerImage.onerror = () => setImageViewerPhase('error')
    imageViewerImage.src = src
  }
  const openImageViewer = (src: string | null | undefined): void => {
    if (!src) return
    showImageInViewer(src)
    windowManager.setOpen('image-viewer', true)
  }
  const onJineImageClick = (event: Event): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    openImageViewer(target.closest('img[data-jine-image]')?.getAttribute('src'))
  }
  surfaces.jineFeed.addEventListener('click', onJineImageClick)
  const onJineScroll = (): void => triggerHostLoadOlder(surfaces.jineFeed)
  surfaces.jineFeed.addEventListener('scroll', onJineScroll, { passive: true })
  const onPictureGridClick = (event: Event): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const thumb = target.closest('button[data-picture-thumb]')
    openImageViewer(thumb?.querySelector('img')?.getAttribute('src'))
  }
  surfaces.pictureGrid.addEventListener('click', onPictureGridClick)

  // ---- JINE stretch: the official Question/interjection panel mounts inside
  // [data-composer-seat] and grows it past the JINE body (785x705 repro: seat
  // 251px vs body 214px). Reserve the feed against the seat's measured top so
  // attachments and multiline drafts actually push the conversation upward.
  // If the seat reaches the title bar, grow the window upward as a second line
  // of defence: CSS-variable path for the default layout, inline geometry path
  // for dragged/resized/maximized windows (restored once the panel unmounts).
  let attachJineSeat: () => void = () => {}
  let disposeJineStretch: () => void = () => {}
  if (jineWindow !== undefined) {
    const JINE_TITLE_BOTTOM = 34 // .titleBar top 8 + height 26: safe seat ceiling
    const JINE_FEED_BOTTOM = 170
    const JINE_FEED_GAP = 12
    const jineElement = jineWindow.element
    const jineBody = surfaces.jineFeed.parentElement
    let jineStretchBaseline: { top: number; height: number } | null = null
    let previousJineWindowState = jineElement.dataset.windowState ?? 'open'
    let jineOpenAnchorFrame = 0
    let jineOpenAnchorPasses = 0
    const settleJineAtLatest = (): void => {
      jineOpenAnchorFrame = 0
      if (jineElement.dataset.windowState !== 'open') {
        jineOpenAnchorPasses = 0
        surfaces.jineFeed.removeAttribute('data-jine-open-anchor')
        return
      }
      surfaces.jineFeed.scrollTop = surfaces.jineFeed.scrollHeight
      jineOpenAnchorPasses -= 1
      if (jineOpenAnchorPasses > 0) {
        jineOpenAnchorFrame = window.requestAnimationFrame(settleJineAtLatest)
      } else {
        surfaces.jineFeed.removeAttribute('data-jine-open-anchor')
      }
    }
    const anchorJineAtLatestOnOpen = (): void => {
      surfaces.jineFeed.setAttribute('data-jine-open-anchor', '')
      surfaces.jineFeed.scrollTop = surfaces.jineFeed.scrollHeight
      jineOpenAnchorPasses = 2
      if (jineOpenAnchorFrame !== 0) window.cancelAnimationFrame(jineOpenAnchorFrame)
      jineOpenAnchorFrame = window.requestAnimationFrame(settleJineAtLatest)
    }
    const readStretch = (): number => {
      const value = Number.parseFloat(body.style.getPropertyValue('--ngo-jine-stretch'))
      return Number.isFinite(value) ? value : 0
    }
    const syncJineStretch = (): void => {
      const state = jineElement.dataset.windowState ?? 'open'
      const openedNow = state === 'open' && previousJineWindowState !== 'open'
      previousJineWindowState = state
      if (openedNow) anchorJineAtLatestOnOpen()
      body.toggleAttribute('data-ngo-jine-open', state !== 'closed' && state !== 'minimized')
      const seatElement = document.querySelector('[data-composer-seat]')
      const followLatest = surfaces.jineFeed.scrollHeight
        - surfaces.jineFeed.scrollTop
        - surfaces.jineFeed.clientHeight <= 24
      const syncFeedBottom = (): void => {
        let feedBottom = JINE_FEED_BOTTOM
        if (state !== 'closed' && state !== 'minimized' && seatElement !== null && jineBody !== null) {
          const seatRect = getDesktopLayoutRect(seatElement as HTMLElement)
          const bodyRect = getDesktopLayoutRect(jineBody)
          if (seatRect.width > 0 && bodyRect.width > 0) {
            feedBottom = Math.max(JINE_FEED_BOTTOM, bodyRect.bottom - seatRect.top + JINE_FEED_GAP)
          }
        }
        body.style.setProperty('--ngo-jine-feed-bottom', `${Math.ceil(feedBottom)}px`)
        // Force the new viewport height before restoring a bottom-following
        // feed. A reader who deliberately scrolled up keeps their scrollTop.
        void surfaces.jineFeed.clientHeight
        if (followLatest) surfaces.jineFeed.scrollTop = surfaces.jineFeed.scrollHeight
      }
      const restoreInline = (): void => {
        if (jineStretchBaseline !== null) {
          jineElement.style.top = `${jineStretchBaseline.top}px`
          jineElement.style.height = `${jineStretchBaseline.height}px`
          jineStretchBaseline = null
          if (state === 'open') windowManager.setRect('jine')
        }
      }
      if (state === 'closed' || state === 'minimized' || seatElement === null) {
        restoreInline()
        body.style.setProperty('--ngo-jine-stretch', '0px')
        syncFeedBottom()
        return
      }
      const seatRect = getDesktopLayoutRect(seatElement as HTMLElement)
      const jineRect = getDesktopLayoutRect(jineElement)
      if (seatRect.width === 0 || jineRect.width === 0) {
        restoreInline()
        body.style.setProperty('--ngo-jine-stretch', '0px')
        syncFeedBottom()
        return
      }
      // Pointer resize owns the live window rectangle. Stretching the same
      // top/height in a ResizeObserver callback makes the window alternate
      // between the pointer rect and the title-protection rect. Reconcile the
      // final composer overflow after the resize attribute is removed.
      if (jineElement.hasAttribute('data-window-resizing')) {
        syncFeedBottom()
        return
      }
      // Measure from the stretch-free base top (current top + applied stretch):
      // stretch itself moves the window, so measuring the moved top would feed
      // back and oscillate. Keep the title bar clear, never above the viewport.
      const baseTop = jineRect.top + readStretch()
      const stretch = Math.min(Math.max(0, baseTop + JINE_TITLE_BOTTOM - seatRect.top), baseTop)
      if (jineElement.style.height !== '') {
        // Window is on inline geometry (dragged/resized/maximized): grow it
        // directly and re-capture, so followers stay aligned on the next refresh.
        if (stretch > 0) {
          if (jineStretchBaseline === null) {
            jineStretchBaseline = { top: baseTop, height: jineRect.height }
          }
          jineElement.style.top = `${jineStretchBaseline.top - stretch}px`
          jineElement.style.height = `${jineStretchBaseline.height + stretch}px`
          windowManager.setRect('jine')
        } else {
          restoreInline()
        }
      } else {
        body.style.setProperty('--ngo-jine-stretch', `${stretch}px`)
      }
      syncFeedBottom()
    }
    const jineStretchObserver = new ResizeObserver(syncJineStretch)
    jineStretchObserver.observe(jineElement)
    attachJineSeat = (): void => {
      const seatElement = document.querySelector('[data-composer-seat]')
      if (seatElement !== null) jineStretchObserver.observe(seatElement)
      syncJineStretch()
    }
    const jineStateObserver = new MutationObserver(syncJineStretch)
    jineStateObserver.observe(jineElement, {
      attributes: true,
      attributeFilter: ['data-window-state', 'data-window-maximized', 'data-window-resizing'],
    })
    disposeJineStretch = (): void => {
      jineStretchObserver.disconnect()
      jineStateObserver.disconnect()
      if (jineOpenAnchorFrame !== 0) window.cancelAnimationFrame(jineOpenAnchorFrame)
      surfaces.jineFeed.removeAttribute('data-jine-open-anchor')
    }
    attachJineSeat()
  }

  const closeStartMenu = (): void => {
    body.removeAttribute(START_ATTRIBUTE)
    surfaces.startButton.setAttribute('aria-expanded', 'false')
    surfaces.startShutdownButton.removeAttribute('data-shutdown-dodged')
  }
  const toggleStartMenu = (): void => {
    const open = !body.hasAttribute(START_ATTRIBUTE)
    if (open) surfaces.startShutdownButton.removeAttribute('data-shutdown-dodged')
    body.toggleAttribute(START_ATTRIBUTE, open)
    surfaces.startButton.setAttribute('aria-expanded', String(open))
  }

  const toggleSaveManager = (): void => {
    closeStartMenu()
    const open = surfaces.saveWindow.dataset.windowState !== 'open'
    if (open) {
      sfx.play('kari')
      void sessions?.refresh?.().catch((reason: unknown) => {
        console.warn('continue-game session refresh failed:', reason)
      })
    }
    // WindowManager owns the open state. The observer below mirrors its state
    // to body/ARIA without turning the clock entry into a latched visual owner.
    windowManager.setOpen('save', open)
  }
  const openSettings = (): void => {
    closeStartMenu()
    const existing = document.querySelector("[data-slot='sidebar.settings'] [role='dialog']")
    if (existing !== null) {
      body.setAttribute(SETTINGS_ATTRIBUTE, '')
      windowManager.setOpen('settings', true)
      windowManager.refresh('settings')
      return
    }
    const trigger = document.querySelector<HTMLButtonElement>("[data-slot='sidebar.settings'] button[aria-haspopup='dialog']")
    body.toggleAttribute(SETTINGS_ATTRIBUTE, trigger !== null)
    trigger?.click()
  }
  const openNewSession = (): void => {
    closeStartMenu()
    sfx.play('commandExecute')
    const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-slot='sidebar'] button")]
    buttons.find(button => /^(?:新会话|New session)$/i.test(normalizedText(button))
      || /^(?:新建会话|New session)$/i.test(button.getAttribute('aria-label') ?? ''))?.click()
  }
  type SaveStatus = {
    kind: 'ongoing' | 'warning' | 'done' | 'error'
    symbol: string
    label: string
  }
  interface SaveSessionProjection {
    id: string
    title: string
    current: boolean
    status?: SaveStatus
    scheduled?: boolean
    open(): void
  }
  interface SaveWorkspaceProjection {
    key: string
    title: string
    sessions: SaveSessionProjection[]
    loading?: boolean
    create?: () => void
  }
  const sessionTitle = (item: HTMLElement): string => {
    const title = item.querySelector<HTMLElement>(":scope > [class$='_title']")?.textContent?.trim()
      ?? item.querySelector<HTMLElement>("[class$='_title']")?.textContent?.trim()
    if (title !== undefined && title !== '') return title
    return normalizedText(item) || t('未命名会话')
  }
  const sessionStatus = (item: HTMLElement): SaveStatus | undefined => {
    const kind = item.querySelector<HTMLElement>('[data-state]')?.dataset.state
    if (kind !== 'ongoing' && kind !== 'warning' && kind !== 'done' && kind !== 'error') return undefined
    const labels = [...item.querySelectorAll<HTMLElement>("[class$='_visuallyHidden']")]
      .map(label => normalizedText(label))
      .filter(Boolean)
    const fallback = { ongoing: t('进行中'), warning: t('待处理'), done: t('已完成'), error: t('失败') }[kind]
    const symbol = { ongoing: '…', warning: '!', done: '✓', error: '×' }[kind]
    return { kind, symbol, label: labels.join('、') || fallback }
  }
  const sessionHasActiveSchedule = (item: HTMLElement): boolean =>
    item.querySelector(":scope > [role='img'][aria-label][title]") !== null
  const officialWorkspaceGroups = (): SaveWorkspaceProjection[] => {
    const trees = [...document.querySelectorAll<HTMLElement>("[data-slot='sidebar'] [role='tree'], [role='tree']")]
    const tree = trees.find(candidate => candidate.querySelector("[role='treeitem'][aria-expanded]") !== null)
      ?? trees.find(candidate => candidate.querySelector("[role='treeitem'][aria-selected]") !== null)
    if (tree === undefined) return []
    const workspaceRows = [...tree.querySelectorAll<HTMLElement>("[role='treeitem'][aria-expanded]")]
    if (workspaceRows.length === 0) {
      return [{
        key: 'dom:ungrouped',
        title: t('未分组'),
        sessions: [...tree.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")]
          .map((source, index) => {
            const status = sessionStatus(source)
            return {
              id: `dom:ungrouped:${index}`,
              title: sessionTitle(source),
              current: source.matches("[aria-selected='true'], [aria-current='true']"),
              ...(status === undefined ? {} : { status }),
              ...(sessionHasActiveSchedule(source) ? { scheduled: true } : {}),
              open: () => source.click(),
            }
          }),
      }]
    }
    return workspaceRows.map((row, workspaceIndex) => {
      let section: HTMLElement = row
      while (section.parentElement !== null && section.parentElement !== tree) section = section.parentElement
      const title = row.querySelector<HTMLElement>("[class$='_projectText'] [class$='_title']")?.textContent?.trim()
        ?? row.querySelector<HTMLElement>("[class$='_title']")?.textContent?.trim()
        ?? normalizedText(row)
      const create = [...row.querySelectorAll<HTMLButtonElement>('button')]
        .find(button => /新建会话|New session/i.test(button.getAttribute('aria-label') ?? ''))
      return {
        key: `dom:${workspaceIndex}:${title}`,
        title: title || t('未命名工作区'),
        sessions: [...section.querySelectorAll<HTMLElement>("[role='treeitem'][aria-selected]")]
          .map((source, index) => {
            const status = sessionStatus(source)
            return {
              id: `dom:${workspaceIndex}:${index}`,
              title: sessionTitle(source),
              current: source.matches("[aria-selected='true'], [aria-current='true']"),
              ...(status === undefined ? {} : { status }),
              ...(sessionHasActiveSchedule(source) ? { scheduled: true } : {}),
              open: () => source.click(),
            }
          }),
        ...(create === undefined ? {} : { create: () => create.click() }),
      }
    })
  }
  const saveStatusFromSummary = (summary: SessionSummary): SaveStatus | undefined => {
    if (summary.pendingInteraction !== undefined) {
      const label = {
        approval: t('等待批准'),
        'plan-review': t('等待确认计划'),
        question: t('等待回复'),
      }[summary.pendingInteraction]
      return { kind: 'warning', symbol: '!', label }
    }
    if (summary.running) return { kind: 'ongoing', symbol: '…', label: t('进行中') }
    if (summary.completed === true) return { kind: 'done', symbol: '✓', label: t('已完成') }
    return undefined
  }
  const serviceWorkspaceGroups = (): SaveWorkspaceProjection[] | undefined => {
    if (sessions === undefined || workspaces === undefined) return undefined
    const sessionService = sessions
    const workspaceService = workspaces
    const sessionList = sessionService.list.getSnapshot()
    const workspaceList = workspaceService.list.getSnapshot()
    const loading = sessionList.phase === 'pending'
    const archived = new Set(workspaceList.archivedSessionIds ?? [])
    const accounted = new Set<string>()
    const visible = (summary: SessionSummary): boolean => summary.origin !== 'subagent'
      && !archived.has(summary.id)
      && (summary.blank !== true || summary.id === sessionList.current)
    const projectSession = (summary: SessionSummary): SaveSessionProjection => {
      const status = saveStatusFromSummary(summary)
      return {
        id: summary.id,
        title: summary.blank === true ? t('新会话') : (summary.displayTitle || t('未命名会话')),
        current: summary.id === sessionList.current,
        ...(status === undefined ? {} : { status }),
        ...((summary.projectionValues?.schedule?.length ?? 0) > 0 ? { scheduled: true } : {}),
        open: () => {
          sfx.play('commandExecute')
          sessionService.open(summary.id)
        },
      }
    }
    const groups = workspaceList.items.map((workspace): SaveWorkspaceProjection => {
      const members: SaveSessionProjection[] = []
      for (const id of workspace.sessionIds) {
        const summary = sessionList.byId[id]
        if (summary === undefined) continue
        accounted.add(id)
        if (visible(summary)) members.push(projectSession(summary))
      }
      return {
        key: workspace.workspaceId,
        title: workspace.title || t('未命名工作区'),
        sessions: members,
        ...(loading ? { loading: true } : {}),
        create: () => {
          const uiWorkspace = ctx.get('uiWorkspace') as UiWorkspaceBridge | undefined
          if (uiWorkspace !== undefined) uiWorkspace.startSession(workspace.workspaceId)
          else workspaceService.startSession?.(workspace.workspaceId)
        },
      }
    })
    const orderedIds = sessionList.ids ?? Object.keys(sessionList.byId)
    const ungrouped = orderedIds
      .map(id => sessionList.byId[id])
      .filter((summary): summary is SessionSummary => summary !== undefined
        && !accounted.has(summary.id)
        && visible(summary))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      .map(projectSession)
    if (ungrouped.length > 0) groups.push({ key: 'ungrouped', title: t('未分组'), sessions: ungrouped })
    return groups
  }
  const collapsedSaveWorkspaces = new Set<string>()
  let activeSaveWorkspace = 0
  let saveWorkspaceTitles: string[] = []
  let pointerPreviewSaveWorkspace: number | undefined
  let focusPreviewSaveWorkspace: number | undefined
  let saveScrollFrame = 0
  const syncSaveWindowTitle = (): void => {
    const preview = focusPreviewSaveWorkspace ?? pointerPreviewSaveWorkspace ?? activeSaveWorkspace
    const title = saveWorkspaceTitles[preview]
    const label = surfaces.saveWindow.querySelector<HTMLElement>(`.${css.titleText ?? ''}`)
    if (label !== null) setText(label, () => title === undefined ? t('继续游戏') : t("继续游戏 · {0}", title))
  }
  const setActiveSaveWorkspace = (index: number): void => {
    activeSaveWorkspace = Math.max(0, index)
    for (const indicator of surfaces.saveProgressTrack.querySelectorAll<HTMLElement>('[data-save-workspace-indicator]')) {
      const active = Number(indicator.dataset.saveWorkspaceIndicator) === activeSaveWorkspace
      indicator.toggleAttribute('data-save-active', active)
      indicator.setAttribute('aria-current', active ? 'true' : 'false')
      if (active) indicator.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    }
    syncSaveWindowTitle()
  }
  const syncActiveSaveWorkspace = (): void => {
    saveScrollFrame = 0
    const sections = [...surfaces.saveData.querySelectorAll<HTMLElement>('[data-save-workspace]')]
    if (sections.length === 0) return
    const scrollTop = surfaces.saveData.scrollTop
    let closestIndex = 0
    let closestTop = Number.NEGATIVE_INFINITY
    sections.forEach((section, index) => {
      if (section.offsetTop <= scrollTop + 8 && section.offsetTop > closestTop) {
        closestIndex = index
        closestTop = section.offsetTop
      }
    })
    setActiveSaveWorkspace(closestIndex)
  }
  const scheduleSaveWorkspaceSync = (): void => {
    if (saveScrollFrame !== 0) return
    saveScrollFrame = window.requestAnimationFrame(syncActiveSaveWorkspace)
  }
  const updateSaveBottomSpace = (): void => {
    const sections = [...surfaces.saveData.querySelectorAll<HTMLElement>('[data-save-workspace]')]
    const spacer = surfaces.saveData.querySelector<HTMLElement>('[data-save-bottom-space]')
    const last = sections.at(-1)
    if (spacer === null || last === undefined) return
    spacer.style.height = `${Math.max(0, surfaces.saveData.clientHeight - last.offsetHeight)}px`
  }
  const syncSaveProjection = (): void => {
    const groups = serviceWorkspaceGroups() ?? officialWorkspaceGroups()
    const previousScrollTop = surfaces.saveData.scrollTop
    saveWorkspaceTitles = groups.map(workspace => workspace.title)
    pointerPreviewSaveWorkspace = undefined
    focusPreviewSaveWorkspace = undefined
    setAttr(surfaces.saveProgress, 'aria-label', () => t("工作区快速导航：共 {0} 个工作区", groups.length))
    const indicators = groups.map((workspace, groupIndex) => {
      const indicator = element('button', css.saveProgressCell ?? '')
      indicator.type = 'button'
      indicator.dataset.saveWorkspaceIndicator = String(groupIndex)
      setAttr(indicator, 'aria-label', () => t("跳转到工作区：{0}", workspace.title))
      indicator.addEventListener('pointerenter', () => {
        pointerPreviewSaveWorkspace = groupIndex
        syncSaveWindowTitle()
      })
      indicator.addEventListener('pointerleave', () => {
        if (pointerPreviewSaveWorkspace === groupIndex) pointerPreviewSaveWorkspace = undefined
        syncSaveWindowTitle()
      })
      indicator.addEventListener('focus', () => {
        focusPreviewSaveWorkspace = groupIndex
        syncSaveWindowTitle()
      })
      indicator.addEventListener('blur', () => {
        if (focusPreviewSaveWorkspace === groupIndex) focusPreviewSaveWorkspace = undefined
        syncSaveWindowTitle()
      })
      indicator.addEventListener('click', () => {
        const target = surfaces.saveData.querySelector<HTMLElement>(`[data-save-workspace='${groupIndex}']`)
        if (target === null) return
        if (typeof surfaces.saveData.scrollTo === 'function') {
          surfaces.saveData.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
        } else surfaces.saveData.scrollTop = target.offsetTop
        setActiveSaveWorkspace(groupIndex)
      })
      return indicator
    })
    surfaces.saveProgressTrack.replaceChildren(...indicators)
    const sections = groups.map((workspace, groupIndex) => {
      const group = element('section', css.saveGroup ?? '')
      group.dataset.saveWorkspace = String(groupIndex)
      const collapsed = collapsedSaveWorkspaces.has(workspace.key)
      group.toggleAttribute('data-save-collapsed', collapsed)
      const heading = element('h2', css.saveHeading ?? '', workspace.title)
      const count = element(
        'span',
        css.saveWorkspaceCount ?? '',
        () => workspace.loading === true ? t('读取会话中…') : t("{0} 个会话", workspace.sessions.length),
      )
      const action = element('button', css.saveAction ?? '', () => t('新建会话'))
      action.type = 'button'
      action.hidden = workspace.create === undefined
      action.addEventListener('click', () => workspace.create?.())
      const collapse = element('button', css.saveCollapse ?? '', collapsed ? '＋' : '－')
      collapse.type = 'button'
      collapse.setAttribute('aria-expanded', String(!collapsed))
      setAttr(collapse, 'aria-label', () => t("{0}{1}的会话", collapsed ? t('展开') : t('收起'), workspace.title))
      setAttr(collapse, 'title', () => collapsed ? t('展开会话') : t('收起会话'))
      collapse.addEventListener('click', () => {
        if (collapsed) collapsedSaveWorkspaces.delete(workspace.key)
        else collapsedSaveWorkspaces.add(workspace.key)
        syncSaveProjection()
      })
      const rule = element('span', css.saveRule ?? '')
      rule.setAttribute('aria-hidden', 'true')
      const viewport = element('div', css.saveViewport ?? '')
      const list = element('div', css.saveList ?? '')
      list.dataset.saveList = String(groupIndex)
      workspace.sessions.forEach((source, index) => {
        const { title, status, scheduled } = source
        const button = element('button', css.saveFile ?? '')
        button.type = 'button'
        button.dataset.saveFile = `${groupIndex}:${index}`
        button.toggleAttribute('data-save-current', source.current)
        button.toggleAttribute('data-save-scheduled', scheduled === true)
        if (status !== undefined) button.dataset.saveStatus = status.kind
        const annotations = [status?.label, scheduled === true ? t('有活动定时任务') : undefined]
          .filter((value): value is string => value !== undefined)
        button.setAttribute('aria-label', annotations.length === 0 ? title : `${title}：${annotations.join('，')}`)
        button.title = annotations.length === 0 ? title : `${title} · ${annotations.join(' · ')}`
        const iconWrap = element('span', css.saveFileIconWrap ?? '')
        const image = element('img', css.saveFileIcon ?? '')
        image.src = NGO_SAVE_FILE.dataUri
        image.alt = ''
        iconWrap.append(image)
        if (status !== undefined) {
          const badge = element('span', css.saveStatusBadge ?? '', status.symbol)
          badge.dataset.saveStatus = status.kind
          badge.setAttribute('aria-hidden', 'true')
          iconWrap.append(badge)
        }
        const sessionName = element('span', css.saveSessionName ?? '', title)
        button.append(iconWrap, sessionName)
        button.addEventListener('click', source.open)
        list.append(button)
      })
      viewport.append(list)
      group.append(heading, count, action, collapse, rule, viewport)
      return group
    })
    const bottomSpace = element('div', css.saveBottomSpace ?? '')
    bottomSpace.dataset.saveBottomSpace = ''
    bottomSpace.setAttribute('aria-hidden', 'true')
    surfaces.saveData.replaceChildren(...sections, bottomSpace)
    setActiveSaveWorkspace(Math.min(activeSaveWorkspace, Math.max(0, groups.length - 1)))
    requestAnimationFrame(() => {
      updateSaveBottomSpace()
      surfaces.saveData.scrollTop = previousScrollTop
      syncActiveSaveWorkspace()
    })
  }
  const createOfficialWorkspace = (): void => {
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('button')]
    buttons.find(button => /^(?:添加工作区|Add workspace)$/i.test(button.getAttribute('aria-label') ?? '')
      || /^(?:添加工作区|Add workspace)$/i.test(normalizedText(button)))?.click()
  }
  const scrollSaveWorkspaceIndicators = (event: WheelEvent): void => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    const before = surfaces.saveProgressTrack.scrollLeft
    surfaces.saveProgressTrack.scrollLeft += event.deltaY
    if (surfaces.saveProgressTrack.scrollLeft !== before) event.preventDefault()
  }
  surfaces.saveData.addEventListener('scroll', scheduleSaveWorkspaceSync, { passive: true })
  surfaces.saveProgressTrack.addEventListener('wheel', scrollSaveWorkspaceIndicators, { passive: false })
  surfaces.saveWorkspaceCreate.addEventListener('click', createOfficialWorkspace)
  window.addEventListener('resize', updateSaveBottomSpace)
  const restartDesktop = (): void => {
    sfx.play('kari')
    lightModeLock.restart()
  }
  const shutdownDesktop = (): void => {
    sfx.play('kari')
    closeStartMenu()
    lightModeLock.shutdown()
  }
  const dodgeShutdown = (): void => {
    if (body.hasAttribute(START_ATTRIBUTE)) surfaces.startShutdownButton.setAttribute('data-shutdown-dodged', '')
  }
  const closeOfficialSettings = (): void => {
    const dialog = document.querySelector("[data-slot='sidebar.settings'] [role='dialog']")
    const buttons = dialog === null ? [] : [...dialog.querySelectorAll<HTMLButtonElement>('button')]
    buttons.find(button => /关闭|Close/i.test(button.getAttribute('aria-label') ?? '')
      || ['关闭', 'Close', '×', 'X'].includes(normalizedText(button)))?.click()
  }
  type ConnectionSurfacePhase = 'connected' | 'disconnected' | 'connecting' | 'recovered'
  const connectionOwner = (): HTMLElement | null =>
    document.querySelector<HTMLElement>("[data-slot='sidebar.settings']")
  const officialReconnectControl = (): HTMLButtonElement | null =>
    connectionOwner()?.querySelector<HTMLButtonElement>(":scope > div > button[data-phase]") ?? null
  const officialRecoveryStatus = (): HTMLElement | null =>
    connectionOwner()?.querySelector<HTMLElement>(":scope > div > [role='status']") ?? null
  const setConnectionPopoverOpen = (open: boolean): void => {
    surfaces.connectionPopover.hidden = !open
    surfaces.connectionButton.setAttribute('aria-expanded', String(open))
  }
  const syncConnectionSurface = (): void => {
    const reconnect = officialReconnectControl()
    const recovered = officialRecoveryStatus()
    const sourcePhase = reconnect?.dataset.phase
    const phase: ConnectionSurfacePhase = sourcePhase === 'disconnected' || sourcePhase === 'connecting'
      ? sourcePhase
      : recovered === null ? 'connected' : 'recovered'
    const status = phase === 'disconnected'
      ? t('网络连接已断开')
      : phase === 'connecting'
        ? t('正在重新连接…')
        : phase === 'recovered' ? t('网络连接已恢复') : t('网络连接正常')
    surfaces.connectionButton.dataset.connectionPhase = phase
    setAttr(surfaces.connectionButton, 'aria-label', () => t("{0}，查看连接状态", status))
    surfaces.connectionButton.title = status
    setText(surfaces.connectionStatus, status)
    surfaces.connectionAction.hidden = reconnect === null
    surfaces.connectionAction.disabled = reconnect === null
    setText(surfaces.connectionAction, () => phase === 'connecting' ? t('重新开始连接') : t('重新连接'))
    surfaces.connectionAction.setAttribute(
      'aria-label',
      reconnect?.getAttribute('aria-label') ?? surfaces.connectionAction.textContent,
    )
    const degraded = phase === 'disconnected' || phase === 'connecting'
    surfaces.connectionTray.hidden = !degraded
    if (!degraded) setConnectionPopoverOpen(false)
  }
  const toggleConnectionPopover = (): void => {
    syncConnectionSurface()
    setConnectionPopoverOpen(surfaces.connectionPopover.hidden)
  }
  const requestOfficialReconnect = (): void => {
    officialReconnectControl()?.click()
  }
  const onConnectionKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && !surfaces.connectionPopover.hidden) {
      setConnectionPopoverOpen(false)
      surfaces.connectionButton.focus()
    }
  }
  // The game's ControlPanel paints the filled portion of the volume track as
  // a thick pink bar over a thin line. The skin mirrors that by painting the
  // range track with two gradients sized by this custom property.
  const applyRangeFill = (input: HTMLInputElement): void => {
    const min = Number(input.min || 0)
    const max = Number(input.max || 100)
    const value = Number(input.value)
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0
    input.style.setProperty('--ngo-range-fill', `${Math.min(100, Math.max(0, percent))}%`)
  }
  const closeFromOutside = (event: PointerEvent): void => {
    const target = event.target
    if (!(target instanceof Node)) return
    if (!surfaces.startMenu.contains(target) && !surfaces.startButton.contains(target)) closeStartMenu()
    if (!surfaces.connectionPopover.contains(target) && !surfaces.connectionButton.contains(target)) {
      setConnectionPopoverOpen(false)
    }
  }
  surfaces.connectionButton.addEventListener('click', toggleConnectionPopover)
  surfaces.connectionAction.addEventListener('click', requestOfficialReconnect)
  surfaces.clockButton.addEventListener('click', toggleSaveManager)
  surfaces.startButton.addEventListener('click', toggleStartMenu)
  surfaces.startNewButton.addEventListener('click', openNewSession)
  surfaces.startContinueButton.addEventListener('click', toggleSaveManager)
  surfaces.startControlButton.addEventListener('click', openSettings)
  surfaces.startRestartButton.addEventListener('click', restartDesktop)
  surfaces.startShutdownButton.addEventListener('click', shutdownDesktop)
  surfaces.startShutdownButton.addEventListener('pointerover', dodgeShutdown)
  surfaces.settingsWindow.querySelector<HTMLElement>("[data-window-action='close']")
    ?.addEventListener('click', closeOfficialSettings)
  const onDesktopPointerDown = (): void => {
    if (document.querySelector('[data-ngo-light-boot][data-boot-stage="blue-screen"]')) return
    sfx.play('poko')
  }
  const onComposerBlankClick = (event: MouseEvent): void => {
    if (event.button !== 0) return
    const target = event.target
    if (!(target instanceof Element)) return
    const card = target.closest<HTMLElement>('[data-composer-card]')
    if (card === null || target.closest('textarea, input, button, a, select, [role="button"], [contenteditable="true"]') !== null) return
    const input = card.querySelector<HTMLElement>("[data-composer-input]:not([aria-disabled='true'])")
    input?.focus({ preventScroll: true })
  }
  const onSettingsRangeInput = (event: Event): void => {
    const target = event.target
    if (target instanceof HTMLInputElement && target.type === 'range'
      && target.closest("[data-slot='sidebar.settings']") !== null) {
      applyRangeFill(target)
      sfx.play('per')
    }
  }
  const onLiveControlClick = (event: MouseEvent): void => {
    const target = event.target
    if (target instanceof Element && target.closest('[data-live-action="latest"]') !== null) {
      sfx.play('poko')
    }
  }
  const onSaveTreeClick = (event: MouseEvent): void => {
    if (!body.hasAttribute(SAVE_ATTRIBUTE)) return
    const target = event.target
    if (target instanceof Element && target.closest('[role="treeitem"]') !== null) {
      sfx.play('commandExecute')
    }
  }
  const questionTimers = new Set<number>()
  const questionTranscriptLedger = createQuestionTranscriptLedger()
  let questionDetailOption: HTMLElement | null = null
  let questionDetailPortal: HTMLElement | null = null
  let questionDetailReconcileTimer: number | undefined
  let questionKeyboardFocusIntent = false
  const hideQuestionDetail = (): void => {
    if (questionDetailReconcileTimer !== undefined) {
      window.clearTimeout(questionDetailReconcileTimer)
      questionTimers.delete(questionDetailReconcileTimer)
      questionDetailReconcileTimer = undefined
    }
    questionDetailOption?.removeAttribute('data-ngo-question-detail-active')
    questionDetailOption = null
    questionDetailPortal?.remove()
    questionDetailPortal = null
  }
  const showQuestionDetail = (option: HTMLElement): void => {
    if (questionDetailOption === option && questionDetailPortal?.isConnected === true) return
    const detail = option.querySelector<HTMLElement>(':scope > [data-ngo-question-option-detail]')
    if (detail === null) return
    hideQuestionDetail()

    const sourceRect = option.getBoundingClientRect()
    const questionScroll = option.closest('[data-question-key]')?.querySelector('[data-question-scroll]')
    const questionRect = questionScroll?.getBoundingClientRect()
    const viewportMargin = 8
    const bounded = questionRect !== undefined && questionRect.width > 0
    const boundLeft = bounded ? Math.max(viewportMargin, questionRect.left + 4) : viewportMargin
    // Reserve the tail's 7px outside the bubble while keeping it inside JINE.
    const boundRight = bounded
      ? Math.min(window.innerWidth - viewportMargin, questionRect.right - 8)
      : window.innerWidth - viewportMargin
    const availableWidth = Math.max(64, boundRight - boundLeft)
    const portal = detail.cloneNode(true) as HTMLElement
    portal.style.setProperty('--ngo-question-detail-min-width', `${Math.min(sourceRect.width, availableWidth)}px`)
    portal.style.maxWidth = `${availableWidth}px`
    portal.dataset.ngoQuestionOptionPortal = ''
    document.body.append(portal)

    const portalRect = portal.getBoundingClientRect()
    const maxLeft = Math.max(boundLeft, boundRight - portalRect.width)
    const left = Math.min(maxLeft, Math.max(boundLeft, sourceRect.right - portalRect.width))
    const belowTop = sourceRect.top
    const aboveTop = sourceRect.bottom - portalRect.height
    const fitsBelow = belowTop + portalRect.height <= window.innerHeight - viewportMargin
    const fitsAbove = aboveTop >= viewportMargin
    const opensDown = fitsBelow || !fitsAbove
    const preferredTop = opensDown ? belowTop : aboveTop
    const maxTop = Math.max(viewportMargin, window.innerHeight - portalRect.height - viewportMargin)
    const top = Math.min(maxTop, Math.max(viewportMargin, preferredTop))
    portal.style.left = `${left}px`
    portal.style.top = `${top}px`
    portal.dataset.ngoQuestionOptionPortal = opensDown ? 'down' : 'up'
    option.dataset.ngoQuestionDetailActive = ''
    questionDetailOption = option
    questionDetailPortal = portal
  }
  const reconcileQuestionDetail = (includeFocus = true): void => {
    if (questionDetailReconcileTimer !== undefined) {
      window.clearTimeout(questionDetailReconcileTimer)
      questionTimers.delete(questionDetailReconcileTimer)
    }
    questionDetailReconcileTimer = window.setTimeout(() => {
      const timer = questionDetailReconcileTimer
      questionDetailReconcileTimer = undefined
      if (timer !== undefined) questionTimers.delete(timer)
      const focusedOption = includeFocus && document.activeElement instanceof Element
        ? document.activeElement.closest<HTMLElement>(
            '[data-ngo-question-option][data-ngo-question-keyboard-focus]',
          )
        : null
      const option = document.querySelector<HTMLElement>(
        '[data-question-key] [data-ngo-question-option]:hover',
      ) ?? focusedOption
      if (option !== null) showQuestionDetail(option)
      else hideQuestionDetail()
    }, 0)
    questionTimers.add(questionDetailReconcileTimer)
  }
  const onQuestionMouseOver = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>('[data-ngo-question-option]')
    if (option !== null) showQuestionDetail(option)
  }
  const onQuestionPointerDown = (event: PointerEvent): void => {
    questionKeyboardFocusIntent = false
    document.querySelectorAll<HTMLElement>('[data-ngo-question-keyboard-focus]')
      .forEach(option => option.removeAttribute('data-ngo-question-keyboard-focus'))
    const target = event.target
    if (!(target instanceof Element) || target.closest('[data-ngo-question-option]') === null) {
      hideQuestionDetail()
    }
  }
  const onQuestionMouseOut = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>('[data-ngo-question-option]')
    if (option === null) return
    const next = event.relatedTarget
    if (next instanceof Node && option.contains(next)) return
    // A click leaves focus on the selected checkbox. Pointer exit must not use
    // that stale focus as a fallback or the selected bubble becomes a
    // permanently revived hover preview after visiting another option.
    reconcileQuestionDetail(false)
  }
  const onQuestionOptionFocusIn = (event: FocusEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>('[data-ngo-question-option]')
    if (option !== null) {
      option.toggleAttribute('data-ngo-question-keyboard-focus', questionKeyboardFocusIntent)
      if (questionKeyboardFocusIntent || option.matches(':hover')) showQuestionDetail(option)
    }
  }
  const onQuestionOptionFocusOut = (event: FocusEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const option = target.closest<HTMLElement>('[data-ngo-question-option]')
    if (option === null) return
    option.removeAttribute('data-ngo-question-keyboard-focus')
    const next = event.relatedTarget
    if (next instanceof Node && option.contains(next)) return
    reconcileQuestionDetail()
  }
  const onQuestionDetailScroll = (): void => {
    const hoveredOption = document.querySelector(
      '[data-question-key] [data-ngo-question-option]:hover',
    )
    const focusedOption = document.activeElement instanceof Element
      ? document.activeElement.closest('[data-ngo-question-option][data-ngo-question-keyboard-focus]')
      : null
    hideQuestionDetail()
    if (hoveredOption !== null) reconcileQuestionDetail(false)
    else if (focusedOption !== null) reconcileQuestionDetail()
  }
  const openQuestionCustom = (row: HTMLElement): void => {
    row.setAttribute('data-ngo-custom-open', '')
    const input = row.querySelector<HTMLTextAreaElement>('textarea')
    if (input !== null) {
      // The open attribute establishes the final editor width before this
      // forced layout read, so height reflects the rendered line count.
      resizeQuestionCustomInput(input)
      input.focus()
    }
    syncQuestionCustomRow(row, true)
  }
  const onQuestionClick = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    const transcriptRoot = target.closest<HTMLElement>('[data-question-key]')
    const transcriptOption = target.closest<HTMLElement>('button[data-ngo-question-option]')
    if (transcriptOption?.getAttribute('role') === 'radio') {
      questionTranscriptLedger.chooseSingle(transcriptOption)
    }
    if (transcriptRoot !== null) {
      const clickedButton = target.closest<HTMLButtonElement>('button')
      const confirm = questionConfirmButton(transcriptRoot)
      if (clickedButton === confirm) questionTranscriptLedger.requestSubmit(transcriptRoot)
      else if (clickedButton !== null && clickedButton.closest('footer') !== null
        && /跳过|skip/i.test(normalizedText(clickedButton))) {
        questionTranscriptLedger.skip(transcriptRoot)
      } else {
        questionTranscriptLedger.capture(transcriptRoot)
      }
      const transcriptTimer = window.setTimeout(() => {
        questionTimers.delete(transcriptTimer)
        questionTranscriptLedger.sync()
        scheduleProjection()
      }, 0)
      questionTimers.add(transcriptTimer)
    }
    const customRow = target.closest<HTMLElement>('[data-ngo-question-custom]')
    if (customRow !== null) openQuestionCustom(customRow)

    const option = target.closest<HTMLButtonElement>("button[data-ngo-question-option][role='radio']")
    const questionRoot = option?.closest<HTMLElement>('[data-question-key]')
    const section = questionRoot?.querySelector<HTMLElement>(':scope > section')
    if (option === null || questionRoot == null || section == null) return
    const questionId = section.getAttribute('aria-labelledby')
    const timer = window.setTimeout(() => {
      questionTimers.delete(timer)
      // A non-final single choice advances to the next question. Only a choice
      // that remains selected on the same page should submit immediately.
      if (!option.isConnected || section.getAttribute('aria-labelledby') !== questionId
        || option.getAttribute('aria-checked') !== 'true') return
      const confirm = questionConfirmButton(questionRoot)
      if (confirm !== null && !confirm.disabled) confirm.click()
    }, 0)
    questionTimers.add(timer)
  }
  const onQuestionInput = (event: Event): void => {
    const target = event.target
    if (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement)) return
    if (target instanceof HTMLTextAreaElement) {
      if (target.hasAttribute('data-ngo-question-custom-editor')) syncNativeQuestionInput(target)
      resizeQuestionCustomInput(target)
    }
    const root = target.closest<HTMLElement>('[data-question-key]')
    if (root !== null) {
      questionTranscriptLedger.capture(root)
      scheduleProjection()
    }
    if (target instanceof HTMLTextAreaElement) {
      const row = target.closest<HTMLElement>('[data-ngo-question-custom]')
      if (row !== null) syncQuestionCustomRow(row, true)
    }
  }
  const onQuestionKeyDown = (event: KeyboardEvent): void => {
    questionKeyboardFocusIntent = true
    const target = event.target
    if (!(target instanceof HTMLTextAreaElement) && !(target instanceof HTMLInputElement)) return
    if (event.key !== 'Enter' || event.isComposing) return
    const root = target.closest<HTMLElement>('[data-question-key]')
    // ASK editors remain native controls in alpha1. Only inputs inside the
    // question root own this override; the Lexical message composer does not.
    if (root === null) return
    if (target instanceof HTMLTextAreaElement && !event.ctrlKey && !event.metaKey) {
      // A textarea owns plain Enter as a newline; the explicit JINE confirm
      // button submits. Stop the host's legacy Enter-to-continue handler.
      event.stopPropagation()
      return
    }
    if (event.shiftKey) return
    questionTranscriptLedger.requestSubmit(root)
  }
  const onQuestionFocusIn = (event: FocusEvent): void => {
    const target = event.target
    if (!(target instanceof HTMLTextAreaElement)) return
    const row = target.closest<HTMLElement>('[data-ngo-question-custom]')
    if (row !== null) openQuestionCustom(row)
  }
  const onQuestionFocusOut = (event: FocusEvent): void => {
    const target = event.target
    if (!(target instanceof HTMLTextAreaElement)) return
    const row = target.closest<HTMLElement>('[data-ngo-question-custom]')
    if (row === null) return
    const timer = window.setTimeout(() => {
      questionTimers.delete(timer)
      if (!row.contains(document.activeElement) && target.value.trim() === '') {
        row.removeAttribute('data-ngo-custom-open')
      }
      syncQuestionCustomRow(row)
    }, 0)
    questionTimers.add(timer)
  }
  document.addEventListener('pointerdown', closeFromOutside)
  document.addEventListener('keydown', onConnectionKeyDown)
  document.addEventListener('pointerdown', onDesktopPointerDown)
  document.addEventListener('click', onComposerBlankClick)
  document.addEventListener('input', onSettingsRangeInput, true)
  document.addEventListener('click', onLiveControlClick, true)
  document.addEventListener('click', onSaveTreeClick, true)
  document.addEventListener('click', onQuestionClick)
  document.addEventListener('input', onQuestionInput, true)
  document.addEventListener('keydown', onQuestionKeyDown, true)
  document.addEventListener('focusin', onQuestionFocusIn)
  document.addEventListener('focusout', onQuestionFocusOut)
  document.addEventListener('mouseover', onQuestionMouseOver)
  document.addEventListener('mouseout', onQuestionMouseOut)
  document.addEventListener('pointerdown', onQuestionPointerDown)
  document.addEventListener('focusin', onQuestionOptionFocusIn)
  document.addEventListener('focusout', onQuestionOptionFocusOut)
  document.addEventListener('scroll', onQuestionDetailScroll, true)

  let pending: number | undefined
  let revealTaskManagerForConversation = false
  let queueFallbackTimer: number | undefined
  let projectionSoundStorage: Storage | undefined
  try { projectionSoundStorage = window.sessionStorage } catch {}
  const rememberProjectionSoundEvent = createProjectionSoundLedger(projectionSoundStorage)
  let lastConversationNotice: ConversationNoticeSnapshot | undefined
  let lastCompletedSessions = new Map<string, string>()
  let lastPoketterPostCount = -1
  let lastQuestionKey = ''
  const syncProjectionSounds = (): void => {
    const turns = collectConversationTurns()
    const conversation = conversationNoticeSnapshot(turns)
    const previousConversation = lastConversationNotice
    const initialized = previousConversation !== undefined
    const sessionChanged = previousConversation !== undefined
      && previousConversation.sessionKey !== conversation.sessionKey
    const conversationEventIsNew = conversation.complete && conversation.finalText !== ''
      ? rememberProjectionSoundEvent(
          'conversation-complete',
          `${conversation.sessionKey}\u0000${conversation.finalText}`,
        )
      : false
    if (sessionChanged) {
      // Opening another DSH session is itself a read action. Baseline its
      // already-rendered history instead of treating a larger transcript as a
      // burst of new JINE messages.
      markJineNoticeRead()
      lastQuestionKey = document.querySelector('[data-question-key]')?.getAttribute('data-question-key') ?? ''
    } else if (lastConversationNotice !== undefined
      && conversation.complete
      && conversation.finalText !== ''
      && conversationEventIsNew
      && (!lastConversationNotice.complete || lastConversationNotice.finalText !== conversation.finalText)) {
      sfx.play('jineReceive')
      showDesktopNotice('complete', conversation.finalText, 'jine')
    }
    lastConversationNotice = conversation

    const completedSessions = completedSessionNotices()
    let newlyCompleted: readonly [string, string] | undefined
    for (const entry of completedSessions) {
      if (lastCompletedSessions.has(entry[0])) continue
      const eventIsNew = rememberProjectionSoundEvent('session-complete', entry[0])
      if (initialized && eventIsNew && newlyCompleted === undefined) newlyCompleted = entry
    }
    if (newlyCompleted !== undefined) {
      sfx.play('jineReceive')
      showDesktopNotice('complete', () => t("{0} 已完成", newlyCompleted[1]), 'jine')
    }
    lastCompletedSessions = completedSessions

    const questionKey = document.querySelector('[data-question-key]')?.getAttribute('data-question-key') ?? ''
    const questionEventIsNew = questionKey !== ''
      ? rememberProjectionSoundEvent('question', `${conversation.sessionKey}\u0000${questionKey}`)
      : false
    if (!sessionChanged && questionKey !== '' && questionKey !== lastQuestionKey && questionEventIsNew) {
      sfx.play('jineReceive')
      showDesktopNotice('question', () => t('糖糖正在等你回复，点击打开 JINE。'), 'jine')
    } else if (questionKey === '' && lastQuestionKey !== '') {
      if (unreadJineNotice?.kind === 'question') unreadJineNotice = undefined
      if (surfaces.desktopNotice.dataset.noticeKind === 'question') clearDesktopNotice()
    }
    lastQuestionKey = questionKey

    const postCount = surfaces.tweetFeed.querySelectorAll('[data-poketter-post]').length
    const postEventIsNew = postCount > 0
      ? rememberProjectionSoundEvent('poketter-post-count', `${conversation.sessionKey}\u0000${postCount}`)
      : false
    if (lastPoketterPostCount === -1 && postCount > 0 && postEventIsNew) sfx.play('tweetLoad')
    else if (lastPoketterPostCount >= 0 && postCount > lastPoketterPostCount && postEventIsNew) {
      sfx.play('tweetChangeTop')
    }
    lastPoketterPostCount = postCount
  }
  const syncQueueDockFallback = (): void => {
    const queueProjected = body.hasAttribute('data-ngo-jine-has-queue')
    const queueDockPresent = document.querySelector('[data-queue-dock]') !== null
    const jineOpen = body.hasAttribute('data-ngo-jine-open')
    if (queueProjected || !queueDockPresent || !jineOpen) {
      if (queueFallbackTimer !== undefined) window.clearTimeout(queueFallbackTimer)
      queueFallbackTimer = undefined
      body.removeAttribute('data-ngo-jine-queue-fallback')
      return
    }
    if (queueFallbackTimer !== undefined || body.hasAttribute('data-ngo-jine-queue-fallback')) return
    queueFallbackTimer = window.setTimeout(() => {
      queueFallbackTimer = undefined
      const shouldReveal = body.hasAttribute('data-ngo-jine-open')
        && !body.hasAttribute('data-ngo-jine-has-queue')
        && document.querySelector('[data-queue-dock]') !== null
      body.toggleAttribute('data-ngo-jine-queue-fallback', shouldReveal)
    }, QUEUE_FALLBACK_DELAY_MS)
  }
  const queueJineStateObserver = new MutationObserver(syncQueueDockFallback)
  if (jineManagedWindow !== undefined) {
    queueJineStateObserver.observe(jineManagedWindow.element, {
      attributes: true,
      attributeFilter: ['data-window-state'],
    })
  }
  const scheduleProjection = (): void => {
    if (pending !== undefined) return
    pending = window.setTimeout(() => {
      pending = undefined
      applyProjection(surfaces, questionTranscriptLedger.records(), projectSubagentView(sessions))
      if (revealTaskManagerForConversation) {
        revealTaskManagerForConversation = false
        surfaces.selectTaskManagerTab('process')
        windowManager.setOpen('status', true)
      }
      syncQueueDockFallback()
      syncProjectionSounds()
      // A finished older-page prepend left the feed at the same flush-to-top
      // position; keep the paging chain going while the user stays pinned.
      triggerHostLoadOlder(surfaces.jineFeed)
    }, PROJECTION_DELAY_MS)
  }
  let jinePointerId: number | undefined
  let jineActivationKey: string | undefined
  const syncJineInteractionLock = (): void => {
    const active = jinePointerId !== undefined || jineActivationKey !== undefined
    surfaces.jineFeed.toggleAttribute('data-jine-interaction-active', active)
    if (!active) scheduleProjection()
  }
  const holdJineProjectionForPointer = (event: PointerEvent): void => {
    if (event.button !== 0 || jinePointerId !== undefined) return
    jinePointerId = event.pointerId
    syncJineInteractionLock()
  }
  const releaseJineProjectionForPointer = (event: PointerEvent): void => {
    if (event.pointerId !== jinePointerId) return
    jinePointerId = undefined
    syncJineInteractionLock()
  }
  const holdJineProjectionForKeyboard = (event: KeyboardEvent): void => {
    if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) return
    const target = event.target
    if (!(target instanceof Element) || target.closest('button, [role="button"]') === null) return
    jineActivationKey = event.key
    syncJineInteractionLock()
  }
  const releaseJineProjectionForKeyboard = (event: KeyboardEvent): void => {
    if (event.key !== jineActivationKey) return
    jineActivationKey = undefined
    syncJineInteractionLock()
  }
  const releaseJineProjectionLocks = (): void => {
    if (jinePointerId === undefined && jineActivationKey === undefined) return
    jinePointerId = undefined
    jineActivationKey = undefined
    syncJineInteractionLock()
  }
  surfaces.jineFeed.addEventListener('pointerdown', holdJineProjectionForPointer)
  surfaces.jineFeed.addEventListener('keydown', holdJineProjectionForKeyboard)
  window.addEventListener('pointerup', releaseJineProjectionForPointer, true)
  window.addEventListener('pointercancel', releaseJineProjectionForPointer, true)
  window.addEventListener('keyup', releaseJineProjectionForKeyboard, true)
  window.addEventListener('blur', releaseJineProjectionLocks)
  let observedSubagentParent: string | undefined
  let projectedSubagentIdentity: string | undefined
  const syncObservedSubagentCatalog = (): void => {
    if (sessions === undefined) {
      surfaces.jineSessionToggle.disabled = true
      setAttr(surfaces.jineSessionToggle, 'title', () => t('当前 DSH 未提供会话选择服务'))
      renderJineSessionMenu(surfaces.jineSessionMenu, projectSubagentView())
      return
    }
    const model = projectSubagentView(sessions)
    if (model.parentSessionId !== observedSubagentParent) {
      if (observedSubagentParent !== undefined) {
        sessions.setSubagentCatalogOpen(observedSubagentParent, false)
      }
      observedSubagentParent = model.parentSessionId
      if (observedSubagentParent !== undefined) {
        sessions.setSubagentCatalogOpen(observedSubagentParent, true)
        void sessions.refreshSubagents(observedSubagentParent)
      }
    }
    renderJineSessionMenu(surfaces.jineSessionMenu, model)
    surfaces.jineSessionToggle.disabled = model.catalogState === 'unavailable'
    surfaces.jineSessionToggle.hidden = model.contacts.length === 0 && model.selected === undefined
    setText(surfaces.jineSessionToggle, () => model.selected === undefined ? t('主') : t('子'))
    surfaces.jineSessionToggle.dataset.jineSessionKind = model.selected === undefined ? 'root' : 'child'
    setAttr(surfaces.jineSessionToggle, 'title', () => model.selected === undefined
      ? t('选择 JINE 会话')
      : t("当前：{0}", model.selected.label))
    surfaces.jineSessionToggle.toggleAttribute(
      'data-subagent-attention',
      surfaces.jineSessionMenu.hidden && model.contacts.some(contact => contact.running),
    )
    const projectionIdentity = model.selected === undefined
      ? `root:${model.rootSessionId ?? ''}`
      : `child:${model.selected.sessionId}:${model.selected.displayName}:${model.selected.handle}`
    if (projectedSubagentIdentity === undefined) {
      projectedSubagentIdentity = projectionIdentity
    } else if (projectionIdentity !== projectedSubagentIdentity) {
      projectedSubagentIdentity = projectionIdentity
      scheduleProjection()
    }
  }
  const syncSessionServices = (): void => {
    syncObservedSubagentCatalog()
    syncSaveProjection()
  }
  ctx.inject(['sessions', 'workspaces'], (serviceCtx: Context) => {
    const boundSessions = serviceCtx.get('sessions') as SessionsBridge
    const boundWorkspaces = serviceCtx.get('workspaces') as WorkspacesBridge
    sessions = boundSessions
    workspaces = boundWorkspaces
    const disposeSessionList = boundSessions.list.subscribe(syncSessionServices)
    const disposeWorkspaceList = boundWorkspaces.list.subscribe(syncSaveProjection)
    syncSessionServices()
    return () => {
      disposeSessionList()
      disposeWorkspaceList()
      if (sessions === boundSessions && observedSubagentParent !== undefined) {
        boundSessions.setSubagentCatalogOpen(observedSubagentParent, false)
        observedSubagentParent = undefined
        projectedSubagentIdentity = undefined
      }
      if (sessions === boundSessions) sessions = undefined
      if (workspaces === boundWorkspaces) workspaces = undefined
      syncSessionServices()
    }
  })
  syncSessionServices()
  const findSubagentContact = (target: EventTarget | null): HTMLButtonElement | null => target instanceof Element
    ? target.closest<HTMLButtonElement>('[data-subagent-root], [data-subagent-child]')
    : null
  const activateSubagentContact = (target: HTMLButtonElement): void => {
    if (sessions === undefined) return
    const rootSessionId = target.dataset.subagentRoot
    if (rootSessionId !== undefined) {
      if (rootSessionId !== '') sessions.open(rootSessionId)
      closeJineSessionMenu()
      return
    }
    const parentSessionId = target.dataset.subagentParent
    if (parentSessionId === undefined || parentSessionId === '') return
    const childSessionId = target.dataset.subagentChild
    const mode = target.dataset.subagentMode
    if (childSessionId !== undefined && (mode === 'one-shot' || mode === 'continuable')) {
      sessions.openSubagent({ parentSessionId, childSessionId, mode })
    }
    closeJineSessionMenu()
  }
  const onSubagentContactPointerDown = (event: PointerEvent): void => {
    if (event.button !== 0) return
    const target = findSubagentContact(event.target)
    if (target !== null) activateSubagentContact(target)
  }
  const onSubagentContactClick = (event: MouseEvent): void => {
    // Pointer activation already happened before an async catalog response can
    // replace the menu row. A detail=0 click is keyboard activation.
    if (event.detail !== 0) return
    const target = findSubagentContact(event.target)
    if (target !== null) activateSubagentContact(target)
  }
  const closeJineSessionMenu = (): void => {
    surfaces.jineSessionMenu.hidden = true
    surfaces.jineSessionToggle.setAttribute('aria-expanded', 'false')
  }
  const toggleJineSessionMenu = (event: MouseEvent): void => {
    event.stopPropagation()
    const open = surfaces.jineSessionMenu.hidden
    surfaces.jineSessionMenu.hidden = !open
    surfaces.jineSessionToggle.setAttribute('aria-expanded', String(open))
    if (open) {
      surfaces.jineSessionToggle.removeAttribute('data-subagent-attention')
    }
  }
  const closeJineSessionMenuFromOutside = (event: PointerEvent): void => {
    const target = event.target
    if (!(target instanceof Node) || surfaces.jineSessionMenu.contains(target)
      || surfaces.jineSessionToggle.contains(target)) return
    closeJineSessionMenu()
  }
  surfaces.jineSessionMenu.addEventListener('pointerdown', onSubagentContactPointerDown)
  surfaces.jineSessionMenu.addEventListener('click', onSubagentContactClick)
  surfaces.jineSessionToggle.addEventListener('click', toggleJineSessionMenu)
  document.addEventListener('pointerdown', closeJineSessionMenuFromOutside)
  let settingsDialogPresent = false
  const syncSettingsWindow = (): void => {
    const present = document.querySelector("[data-slot='sidebar.settings'] [role='dialog']") !== null
    body.toggleAttribute(SETTINGS_ATTRIBUTE, present)
    if (present !== settingsDialogPresent) windowManager.setOpen('settings', present)
    settingsDialogPresent = present
    windowManager.refresh('settings')
    document.querySelectorAll<HTMLInputElement>("[data-slot='sidebar.settings'] input[type='range']")
      .forEach(applyRangeFill)
    lightModeLock.syncSettings()
  }
  let todoSourcePresent: boolean | undefined
  let goalSourcePresent: boolean | undefined
  const syncTodoWindow = (): void => {
    const projection = projectTodo(surfaces.todoList)
    const present = projection.todo || projection.goal
    if (todoSourcePresent === undefined) {
      todoSourcePresent = present
      goalSourcePresent = projection.goal
      return
    }
    if ((projection.goal && goalSourcePresent === false) || present !== todoSourcePresent) {
      windowManager.setOpen('todo', present)
    }
    todoSourcePresent = present
    goalSourcePresent = projection.goal
  }
  const metricRow = (metric: 'tokens' | 'cache' | 'context' | 'access'): HTMLElement | null =>
    surfaces.scene.querySelector<HTMLElement>(`[data-ngo-task-metric='${metric}']`)
  const updateMetric = (
    metric: 'tokens' | 'cache' | 'context' | 'access',
    value: string,
    percent: number,
  ): void => {
    const row = metricRow(metric)
    if (row === null) return
    const valueNode = row.querySelector<HTMLElement>('[data-ngo-task-metric-value]')
    const meter = row.querySelector<HTMLElement>('[data-ngo-task-metric-meter]')
    if (valueNode?.textContent !== value) setText(valueNode!, value)
    const bounded = Math.max(0, Math.min(100, Math.round(percent)))
    meter?.style.setProperty('--ngo-status-meter', String(bounded))
    meter?.setAttribute('aria-valuenow', String(bounded))
    meter?.setAttribute('aria-valuetext', value)
  }
  let officialTokenTotal = 0
  let estimatedTokenTotal = 0
  let estimatedTokenRate = 0
  let tokenEstimateActive = false
  const renderTokenTotal = (estimated: boolean): void => {
    const valueNode = metricRow('tokens')?.querySelector<HTMLElement>('[data-ngo-task-metric-value]')
    valueNode?.toggleAttribute('data-ngo-token-live', estimated)
    updateMetric('tokens', formatTokenCount(estimated ? estimatedTokenTotal : officialTokenTotal), 0)
  }
  const syncTaskManagerStats = (): void => {
    const officialRoot = document.querySelector<HTMLElement>("[id='root']")
    if (officialRoot === null) return

    // StatsLine has no public DOM slot, so select the smallest official node
    // carrying both token labels. This excludes the skin root and remains
    // stable across CSS-module hash changes and localized layouts.
    // Reuse one text snapshot for TOKEN, throughput and cache parsing so a
    // streaming MutationObserver pass never traverses the official DOM three
    // separate times.
    const officialText = [...officialRoot.querySelectorAll<HTMLElement>('div, span')]
      .map(node => normalizedText(node))
    const statsText = officialText
      .filter(text => /(?:输入|Input)\s*[\d,.]+\s*[KMB]?\s*tok/i.test(text)
        && /(?:输出|Output)\s*[\d,.]+\s*[KMB]?\s*tok/i.test(text))
      .sort((left, right) => left.length - right.length)[0] ?? ''
    const tokenMatch = statsText.match(
      /(?:输入|Input)\s*([\d,.]+)\s*([KMB]?)\s*tok(?:en)?s?\s*[·•]\s*(?:输出|Output)\s*([\d,.]+)\s*([KMB]?)\s*tok/i,
    )
    const inputTokens = tokenMatch === null ? 0 : parseCompactTokens(tokenMatch[1] ?? '0', tokenMatch[2] ?? '')
    const outputTokens = tokenMatch === null ? 0 : parseCompactTokens(tokenMatch[3] ?? '0', tokenMatch[4] ?? '')
    const totalTokens = inputTokens + outputTokens
    if (totalTokens !== officialTokenTotal) {
      officialTokenTotal = totalTokens
      estimatedTokenTotal = totalTokens
    }
    const throughputText = officialText
      .filter(text => /[\d,.]+\s*tok\/s/i.test(text))
      .sort((left, right) => left.length - right.length)[0] ?? ''
    const throughput = Number(throughputText.match(/([\d,.]+)\s*tok\/s/i)?.[1]?.replaceAll(',', '') ?? 0)
    estimatedTokenRate = Number.isFinite(throughput) ? Math.max(0, Math.min(2_000, throughput)) : 0
    renderTokenTotal(tokenEstimateActive)

    const cacheText = officialText
      .filter(text => /(?:缓存命中|Cache hit)\s*[\d.]+%/i.test(text))
      .sort((left, right) => left.length - right.length)[0] ?? ''
    const cacheMatch = cacheText.match(/(?:缓存命中|Cache hit)\s*([\d.]+)%/i)
    const cachePercent = cacheMatch === null ? null : Number(cacheMatch[1])
    const cacheValue = cachePercent === null || !Number.isFinite(cachePercent) ? '--' : `${cachePercent}%`
    updateMetric(
      'cache',
      cacheValue,
      cachePercent ?? 0,
    )

    const contextButton = [...officialRoot.querySelectorAll<HTMLButtonElement>('button[aria-label]')]
      .find(button => /(?:上下文.*\d+%|\d+%.*context used)/i.test(button.getAttribute('aria-label') ?? ''))
    const contextLabel = contextButton?.getAttribute('aria-label') ?? ''
    const contextPercent = Number(contextLabel.match(/(\d+)%/)?.[1] ?? 0)
    updateMetric(
      'context',
      `${contextPercent} / 100`,
      contextPercent,
    )

    const accessButton = [...officialRoot.querySelectorAll<HTMLButtonElement>('button[aria-label]')]
      .find(button => /^(?:访问模式|Access mode)/i.test(button.getAttribute('aria-label') ?? ''))
    const accessLabel = `${accessButton?.getAttribute('aria-label') ?? ''} ${accessButton === undefined ? '' : normalizedText(accessButton)}`
    const access = /full access/i.test(accessLabel)
      ? { value: 'FULL', percent: 100, detail: t('完全访问') }
      : /workspace write/i.test(accessLabel)
        ? { value: 'WRITE', percent: 60, detail: t('工作区写入') }
        : /read only/i.test(accessLabel)
          ? { value: 'READ', percent: 25, detail: t('只读') }
          : { value: '--', percent: 0, detail: t('尚未识别') }
    updateMetric(
      'access',
      access.value,
      access.percent,
    )
  }
  let tokenEstimateTimer: number | undefined
  const tickTokenEstimate = (): void => {
    const tokenRow = metricRow('tokens')
    const statsPanel = tokenRow?.closest<HTMLElement>('[role="tabpanel"]')
    const statusWindow = tokenRow?.closest<HTMLElement>('[data-window-id="status"]')
    const visible = document.visibilityState === 'visible'
      && statusWindow?.dataset.windowState === 'open'
      && statsPanel?.hidden !== true
    const running = surfaces.taskFeed.querySelector('[data-task-state="running"]') !== null
    const shouldEstimate = visible && running && estimatedTokenRate > 0
    if (shouldEstimate) {
      if (!tokenEstimateActive) estimatedTokenTotal = officialTokenTotal
      tokenEstimateActive = true
      estimatedTokenTotal += Math.max(1, Math.round(estimatedTokenRate))
    } else {
      tokenEstimateActive = false
      estimatedTokenTotal = officialTokenTotal
    }
    renderTokenTotal(tokenEstimateActive)
    tokenEstimateTimer = window.setTimeout(tickTokenEstimate, 1_000)
  }
  tokenEstimateTimer = window.setTimeout(tickTokenEstimate, 1_000)
  // The official composer is remounted by React on every hero<->active phase
  // switch (and after 从头开始), which drops the follower's inline transform
  // and leaves the composer back at its CSS position while the JINE window
  // stays where the user dragged it. Re-apply the follower offset whenever the
  // [data-composer-seat] element itself is added/removed.
  const mutationReplacesComposer = (mutation: MutationRecord): boolean => {
    if (mutation.type !== 'childList') return false
    return [...mutation.addedNodes, ...mutation.removedNodes].some(node => node instanceof Element
      && (node.matches('[data-composer-seat], [data-composer-input]')
        || node.querySelector('[data-composer-seat], [data-composer-input]') !== null))
  }
  const mutationIsLexicalEditNoise = (mutation: MutationRecord): boolean => {
    if (mutation.type !== 'childList') return false
    const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
    return target?.closest('[data-composer-input]') !== null
  }
  const refreshOnResize = (): void => {
    hideQuestionDetail()
    document.querySelectorAll<HTMLTextAreaElement>('[data-ngo-question-custom-input]')
      .forEach(resizeQuestionCustomInput)
    windowManager.refresh()
  }
  const mutationTouchesConnection = (mutation: MutationRecord): boolean => {
    const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
    if (target !== null && target.closest("[data-slot='sidebar.settings']") !== null) return true
    if (mutation.type !== 'childList') return false
    return [...mutation.addedNodes, ...mutation.removedNodes].some(node => node instanceof Element
      && (node.matches("[data-slot='sidebar.settings']")
        || node.querySelector("[data-slot='sidebar.settings']") !== null))
  }
  window.addEventListener('resize', refreshOnResize)
  const observer = new MutationObserver((mutations) => {
    const relevantMutations = mutations.filter(mutation => !mutationIsLexicalEditNoise(mutation))
    if (relevantMutations.length === 0) return
    const previousQuestionDetailOption = questionDetailOption
    const questionDetailSourceReplaced = previousQuestionDetailOption !== null
      && !previousQuestionDetailOption.isConnected
    if (questionDetailSourceReplaced) hideQuestionDetail()
    decorateScheduleCatalog()
    const questionSelectionChanged = relevantMutations.some(mutation => mutation.type === 'attributes'
      && mutation.attributeName === 'aria-checked'
      && mutation.target instanceof Element
      && mutation.target.matches('[data-ngo-question-option]'))
    const questionOptionReplaced = relevantMutations.some(mutation => mutation.type === 'childList'
      && [...mutation.addedNodes, ...mutation.removedNodes].some(node => node instanceof Element
        && (node.matches("button[role='radio'], button[role='checkbox']")
          || node.querySelector("button[role='radio'], button[role='checkbox']") !== null)))
    decorateQuestionComposers()
    if (questionSelectionChanged || questionDetailSourceReplaced || questionOptionReplaced) {
      const focusedOption = document.activeElement instanceof Element
        ? document.activeElement.closest<HTMLElement>('[data-ngo-question-option]')
        : null
      // React may replace the option button while committing aria-checked and
      // its checkmark. The pointer is already over the replacement, so no new
      // mouseover fires; reacquire it instead of leaving the clipped inline
      // detail visible until the user moves away and back.
      const option = (previousQuestionDetailOption?.isConnected === true
        ? previousQuestionDetailOption
        : null)
        ?? document.querySelector<HTMLElement>('[data-question-key] [data-ngo-question-option]:hover')
        ?? (questionDetailSourceReplaced || focusedOption?.hasAttribute('data-ngo-question-keyboard-focus') === true
          ? focusedOption
          : null)
      if (option !== null) {
        hideQuestionDetail()
        showQuestionDetail(option)
      }
    }
    questionTranscriptLedger.sync()
    syncSettingsWindow()
    if (relevantMutations.some(mutationTouchesConnection)) syncConnectionSurface()
    syncTaskManagerStats()
    if (relevantMutations.some((mutation) => {
      const target = mutation.target instanceof Element ? mutation.target : mutation.target.parentElement
      return target?.closest("[role='tree']") !== null
        && !surfaces.scene.contains(target)
        && (mutation.type === 'childList'
          || mutation.type === 'characterData'
          || (mutation.type === 'attributes'
            && ['aria-expanded', 'aria-selected', 'aria-current', 'aria-label', 'data-state']
              .includes(mutation.attributeName ?? '')))
    })) {
      syncSaveProjection()
    }
    if (relevantMutations.some(mutationTouchesTodo)) syncTodoWindow()
    if (relevantMutations.some(mutationAddsConversationUser)) revealTaskManagerForConversation = true
    if (relevantMutations.some(mutationTouchesProjection)) scheduleProjection()
    if (relevantMutations.some(mutationReplacesComposer)) {
      windowManager.refresh('jine')
      attachJineSeat()
    }
  })
  const root = document.querySelector("[id='root']")
  if (root !== null) observer.observe(root, {
    attributes: true,
    attributeFilter: [
      'data-phase',
      'data-state',
      'data-streaming',
      'data-approval-key',
      'aria-selected',
      'aria-current',
      'aria-label',
      'aria-checked',
      'aria-disabled',
    ],
    childList: true,
    subtree: true,
    characterData: true,
  })
  decorateScheduleCatalog()
  decorateQuestionComposers()
  questionTranscriptLedger.sync()
  applyProjection(surfaces, questionTranscriptLedger.records(), projectSubagentView(sessions))
  syncQueueDockFallback()
  syncProjectionSounds()
  syncSettingsWindow()
  syncConnectionSurface()
  syncTodoWindow()
  syncSaveProjection()
  syncTaskManagerStats()

  const syncSaveWindowState = (): void => {
    const open = surfaces.saveWindow.dataset.windowState === 'open'
    body.toggleAttribute(SAVE_ATTRIBUTE, open)
    surfaces.clockButton.setAttribute('aria-expanded', String(open))
    if (open) requestAnimationFrame(() => {
      updateSaveBottomSpace()
      syncActiveSaveWorkspace()
    })
  }
  const saveWindowStateObserver = new MutationObserver(syncSaveWindowState)
  saveWindowStateObserver.observe(surfaces.saveWindow, {
    attributes: true,
    attributeFilter: ['data-window-state'],
  })

  const stopLocaleRefresh = onLocaleChange(() => {
    applyProjection(surfaces, questionTranscriptLedger.records(), projectSubagentView(sessions))
    syncObservedSubagentCatalog()
    syncSaveProjection()
    syncConnectionSurface()
    syncTaskManagerStats()
    decorateQuestionComposers()
    if (surfaces.internetSearchInput.value.trim() !== '') runInternetSearch()
  })

  ctx.effect(() => () => {
    stopLocaleRefresh()
    disposeLocale()
    lightModeLock.dispose()
    disposeHarnessFailureBlueScreen()
    disposeOnboardingAdapter()
    disposeSkinCustomization()
    clearPeakPricingTimer()
    if (clockTimer !== undefined) window.clearTimeout(clockTimer)
    clearSideSceneTransition()
    pomodoroController.dispose()
    surfaces.disposeMedicine()
    surfaces.pomodoroToggle.removeEventListener('click', onPomodoroToggle)
    surfaces.pomodoroSkip.removeEventListener('click', onPomodoroSkip)
    surfaces.pomodoroReset.removeEventListener('click', onPomodoroReset)
    surfaces.pomodoroPreset25.removeEventListener('click', onPomodoroPreset25)
    surfaces.pomodoroPreset50.removeEventListener('click', onPomodoroPreset50)
    surfaces.pomodoroApply.removeEventListener('click', onPomodoroApply)
    surfaces.medicineShortcut.removeEventListener('click', openMedicine)
    surfaces.medicineConsentAccept.removeEventListener('click', acceptMedicineConsent)
    surfaces.medicineConsentDecline.removeEventListener('click', declineMedicineConsent)
    document.removeEventListener('keydown', dismissMedicineConsentFromKeyboard)
    surfaces.jineSessionMenu.removeEventListener('pointerdown', onSubagentContactPointerDown)
    surfaces.jineSessionMenu.removeEventListener('click', onSubagentContactClick)
    surfaces.jineSessionToggle.removeEventListener('click', toggleJineSessionMenu)
    document.removeEventListener('pointerdown', closeJineSessionMenuFromOutside)
    surfaces.jineFeed.removeEventListener('pointerdown', holdJineProjectionForPointer)
    surfaces.jineFeed.removeEventListener('keydown', holdJineProjectionForKeyboard)
    window.removeEventListener('pointerup', releaseJineProjectionForPointer, true)
    window.removeEventListener('pointercancel', releaseJineProjectionForPointer, true)
    window.removeEventListener('keyup', releaseJineProjectionForKeyboard, true)
    window.removeEventListener('blur', releaseJineProjectionLocks)
    surfaces.jineFeed.removeAttribute('data-jine-interaction-active')
    disposeDailyTransition()
    sfx.dispose()
    surfaces.disposeWebcam()
    windowManager.dispose()
    observer.disconnect()
    if (sessions !== undefined && observedSubagentParent !== undefined) {
      sessions.setSubagentCatalogOpen(observedSubagentParent, false)
    }
    saveWindowStateObserver.disconnect()
    disposeJineStretch()
    clearQuestionDecorations()
    body.style.removeProperty('--ngo-jine-stretch')
    body.style.removeProperty('--ngo-jine-feed-bottom')
    body.removeAttribute('data-ngo-jine-open')
    body.removeAttribute('data-ngo-jine-has-queue')
    body.removeAttribute('data-ngo-jine-queue-fallback')
    if (pending !== undefined) window.clearTimeout(pending)
    if (queueFallbackTimer !== undefined) window.clearTimeout(queueFallbackTimer)
    if (tokenEstimateTimer !== undefined) window.clearTimeout(tokenEstimateTimer)
    if (internetJumpTimer !== undefined) window.clearTimeout(internetJumpTimer)
    if (internetHighlightTimer !== undefined) window.clearTimeout(internetHighlightTimer)
    internetSearchForm.removeEventListener('submit', onInternetSearchSubmit)
    surfaces.internetSearchResults.removeEventListener('click', onInternetSearchResultClick)
    surfaces.connectionButton.removeEventListener('click', toggleConnectionPopover)
    surfaces.connectionAction.removeEventListener('click', requestOfficialReconnect)
    surfaces.clockButton.removeEventListener('click', toggleSaveManager)
    surfaces.startButton.removeEventListener('click', toggleStartMenu)
    surfaces.startNewButton.removeEventListener('click', openNewSession)
    surfaces.startContinueButton.removeEventListener('click', toggleSaveManager)
    surfaces.startControlButton.removeEventListener('click', openSettings)
    surfaces.startRestartButton.removeEventListener('click', restartDesktop)
    surfaces.startShutdownButton.removeEventListener('click', shutdownDesktop)
    surfaces.startShutdownButton.removeEventListener('pointerover', dodgeShutdown)
    surfaces.settingsWindow.querySelector<HTMLElement>("[data-window-action='close']")
      ?.removeEventListener('click', closeOfficialSettings)
    document.removeEventListener('pointerdown', closeFromOutside)
    document.removeEventListener('keydown', onConnectionKeyDown)
    document.removeEventListener('pointerdown', onDesktopPointerDown)
    document.removeEventListener('click', onComposerBlankClick)
    document.removeEventListener('dragstart', onSkinDragStart, true)
    surfaces.scene.removeEventListener('dragstart', onSkinDragStart, true)
    document.removeEventListener('input', onSettingsRangeInput, true)
    document.removeEventListener('click', onLiveControlClick, true)
    document.removeEventListener('click', onSaveTreeClick, true)
    document.removeEventListener('click', onQuestionClick)
    document.removeEventListener('input', onQuestionInput, true)
    document.removeEventListener('keydown', onQuestionKeyDown, true)
    document.removeEventListener('focusin', onQuestionFocusIn)
    document.removeEventListener('focusout', onQuestionFocusOut)
    document.removeEventListener('mouseover', onQuestionMouseOver)
    document.removeEventListener('mouseout', onQuestionMouseOut)
    document.removeEventListener('pointerdown', onQuestionPointerDown)
    document.removeEventListener('focusin', onQuestionOptionFocusIn)
    document.removeEventListener('focusout', onQuestionOptionFocusOut)
    document.removeEventListener('scroll', onQuestionDetailScroll, true)
    hideQuestionDetail()
    for (const catalog of ownedScheduleCatalogs) {
      if (catalog.getAttribute(SCHEDULE_CATALOG_ATTRIBUTE) === scheduleCatalogLease) {
        catalog.removeAttribute(SCHEDULE_CATALOG_ATTRIBUTE)
      }
    }
    ownedScheduleCatalogs.clear()
    for (const timer of questionTimers) window.clearTimeout(timer)
    questionTimers.clear()
    window.removeEventListener('resize', refreshOnResize)
    window.removeEventListener('resize', updateSaveBottomSpace)
    surfaces.saveData.removeEventListener('scroll', scheduleSaveWorkspaceSync)
    surfaces.saveProgressTrack.removeEventListener('wheel', scrollSaveWorkspaceIndicators)
    surfaces.saveWorkspaceCreate.removeEventListener('click', createOfficialWorkspace)
    if (saveScrollFrame !== 0) window.cancelAnimationFrame(saveScrollFrame)
    surfaces.jineFeed.removeEventListener('click', onJineImageClick)
    surfaces.jineFeed.removeEventListener('click', onJineTaskLinkClick)
    surfaces.jineFeed.removeEventListener('scroll', onJineScroll)
    surfaces.taskFeed.removeEventListener('click', onTaskManagerLinkClick)
    surfaces.desktopNotice.removeEventListener('click', onDesktopNoticeClick)
    for (const opener of jineNoticeDismissers) opener.removeEventListener('click', dismissJineNotice)
    jineManagedWindow?.element.removeEventListener('pointerdown', dismissJineNotice)
    for (const opener of pomodoroNoticeDismissers) opener.removeEventListener('click', dismissPomodoroNotice)
    pomodoroManagedWindow?.element.removeEventListener('pointerdown', dismissPomodoroNotice)
    jineFocusObserver.disconnect()
    queueJineStateObserver.disconnect()
    window.removeEventListener('focus', syncJineNoticeVisibility)
    surfaces.pictureGrid.removeEventListener('click', onPictureGridClick)
    imageViewerImage.onload = null
    imageViewerImage.onerror = null
    imageViewerImage.removeAttribute('src')
    setImageViewerPhase('hidden')
    favicon.remove()
    for (const { hostIcon, anchor } of hostIcons) {
      if (anchor !== null && anchor.isConnected) document.head.insertBefore(hostIcon, anchor)
      else document.head.append(hostIcon)
    }
    manifestLink.remove()
    for (const { hostManifest, anchor } of hostManifests) {
      if (anchor !== null && anchor.isConnected) document.head.insertBefore(hostManifest, anchor)
      else document.head.append(hostManifest)
    }
    surfaces.scene.remove()
    body.removeAttribute(BODY_ATTRIBUTE)
    body.removeAttribute(SAVE_ATTRIBUTE)
    body.removeAttribute(START_ATTRIBUTE)
    body.removeAttribute(SETTINGS_ATTRIBUTE)
    body.removeAttribute(SETTINGS_ACTIVE_ATTRIBUTE)
    body.removeAttribute(FONT_ATTRIBUTE)
    body.removeAttribute(PHASE_ATTRIBUTE)
    body.removeAttribute(SIDE_SCENE_ATTRIBUTE)
    body.style.removeProperty('--ngo-bgm-volume')
    body.style.removeProperty('--ngo-sfx-volume')
    body.style.removeProperty('--ngo-settings-layer')
    body.style.removeProperty('--ngo-jine-layer')
    for (const [property, previous] of previousArt) {
      if (previous === '') body.style.removeProperty(property)
      else body.style.setProperty(property, previous)
    }
  }, 'ui-skin-internet-angel-desktop: full desktop presentation and transcript projection')
}
