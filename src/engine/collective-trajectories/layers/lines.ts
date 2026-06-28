// @ts-nocheck
import {
  BufferAttribute,
  BufferGeometry,
  LineBasicNodeMaterial,
  LineSegments,
} from 'three/webgpu'
import { cameraPosition, vec3 } from 'three/tsl'
import { additiveProps, dofFactor, fogFactor } from '../effects'
import type { CollectiveField } from '../gpgpu'
import { uOpacity } from '../uniforms'

export function createLines(field: CollectiveField): LineSegments {
  const { positionBuffer, brightnessBuffer, count, strandCount } = field
  const material = new LineBasicNodeMaterial(additiveProps)
  const b = brightnessBuffer.toAttribute()
  const worldPos = positionBuffer.toAttribute()
  const camDist = worldPos.sub(cameraPosition).length()

  material.positionNode = worldPos
  material.colorNode = vec3(0.9, 0.98, 1).mul(b)
  material.opacityNode = b.mul(uOpacity).mul(fogFactor(camDist)).mul(dofFactor(camDist))

  const lineIndices = new Uint32Array(strandCount * 199 * 2)
  let ptr = 0
  for (let s = 0; s < strandCount; s++) {
    const base = s * 200
    for (let j = 0; j < 199; j++) {
      lineIndices[ptr++] = base + j
      lineIndices[ptr++] = base + j + 1
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setIndex(new BufferAttribute(lineIndices, 1))

  const lines = new LineSegments(geometry, material)
  lines.frustumCulled = false
  return lines
}
