import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AnimationId } from '../animations'
import { ANIMATION_REGISTRY } from '../animations'
import { getDefaultParams } from '../params'
import type { ParamValue, ParamValues } from '../params'

interface AnimationParamsContextValue {
  animationId: AnimationId
  values: ParamValues
  setParam: (key: string, value: ParamValue) => void
  resetParams: () => void
  exportJson: () => string
}

const AnimationParamsContext = createContext<AnimationParamsContextValue | null>(
  null,
)

type ParamsStore = Partial<Record<AnimationId, ParamValues>>

export function AnimationParamsProvider({
  animationId,
  children,
}: {
  animationId: AnimationId
  children: ReactNode
}) {
  const [store, setStore] = useState<ParamsStore>({})

  const values = useMemo(
    () => store[animationId] ?? getDefaultParams(animationId),
    [store, animationId],
  )

  const setParam = useCallback(
    (key: string, value: ParamValue) => {
      setStore((prev) => ({
        ...prev,
        [animationId]: {
          ...(prev[animationId] ?? getDefaultParams(animationId)),
          [key]: value,
        },
      }))
    },
    [animationId],
  )

  const resetParams = useCallback(() => {
    setStore((prev) => ({
      ...prev,
      [animationId]: getDefaultParams(animationId),
    }))
  }, [animationId])

  const exportJson = useCallback(() => {
    const entry = ANIMATION_REGISTRY.find((item) => item.id === animationId)
    const payload = {
      animationId,
      label: entry?.label ?? animationId,
      params: values,
    }
    return JSON.stringify(payload, null, 2)
  }, [animationId, values])

  const contextValue = useMemo(
    () => ({
      animationId,
      values,
      setParam,
      resetParams,
      exportJson,
    }),
    [animationId, values, setParam, resetParams, exportJson],
  )

  return (
    <AnimationParamsContext.Provider value={contextValue}>
      {children}
    </AnimationParamsContext.Provider>
  )
}

export function useAnimationParams(): AnimationParamsContextValue {
  const context = useContext(AnimationParamsContext)
  if (!context) {
    throw new Error('useAnimationParams must be used within AnimationParamsProvider')
  }
  return context
}
