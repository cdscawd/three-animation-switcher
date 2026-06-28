import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useLabBackground } from '../../hooks/backgroundEngines'
import './LabBackground.scss'

export function LabBackground() {
  return <BackgroundShell className="lab-bg" useEngine={useLabBackground} />
}
