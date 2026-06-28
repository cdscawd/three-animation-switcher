import { useEffect, useRef, type RefObject } from 'react'
import { useAnimationParams } from '../context/AnimationParamsContext'
import type { BackgroundEngineClass } from '../engine/types'

export function createBackgroundEngineHook(
  EngineClass: BackgroundEngineClass,
  logLabel: string,
) {
  return function useBackgroundEngine(
    containerRef: RefObject<HTMLElement | null>,
  ): void {
    const { values } = useAnimationParams()
    const engineRef = useRef<InstanceType<BackgroundEngineClass> | null>(null)
    const valuesRef = useRef(values)

    valuesRef.current = values

    useEffect(() => {
      const containerEl = containerRef.current
      if (!containerEl) return undefined

      const engine = new EngineClass({ containerEl })
      try {
        engine.load()
        engine.applyParams?.(valuesRef.current)
        engineRef.current = engine
      } catch (error) {
        console.error(`[${logLabel}]`, error)
        engine.dispose()
        return undefined
      }

      return () => {
        engine.dispose()
        engineRef.current = null
      }
    }, [containerRef])

    useEffect(() => {
      engineRef.current?.applyParams?.(values)
    }, [values])
  }
}
