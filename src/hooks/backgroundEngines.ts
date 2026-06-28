import { createBackgroundEngineHook } from './createBackgroundEngineHook'
import { AnomalousMatterEngine } from '../engine/anomalous-matter/AnomalousMatterEngine'
import { AtcShaderEngine } from '../engine/atc/AtcShaderEngine'
import { CathedralShaderEngine } from '../engine/cathedral/CathedralShaderEngine'
import { CollectiveTrajectoriesEngine } from '../engine/collective-trajectories/CollectiveTrajectoriesEngine'
import { FirefliesShaderEngine } from '../engine/fireflies/FirefliesShaderEngine'
import { CyberspaceBackgroundEngine } from '../engine/cyberspace/CyberspaceBackgroundEngine'
import { GridShaderEngine } from '../engine/grid-shader/GridShaderEngine'
import { KaleidoscopeEngine } from '../engine/kaleidoscope/KaleidoscopeEngine'
import { LabShaderEngine } from '../engine/lab/LabShaderEngine'
import { LaunchShaderEngine } from '../engine/launch/LaunchShaderEngine'
import { PhosphorShaderEngine } from '../engine/phosphor/PhosphorShaderEngine'
import { RadialShaderEngine } from '../engine/radial-shader/RadialShaderEngine'
import { ShaderAnimationEngine } from '../engine/shader-animation/ShaderAnimationEngine'
import { ShaderLinesEngine } from '../engine/shader-lines/ShaderLinesEngine'
import { StarshipShaderEngine } from '../engine/starship/StarshipShaderEngine'

export const useCyberspaceBackground = createBackgroundEngineHook(
  CyberspaceBackgroundEngine,
  'CyberspaceBackgroundEngine',
)

export const useStarshipBackground = createBackgroundEngineHook(
  StarshipShaderEngine,
  'StarshipShaderEngine',
)

export const usePhosphorBackground = createBackgroundEngineHook(
  PhosphorShaderEngine,
  'PhosphorShaderEngine',
)

export const useAtcBackground = createBackgroundEngineHook(
  AtcShaderEngine,
  'AtcShaderEngine',
)

export const useCathedralBackground = createBackgroundEngineHook(
  CathedralShaderEngine,
  'CathedralShaderEngine',
)

export const useShaderLinesBackground = createBackgroundEngineHook(
  ShaderLinesEngine,
  'ShaderLinesEngine',
)

export const useShaderAnimationBackground = createBackgroundEngineHook(
  ShaderAnimationEngine,
  'ShaderAnimationEngine',
)

export const useAnomalousMatterBackground = createBackgroundEngineHook(
  AnomalousMatterEngine,
  'AnomalousMatterEngine',
)

export const useLabBackground = createBackgroundEngineHook(
  LabShaderEngine,
  'LabShaderEngine',
)

export const useLaunchBackground = createBackgroundEngineHook(
  LaunchShaderEngine,
  'LaunchShaderEngine',
)

export const useRadialShaderBackground = createBackgroundEngineHook(
  RadialShaderEngine,
  'RadialShaderEngine',
)

export const useGridShaderBackground = createBackgroundEngineHook(
  GridShaderEngine,
  'GridShaderEngine',
)

export const useFirefliesBackground = createBackgroundEngineHook(
  FirefliesShaderEngine,
  'FirefliesShaderEngine',
)

export const useCollectiveTrajectoriesBackground = createBackgroundEngineHook(
  CollectiveTrajectoriesEngine,
  'CollectiveTrajectoriesEngine',
)

export const useKaleidoscopeBackground = createBackgroundEngineHook(
  KaleidoscopeEngine,
  'KaleidoscopeEngine',
)
