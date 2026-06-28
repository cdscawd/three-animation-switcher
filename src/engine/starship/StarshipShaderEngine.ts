import {
  Clock,
  DataTexture,
  GLSL3,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RepeatWrapping,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  WebGLRenderer,
} from 'three'
import fragmentShader from './shaders/starship.frag.glsl?raw'
import vertexShader from './shaders/starship.vert.glsl?raw'
import type { ParamValues } from '../../params'

export interface StarshipShaderEngineOptions {
  containerEl: HTMLElement
}

const DEFAULT_PARAMS = {
  timeScale: 1,
  iterations: 50,
  stepSize: 0.02,
  accumDiv: 10000,
}

function createNoiseTexture(): DataTexture {
  const size = 256
  const data = new Uint8Array(size * size * 4)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.floor(Math.random() * 256)
  }

  const texture = new DataTexture(data, size, size, RGBAFormat, UnsignedByteType)
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.minFilter = NearestFilter
  texture.magFilter = NearestFilter
  texture.needsUpdate = true
  return texture
}

function getPixelRatio(): number {
  return Math.min(window.devicePixelRatio, 2)
}

/** Matches 21st.dev starship-shader bundle (Three.js + adapted XorDev shader) */
export class StarshipShaderEngine {
  private readonly containerEl: HTMLElement
  private disposed = false
  private isLooping = false
  private readonly clock = new Clock()
  private readonly noiseTexture = createNoiseTexture()
  private readonly renderer: WebGLRenderer
  private readonly scene: Scene
  private readonly camera: OrthographicCamera
  private readonly material: ShaderMaterial
  private readonly mesh: Mesh
  private readonly resolution = new Vector2()
  private timeScale = DEFAULT_PARAMS.timeScale

  private readonly onRender = (): void => {
    if (this.disposed) return

    this.material.uniforms.iTime.value =
      this.clock.getElapsedTime() * this.timeScale
    this.renderer.render(this.scene, this.camera)
  }

  private readonly onResize = (): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    this.renderer.setSize(width, height, false)
    this.renderer.setPixelRatio(getPixelRatio())
    this.resolution.set(
      this.renderer.domElement.width,
      this.renderer.domElement.height,
    )
    this.material.uniforms.iResolution.value.copy(this.resolution)
    this.startLoop()
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop()
    else {
      this.clock.start()
      this.startLoop()
    }
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault()
    this.stopLoop()
  }

  private readonly onContextRestored = (): void => {
    this.clock.start()
    this.startLoop()
  }

  constructor({ containerEl }: StarshipShaderEngineOptions) {
    this.containerEl = containerEl

    this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
    this.renderer.setClearColor(0x000000, 0)

    this.scene = new Scene()
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)

    this.material = new ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vector2(1, 1) },
        iChannel0: { value: this.noiseTexture },
        uIterations: { value: DEFAULT_PARAMS.iterations },
        uStepSize: { value: DEFAULT_PARAMS.stepSize },
        uAccumDiv: { value: DEFAULT_PARAMS.accumDiv },
      },
      vertexShader,
      fragmentShader,
      glslVersion: GLSL3,
      depthWrite: false,
      depthTest: false,
      transparent: false,
    })

    this.mesh = new Mesh(new PlaneGeometry(2, 2), this.material)
    this.scene.add(this.mesh)
  }

  applyParams(params: ParamValues): void {
    const { uniforms } = this.material

    if (typeof params.timeScale === 'number') {
      this.timeScale = params.timeScale
    }
    if (typeof params.iterations === 'number') {
      uniforms.uIterations.value = params.iterations
    }
    if (typeof params.stepSize === 'number') {
      uniforms.uStepSize.value = params.stepSize
    }
    if (typeof params.accumDiv === 'number') {
      uniforms.uAccumDiv.value = params.accumDiv
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
    this.noiseTexture.dispose()
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
