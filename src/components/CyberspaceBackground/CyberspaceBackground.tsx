import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useCyberspaceBackground } from '../../hooks/backgroundEngines'
import './CyberspaceBackground.scss'

export function CyberspaceBackground() {
  return (
    <BackgroundShell
      className="cyberspace-bg"
      useEngine={useCyberspaceBackground}
    />
  )
}
