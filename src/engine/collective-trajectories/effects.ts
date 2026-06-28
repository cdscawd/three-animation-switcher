import { AdditiveBlending } from 'three'
import { abs, clamp, float, oneMinus, smoothstep, uv } from 'three/tsl'
import { uDofDim, uFocus, uFocusRange, uFogFar, uFogNear, uFogStrength } from './uniforms'

export const additiveProps = {
  transparent: true,
  blending: AdditiveBlending,
  depthWrite: false,
  depthTest: true,
}

export const fogFactor = (camDist: ReturnType<typeof float>) =>
  oneMinus(clamp(smoothstep(uFogNear, uFogFar, camDist).mul(uFogStrength), 0, 1))

export const dofFactor = (camDist: ReturnType<typeof float>) =>
  oneMinus(clamp(abs(camDist.sub(uFocus)).div(uFocusRange), 0, 1).mul(uDofDim))

export const softCircle = () => smoothstep(0.5, 0, uv().sub(0.5).length())
