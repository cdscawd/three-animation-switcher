import {
  Color,
  IcosahedronGeometry,
  LinearSRGBColorSpace,
  Mesh,
  NoToneMapping,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three'
import fragmentShader from './shaders/anomalous-matter.frag.glsl?raw'
import vertexShader from './shaders/anomalous-matter.vert.glsl?raw'
import type { ParamValues } from '../../params'

const DEFAULT_COLOR = 0x7dd3fc

/** Matches 21st.dev dhileepkumargm/anomalous-matter-hero bundle */
export class AnomalousMatterEngine {
  private readonly containerEl: HTMLElement
  private disposed = false
  private rafId = 0
  private rotationSpeed = 0.0005
  private timeScale = 0.0003
  private readonly renderer: WebGLRenderer
  private readonly scene: Scene
  private readonly camera: PerspectiveCamera
  private readonly material: ShaderMaterial
  private readonly mesh: Mesh
  private readonly pointLightPosition = new Vector3(0, 0, 5)

  private readonly onRender = (timestamp: number): void => {
    if (this.disposed) return

    this.material.uniforms.time.value = timestamp * this.timeScale
    this.mesh.rotation.y += this.rotationSpeed
    this.mesh.rotation.x += this.rotationSpeed
    this.renderer.render(this.scene, this.camera)
    this.rafId = requestAnimationFrame(this.onRender)
  }

  private readonly onResize = (): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
  }

  private readonly onMouseMove = (event: MouseEvent): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    const x = (event.clientX / width) * 2 - 1
    const y = -(event.clientY / height) * 2 + 1
    const direction = new Vector3(x, y, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position)
      .normalize()
    const distance = -this.camera.position.z / direction.z
    this.pointLightPosition.copy(this.camera.position).add(direction.multiplyScalar(distance))
    this.material.uniforms.pointLightPosition.value.copy(this.pointLightPosition)
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop()
    else this.startLoop()
  }

  constructor({ containerEl }: { containerEl: HTMLElement }) {
    this.containerEl = containerEl

    this.renderer = new WebGLRenderer({ antialias: true, alpha: false })
    this.renderer.outputColorSpace = LinearSRGBColorSpace
    this.renderer.toneMapping = NoToneMapping
    this.renderer.setClearColor(0x000000, 1)

    this.scene = new Scene()
    this.camera = new PerspectiveCamera(75, 1, 0.1, 1000)
    this.camera.position.z = 5

    this.material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPosition: { value: this.pointLightPosition.clone() },
        color: { value: new Color(DEFAULT_COLOR) },
      },
      vertexShader,
      fragmentShader,
      wireframe: true,
    })

    this.mesh = new Mesh(new IcosahedronGeometry(1.2, 64), this.material)
    this.scene.add(this.mesh)
  }

  applyParams(params: ParamValues): void {
    if (typeof params.rotationSpeed === 'number') {
      this.rotationSpeed = params.rotationSpeed
    }
    if (typeof params.timeScale === 'number') {
      this.timeScale = params.timeScale
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
    this.onResize()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.startLoop()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.stopLoop()
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.mesh.geometry.dispose()
    this.material.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }

  private startLoop(): void {
    if (this.disposed || this.rafId !== 0) return
    this.rafId = requestAnimationFrame(this.onRender)
  }

  private stopLoop(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }
}
