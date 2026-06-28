import { AnomalousMatterBackground } from '../components/AnomalousMatterBackground/AnomalousMatterBackground'
import { AtcBackground } from '../components/AtcBackground/AtcBackground'
import { CathedralBackground } from '../components/CathedralBackground/CathedralBackground'
import { CollectiveTrajectoriesBackground } from '../components/CollectiveTrajectoriesBackground/CollectiveTrajectoriesBackground'
import { FirefliesBackground } from '../components/FirefliesBackground/FirefliesBackground'
import { CyberspaceBackground } from '../components/CyberspaceBackground/CyberspaceBackground'
import { GridShaderBackground } from '../components/GridShaderBackground/GridShaderBackground'
import { KaleidoscopeBackground } from '../components/KaleidoscopeBackground/KaleidoscopeBackground'
import { LabBackground } from '../components/LabBackground/LabBackground'
import { LaunchBackground } from '../components/LaunchBackground/LaunchBackground'
import { PhosphorBackground } from '../components/PhosphorBackground/PhosphorBackground'
import { RadialShaderBackground } from '../components/RadialShaderBackground/RadialShaderBackground'
import { ShaderAnimationBackground } from '../components/ShaderAnimationBackground/ShaderAnimationBackground'
import { ShaderLinesBackground } from '../components/ShaderLinesBackground/ShaderLinesBackground'
import { StarshipBackground } from '../components/StarshipBackground/StarshipBackground'
import { ANIMATIONS, type AnimationDefinition, type AnimationId } from './types'

export { ANIMATIONS, type AnimationId }

export const ANIMATION_REGISTRY: AnimationDefinition[] = [
  {
    id: 'cyberspace',
    label: 'Enter Cyberspace',
    kind: 'three-scene',
    component: CyberspaceBackground,
  },
  {
    id: 'starship',
    label: 'Starship Shader',
    kind: 'three-shader',
    component: StarshipBackground,
  },
  {
    id: 'phosphor',
    label: 'Phosphor Shader',
    kind: 'fullscreen-shader',
    component: PhosphorBackground,
  },
  {
    id: 'atc',
    label: 'ATC Shader',
    kind: 'fullscreen-shader',
    component: AtcBackground,
  },
  {
    id: 'cathedral',
    label: 'Cathedral Shader',
    kind: 'fullscreen-shader',
    component: CathedralBackground,
  },
  {
    id: 'shader-lines',
    label: 'Shader Lines',
    kind: 'three-shader',
    component: ShaderLinesBackground,
  },
  {
    id: 'shader-animation',
    label: 'Shader Animation',
    kind: 'three-shader',
    component: ShaderAnimationBackground,
  },
  {
    id: 'anomalous-matter',
    label: 'Anomalous Matter',
    kind: 'three-scene',
    component: AnomalousMatterBackground,
  },
  {
    id: 'lab',
    label: 'Lab Shader',
    kind: 'fullscreen-shader',
    component: LabBackground,
  },
  {
    id: 'launch',
    label: 'Launch Shader',
    kind: 'fullscreen-shader',
    component: LaunchBackground,
  },
  {
    id: 'radial-shader',
    label: 'Radial Shader',
    kind: 'fullscreen-shader',
    component: RadialShaderBackground,
  },
  {
    id: 'grid-shader',
    label: 'Grid Shader',
    kind: 'three-shader',
    component: GridShaderBackground,
  },
  {
    id: 'fireflies',
    label: 'Fireflies',
    kind: 'fullscreen-shader',
    component: FirefliesBackground,
  },
  {
    id: 'collective-trajectories',
    label: 'Collective Trajectories',
    kind: 'three-scene',
    component: CollectiveTrajectoriesBackground,
  },
  {
    id: 'kaleidoscope',
    label: 'Kaleidoscope',
    kind: 'three-shader',
    component: KaleidoscopeBackground,
  },
]

export function getAnimationComponent(id: AnimationId) {
  return ANIMATION_REGISTRY.find((item) => item.id === id)?.component
}
