import type { ParamValues } from '../../params'
import * as u from './uniforms'

const UNIFORM_BINDINGS: Record<string, { value: number }> = {
  radius: u.uRadius,
  audioReact: u.uAudioReact,
  curl: u.uCurl,
  noiseFreq: u.uFreq,
  shimmerSpeed: u.uNoiseSpeed,
  flowSpeed: u.uFlowSpeed,
  pulseCount: u.uPulseFreq,
  endsVsMiddle: u.uTipPower,
  lineBase: u.uLineBase,
  lineOpacity: u.uOpacity,
  extendFraction: u.uExtendFrac,
  extendReach: u.uExtendReach,
  introGrowTime: u.uGrowDur,
  introRandomDelay: u.uGrowSpread,
  glowStrength: u.uGlowStrength,
  glowSize: u.uGlowSize,
  shellDots: u.uShellStrength,
  shellDotSize: u.uShellSize,
  coreWireframe: u.uCoreStrength,
  coreRadius: u.uCoreRadius,
  coreEmanation: u.uCoreNoise,
  coreDetail: u.uCoreFreq,
  fogStrength: u.uFogStrength,
  fogNear: u.uFogNear,
  fogFar: u.uFogFar,
  dofDim: u.uDofDim,
  focusDist: u.uFocus,
  focusRange: u.uFocusRange,
  rippleStrength: u.uRippleStrength,
  rippleSpread: u.uRippleSpan,
  ringSpacing: u.uRingSpacing,
  rippleFade: u.uRippleFade,
}

export function applyCollectiveUniformParams(params: ParamValues): void {
  for (const [key, uniform] of Object.entries(UNIFORM_BINDINGS)) {
    const value = params[key]
    if (typeof value === 'number') {
      uniform.value = value
    }
  }
}
