import { describe, expect, it } from 'vitest'
import { SEQUENCES } from '../src/client/webcam-sequences.ts'
import {
  NGO_WEBCAM_AME_SELFIE_000,
  NGO_WEBCAM_AME_SELFIE_002,
  NGO_WEBCAM_AME_SELFIE_004,
  NGO_WEBCAM_AME_SELFIE_005,
  NGO_WEBCAM_AME_HANDSPINNER_008,
  NGO_WEBCAM_AME_HANDSPINNER2_003,
  NGO_WEBCAM_AME_HANDSPINNER2_009,
  NGO_WEBCAM_AME_HANDSPINNER2_011,
  NGO_WEBCAM_AME_HENOJI_000,
} from '../src/client/art.generated.ts'

describe('webcam game keyframe sequences (pptrCurveMapping contracts)', () => {
  it('selfie: preserves the game order and non-uniform 4.517s keyframe timing', () => {
    expect(SEQUENCES.selfie).toHaveLength(12)
    expect(SEQUENCES.selfie.map(f => f.ms)).toEqual([
      583, 84, 916, 500, 100, 984, 100, 233, 83, 84, 833, 17,
    ])
    // anchor keyframes verify the game's order (005 sits at keyframes 5 and 7)
    expect(SEQUENCES.selfie[5]!.src).toBe(NGO_WEBCAM_AME_SELFIE_005.dataUri)
    expect(SEQUENCES.selfie[7]!.src).toBe(NGO_WEBCAM_AME_SELFIE_005.dataUri)
    expect(SEQUENCES.selfie[4]!.src).toBe(NGO_WEBCAM_AME_SELFIE_004.dataUri)
    expect(SEQUENCES.selfie[0]!.src).toBe(NGO_WEBCAM_AME_SELFIE_000.dataUri)
    expect(SEQUENCES.selfie[3]!.src).toBe(NGO_WEBCAM_AME_SELFIE_002.dataUri)
  })

  it('handspinner1: holds the opening pose before the short relay transition', () => {
    expect(SEQUENCES.handspinner1).toHaveLength(4)
    expect(SEQUENCES.handspinner1.map(f => f.ms)).toEqual([1167, 250, 83, 17])
    expect(SEQUENCES.handspinner1[2]!.src).toBe(NGO_WEBCAM_AME_HANDSPINNER_008.dataUri)
    expect(SEQUENCES.handspinner1[3]!.src).toBe(NGO_WEBCAM_AME_HANDSPINNER_008.dataUri)
  })

  it('handspinner2: keeps Unity\'s 60 Hz rounding and exact 5.850s duration', () => {
    expect(SEQUENCES.handspinner2).toHaveLength(71)
    expect(SEQUENCES.handspinner2.reduce((sum, f) => sum + f.ms, 0)).toBe(5850)
    expect(new Set(SEQUENCES.handspinner2.map(f => f.ms))).toEqual(new Set([17, 83, 84]))
    expect(SEQUENCES.handspinner2[0]!.src).toBe(NGO_WEBCAM_AME_HANDSPINNER2_009.dataUri)
    expect(SEQUENCES.handspinner2[2]!.src).toBe(NGO_WEBCAM_AME_HANDSPINNER2_011.dataUri)
    expect(SEQUENCES.handspinner2[3]!.src).toBe(NGO_WEBCAM_AME_HANDSPINNER2_003.dataUri)
  })

  it('henoji: uses the game webcam-dismiss reaction frame and clip dwell', () => {
    expect(SEQUENCES.henoji).toEqual([{
      src: NGO_WEBCAM_AME_HENOJI_000.dataUri,
      ms: 2017,
    }])
  })

  it('all sequences carry positive dwells and data-URI frames', () => {
    for (const key of Object.keys(SEQUENCES) as Array<keyof typeof SEQUENCES>) {
      for (const f of SEQUENCES[key]) {
        expect(f.ms).toBeGreaterThan(0)
        expect(f.src).toMatch(/^data:image\/png;base64,/)
      }
    }
  })
})
