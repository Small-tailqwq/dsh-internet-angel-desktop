/**
 * Game-faithful webcam base-animation player.
 *
 * Reverse-engineered from ngov3.App_Webcam + WebCamManager (Ame desktop) and
 * ngov3.TenchanView (KAngel live view):
 * - `RandomizeAmeAnimation()` picks one base animation from a status-weighted
 *   pool (TimePassing1/2/3, day start, events) and plays it ONCE per re-roll.
 * - The clip's own loop flag decides what happens when it ends
 *   (`PlayAnim` only skips re-mounting `animationClip.isLooping` clips already
 *   mounted): looping clips keep cycling; non-looping clips freeze on their
 *   last frame (craziness) or relay into the next segment (handspinner1 ->
 *   handspinner2 via OnStateExit, which then loops).
 * - KAngel's TenchanView replays the current clip whenever the state exits
 *   (`OnExittedAnim` -> PlayAnim(CurrentAnim)) unless stopped.
 * - Head-pat replaces the base with `stream_ame_smile` (a looping clip) on the
 *   base channel; it stays until the next re-roll.
 */

export type WebcamCharacter = 'ame' | 'cho'

export interface WebcamPoseFrame {
  src: string
  /** Hold time of this frame in ms (from the Unity sprite keyframe curve). */
  ms: number
}

export type WebcamPoseEnd = 'loop' | 'hold' | 'replay'

export interface WebcamPose {
  /** Stable id, also reflected as data-webcam-pose on the stage. */
  id: string
  frames: readonly WebcamPoseFrame[]
  /** What happens when the frame sequence finishes. */
  end: WebcamPoseEnd
  /** Play this pose once the sequence finishes (handspinner1 -> handspinner2). */
  relayTo?: string
  /** Relative random-pick weight; 0 makes it a relay target only. */
  weight: number
  /** Base-layer pose (existing idle/smile layers own the display). */
  base?: boolean
  /** Only enters the random pool while the side scene is night (安心模式). */
  nightOnly?: boolean
}

const NIGHT_SCENE_ATTRIBUTE = 'data-ngo-side-scene'

export interface WebcamPoseLoop {
  /** Switch character set and re-roll the base animation. Reapplying the
   * current character is a no-op because settings updates resend all values. */
  setCharacter(character: WebcamCharacter): void
  /** RandomizeAmeAnimation semantics: re-roll the base animation and leave
   * any long-running head-pat smile. */
  roll(): void
  /** Temporarily replace the current base animation, then resume it. */
  react(pose: WebcamPose, durationMs: number): void
  /** Replace the current base animation until the next explicit roll/react. */
  hold(pose: WebcamPose): void
  /** Pause the pose layer while the head-pat reaction owns the screen. */
  suppress(): void
  dispose(): void
}

export function installWebcamPoseLoop(options: {
  stage: HTMLElement
  poseImage: HTMLImageElement
  sets: Record<WebcamCharacter, readonly WebcamPose[]>
  random?: () => number
  /** Injectable monotonic clock for deterministic scheduling tests. */
  now?: () => number
}): WebcamPoseLoop {
  const { stage, poseImage, sets } = options
  const random = options.random ?? Math.random
  const now = options.now ?? (() => performance.now())
  let character: WebcamCharacter = 'ame'
  let frameTimer: number | undefined
  let reactionTimer: number | undefined
  let currentPose: WebcamPose | null = null
  let suppressed = false
  let characterInitialized = false

  const clearTimer = (): void => {
    if (frameTimer !== undefined) window.clearTimeout(frameTimer)
    frameTimer = undefined
  }

  const clearReactionTimer = (): void => {
    if (reactionTimer !== undefined) window.clearTimeout(reactionTimer)
    reactionTimer = undefined
  }

  const clearPoseLayer = (): void => {
    clearTimer()
    stage.removeAttribute('data-webcam-pose')
    poseImage.removeAttribute('src')
  }

  const playPose = (pose: WebcamPose): void => {
    clearTimer()
    currentPose = pose
    if (pose.base === true || pose.frames.length === 0) {
      // Base-layer poses are drawn by the existing idle/smile layers.
      clearPoseLayer()
      return
    }
    stage.setAttribute('data-webcam-pose', pose.id)
    const boundaries: number[] = []
    let duration = 0
    for (const frame of pose.frames) {
      duration += frame.ms
      boundaries.push(duration)
    }
    const startedAt = now()

    const paintTimeline = (): void => {
      if (currentPose !== pose || duration <= 0) return
      const elapsed = Math.max(0, now() - startedAt)
      if (elapsed >= duration && pose.relayTo !== undefined) {
        const relay = sets[character].find(candidate => candidate.id === pose.relayTo)
        if (relay !== undefined) {
          playPose(relay)
          return
        }
      }
      if (elapsed >= duration && pose.end === 'hold') {
        poseImage.src = pose.frames[pose.frames.length - 1]!.src
        frameTimer = undefined
        return
      }

      // Anchor every transition to the clip start. If the tab or main thread
      // stalls, skip directly to the current Unity keyframe instead of adding
      // the delay to every following frame.
      const cycle = Math.floor(elapsed / duration)
      const cycleElapsed = elapsed - cycle * duration
      let frameIndex = boundaries.findIndex(boundary => cycleElapsed < boundary)
      if (frameIndex < 0) frameIndex = pose.frames.length - 1
      poseImage.src = pose.frames[frameIndex]!.src
      const nextBoundary = startedAt + cycle * duration + boundaries[frameIndex]!
      frameTimer = window.setTimeout(paintTimeline, Math.max(1, nextBoundary - now()))
    }

    paintTimeline()
  }

  const pickPose = (poses: readonly WebcamPose[]): WebcamPose | null => {
    const isNight = typeof document !== 'undefined'
      && document.body.getAttribute(NIGHT_SCENE_ATTRIBUTE) === 'night'
    const pool = poses.filter(pose => pose.weight > 0 && (!pose.nightOnly || isNight))
    if (pool.length === 0) return null
    const total = pool.reduce((sum, pose) => sum + pose.weight, 0)
    if (total <= 0) return null
    let roll = random() * total
    for (const pose of pool) {
      roll -= pose.weight
      if (roll <= 0) return pose
    }
    return pool[pool.length - 1] ?? null
  }

  const roll = (): void => {
    clearReactionTimer()
    suppressed = false
    // The head-pat smile is also a base-animation replacement in the game; a
    // re-roll leaves it and switches to the new pose.
    stage.removeAttribute('data-webcam-patting')
    const pose = pickPose(sets[character])
    if (pose === null) {
      clearPoseLayer()
      return
    }
    playPose(pose)
  }

  return {
    setCharacter(next: WebcamCharacter): void {
      if (characterInitialized && character === next) return
      characterInitialized = true
      clearReactionTimer()
      character = next
      currentPose = null
      suppressed = false
      clearPoseLayer()
      roll()
    },
    roll,
    react(pose: WebcamPose, durationMs: number): void {
      clearReactionTimer()
      const restorePose = currentPose
      suppressed = false
      stage.removeAttribute('data-webcam-patting')
      playPose(pose)
      reactionTimer = window.setTimeout(() => {
        reactionTimer = undefined
        if (currentPose !== pose) return
        if (restorePose === null) clearPoseLayer()
        else playPose(restorePose)
      }, durationMs)
    },
    hold(pose: WebcamPose): void {
      clearReactionTimer()
      suppressed = false
      stage.removeAttribute('data-webcam-patting')
      playPose(pose)
    },
    suppress(): void {
      clearReactionTimer()
      suppressed = true
      clearPoseLayer()
    },
    dispose(): void {
      clearReactionTimer()
      suppressed = true
      clearPoseLayer()
      currentPose = null
    },
  }
}
