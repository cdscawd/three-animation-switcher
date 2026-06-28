import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { usePhosphorBackground } from '../../hooks/backgroundEngines'
import './PhosphorBackground.scss'

export function PhosphorBackground() {
  return (
    <BackgroundShell
      className="phosphor-bg"
      useEngine={usePhosphorBackground}
    />
  )
}
