import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useRadialShaderBackground } from '../../hooks/backgroundEngines'
import './RadialShaderBackground.scss'

export function RadialShaderBackground() {
  return (
    <BackgroundShell className="radial-shader-bg" useEngine={useRadialShaderBackground} />
  )
}
