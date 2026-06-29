import type { ComponentType } from 'react'

export const ANIMATIONS = [
  { id: 'cyberspace', label: 'Enter Cyberspace' },
  { id: 'starship', label: 'Starship Shader' },
  { id: 'phosphor', label: 'Phosphor Shader' },
  { id: 'atc', label: 'ATC Shader' },
  { id: 'cathedral', label: 'Cathedral Shader' },
  { id: 'shader-lines', label: 'Shader Lines' },
  { id: 'shader-animation', label: 'Shader Animation' },
  { id: 'anomalous-matter', label: 'Anomalous Matter' },
  { id: 'lab', label: 'Lab Shader' },
  { id: 'launch', label: 'Launch Shader' },
  { id: 'radial-shader', label: 'Radial Shader' },
  { id: 'grid-shader', label: 'Grid Shader' },
  { id: 'fireflies', label: 'Fireflies' },
  { id: 'collective-trajectories', label: 'Collective Trajectories' },
] as const

export type AnimationId = (typeof ANIMATIONS)[number]['id']

/** three-scene: multi-object Three.js scene; fullscreen-shader: single quad / raw WebGL */
export type AnimationEngineKind = 'three-scene' | 'fullscreen-shader' | 'three-shader'

export interface AnimationDefinition {
  id: AnimationId
  label: string
  kind: AnimationEngineKind
  component: ComponentType
}
