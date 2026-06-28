// @ts-nocheck
import {
  Group,
  IcosahedronGeometry,
  LineBasicNodeMaterial,
  LineSegments,
  Mesh,
  MeshBasicNodeMaterial,
  WireframeGeometry,
} from 'three/webgpu'
import { mx_noise_float, normalize, positionLocal } from 'three/tsl'
import {
  uCoreFreq,
  uCoreNoise,
  uCoreRadius,
  uCoreSpeed,
  uCoreStrength,
  uTime,
} from '../uniforms'

const baseGeo = new IcosahedronGeometry(1, 4)

function displaced(scale: number) {
  const dir = normalize(positionLocal)
  const n = mx_noise_float(dir.mul(uCoreFreq).add(uTime.mul(uCoreSpeed)))
  return dir.mul(uCoreRadius.add(n.mul(uCoreNoise))).mul(scale)
}

export function createCoreSphere(): Group {
  const fillMaterial = new MeshBasicNodeMaterial({ color: 0 })
  fillMaterial.positionNode = displaced(1)
  const fill = new Mesh(baseGeo, fillMaterial)
  fill.frustumCulled = false

  const wireMaterial = new LineBasicNodeMaterial({
    color: 0xffffff,
    transparent: true,
    depthWrite: false,
  })
  wireMaterial.positionNode = displaced(1.004)
  wireMaterial.opacityNode = uCoreStrength
  const wire = new LineSegments(new WireframeGeometry(baseGeo), wireMaterial)
  wire.frustumCulled = false

  const coreSphere = new Group()
  coreSphere.add(fill, wire)
  return coreSphere
}
