import { AmbientLight, PointLight } from 'three'
import { LIGHTS, SPACE } from '../config/space'
import { wrapZ } from '../utils/dom'
import type { SpaceLayer } from '../types'

export class SpaceLights implements SpaceLayer {
  private lightSpeed: number = SPACE.lightSpeed
  private readonly ambientLight: AmbientLight
  private readonly cyanLight: PointLight
  private readonly purpleLight: PointLight
  private readonly _objects: [AmbientLight, PointLight, PointLight]

  constructor() {
    this.ambientLight = this.createAmbientLight()
    this.cyanLight = this.createPointLight(
      LIGHTS.cyan.color,
      LIGHTS.cyan.intensity,
      LIGHTS.cyan.distance,
      LIGHTS.cyan.decay,
    )
    this.purpleLight = this.createPointLight(
      LIGHTS.purple.color,
      LIGHTS.purple.intensity,
      LIGHTS.purple.distance,
      LIGHTS.purple.decay,
    )
    this._objects = [this.ambientLight, this.cyanLight, this.purpleLight]
  }

  get objects() {
    return this._objects
  }

  update(time: number): void {
    const { frameHalf } = SPACE
    const x = frameHalf * LIGHTS.layout.ratioX
    const y = frameHalf * LIGHTS.layout.ratioY
    const z = -time * this.lightSpeed

    this.cyanLight.position.set(x, y, wrapZ(z))
    this.purpleLight.position.set(-x, -y, wrapZ(LIGHTS.layout.purpleOffsetZ + z))
  }

  setAmbientIntensity(intensity: number): void {
    this.ambientLight.intensity = intensity
  }

  setPointLightIntensity(intensity: number): void {
    this.cyanLight.intensity = intensity
    this.purpleLight.intensity = intensity
  }

  setLightSpeed(speed: number): void {
    this.lightSpeed = speed
  }

  private createAmbientLight(): AmbientLight {
    return new AmbientLight(LIGHTS.ambient.color, LIGHTS.ambient.intensity)
  }

  private createPointLight(
    color: string,
    intensity: number,
    distance: number,
    decay: number,
  ): PointLight {
    return new PointLight(color, intensity, distance, decay)
  }
}
