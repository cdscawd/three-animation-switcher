import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  GLSL3,
  Points,
  ShaderMaterial,
} from 'three'
import { PARTICLE, SPACE } from '../config/space'
import particleFrag from '../shaders/particle.frag.glsl?raw'
import particleVert from '../shaders/particle.vert.glsl?raw'
import type { ParticlesOptions, SpaceLayer } from '../types'

export class Particles implements SpaceLayer {
  private readonly props: ParticlesOptions
  private readonly maxCount = SPACE.particleCount
  private isReduced = false
  private isLowPower: boolean
  private readonly points: Points
  private readonly _objects: Points[]

  constructor({ rtHeight, isLowPower }: ParticlesOptions) {
    this.props = { rtHeight, isLowPower }
    this.isLowPower = isLowPower
    this.points = this.createPoints()
    this._objects = [this.points]
    this.applyDrawRange()
  }

  get objects() {
    return this._objects
  }

  update(time: number): void {
    const material = this.points.material as ShaderMaterial
    material.uniforms.uTime.value = time
  }

  setReduced(reduced: boolean): void {
    this.isReduced = reduced
    this.applyDrawRange()
  }

  setLowPower(lowPower: boolean): void {
    this.isLowPower = lowPower
    this.applyDrawRange()
  }

  setHeight(height: number): void {
    const material = this.points.material as ShaderMaterial
    material.uniforms.uHeightPx.value = height
  }

  setSpeed(speed: number): void {
    const material = this.points.material as ShaderMaterial
    material.uniforms.uSpeed.value = speed
  }

  setSize(size: number): void {
    const material = this.points.material as ShaderMaterial
    material.uniforms.uSize.value = size
  }

  setFlow(flow: number): void {
    const material = this.points.material as ShaderMaterial
    material.uniforms.uFlow.value = flow
  }

  private applyDrawRange(): void {
    const { reducedRatio } = PARTICLE.performance
    const base = this.isLowPower ? SPACE.particleCountLow : SPACE.particleCount
    const count = this.isReduced ? Math.floor(base * reducedRatio) : base
    this.points.geometry.setDrawRange(0, count)
  }

  private createPoints(): Points {
    const points = new Points(this.createGeometry(), this.createMaterial())
    points.frustumCulled = false
    return points
  }

  private createGeometry(): BufferGeometry {
    const positions = new Float32Array(this.maxCount * 3)
    const seeds = new Float32Array(this.maxCount)
    const colors = new Float32Array(this.maxCount * 3)
    const { layout, color } = PARTICLE

    for (let i = 0; i < this.maxCount; i += 1) {
      const angle = Math.random() * Math.PI * 2
      const radius = layout.baseRadius + Math.random() * layout.radiusVariance
      const x = Math.cos(angle) * radius * layout.xMultiplier
      const y = Math.sin(angle) * radius
      const offset = i * 3

      positions[offset] = x
      positions[offset + 1] = y
      positions[offset + 2] = -Math.random() * SPACE.particleDepth
      seeds[i] = Math.random()

      const pick = Math.random()
      let rgb: readonly [number, number, number]
      if (pick > color.threshold1) rgb = color.purple
      else if (pick > color.threshold2) rgb = color.cyan
      else rgb = color.blue

      colors[offset] = rgb[0]
      colors[offset + 1] = rgb[1]
      colors[offset + 2] = rgb[2]
    }

    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
    geometry.setAttribute('aColor', new BufferAttribute(colors, 3))
    return geometry
  }

  private createMaterial(): ShaderMaterial {
    const { particleDepth } = SPACE
    const { uniforms } = PARTICLE

    return new ShaderMaterial({
      uniforms: {
        uDepth: { value: particleDepth },
        uFlow: { value: uniforms.flow },
        uHeightPx: { value: this.props.rtHeight },
        uSize: { value: uniforms.size },
        uSpeed: { value: uniforms.speed },
        uTime: { value: 0 },
      },
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: AdditiveBlending,
      glslVersion: GLSL3,
    })
  }
}
