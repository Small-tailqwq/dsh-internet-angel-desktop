// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  installWebcamPoseLoop,
  type WebcamPose,
} from '../src/client/webcam-poses.ts'

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('webcam pose timeline', () => {
  it('can hold a leave pose until an explicit roll restores the base', () => {
    vi.useFakeTimers()
    const stage = document.createElement('div')
    const image = document.createElement('img')
    const idle: WebcamPose = { id: 'idle', frames: [], end: 'loop', weight: 1, base: true }
    const leave: WebcamPose = {
      id: 'leave',
      frames: [{ src: 'empty-room', ms: 100 }],
      end: 'hold',
      weight: 0,
    }
    const player = installWebcamPoseLoop({
      stage,
      poseImage: image,
      sets: { ame: [idle], cho: [idle] },
      random: () => 0,
      now: () => Date.now(),
    })

    player.setCharacter('ame')
    player.hold(leave)
    vi.advanceTimersByTime(60_000)
    expect(stage.dataset.webcamPose).toBe('leave')
    expect(image.src).toContain('empty-room')

    player.roll()
    expect(stage.hasAttribute('data-webcam-pose')).toBe(false)
    player.dispose()
  })

  it('does not re-roll when a settings update reapplies the same character', () => {
    vi.useFakeTimers()
    const stage = document.createElement('div')
    const image = document.createElement('img')
    const first: WebcamPose = {
      id: 'first',
      frames: [{ src: 'first-frame', ms: 1000 }],
      end: 'loop',
      weight: 1,
    }
    const second: WebcamPose = {
      id: 'second',
      frames: [{ src: 'second-frame', ms: 1000 }],
      end: 'loop',
      weight: 1,
    }
    const random = vi.fn()
      .mockReturnValueOnce(0)
      .mockReturnValue(0.99)
    const player = installWebcamPoseLoop({
      stage,
      poseImage: image,
      sets: { ame: [first, second], cho: [first, second] },
      random,
      now: () => 0,
    })

    player.setCharacter('ame')
    expect(stage.dataset.webcamPose).toBe('first')

    // BGM/SFX sliders resend the complete customization state, including
    // the unchanged webcamCharacter value, for every input step.
    player.setCharacter('ame')
    expect(random).toHaveBeenCalledTimes(1)
    expect(stage.dataset.webcamPose).toBe('first')

    player.setCharacter('cho')
    expect(random).toHaveBeenCalledTimes(2)
    expect(stage.dataset.webcamPose).toBe('second')
    player.dispose()
  })

  it('uses absolute clip time and skips stale frames after a delayed callback', () => {
    vi.useFakeTimers()
    let clock = 0
    const stage = document.createElement('div')
    const image = document.createElement('img')
    const loop: WebcamPose = {
      id: 'loop',
      frames: [
        { src: 'frame-a', ms: 100 },
        { src: 'frame-b', ms: 100 },
        { src: 'frame-c', ms: 100 },
      ],
      end: 'loop',
      weight: 1,
    }
    const player = installWebcamPoseLoop({
      stage,
      poseImage: image,
      sets: { ame: [loop], cho: [loop] },
      random: () => 0,
      now: () => clock,
    })

    player.setCharacter('ame')
    expect(image.getAttribute('src')).toBe('frame-a')

    // The main thread wakes 150ms late. A relative timeout chain would paint
    // frame-b and stay late; the game-time scheduler jumps straight to C.
    clock = 250
    vi.runOnlyPendingTimers()
    expect(image.getAttribute('src')).toBe('frame-c')

    clock = 300
    vi.runOnlyPendingTimers()
    expect(image.getAttribute('src')).toBe('frame-a')
    player.dispose()
  })

  it('relays handspinner-style one-shots and freezes hold clips at the end', () => {
    vi.useFakeTimers()
    let clock = 0
    const stage = document.createElement('div')
    const image = document.createElement('img')
    const relay: WebcamPose = {
      id: 'relay',
      frames: [{ src: 'relay-frame', ms: 100 }],
      end: 'loop',
      relayTo: 'spinner',
      weight: 1,
    }
    const spinner: WebcamPose = {
      id: 'spinner',
      frames: [{ src: 'spinner-frame', ms: 100 }],
      end: 'loop',
      weight: 0,
    }
    const hold: WebcamPose = {
      id: 'hold',
      frames: [{ src: 'hold-frame', ms: 100 }],
      end: 'hold',
      weight: 1,
    }
    const player = installWebcamPoseLoop({
      stage,
      poseImage: image,
      sets: { ame: [relay, spinner], cho: [hold] },
      random: () => 0,
      now: () => clock,
    })

    player.setCharacter('ame')
    clock = 100
    vi.runOnlyPendingTimers()
    expect(stage.getAttribute('data-webcam-pose')).toBe('spinner')
    expect(image.getAttribute('src')).toBe('spinner-frame')

    player.setCharacter('cho')
    clock = 200
    vi.runOnlyPendingTimers()
    expect(stage.getAttribute('data-webcam-pose')).toBe('hold')
    expect(image.getAttribute('src')).toBe('hold-frame')
    expect(vi.getTimerCount()).toBe(0)
    player.dispose()
  })

  it('temporarily replaces the base pose for a reaction, then resumes it', () => {
    vi.useFakeTimers()
    let clock = 0
    const stage = document.createElement('div')
    const image = document.createElement('img')
    const idle: WebcamPose = {
      id: 'idle',
      frames: [{ src: 'idle-frame', ms: 1000 }],
      end: 'loop',
      weight: 1,
    }
    const angry: WebcamPose = {
      id: 'angry',
      frames: [{ src: 'angry-frame', ms: 2000 }],
      end: 'hold',
      weight: 0,
    }
    const player = installWebcamPoseLoop({
      stage,
      poseImage: image,
      sets: { ame: [idle, angry], cho: [idle] },
      random: () => 0,
      now: () => clock,
    })

    player.setCharacter('ame')
    player.react(angry, 1800)
    expect(stage.dataset.webcamPose).toBe('angry')
    expect(image.getAttribute('src')).toBe('angry-frame')
    clock = 1800
    vi.advanceTimersByTime(1800)
    expect(stage.dataset.webcamPose).toBe('idle')
    expect(image.getAttribute('src')).toBe('idle-frame')
    player.dispose()
  })
})
