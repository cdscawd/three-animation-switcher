import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useShaderAnimationBackground } from '../../hooks/backgroundEngines'
import './ShaderAnimationBackground.scss'

export function ShaderAnimationBackground() {
  return (
    <BackgroundShell
      className="shader-animation-bg"
      useEngine={useShaderAnimationBackground}
    />
  )
}
