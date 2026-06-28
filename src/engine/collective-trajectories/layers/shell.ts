// @ts-nocheck
import {
  Sprite,
  SpriteNodeMaterial,
  StorageInstancedBufferAttribute,
} from 'three/webgpu'
import { cameraPosition, instanceIndex, storage, vec3 } from 'three/tsl'
import { SHELL_COUNT } from '../config'
import { additiveProps, dofFactor, fogFactor, softCircle } from '../effects'
import { fibonacciSphere } from '../utils'
import { uShellRadius, uShellSize, uShellStrength } from '../uniforms'

export function createShell(): Sprite {
  const dirBuffer = storage(
    new StorageInstancedBufferAttribute(fibonacciSphere(SHELL_COUNT), 3),
    'vec3',
    SHELL_COUNT,
  )
  const material = new SpriteNodeMaterial(additiveProps)
  const pos = dirBuffer.element(instanceIndex).mul(uShellRadius)
  const camDist = pos.sub(cameraPosition).length()

  material.positionNode = pos
  material.scaleNode = uShellSize
  material.colorNode = vec3(1).mul(uShellStrength)
  material.opacityNode = softCircle()
    .mul(uShellStrength)
    .mul(fogFactor(camDist))
    .mul(dofFactor(camDist))

  const shell = new Sprite(material)
  shell.count = SHELL_COUNT
  shell.frustumCulled = false
  return shell
}
