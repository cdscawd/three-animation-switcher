import { useEffect, useState, type ReactNode } from 'react'

/** 延迟一帧挂载，确保 liquidglass 组件 ref 就绪 */
export function GlassMount({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (!ready) return null

  return children
}
