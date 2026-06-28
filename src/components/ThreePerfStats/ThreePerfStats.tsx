import { useEffect } from 'react'
import Stats from 'three/addons/libs/stats.module.js'
import './ThreePerfStats.scss'

export function ThreePerfStats() {
  useEffect(() => {
    const stats = new Stats()
    stats.dom.classList.add('three-perf-stats')
    document.body.appendChild(stats.dom)

    let rafId = 0
    const tick = () => {
      stats.update()
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      stats.dom.remove()
    }
  }, [])

  return null
}
