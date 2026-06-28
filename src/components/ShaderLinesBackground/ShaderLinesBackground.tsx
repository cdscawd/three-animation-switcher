import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useShaderLinesBackground } from '../../hooks/backgroundEngines'
import './ShaderLinesBackground.scss'

export function ShaderLinesBackground() {
  return (
    <BackgroundShell
      className="shader-lines-bg"
      useEngine={useShaderLinesBackground}
    />
  )
}
