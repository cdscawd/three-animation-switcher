import { WebGL2FullscreenEngine } from '../shared/WebGL2FullscreenEngine'
import fragmentShader from './shaders/radial-shader.frag.glsl?raw'

export class RadialShaderEngine extends WebGL2FullscreenEngine {
  constructor({ containerEl }: { containerEl: HTMLElement }) {
    super({ containerEl, fragmentShader })
  }
}
