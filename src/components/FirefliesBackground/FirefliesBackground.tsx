import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useFirefliesBackground } from '../../hooks/backgroundEngines'
import './FirefliesBackground.scss'

export function FirefliesBackground() {
  return (
    <BackgroundShell className="fireflies-bg" useEngine={useFirefliesBackground} />
  )
}
