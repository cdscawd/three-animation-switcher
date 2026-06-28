import { WebGL2FullscreenEngine } from '../shared/WebGL2FullscreenEngine'
import fragmentShader from './shaders/fireflies.frag.glsl?raw'

/** Matches 21st.dev larsen66/fireflies-1 bundle (ShaderCanvas) */
export class FirefliesShaderEngine extends WebGL2FullscreenEngine {
  constructor({ containerEl }: { containerEl: HTMLElement }) {
    super({ containerEl, fragmentShader })
  }
}
