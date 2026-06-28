import gsap from 'gsap'
import { Timer, Vector2, type WebGLRenderer } from 'three'
import { MOBILE_MQ } from './config/media'
import { SceneRenderer } from './core/SceneRenderer'
import { SpaceManager } from './space/SpaceManager'
import { debounce, getPixelRatio, getWinSize } from './utils/dom'
import type { CyberspaceBackgroundEngineOptions } from './types'
import type { ParamValues } from '../../params'

const RT_CAP = 2048
const IMMERSE_EASE = 'power3.inOut'

export class CyberspaceBackgroundEngine {
  private readonly containerEl: HTMLElement
  private disposed = false
  private isLooping = false
  private readonly timer: Timer
  private readonly renderer: SceneRenderer
  private readonly webgl: WebGLRenderer
  private readonly spaceManager: SpaceManager
  private readonly diveProgress = { value: 0 }
  private readonly debouncedResize: () => void
  private readonly onRender: () => void
  private readonly onResize: () => void
  private readonly onMqChange: () => void
  private readonly onVisibilityChange: () => void
  private readonly onContextLost: (event: Event) => void
  private readonly onContextRestored: () => void
  private readonly onPointerMove: (event: PointerEvent) => void
  private immerseDuration = 1.4

  constructor({ containerEl }: CyberspaceBackgroundEngineOptions) {
    this.containerEl = containerEl

    const winSize = getWinSize()
    const aspect = winSize.wd / winSize.wh

    this.timer = new Timer()
    this.renderer = new SceneRenderer({ winSize, antialias: false })
    this.webgl = this.renderer.getRenderer()
    this.webgl.setClearColor(0x000000, 1)

    this.spaceManager = new SpaceManager({
      aspect,
      isLowPower: MOBILE_MQ.matches,
    })

    this.spaceManager.setReduced(true)
    this.spaceManager.setDive(0)

    this.debouncedResize = debounce(() => this.handleResize(), 150)

    this.onRender = () => {
      if (this.disposed) return

      this.timer.update()
      const elapsed = this.timer.getElapsed()
      this.spaceManager.update(elapsed)
      this.webgl.render(this.spaceManager.scene, this.spaceManager.camera)
    }

    this.onResize = () => {
      const nextWinSize = getWinSize()
      this.renderer.resize({ winSize: nextWinSize })
      this.resizeSpaceTarget()
      this.startLoop()
      this.debouncedResize()
    }

    this.onMqChange = () => {
      this.spaceManager.setLowPower(MOBILE_MQ.matches)
      this.onResize()
    }

    this.onVisibilityChange = () => {
      if (document.hidden) this.stopLoop()
      else this.startLoop()
    }

    this.onContextLost = (event) => {
      event.preventDefault()
      this.stopLoop()
    }

    this.onContextRestored = () => this.startLoop()

    this.onPointerMove = (event) => {
      const nextWinSize = getWinSize()
      const x = event.clientX / nextWinSize.wd - 0.5
      const y = event.clientY / nextWinSize.wh - 0.5
      this.spaceManager.setParallax(x, y)
      this.startLoop()
    }
  }

  load(): void {
    if (!this.containerEl) return

    const canvas = this.webgl.domElement
    canvas.style.position = 'absolute'
    canvas.style.inset = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    canvas.style.pointerEvents = 'none'

    this.containerEl.appendChild(canvas)
    this.webgl.setPixelRatio(getPixelRatio())
    this.resizeSpaceTarget()
    this.addEventListeners()
    this.startLoop()
    this.playEnterAnimation()
  }

  private playEnterAnimation(): void {
    gsap.killTweensOf(this.diveProgress)
    gsap.to(this.diveProgress, {
      value: 1,
      duration: this.immerseDuration,
      ease: IMMERSE_EASE,
      onUpdate: () => {
        this.spaceManager.setDive(this.diveProgress.value)
        this.startLoop()
      },
    })
  }

  applyParams(params: ParamValues): void {
    this.spaceManager.applyParams(params)
    if (typeof params.immerseDuration === 'number') {
      this.immerseDuration = params.immerseDuration
    }
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    gsap.killTweensOf(this.diveProgress)
    this.stopLoop()
    this.removeEventListeners()
    this.webgl.domElement.remove()
    this.webgl.dispose()
    this.spaceManager.renderTarget.dispose()
  }

  private resizeSpaceTarget(): void {
    const size = this.webgl.getDrawingBufferSize(new Vector2())
    let width = Math.round(size.x)
    let height = Math.round(size.y)

    if (width > RT_CAP) {
      height = Math.round((height * RT_CAP) / width)
      width = RT_CAP
    }

    this.spaceManager.resize(width, height)
    this.spaceManager.setAspect(width / height)
  }

  private handleResize(): void {
    const ratio = getPixelRatio()
    if (ratio === this.webgl.getPixelRatio()) return

    this.webgl.setPixelRatio(ratio)
    this.renderer.resize({ winSize: getWinSize() })
    this.resizeSpaceTarget()
    this.startLoop()
  }

  private startLoop(): void {
    if (this.isLooping || this.disposed) return
    this.isLooping = true
    this.webgl.setAnimationLoop(this.onRender)
  }

  private stopLoop(): void {
    if (!this.isLooping) return
    this.isLooping = false
    this.webgl.setAnimationLoop(null)
  }

  private addEventListeners(): void {
    const { domElement } = this.webgl

    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointerMove)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    domElement.addEventListener('webglcontextlost', this.onContextLost)
    domElement.addEventListener('webglcontextrestored', this.onContextRestored)
    MOBILE_MQ.addEventListener('change', this.onMqChange)
  }

  private removeEventListeners(): void {
    const { domElement } = this.webgl

    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    domElement.removeEventListener('webglcontextlost', this.onContextLost)
    domElement.removeEventListener('webglcontextrestored', this.onContextRestored)
    MOBILE_MQ.removeEventListener('change', this.onMqChange)
  }
}
