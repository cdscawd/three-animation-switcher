// @ts-nocheck
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicNodeMaterial,
  LineSegments,
} from 'three/webgpu'
import {
  PI2,
  abs,
  cameraPosition,
  cos,
  cross,
  float,
  fract,
  hash,
  instanceIndex,
  mx_noise_vec3,
  normalize,
  oneMinus,
  pow,
  sin,
  smoothstep,
  step,
  uint,
  varying,
  vec3,
  vertexIndex,
} from 'three/tsl'
import { additiveProps, dofFactor, fogFactor } from '../effects'
import type { CollectiveField } from '../gpgpu'
import {
  uCurl,
  uFlowSpeed,
  uFreq,
  uGrowDur,
  uGrowSpread,
  uNoiseSpeed,
  uPulseFreq,
  uRadius,
  uRippleFade,
  uRippleSpan,
  uRippleStrength,
  uRingSpacing,
  uTime,
} from '../uniforms'

export function createRipples(field: CollectiveField): LineSegments {
  const { strandDirBuffer, strandPhaseBuffer, strandCount } = field
  const ringVerts = strandCount * 4 * 96
  const material = new LineBasicNodeMaterial(additiveProps)
  const vSeg = uint(96)
  const vRing = uint(4)
  const ringGlobal = vertexIndex.div(vSeg)
  const segId = vertexIndex.sub(ringGlobal.mul(vSeg))
  const strandId = ringGlobal.div(vRing)
  const ringId = ringGlobal.sub(strandId.mul(vRing))
  const phi = float(segId).div(96).mul(PI2)
  const dir = strandDirBuffer.element(strandId)
  const ph = strandPhaseBuffer.element(strandId)
  const seed = float(strandId).add(1)
  const tipBase = dir.mul(uRadius)
  const tipNp = tipBase.mul(uFreq).add(vec3(0, uTime.mul(uNoiseSpeed), seed))
  const tip = tipBase.add(mx_noise_vec3(tipNp).mul(uCurl))
  const tipDir = normalize(tip)
  const tipLen = tip.length()
  const uTan = normalize(
    cross(
      abs(tipDir.z).greaterThan(0.99).select(vec3(1, 0, 0), vec3(0, 0, 1)),
      tipDir,
    ),
  )
  const vTan = cross(tipDir, uTan)
  const rAge = fract(uTime.mul(uFlowSpeed).sub(ph).sub(uPulseFreq))
  const theta = rAge.mul(uRippleSpan).sub(float(ringId).mul(uRingSpacing)).max(0)
  const radialDir = cos(phi).mul(uTan).add(sin(phi).mul(vTan))
  const ringPos = tipDir.mul(cos(theta)).add(radialDir.mul(sin(theta))).mul(tipLen)
  const visible = step(0.0001, theta)
  const ringFade = oneMinus(float(ringId).div(4))
  const gDelay = hash(seed.mul(5.17).add(0.83)).mul(uGrowSpread)
  const grown = smoothstep(0.85, 1.1, uTime.sub(gDelay).div(uGrowDur))
  const rippleFade = varying(
    pow(oneMinus(rAge), uRippleFade).mul(ringFade).mul(visible).mul(grown),
  )
  const camDist = ringPos.sub(cameraPosition).length()

  material.positionNode = ringPos
  material.colorNode = vec3(1).mul(rippleFade).mul(uRippleStrength)
  material.opacityNode = rippleFade
    .mul(uRippleStrength)
    .mul(varying(fogFactor(camDist)))
    .mul(varying(dofFactor(camDist)))

  const ringIndices = new Uint32Array(strandCount * 4 * 96 * 2)
  let ptr = 0
  const ringCount = strandCount * 4
  for (let r = 0; r < ringCount; r++) {
    const base = r * 96
    for (let j = 0; j < 96; j++) {
      ringIndices[ptr++] = base + j
      ringIndices[ptr++] = base + (j + 1) % 96
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(ringVerts * 3), 3))
  geometry.setIndex(new BufferAttribute(ringIndices, 1))

  const ripples = new LineSegments(geometry, material)
  ripples.frustumCulled = false
  return ripples
}
