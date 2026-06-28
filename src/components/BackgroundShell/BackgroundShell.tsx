import { useRef, type RefObject } from 'react'

export interface BackgroundShellProps {
  className: string
  useEngine: (containerRef: RefObject<HTMLElement | null>) => void
}

export function BackgroundShell({ className, useEngine }: BackgroundShellProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEngine(containerRef)

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden
    />
  )
}
