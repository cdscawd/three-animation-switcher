import { WebGL2FullscreenEngine } from '../shared/WebGL2FullscreenEngine'
import fragmentShader from './shaders/launch.frag.glsl?raw'

export class LaunchShaderEngine extends WebGL2FullscreenEngine {
  constructor({ containerEl }: { containerEl: HTMLElement }) {
    super({ containerEl, fragmentShader, maxPixelRatio: 1.5 })
  }
}
