import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useGridShaderBackground } from '../../hooks/backgroundEngines'
import './GridShaderBackground.scss'

export function GridShaderBackground() {
  return (
    <BackgroundShell className="grid-shader-bg" useEngine={useGridShaderBackground} />
  )
}
