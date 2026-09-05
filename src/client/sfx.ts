/**
 * Tiny non-blocking WebAudio/HTMLAudio SFX manager for the game-faithful
 * desktop feedback. All clips are embedded data-URI OGG files already decoded
 * from NEEDY GIRL OVERDOSE's sharedassets0 AudioClips; no external network is
 * used and every source is retracted on skin unload.
 */

export type SfxName =
  | 'poko'
  | 'kari'
  | 'pirodown'
  | 'windowClose'
  | 'commandExecute'
  | 'popTooltip'
  | 'popTutorial'
  | 'pillGuiiin'
  | 'per'
  | 'biosPiko'
  | 'biosHdd'
  | 'boot'
  | 'bootCaution'
  | 'piporo'
  | 'jineReceive'
  | 'tweetLoad'
  | 'tweetChangeTop'
  | 'tweetKusorep'
  | 'statusUp'
  | 'statusDown'
  | 'statusShowDiff'
  | 'haisinSuperchat'
  | 'jineSendStamp'
  | 'nadenade1'
  | 'notification'
  | 'piyo'
  | 'isaacSlotCoin'
  | 'isaacSlotPull'
  | 'isaacSlotSpin'
  | 'isaacSlotStop'
  | 'isaacSlotSpawn'
  | 'isaacBombDrop0'
  | 'isaacBombDrop1'
  | 'isaacBombExplode0'
  | 'isaacBombExplode1'
  | 'isaacBombExplode2'
  | 'steamAchievement'
  | 'isaacVoicePowerPill'
  | 'isaacVoiceRetroVision'
  | 'isaacGamekidChew'
  | 'terrariaGravityPotionUse'
  | 'minecraftSuspiciousStewEat'
  | 'minecraftDrink'

export interface Sfx {
  play(name: SfxName, volume?: number): void
  playAndWait(name: SfxName, volume?: number): Promise<void>
  playLoop(name: SfxName, volume?: number): void
  prepareStutter(name: SfxName): void
  playStutter(name: SfxName): void
  /** Stop every playing instance of one SFX (game AudioManager.StopByType). */
  stop(name: SfxName): void
  /** 0..100; 0 keeps the whole easter-egg sound layer silent by default. */
  setSeVolume(percent: number): void
  getSeVolume(): number
  /** Start the looping desktop BGM (mainloop_normal). No-op if already started. */
  startBgm(): void
  stopBgm(): void
  setBgmVolume(percent: number): void
  getBgmVolume(): number
  dispose(): void
}

const MAX_POOL_PER_SFX = 3

export function createSfx(
  sources: Partial<Record<SfxName, string>>,
  bgmSrc?: string,
): Sfx {
  const pool = new Map<SfxName, HTMLAudioElement[]>()
  let seGain = 0
  let bgmGain = 0
  let bgm: HTMLAudioElement | null = null
  let bgmStarted = false
  let glitchContext: AudioContext | undefined
  let glitchGain: GainNode | undefined
  let glitchSource: AudioBufferSourceNode | undefined
  let disposed = false
  const glitchBuffers = new Map<SfxName, Promise<AudioBuffer>>()
  const prepareStutter = (name: SfxName): void => {
    const src = sources[name]
    if (disposed || !src || typeof AudioContext === 'undefined') return
    try {
      glitchContext ??= new AudioContext()
      if (!glitchGain) {
        glitchGain = glitchContext.createGain()
        glitchGain.gain.value = seGain
        glitchGain.connect(glitchContext.destination)
      }
      void glitchContext.resume().catch(() => {})
      if (!glitchBuffers.has(name)) {
        const bytes = Uint8Array.from(atob(src.slice(src.indexOf(',') + 1)), char => char.charCodeAt(0))
        const decoding = glitchContext.decodeAudioData(bytes.buffer)
        glitchBuffers.set(name, decoding)
        void decoding.catch(() => { glitchBuffers.delete(name) })
      }
    } catch {
      // Keep the visual easter egg usable when browser audio is unavailable.
    }
  }
  const playStutter = (name: SfxName): void => {
    if (disposed || glitchSource) return
    prepareStutter(name)
    void glitchBuffers.get(name)?.then(buffer => {
      if (disposed || glitchSource || !glitchContext || !glitchGain) return
      const source = glitchContext.createBufferSource()
      source.buffer = buffer
      // Play the attack once, then freeze a 40 ms slice of that same explosion.
      source.loop = true
      source.loopStart = Math.min(.16, buffer.duration * .4)
      source.loopEnd = Math.min(.20, buffer.duration * .5)
      source.connect(glitchGain)
      source.start()
      glitchSource = source
    }).catch(() => {})
  }

  const prepareAudio = (name: SfxName, volume: number, loop: boolean): HTMLAudioElement | null => {
    const src = sources[name]
    if (src === undefined || typeof Audio === 'undefined') return null
    let nodes = pool.get(name)
    if (nodes === undefined) {
      nodes = []
      pool.set(name, nodes)
    }
    let node = nodes.find(audio => audio.paused)
    if (node === undefined && nodes.length < MAX_POOL_PER_SFX) {
      node = new Audio(src)
      node.preload = 'auto'
      nodes.push(node)
    }
    if (node === undefined) node = nodes[0]
    if (node === undefined) return null
    node.loop = loop
    node.volume = seGain * Math.min(1, Math.max(0, volume))
    return node
  }
  const playWithLoop = (name: SfxName, volume: number, loop: boolean): void => {
    const node = prepareAudio(name, volume, loop)
    if (node === null) return
    try {
      node.currentTime = 0
      void node.play().catch(() => {})
    } catch {
      // Browsers may reject until the user gesture has been processed; the
      // catch keeps the desktop usable in automated/no-audio environments.
    }
  }
  const play = (name: SfxName, volume = 1): void => playWithLoop(name, volume, false)
  const playLoop = (name: SfxName, volume = 1): void => playWithLoop(name, volume, true)
  const playAndWait = (name: SfxName, volume = 1): Promise<void> => {
    const node = prepareAudio(name, volume, false)
    if (node === null) return Promise.resolve()
    return new Promise(resolve => {
      let fallback: ReturnType<typeof setTimeout> | undefined
      const finish = (): void => {
        node.removeEventListener('ended', finish)
        node.removeEventListener('error', finish)
        if (fallback !== undefined) clearTimeout(fallback)
        resolve()
      }
      node.addEventListener('ended', finish, { once: true })
      node.addEventListener('error', finish, { once: true })
      fallback = setTimeout(finish, 2_000)
      try {
        node.currentTime = 0
        void node.play().catch(finish)
      } catch {
        finish()
      }
    })
  }

  const stop = (name: SfxName): void => {
    for (const node of pool.get(name) ?? []) {
      try {
        node.pause()
        node.currentTime = 0
        node.loop = false
      } catch {
        // ignore
      }
    }
  }

  const getBgm = (): HTMLAudioElement | null => {
    if (typeof Audio === 'undefined' || bgmSrc === undefined) return null
    if (bgm === null) {
      bgm = new Audio(bgmSrc)
      bgm.loop = true
      bgm.preload = 'auto'
      bgm.volume = bgmGain
    }
    return bgm
  }

  const startBgm = (): void => {
    if (bgmStarted) return
    const node = getBgm()
    if (node === null) return
    bgmStarted = true
    try {
      void node.play().catch(() => {})
    } catch {
      // Autoplay may be blocked until a user gesture; the first pointerdown
      // plays the global SE which gives the browser its gesture, and the
      // BGM is retried on the next volume change (see setBgmVolume).
    }
  }

  const stopBgm = (): void => {
    bgmStarted = false
    if (bgm !== null) {
      try {
        bgm.pause()
      } catch {
        // ignore
      }
    }
  }

  const dispose = (): void => {
    disposed = true
    glitchSource?.stop()
    glitchSource?.disconnect()
    glitchGain?.disconnect()
    if (glitchContext) void glitchContext.close().catch(() => {})
    glitchBuffers.clear()
    for (const nodes of pool.values()) {
      for (const node of nodes) {
        try {
          node.pause()
        } catch {
          // ignore
        }
        try {
          node.src = ''
        } catch {
          // ignore
        }
      }
    }
    pool.clear()
    stopBgm()
    if (bgm !== null) {
      try {
        bgm.src = ''
      } catch {
        // ignore
      }
      bgm = null
    }
  }

  const setSeVolume = (percent: number): void => {
    seGain = Math.min(1, Math.max(0, percent / 100))
    if (glitchGain) glitchGain.gain.value = seGain
  }
  const getSeVolume = (): number => seGain
  const setBgmVolume = (percent: number): void => {
    bgmGain = Math.min(1, Math.max(0, percent / 100))
    if (bgm !== null) bgm.volume = bgmGain
    // A volume change is a direct user interaction with the slider, which
    // re-tries the BGM start when autoplay was blocked earlier.
    if (bgmGain > 0 && bgmStarted && bgm !== null && bgm.paused) {
      try {
        void bgm.play().catch(() => {})
      } catch {
        // ignore
      }
    }
  }
  const getBgmVolume = (): number => bgmGain

  return {
    play,
    playAndWait,
    playLoop,
    prepareStutter,
    playStutter,
    stop,
    setSeVolume,
    getSeVolume,
    startBgm,
    stopBgm,
    setBgmVolume,
    getBgmVolume,
    dispose,
  }
}
