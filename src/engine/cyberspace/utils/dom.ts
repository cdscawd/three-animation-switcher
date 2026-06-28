import type { WinSize } from '../types'

import { SPACE } from '../config/space'

export function getPixelRatio(): number {
  const max = window.matchMedia('(max-width: 768px)').matches ? 1.5 : 2
  return Math.min(window.devicePixelRatio, max)
}

export function getWinSize(): WinSize {
  return {
    wd: window.innerWidth,
    wh: document.documentElement.clientHeight,
  }
}

export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | undefined

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}

export function wrapZ(value: number, depth: number = SPACE.tunnelDepth): number {
  return ((value % depth) + depth) % depth - depth
}
