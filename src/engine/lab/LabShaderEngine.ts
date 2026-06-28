import { WebGL2FullscreenEngine } from '../shared/WebGL2FullscreenEngine'
import fragmentShader from './shaders/lab.frag.glsl?raw'

export class LabShaderEngine extends WebGL2FullscreenEngine {
  constructor({ containerEl }: { containerEl: HTMLElement }) {
    super({ containerEl, fragmentShader })
  }
}
