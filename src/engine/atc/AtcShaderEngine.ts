import { FullscreenShaderEngine } from '../shared/FullscreenShaderEngine'
import type { ParamValues } from '../../params'
import fragmentShader from './shaders/atc.frag.glsl?raw'
import vertexShader from './shaders/atc.vert.glsl?raw'

export interface AtcShaderEngineOptions {
  containerEl: HTMLElement
}

export class AtcShaderEngine extends FullscreenShaderEngine {
  constructor({ containerEl }: AtcShaderEngineOptions) {
    super({
      containerEl,
      clearColor: [0, 0, 0],
      alpha: 0,
      resolutionScale: 0.5,
      floatUniforms: {
        uIterations: 50,
        uTimeScale: 0.2,
        uIntensity: 0.2,
      },
    })
  }

  protected getVertexSource(): string {
    return vertexShader
  }

  protected getFragmentSource(): string {
    return fragmentShader
  }

  applyParams(params: ParamValues): void {
    super.applyParams({
      ...params,
      uIterations: params.iterations,
      uTimeScale: params.timeScale,
      uIntensity: params.intensity,
    })
  }
}
