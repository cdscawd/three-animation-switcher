// @ts-nocheck — TSL node types are wider than TypeScript can express here.
import { StorageBufferAttribute } from 'three/webgpu'
import {
  Fn,
  PI2,
  abs,
  clamp,
  cos,
  float,
  fract,
  hash,
  instanceIndex,
  mix,
  mx_noise_vec3,
  oneMinus,
  pow,
  sin,
  smoothstep,
  sqrt,
  step,
  storage,
  vec3,
} from 'three/tsl'
import { POINTS_PER_STRAND } from './config'
import {
  uCurl,
  uExtendFrac,
  uExtendReach,
  uFlowSpeed,
  uFreq,
  uGrowDur,
  uGrowSpread,
  uLineBase,
  uNoiseSpeed,
  uPulseFreq,
  uRadius,
  uTime,
  uTipPower,
} from './uniforms'

export interface CollectiveField {
  strandCount: number
  count: number
  positionBuffer: unknown
  brightnessBuffer: unknown
  strandDirBuffer: unknown
  strandPhaseBuffer: unknown
  computeUpdate: unknown
  computeStrandInit: unknown
}

export function createField(strandCount: number): CollectiveField {
  const count = strandCount * POINTS_PER_STRAND
  const positionBuffer = storage(new StorageBufferAttribute(count, 3), 'vec3', count)
  const brightnessBuffer = storage(new StorageBufferAttribute(count, 1), 'float', count)
  const strandDirBuffer = storage(new StorageBufferAttribute(strandCount, 3), 'vec3', strandCount)
  const strandPhaseBuffer = storage(new StorageBufferAttribute(strandCount, 1), 'float', strandCount)

  return {
    strandCount,
    count,
    positionBuffer,
    brightnessBuffer,
    strandDirBuffer,
    strandPhaseBuffer,
    computeUpdate: Fn(() => {
      const i = float(instanceIndex)
      const pps = float(POINTS_PER_STRAND)
      const strandId = i.div(pps).floor()
      const tBase = i.sub(strandId.mul(pps)).div(pps.sub(1))
      const seed = strandId.add(1)
      const u1 = hash(seed.mul(0.1234).add(0.567))
      const u2 = hash(seed.mul(0.789).add(0.0123))
      const phase = hash(seed.mul(2.345).add(0.91))
      const z = u1.mul(2).sub(1)
      const phi = u2.mul(PI2)
      const rxy = sqrt(float(1).sub(z.mul(z)))
      const dir = vec3(rxy.mul(cos(phi)), rxy.mul(sin(phi)), z)
      const t = tBase
      const ext = step(hash(seed.mul(3.71).add(0.27)), uExtendFrac)
      const reach = mix(float(1), uExtendReach, ext)
      const s = t.mul(reach)
      const base = dir.mul(s.mul(uRadius))
      const disp = mx_noise_vec3(
        base.mul(uFreq).add(vec3(0, uTime.mul(uNoiseSpeed), seed)),
      )
        .mul(uCurl)
        .mul(t)
      const pos = base.add(disp)
      const ends = pow(abs(s.min(1).mul(2).sub(1)), uTipPower)
      const journey = uLineBase.add(oneMinus(uLineBase).mul(ends))
      const pulse = pow(
        fract(t.mul(uPulseFreq).sub(uTime.mul(uFlowSpeed)).add(phase)),
        4,
      )
      const tailT = clamp(s.sub(1).div(uExtendReach.sub(1).max(0.001)), 0, 1)
      const beyond = smoothstep(1, 1.04, s).mul(ext)
      const tailMul = mix(float(1), oneMinus(tailT).mul(0.5), beyond)
      const delay = hash(seed.mul(5.17).add(0.83)).mul(uGrowSpread)
      const gFront = uTime.sub(delay).div(uGrowDur)
      const reveal = oneMinus(smoothstep(gFront.sub(0.12), gFront.add(0.12), t))
      const brightness = journey
        .mul(float(0.35).add(pulse.mul(0.9)))
        .add(0.02)
        .mul(tailMul)
        .mul(reveal)
      positionBuffer.element(instanceIndex).assign(pos)
      brightnessBuffer.element(instanceIndex).assign(brightness)
    })().compute(count),
    computeStrandInit: Fn(() => {
      const seed = float(instanceIndex).add(1)
      const u1 = hash(seed.mul(0.1234).add(0.567))
      const u2 = hash(seed.mul(0.789).add(0.0123))
      const phase = hash(seed.mul(2.345).add(0.91))
      const z = u1.mul(2).sub(1)
      const phi = u2.mul(PI2)
      const rxy = sqrt(float(1).sub(z.mul(z)))
      const dir = vec3(rxy.mul(cos(phi)), rxy.mul(sin(phi)), z)
      strandDirBuffer.element(instanceIndex).assign(dir)
      strandPhaseBuffer.element(instanceIndex).assign(phase)
    })().compute(strandCount),
  }
}
