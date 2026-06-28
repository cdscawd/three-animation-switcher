import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useStarshipBackground } from '../../hooks/backgroundEngines'
import './StarshipBackground.scss'

export function StarshipBackground() {
  return (
    <BackgroundShell
      className="starship-bg"
      useEngine={useStarshipBackground}
    />
  )
}
