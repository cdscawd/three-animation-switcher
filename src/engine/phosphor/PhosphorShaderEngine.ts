import { FullscreenShaderEngine } from '../shared/FullscreenShaderEngine'
import type { ParamValues } from '../../params'
import fragmentShader from './shaders/phosphor.frag.glsl?raw'
import vertexShader from './shaders/phosphor.vert.glsl?raw'

export interface PhosphorShaderEngineOptions {
  containerEl: HTMLElement
}

export class PhosphorShaderEngine extends FullscreenShaderEngine {
  constructor({ containerEl }: PhosphorShaderEngineOptions) {
    super({
      containerEl,
      clearColor: [0, 0, 0],
      alpha: 0,
      floatUniforms: {
        uIterations: 80,
        uOutputScale: 5000,
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
      uOutputScale: params.outputScale,
    })
  }
}
