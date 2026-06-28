import {
  Color,
  FogExp2,
  LinearFilter,
  PerspectiveCamera,
  Scene,
  WebGLRenderTarget,
} from 'three'
import { SPACE } from '../config/space'
import { Particles } from './Particles'
import { SpaceLights } from './SpaceLights'
import { Tunnel } from './Tunnel'
import type { ParamValues } from '../../../params'
import type { SpaceLayer, SpaceManagerOptions } from '../types'

export class SpaceManager {
  private lastDive = -1
  private currentDiveProgress = 0
  private diveDistance: number = SPACE.diveDistance
  private fovPunch: number = SPACE.fovPunch
  private readonly prevMousePosition = { x: 0, y: 0 }
  private readonly mousePosition = { x: 0, y: 0 }
  private readonly defaultHeight: number
  private readonly _scene: Scene
  private readonly _camera: PerspectiveCamera
  private readonly baseFov: number
  private readonly _renderTarget: WebGLRenderTarget
  readonly particles: Particles | null
  private readonly layers: SpaceLayer[]
  private readonly spaceLights: SpaceLights
  private readonly tunnel: Tunnel

  constructor({ aspect, isLowPower = false, particlesEnabled = true }: SpaceManagerOptions) {
    const height = Math.round(SPACE.rtWidth / aspect)
    this.defaultHeight = height

    this._scene = new Scene()
    this._scene.background = new Color(0x000000)
    this._scene.fog = new FogExp2(0x000000, 0.028)

    this._camera = new PerspectiveCamera(60, aspect, 0.1, 200)
    this._camera.position.set(0, 0, 0)
    this.baseFov = this._camera.fov

    this._renderTarget = new WebGLRenderTarget(SPACE.rtWidth, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      depthBuffer: true,
    })

    this.particles = particlesEnabled
      ? new Particles({ rtHeight: height, isLowPower })
      : null

    this.spaceLights = new SpaceLights()
    this.tunnel = new Tunnel()

    this.layers = [
      this.spaceLights,
      this.tunnel,
      ...(this.particles ? [this.particles] : []),
    ]

    this.layers.forEach((layer) => this._scene.add(...layer.objects))
  }

  get texture() {
    return this._renderTarget.texture
  }

  get scene() {
    return this._scene
  }

  get camera() {
    return this._camera
  }

  get renderTarget() {
    return this._renderTarget
  }

  setAspect(aspect: number): void {
    if (this._camera.aspect !== aspect) {
      this._camera.aspect = aspect
      this._camera.updateProjectionMatrix()
    }
  }

  setDive(progress: number): void {
    this.currentDiveProgress = progress
    if (progress === this.lastDive) return
    this.lastDive = progress
    this._camera.position.z = -progress * this.diveDistance
    this._camera.fov = this.baseFov + progress * this.fovPunch
    this._camera.updateProjectionMatrix()
  }

  applyParams(params: ParamValues): void {
    let shouldRefreshDive = false

    if (typeof params.fogDensity === 'number') {
      const fog = this._scene.fog
      if (fog && 'density' in fog) {
        fog.density = params.fogDensity
      }
      this.tunnel.setFogDensity(params.fogDensity)
    }
    if (typeof params.particleSpeed === 'number') {
      this.particles?.setSpeed(params.particleSpeed)
    }
    if (typeof params.particleSize === 'number') {
      this.particles?.setSize(params.particleSize)
    }
    if (typeof params.particleFlow === 'number') {
      this.particles?.setFlow(params.particleFlow)
    }
    if (typeof params.diveDistance === 'number') {
      this.diveDistance = params.diveDistance
      shouldRefreshDive = true
    }
    if (typeof params.fovPunch === 'number') {
      this.fovPunch = params.fovPunch
      shouldRefreshDive = true
    }
    if (typeof params.pulseInterval === 'number') {
      this.tunnel.setPulseInterval(params.pulseInterval)
    }
    if (typeof params.ambientIntensity === 'number') {
      this.spaceLights.setAmbientIntensity(params.ambientIntensity)
    }
    if (typeof params.pointLightIntensity === 'number') {
      this.spaceLights.setPointLightIntensity(params.pointLightIntensity)
    }
    if (typeof params.lightSpeed === 'number') {
      this.spaceLights.setLightSpeed(params.lightSpeed)
    }

    if (shouldRefreshDive) {
      this.lastDive = -1
      this.setDive(this.currentDiveProgress)
    }
  }

  setParallax(x: number, y: number): void {
    this.prevMousePosition.x = x * 0.1
    this.prevMousePosition.y = y * 0.1
  }

  setReduced(reduced: boolean): void {
    this.layers.forEach((layer) => layer.setReduced?.(reduced))
  }

  setLowPower(lowPower: boolean): void {
    this.particles?.setLowPower(lowPower)
  }

  resize(width: number, height: number): void {
    this._renderTarget.setSize(width, height)
    this.particles?.setHeight(height)
  }

  update(time: number): void {
    this.layers.forEach((layer) => layer.update(time))

    this.mousePosition.x += (this.prevMousePosition.x - this.mousePosition.x) * 0.1
    this.mousePosition.y += (this.prevMousePosition.y - this.mousePosition.y) * 0.1
    this._camera.rotation.set(this.mousePosition.y, -this.mousePosition.x, 0)
  }

  resetResolution(): void {
    this.resize(SPACE.rtWidth, this.defaultHeight)
  }
}
