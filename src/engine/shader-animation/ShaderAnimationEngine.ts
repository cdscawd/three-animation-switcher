import {
  Camera,
  LinearSRGBColorSpace,
  Mesh,
  NoToneMapping,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import fragmentShader from './shaders/shader-animation.frag.glsl?raw'
import vertexShader from './shaders/shader-animation.vert.glsl?raw'
import type { ParamValues } from '../../params'

const DEFAULT_PARAMS = {
  timeSpeed: 0.05,
  resolutionScale: 1,
}

function getPixelRatio(resolutionScale: number): number {
  const dpr = window.devicePixelRatio || 1
  return Math.max(1, Math.min(2, dpr * resolutionScale))
}

/** Matches 21st.dev designali-in/shader-animation bundle */
export class ShaderAnimationEngine {
  private readonly containerEl: HTMLElement
  private disposed = false
  private isLooping = false
  private time = 1
  private timeSpeed = DEFAULT_PARAMS.timeSpeed
  private resolutionScale = DEFAULT_PARAMS.resolutionScale
  private readonly renderer: WebGLRenderer
  private readonly scene: Scene
  private readonly camera: Camera
  private readonly material: ShaderMaterial
  private readonly mesh: Mesh

  private readonly onRender = (): void => {
    if (this.disposed) return
    this.time += this.timeSpeed
    this.material.uniforms.time.value = this.time
    this.renderer.render(this.scene, this.camera)
  }

  private readonly onResize = (): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    const pixelRatio = getPixelRatio(this.resolutionScale)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(width, height, false)
    this.material.uniforms.resolution.value.set(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
    )
    this.startLoop()
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

  constructor({ containerEl }: { containerEl: HTMLElement }) {
    this.containerEl = containerEl

    this.renderer = new WebGLRenderer({ antialias: true, alpha: false })
    this.renderer.outputColorSpace = LinearSRGBColorSpace
    this.renderer.toneMapping = NoToneMapping
    this.renderer.setClearColor(0x000000, 1)

    this.scene = new Scene()
    this.camera = new Camera()
    this.camera.position.z = 1

    this.material = new ShaderMaterial({
      uniforms: {
        time: { value: 1 },
        resolution: { value: new Vector2(1, 1) },
      },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material)
    this.scene.add(this.mesh)
  }

  applyParams(params: ParamValues): void {
    if (typeof params.timeSpeed === 'number') {
      this.timeSpeed = params.timeSpeed
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
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    domElement.addEventListener('webglcontextlost', this.onContextLost)
    domElement.addEventListener('webglcontextrestored', this.onContextRestored)
  }

  private removeEventListeners(): void {
    const { domElement } = this.renderer
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    domElement.removeEventListener('webglcontextlost', this.onContextLost)
    domElement.removeEventListener('webglcontextrestored', this.onContextRestored)
  }
}
