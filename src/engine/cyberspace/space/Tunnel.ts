import {
  BackSide,
  BoxGeometry,
  Color,
  GLSL3,
  Mesh,
  ShaderMaterial,
} from 'three'
import { SPACE, TUNNEL } from '../config/space'
import tunnelFrag from '../shaders/tunnel.frag.glsl?raw'
import tunnelVert from '../shaders/tunnel.vert.glsl?raw'
import type { SpaceLayer } from '../types'

export class Tunnel implements SpaceLayer {
  private readonly mesh: Mesh
  private readonly _objects: Mesh[]

  constructor() {
    this.mesh = this.createMesh()
    this._objects = [this.mesh]
  }

  get objects() {
    return this._objects
  }

  update(time: number): void {
    const material = this.mesh.material as ShaderMaterial
    material.uniforms.uTime.value = time
  }

  setFogDensity(density: number): void {
    const material = this.mesh.material as ShaderMaterial
    material.uniforms.uFogDensity.value = density
  }

  setPulseInterval(interval: number): void {
    const material = this.mesh.material as ShaderMaterial
    material.uniforms.uInterval.value = interval
  }

  private createMesh(): Mesh {
    const geometry = this.createGeometry()
    const material = this.createMaterial()
    const { zOffset } = TUNNEL.layout
    const mesh = new Mesh(geometry, material)
    mesh.position.z = -SPACE.tunnelBoxDepth / 2 + zOffset
    mesh.frustumCulled = false
    return mesh
  }

  private createGeometry(): BoxGeometry {
    const { frameHalf, tunnelBoxDepth } = SPACE
    return new BoxGeometry(frameHalf * 2, frameHalf * 2, tunnelBoxDepth)
  }

  private createMaterial(): ShaderMaterial {
    const { frameHalf, tunnelBoxDepth, pulseInterval } = SPACE
    const { color, fog, layout } = TUNNEL

    return new ShaderMaterial({
      uniforms: {
        uColorBlue: { value: new Color(...color.neonBlue) },
        uColorPurple: { value: new Color(...color.neonPurple) },
        uColorBaseWall: { value: new Color(...color.baseWall) },
        uColorSeamGlow: { value: new Color(...color.seamGlow) },
        uColorNodeGlow: { value: new Color(...color.nodeGlow) },
        uColorPulseGlow: { value: new Color(...color.pulseGlow) },
        uFogDensity: { value: fog.density },
        uHalf: { value: frameHalf },
        uInterval: { value: pulseInterval },
        uSpan: { value: tunnelBoxDepth + layout.spanOffset },
        uTime: { value: 0 },
      },
      vertexShader: tunnelVert,
      fragmentShader: tunnelFrag,
      side: BackSide,
      glslVersion: GLSL3,
    })
  }
}
