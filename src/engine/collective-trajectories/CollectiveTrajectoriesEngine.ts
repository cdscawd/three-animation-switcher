import WebGPU from 'three/addons/capabilities/WebGPU.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  Clock,
  Color,
  Group,
  Line,
  LineSegments,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Scene,
  Sprite,
  WebGPURenderer,
} from 'three/webgpu'
import type { ParamValues } from '../../params'
import type { BackgroundEngine } from '../types'
import { applyCollectiveUniformParams } from './applyParams'
import { CollectiveTrajectoriesAudio } from './audio'
import { DEFAULT_STRAND_COUNT } from './config'
import { createField, type CollectiveField } from './gpgpu'
import { createCoreSphere } from './layers/coreSphere'
import { createGlow } from './layers/glow'
import { createLines } from './layers/lines'
import { createRipples } from './layers/ripples'
import { createShell } from './layers/shell'
import { uAudioReact, uRadius, uShellRadius, uTime } from './uniforms'

function disposeObject3D(object: Object3D): void {
  object.traverse((child) => {
    if (
      child instanceof Mesh ||
      child instanceof Sprite ||
      child instanceof Line ||
      child instanceof LineSegments
    ) {
      child.geometry?.dispose()
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose())
      } else {
        child.material?.dispose()
      }
    }
  })
}

/** Matches [jeonghopark.de/collectivetrajectories](https://jeonghopark.de/collectivetrajectories/) — WebGPU + TSL GPGPU */
export class CollectiveTrajectoriesEngine implements BackgroundEngine {
  private readonly containerEl: HTMLElement
  private readonly canvas: HTMLCanvasElement
  private readonly scene: Scene
  private readonly camera: PerspectiveCamera
  private readonly renderer: WebGPURenderer
  private readonly controls: OrbitControls
  private readonly clock = new Clock(false)
  private readonly audio = new CollectiveTrajectoriesAudio()
  private readonly strandGroup = new Group()
  private shell: Sprite | null = null
  private coreSphere: Group | null = null

  private disposed = false
  private initialized = false
  private strandCount = DEFAULT_STRAND_COUNT
  private resolutionScale = 1
  private audioPlay = true
  private field: CollectiveField | null = null
  private layers: Object3D[] = []
  private resizeObserver: ResizeObserver | null = null

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) {
      this.clock.stop()
      this.renderer.setAnimationLoop(null)
    } else if (this.initialized) {
      this.clock.start()
      this.renderer.setAnimationLoop(this.renderFrame)
    }
  }

  constructor({ containerEl }: { containerEl: HTMLElement }) {
    this.containerEl = containerEl
    this.canvas = document.createElement('canvas')

    this.scene = new Scene()
    this.scene.background = new Color('#001010')

    this.camera = new PerspectiveCamera(50, 1, 0.1, 100)
    this.camera.position.set(0, 0, 12)

    this.renderer = new WebGPURenderer({ canvas: this.canvas, antialias: true })
    this.renderer.toneMapping = 0

    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.4

    this.scene.add(this.strandGroup)
  }

  applyParams(params: ParamValues): void {
    applyCollectiveUniformParams(params)

    if (typeof params.autoRotate === 'boolean') {
      this.controls.autoRotate = params.autoRotate
    }
    if (typeof params.resolutionScale === 'number') {
      this.resolutionScale = params.resolutionScale
      this.applySize()
    }
    if (typeof params.audioVolume === 'number') {
      this.audio.setVolume(params.audioVolume)
    }
    if (typeof params.audioPlay === 'boolean') {
      this.audioPlay = params.audioPlay
      this.audio.setPlaying(params.audioPlay)
    }
    if (typeof params.strandCount === 'number') {
      const next = Math.round(params.strandCount)
      if (next !== this.strandCount) {
        this.strandCount = next
        if (this.initialized) void this.rebuild(next)
      }
    }
  }

  load(): void {
    const canvas = this.canvas
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.pointerEvents = 'none'

    this.containerEl.appendChild(canvas)
    this.applySize()

    this.resizeObserver = new ResizeObserver(() => this.applySize())
    this.resizeObserver.observe(this.containerEl)
    document.addEventListener('visibilitychange', this.onVisibilityChange)

    void this.init()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.renderer.setAnimationLoop(null)
    this.resizeObserver?.disconnect()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.controls.dispose()
    this.audio.dispose()

    this.clearStrandLayers()
    if (this.shell) {
      this.scene.remove(this.shell)
      disposeObject3D(this.shell)
      this.shell = null
    }
    if (this.coreSphere) {
      this.scene.remove(this.coreSphere)
      disposeObject3D(this.coreSphere)
      this.coreSphere = null
    }

    this.renderer.dispose()
    this.canvas.remove()
  }

  private async init(): Promise<void> {
    try {
      if (!WebGPU.isAvailable()) {
        throw new Error('WebGPU is not available in this browser.')
      }

      await this.renderer.init()
      if (this.disposed) return

      this.shell = createShell()
      this.coreSphere = createCoreSphere()
      this.scene.add(this.shell, this.coreSphere)

      await this.rebuild(this.strandCount)
      if (this.disposed) return

      this.initialized = true
      this.clock.start()
      if (this.audioPlay) {
        this.audio.setPlaying(true)
      }
      this.renderer.setAnimationLoop(this.renderFrame)
    } catch (error) {
      console.error('[CollectiveTrajectoriesEngine]', error)
      if (!this.disposed) {
        this.showInitError(error)
      }
    }
  }

  private showInitError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    const note = document.createElement('p')
    note.style.cssText =
      'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:1rem;color:#8af;font-family:system-ui;text-align:center;pointer-events:none'
    note.textContent = `Collective Trajectories failed to start: ${message}`
    this.containerEl.appendChild(note)
  }

  private readonly renderFrame = (): void => {
    if (this.disposed || !this.field) return

    uTime.value = this.clock.getElapsedTime()
    uShellRadius.value = uRadius.value + this.audio.getLevel() * uAudioReact.value
    this.controls.update()

    void this.renderer
      .computeAsync(this.field.computeUpdate as Parameters<WebGPURenderer['computeAsync']>[0])
      .then(() => this.renderer.renderAsync(this.scene, this.camera))
  }

  private clearStrandLayers(): void {
    for (const layer of this.layers) {
      this.strandGroup.remove(layer)
      disposeObject3D(layer)
    }
    this.layers = []
  }

  private buildField(strandCount: number): void {
    this.clearStrandLayers()
    this.field = createField(strandCount)
    this.layers = [
      createLines(this.field),
      createGlow(this.field),
      createRipples(this.field),
    ]
    this.strandGroup.add(...this.layers)
  }

  private async rebuild(strandCount: number): Promise<void> {
    this.strandCount = strandCount
    this.buildField(strandCount)
    if (this.field) {
      await this.renderer.computeAsync(
        this.field.computeStrandInit as Parameters<WebGPURenderer['computeAsync']>[0],
      )
    }
  }

  private applySize(): void {
    const width = Math.max(1, this.containerEl.clientWidth | 0)
    const height = Math.max(1, this.containerEl.clientHeight | 0)
    const dpr = window.devicePixelRatio || 1
    const pixelRatio = Math.max(1, Math.min(2, dpr * this.resolutionScale))

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(width, height)
    this.renderer.setClearColor('#000000', 1)
  }
}
