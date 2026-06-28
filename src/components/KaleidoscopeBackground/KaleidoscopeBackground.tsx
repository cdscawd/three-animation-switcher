import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useKaleidoscopeBackground } from '../../hooks/backgroundEngines'
import './KaleidoscopeBackground.scss'

export function KaleidoscopeBackground() {
  return (
    <BackgroundShell
      className="kaleidoscope-bg"
      useEngine={useKaleidoscopeBackground}
    />
  )
}
