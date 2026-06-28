import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useAnomalousMatterBackground } from '../../hooks/backgroundEngines'
import './AnomalousMatterBackground.scss'

export function AnomalousMatterBackground() {
  return (
    <BackgroundShell
      className="anomalous-matter-bg"
      useEngine={useAnomalousMatterBackground}
    />
  )
}
