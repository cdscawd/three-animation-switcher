import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useCollectiveTrajectoriesBackground } from '../../hooks/backgroundEngines'
import './CollectiveTrajectoriesBackground.scss'

export function CollectiveTrajectoriesBackground() {
  return (
    <BackgroundShell
      className="collective-trajectories-bg"
      useEngine={useCollectiveTrajectoriesBackground}
    />
  )
}
