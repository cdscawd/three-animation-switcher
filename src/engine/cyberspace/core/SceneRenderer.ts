import { WebGLRenderer } from 'three'
import type { SceneRendererOptions, WinSize } from '../types'

export class SceneRenderer {
  private readonly webGLRenderer: WebGLRenderer

  constructor({ winSize, antialias = true, maxPixelRatio = 2 }: SceneRendererOptions) {
    this.webGLRenderer = new WebGLRenderer({ alpha: true, antialias })
    this.webGLRenderer.setClearColor(0xffffff, 0)
    this.webGLRenderer.setSize(winSize.wd, winSize.wh)
    this.webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
  }

  getRenderer(): WebGLRenderer {
    return this.webGLRenderer
  }

  resize({ winSize }: { winSize: WinSize }): void {
    this.webGLRenderer.setSize(winSize.wd, winSize.wh)
  }
}
