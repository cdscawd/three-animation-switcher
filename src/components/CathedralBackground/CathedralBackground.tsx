import { BackgroundShell } from '../BackgroundShell/BackgroundShell'
import { useCathedralBackground } from '../../hooks/backgroundEngines'
import './CathedralBackground.scss'

export function CathedralBackground() {
  return (
    <BackgroundShell
      className="cathedral-bg"
      useEngine={useCathedralBackground}
    />
  )
}
