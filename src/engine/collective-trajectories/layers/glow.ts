// @ts-nocheck
import { Sprite, SpriteNodeMaterial } from 'three/webgpu'
import { cameraPosition, float, instanceIndex, vec3 } from 'three/tsl'
import { additiveProps, dofFactor, fogFactor, softCircle } from '../effects'
import type { CollectiveField } from '../gpgpu'
import { uGlowSize, uGlowStrength } from '../uniforms'

export function createGlow(field: CollectiveField): Sprite {
  const { positionBuffer, brightnessBuffer, count } = field
  const material = new SpriteNodeMaterial(additiveProps)
  const pos = positionBuffer.element(instanceIndex)
  const b = brightnessBuffer.element(instanceIndex)
  const camDist = pos.sub(cameraPosition).length()

  material.positionNode = pos
  material.scaleNode = uGlowSize.mul(float(0.5).add(b.mul(0.8)))
  material.colorNode = vec3(0.98, 0.99, 0.9).mul(b)
  material.opacityNode = softCircle()
    .mul(b)
    .mul(uGlowStrength)
    .mul(fogFactor(camDist))
    .mul(dofFactor(camDist))

  const glow = new Sprite(material)
  glow.count = count
  glow.frustumCulled = false
  return glow
}
