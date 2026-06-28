import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useLaunchBackground } from '../../hooks/backgroundEngines'
import './LaunchBackground.scss'

export function LaunchBackground() {
  return <BackgroundShell className="launch-bg" useEngine={useLaunchBackground} />
}
