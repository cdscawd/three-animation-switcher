export interface FullscreenShaderEngineOptions {
  containerEl: HTMLElement
  /** Canvas clear color RGB 0–1 */
  clearColor?: [number, number, number]
  /** Initial alpha uniform for shaders that use it */
  alpha?: number
  /** Internal canvas resolution multiplier (lower = chunkier pixels when upscaled) */
  resolutionScale?: number
  /** Named float uniforms declared in fragment shader */
  floatUniforms?: Record<string, number>
}

export abstract class FullscreenShaderEngine {
  protected readonly containerEl: HTMLElement
  protected readonly clearColor: [number, number, number]
  protected alpha: number
  protected resolutionScale: number
  protected readonly floatUniforms: Record<string, number>
  protected readonly floatUniformLocations: Record<string, WebGLUniformLocation | null> =
    {}
  protected disposed = false
  private isLooping = false
  private startTime = 0
  protected gl!: WebGLRenderingContext
  protected program!: WebGLProgram
  protected rLocation!: WebGLUniformLocation
  protected tLocation!: WebGLUniformLocation
  protected alphaLocation: WebGLUniformLocation | null = null
  private readonly canvas: HTMLCanvasElement

  private readonly onRender = (): void => {
    if (this.disposed) return

    const time = (performance.now() - this.startTime) * 0.001
    this.gl.useProgram(this.program)
    this.gl.uniform1f(this.tLocation, time)
    this.gl.uniform2f(
      this.rLocation,
      this.canvas.width,
      this.canvas.height,
    )
    if (this.alphaLocation) {
      this.gl.uniform1f(this.alphaLocation, this.alpha)
    }
    this.applyFloatUniforms()

    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  private readonly onResize = (): void => {
    const width = this.containerEl.clientWidth
    const height = this.containerEl.clientHeight
    if (width === 0 || height === 0) return

    const scale = this.resolutionScale
    this.canvas.width = Math.max(1, Math.floor(width * scale))
    this.canvas.height = Math.max(1, Math.floor(height * scale))
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
    this.startLoop()
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
    this.startTime = performance.now()
    this.startLoop()
  }

  constructor({
    containerEl,
    clearColor = [1, 1, 1],
    alpha = 255,
    resolutionScale = 1,
    floatUniforms = {},
  }: FullscreenShaderEngineOptions) {
    this.containerEl = containerEl
    this.clearColor = clearColor
    this.alpha = alpha
    this.resolutionScale = resolutionScale
    this.floatUniforms = { ...floatUniforms }
    this.canvas = document.createElement('canvas')
  }

  applyParams(params: Record<string, number | string | boolean>): void {
    if (typeof params.resolutionScale === 'number') {
      this.resolutionScale = params.resolutionScale
      this.onResize()
    }
    if (typeof params.alpha === 'number') {
      this.alpha = params.alpha
    }
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'number' && key in this.floatUniforms) {
        this.floatUniforms[key] = value
      }
    }
  }

  protected applyFloatUniforms(): void {
    if (!this.gl) return
    for (const [name, value] of Object.entries(this.floatUniforms)) {
      const location = this.floatUniformLocations[name]
      if (location) {
        this.gl.uniform1f(location, value)
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

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      throw new Error('Unable to initialize WebGL.')
    }
    this.gl = gl
    this.gl.clearColor(...this.clearColor, 1)

    const vertexShader = this.createShader(gl.VERTEX_SHADER, this.getVertexSource())
    const fragmentShader = this.createShader(
      gl.FRAGMENT_SHADER,
      this.getFragmentSource(),
    )
    this.program = this.createProgram(vertexShader, fragmentShader)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const aVertexPosition = gl.getAttribLocation(this.program, 'aVertexPosition')
    gl.enableVertexAttribArray(aVertexPosition)
    gl.vertexAttribPointer(aVertexPosition, 2, gl.FLOAT, false, 0, 0)

    this.rLocation = gl.getUniformLocation(this.program, 'r')!
    this.tLocation = gl.getUniformLocation(this.program, 't')!
    this.alphaLocation = gl.getUniformLocation(this.program, 'alpha')

    for (const name of Object.keys(this.floatUniforms)) {
      this.floatUniformLocations[name] = gl.getUniformLocation(this.program, name)
    }

    this.startTime = performance.now()
    this.onResize()
    this.addEventListeners()
    this.startLoop()
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true

    this.stopLoop()
    this.removeEventListeners()
    const { gl } = this
    gl.deleteProgram(this.program)
    this.canvas.remove()
  }

  protected abstract getVertexSource(): string
  protected abstract getFragmentSource(): string

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = this.gl.getShaderInfoLog(shader) ?? 'Shader compile failed'
      this.gl.deleteShader(shader)
      throw new Error(message)
    }
    return shader
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): WebGLProgram {
    const program = this.gl.createProgram()!
    this.gl.attachShader(program, vertexShader)
    this.gl.attachShader(program, fragmentShader)
    this.gl.linkProgram(program)
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        this.gl.getProgramInfoLog(program) ?? 'Shader program link failed',
      )
    }
    this.gl.deleteShader(vertexShader)
    this.gl.deleteShader(fragmentShader)
    return program
  }

  private startLoop(): void {
    if (this.isLooping || this.disposed) return
    this.isLooping = true
    const tick = (): void => {
      if (!this.isLooping) return
      this.onRender()
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  private stopLoop(): void {
    this.isLooping = false
  }

  private addEventListeners(): void {
    window.addEventListener('resize', this.onResize)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
    this.canvas.addEventListener('webglcontextlost', this.onContextLost)
    this.canvas.addEventListener('webglcontextrestored', this.onContextRestored)
  }

  private removeEventListeners(): void {
    window.removeEventListener('resize', this.onResize)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost)
    this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored)
  }
}
