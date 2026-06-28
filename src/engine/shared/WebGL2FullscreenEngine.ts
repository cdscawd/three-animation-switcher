import type { BackgroundEngine } from '../types'
import type { ParamValues } from '../../params'
import vertexShader from './webgl2.vert.glsl?raw'

export interface WebGL2FullscreenEngineOptions {
  containerEl: HTMLElement
  fragmentShader: string
  label?: string
  /** Cap effective device pixel ratio (default 2). */
  maxPixelRatio?: number
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'Shader compile failed'
    gl.deleteShader(shader)
    throw new Error(log)
  }
  return shader
}

function linkProgram(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram()!
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'Program link failed'
    gl.deleteProgram(program)
    throw new Error(log)
  }
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  return program
}

/** Raw WebGL2 fullscreen shader — matches 21st.dev ShaderCanvas bundles */
export class WebGL2FullscreenEngine implements BackgroundEngine {
  private readonly containerEl: HTMLElement
  private readonly fragmentSource: string
  private readonly maxPixelRatio: number
  private readonly canvas: HTMLCanvasElement
  private gl!: WebGL2RenderingContext
  private program!: WebGLProgram
  private vao!: WebGLVertexArrayObject
  private buffer!: WebGLBuffer
  private iResolutionLoc: WebGLUniformLocation | null = null
  private iTimeLoc: WebGLUniformLocation | null = null
  private iFrameLoc: WebGLUniformLocation | null = null
  private rafId = 0
  private startTime = 0
  private frame = 0
  private disposed = false
  private sizeScheduled = false
  private resolutionScale = 1
  private timeScale = 1
  private resizeObserver: ResizeObserver | null = null

  private readonly onResize = (): void => {
    this.scheduleSize()
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopLoop()
    else {
      this.startTime = performance.now()
      this.startLoop()
    }
  }

  private readonly onContextLost = (event: Event): void => {
    event.preventDefault()
    this.stopLoop()
  }

  private readonly onContextRestored = (): void => {
    this.scheduleSize()
    this.startTime = performance.now()
    this.frame = 0
    this.startLoop()
  }

  private readonly tick = (timestamp: number): void => {
    if (this.disposed) return
    if (this.gl.isContextLost()) {
      this.rafId = requestAnimationFrame(this.tick)
      return
    }

    const time = ((timestamp - this.startTime) / 1000) * this.timeScale
    this.frame += 1
    const dpr = this.getDpr()

    this.gl.useProgram(this.program)
    if (this.sizeScheduled) this.applySize()

    this.gl.uniform3f(
      this.iResolutionLoc,
      this.canvas.width,
      this.canvas.height,
      dpr,
    )
    if (this.iTimeLoc) this.gl.uniform1f(this.iTimeLoc, time)
    if (this.iFrameLoc) this.gl.uniform1i(this.iFrameLoc, this.frame)

    this.gl.bindVertexArray(this.vao)
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3)

    this.rafId = requestAnimationFrame(this.tick)
  }

  constructor({
    containerEl,
    fragmentShader,
    maxPixelRatio = 2,
  }: WebGL2FullscreenEngineOptions) {
    this.containerEl = containerEl
    this.fragmentSource = fragmentShader
    this.maxPixelRatio = maxPixelRatio
    this.canvas = document.createElement('canvas')
  }

  applyParams(params: ParamValues): void {
    if (typeof params.timeScale === 'number') {
      this.timeScale = params.timeScale
    }
    if (typeof params.resolutionScale === 'number') {
      this.resolutionScale = params.resolutionScale
      this.scheduleSize()
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

    const gl = canvas.getContext('webgl2', { premultipliedAlpha: false })
    if (!gl) {
      throw new Error('WebGL2 is required for this shader.')
    }
    this.gl = gl

    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, this.fragmentSource)
    this.program = linkProgram(gl, vs, fs)

    this.vao = gl.createVertexArray()!
    gl.bindVertexArray(this.vao)

    this.buffer = gl.createBuffer()!
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

    this.iResolutionLoc = gl.getUniformLocation(this.program, 'iResolution')
    this.iTimeLoc = gl.getUniformLocation(this.program, 'iTime')
    this.iFrameLoc = gl.getUniformLocation(this.program, 'iFrame')

    this.startTime = performance.now()
    this.frame = 0
    this.applySize()
    this.addEventListeners()
    this.startLoop()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.stopLoop()
    this.removeEventListeners()

    const gl = this.gl
    gl.deleteBuffer(this.buffer)
    gl.deleteVertexArray(this.vao)
    gl.deleteProgram(this.program)
    this.canvas.remove()
  }

  private getDpr(): number {
    const dpr = window.devicePixelRatio || 1
    return Math.max(1, Math.min(this.maxPixelRatio, dpr * this.resolutionScale))
  }

  private scheduleSize(): void {
    if (this.sizeScheduled) return
    this.sizeScheduled = true
    requestAnimationFrame(() => {
      this.sizeScheduled = false
      if (this.disposed) return
      this.applySize()
    })
  }

  private applySize(): void {
    const dpr = this.getDpr()
    const width = Math.max(1, this.containerEl.clientWidth | 0)
    const height = Math.max(1, this.containerEl.clientHeight | 0)
    const canvasWidth = Math.max(1, Math.floor(width * dpr))
    const canvasHeight = Math.max(1, Math.floor(height * dpr))

    if (
      this.canvas.width !== canvasWidth ||
      this.canvas.height !== canvasHeight
    ) {
      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.gl.viewport(0, 0, canvasWidth, canvasHeight)
    }
  }

  private startLoop(): void {
    if (this.disposed || this.rafId !== 0) return
    this.rafId = requestAnimationFrame(this.tick)
  }

  private stopLoop(): void {
    if (this.rafId !== 0) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
  }

  private addEventListeners(): void {
    this.resizeObserver = new ResizeObserver(() => this.scheduleSize())
    this.resizeObserver.observe(this.containerEl)

    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.canvas.addEventListener('webglcontextlost', this.onContextLost)
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored)
  }

  private removeEventListeners(): void {
    this.resizeObserver?.disconnect()
    this.resizeObserver = null

    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener(
      'webglcontextrestored',
      this.onContextRestored,
    )
  }
}
