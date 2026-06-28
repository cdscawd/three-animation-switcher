import type { ParamValues } from '../params'

/** Common lifecycle for fullscreen / scene background engines */
export interface BackgroundEngine {
  load(): void
  dispose(): void
  applyParams?(params: ParamValues): void
}

export interface BackgroundEngineOptions {
  containerEl: HTMLElement
}

export type BackgroundEngineClass = new (
  options: BackgroundEngineOptions,
) => BackgroundEngine
