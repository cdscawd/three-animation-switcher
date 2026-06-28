import type { Object3D } from 'three'

export interface WinSize {
  wd: number
  wh: number
}

export interface SpaceLayer {
  objects: Object3D[]
  update: (time: number) => void
  setReduced?: (reduced: boolean) => void
}

export interface SpaceManagerOptions {
  aspect: number
  isLowPower?: boolean
  particlesEnabled?: boolean
}

export interface ParticlesOptions {
  rtHeight: number
  isLowPower: boolean
}

export interface SceneRendererOptions {
  winSize: WinSize
  antialias?: boolean
  maxPixelRatio?: number
}

export interface SceneCameraOptions {
  winSize: WinSize
  far?: number
  z?: number
}

export interface CyberspaceBackgroundEngineOptions {
  containerEl: HTMLElement
}
