import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useAtcBackground } from '../../hooks/backgroundEngines'
import './AtcBackground.scss'

export function AtcBackground() {
  return (
    <BackgroundShell
      className="atc-bg"
      useEngine={useAtcBackground}
    />
  )
}
