import {
  ACESFilmicToneMapping,
  Camera,
  LinearSRGBColorSpace,
  Mesh,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import fragmentShader from './shaders/kaleidoscope.frag.glsl?raw'
import vertexShader from './shaders/kaleidoscope.vert.glsl?raw'
import type { ParamValues } from '../../params'

export interface KaleidoscopeEngineOptions {
  containerEl: HTMLElement
}

const DEFAULT_PARAMS = {
  timeSpeed: 0.01,
  segments: 7,
  colorIntensity: 0.4,
  bloomStrength: 0,
  morphAmount: 0,
  rotationSpeed: 0.05,
  mouseInfluence: 0,
  resolutionScale: 0.25,
}

function getPixelRatio(resolutionScale: number): number {
  const dpr = window.devicePixelRatio || 1
  return Math.max(1, Math.min(2, dpr * resolutionScale))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export class KaleidoscopeEngine {
  private readonly containerEl: HTMLElement
  private disposed = false
  private isLooping = false
  private time = 0
  private timeSpeed = DEFAULT_PARAMS.timeSpeed
  private segments = DEFAULT_PARAMS.segments
  private colorIntensity = DEFAULT_PARAMS.colorIntensity
  private bloomStrength = DEFAULT_PARAMS.bloomStrength
  private morphAmount = DEFAULT_PARAMS.morphAmount
  private rotationSpeed = DEFAULT_PARAMS.rotationSpeed
  private mouseInfluence = DEFAULT_PARAMS.mouseInfluence
  private resolutionScale = DEFAULT_PARAMS.resolutionScale
  private readonly mouseTarget = new Vector2(0, 0)
  private readonly mouseSmooth = new Vector2(0, 0)
  private readonly renderer: WebGLRenderer
  private readonly scene: Scene
  private readonly camera: Camera
  private readonly material: ShaderMaterial
  private readonly mesh: Mesh
  private readonly composer: EffectComposer
  private readonly bloomPass: UnrealBloomPass

  private readonly onRender = (): void => {
    if (this.disposed) return

    this.time += this.timeSpeed
    this.mouseSmooth.x = lerp(this.mouseSmooth.x, this.mouseTarget.x, 0.08)
    this.mouseSmooth.y = lerp(this.mouseSmooth.y, this.mouseTarget.y, 0.08)

    const uniforms = this.material.uniforms
    uniforms.time.value = this.time
    uniforms.mouse.value.copy(this.mouseSmooth)
    uniforms.segments.value = this.segments
    uniforms.colorIntensity.value = this.colorIntensity
    uniforms.morphAmount.value = this.morphAmount
    uniforms.rotationSpeed.value = this.rotationSpeed

    this.bloomPass.strength = this.bloomStrength
    this.composer.render()
  }

  private readonly onResize = (): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    const pixelRatio = getPixelRatio(this.resolutionScale)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(width, height, false)
    this.composer.setSize(width, height)
    this.bloomPass.setSize(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
    )
    this.material.uniforms.resolution.value.set(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
    )
    this.startLoop()
  }

  private readonly onPointerMove = (event: PointerEvent): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    const x = (event.clientX / width) * 2 - 1
    const y = -(event.clientY / height) * 2 + 1
    this.mouseTarget.set(x * this.mouseInfluence, y * this.mouseInfluence)
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop()
    else this.startLoop()
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault()
    this.stopLoop()
  }

  private readonly onContextRestored = (): void => {
    this.startLoop()
  }

  constructor({ containerEl }: KaleidoscopeEngineOptions) {
    this.containerEl = containerEl

    this.renderer = new WebGLRenderer({ antialias: false, alpha: false })
    this.renderer.outputColorSpace = LinearSRGBColorSpace
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    this.renderer.setClearColor(0x000000, 1)

    this.scene = new Scene()
    this.camera = new Camera()
    this.camera.position.z = 1

    this.material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new Vector2(1, 1) },
        mouse: { value: new Vector2(0, 0) },
        segments: { value: DEFAULT_PARAMS.segments },
        colorIntensity: { value: DEFAULT_PARAMS.colorIntensity },
        morphAmount: { value: DEFAULT_PARAMS.morphAmount },
        rotationSpeed: { value: DEFAULT_PARAMS.rotationSpeed },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material)
    this.scene.add(this.mesh)

    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloomPass = new UnrealBloomPass(
      new Vector2(1, 1),
      DEFAULT_PARAMS.bloomStrength,
      0.45,
      0.15,
    )
    this.composer.addPass(this.bloomPass)
  }

  applyParams(params: ParamValues): void {
    if (typeof params.timeSpeed === 'number') {
      this.timeSpeed = params.timeSpeed
    }
    if (typeof params.segments === 'number') {
      this.segments = Math.round(Math.max(6, Math.min(8, params.segments)))
    }
    if (typeof params.colorIntensity === 'number') {
      this.colorIntensity = params.colorIntensity
    }
    if (typeof params.bloomStrength === 'number') {
      this.bloomStrength = params.bloomStrength
    }
    if (typeof params.morphAmount === 'number') {
      this.morphAmount = params.morphAmount
    }
    if (typeof params.rotationSpeed === 'number') {
      this.rotationSpeed = params.rotationSpeed
    }
    if (typeof params.mouseInfluence === 'number') {
      this.mouseInfluence = params.mouseInfluence
    }
    if (typeof params.resolutionScale === 'number') {
      this.resolutionScale = params.resolutionScale
      this.onResize()
    }
  }

  load(): void {
    const canvas = this.renderer.domElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.pointerEvents = 'none'

    this.containerEl.appendChild(canvas)
    this.renderer.compile(this.scene, this.camera)
    this.onResize()
    this.addEventListeners()
    this.startLoop()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.stopLoop()
    this.removeEventListeners()
    this.composer.dispose()
    this.bloomPass.dispose()
    this.mesh.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  private startLoop(): void {
    if (this.isLooping || this.disposed) return
    this.isLooping = true
    this.renderer.setAnimationLoop(this.onRender)
  }

  private stopLoop(): void {
    if (!this.isLooping) return
    this.isLooping = false
    this.renderer.setAnimationLoop(null)
  }

  private addEventListeners(): void {
    const { domElement } = this.renderer
    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    domElement.addEventListener('webglcontextlost', this.onContextLost)
    domElement.addEventListener('webglcontextrestored', this.onContextRestored)
  }

  private removeEventListeners(): void {
    const { domElement } = this.renderer
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    domElement.removeEventListener('webglcontextlost', this.onContextLost)
    domElement.removeEventListener('webglcontextrestored', this.onContextRestored)
  }
}
