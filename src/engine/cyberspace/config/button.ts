export const RIPPLE = {
  max: 6,
  minDistance: 0.05,
  minStrength: 0.7,
  maxStrength: 1.9,
  speedScale: 16,
  enterStrength: 1.6,
  life: 3.2,
} as const

export const HOVER = {
  duration: 0.7,
  tilt: 0.16,
} as const

export const RENDER = {
  rtCap: 2048,
} as const

export const FEATURES = {
  rippleEnabled: true,
} as const

export const BUTTON = {
  refract: { base: 0.002, hover: 0.0036 },
  color: {
    bg0: [0.98, 0.985, 0.995],
    bg1: [0.9, 0.915, 0.945],
    bg2: [0.82, 0.845, 0.89],
    glassFrost: [0.87, 0.9, 0.96],
    glassShadow: [0.18, 0.58, 0.82],
    glassSheen: [0.9, 0.95, 1],
    glint1: [1, 1, 1],
    glint2: [0.8, 0.9, 1],
    portalSpec: [0.95, 0.97, 1],
    portalAmbient: [0.55, 0.72, 1],
    waveGlow: [0.3, 0.7, 1.2],
    shockGlow: [0.5, 0.8, 1.2],
  },
  animation: {
    popScale: 1.02,
    popDuration: 0.16,
    immerseRevealDuration: 0.4,
  },
  shockStartBase: -1000,
} as const
