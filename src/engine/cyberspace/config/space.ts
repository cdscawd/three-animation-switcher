export const SPACE = {
  rtWidth: 768,
  tunnelDepth: 55,
  frameHalf: 6,
  tunnelBoxDepth: 140,
  pulseInterval: 2.6,
  floaterCount: 16,
  floaterSpeed: 4,
  lightSpeed: 8,
  diveDistance: 26,
  fovPunch: 18,
  particleCount: 4000,
  particleCountLow: 2000,
  particleDepth: 60,
} as const

export const FLOATER = {
  movement: { sinFreq: 0.3, cosFreq: 0.27, amp: 0.6 },
  layout: {
    baseRadius: 3.5,
    radiusVariance: 2,
    xMultiplier: 1.1,
    scaleMin: 0.5,
    scaleVariance: 0.7,
    rotMax: 0.4,
  },
  color: {
    hueBase: 0.55,
    hueVariance: 0.23,
    saturation: 0.65,
    lightness: 0.8,
  },
  geometry: { boxSize: 1, polyRadius: 0.72 },
  material: {
    color: 0xffffff,
    shininess: 90,
    specular: 0x999fff,
    emissive: 0x4a7ab0,
    emissiveIntensity: 1.4,
    reflectivity: 0.6,
  },
  performance: { reducedRatio: 0.5 },
} as const

export const ENV_MAP = {
  width: 512,
  height: 256,
  bg: {
    stops: [
      { offset: 0, color: '#0a1840' },
      { offset: 0.5, color: '#05030f' },
      { offset: 1, color: '#1a0a40' },
    ],
  },
  neon: {
    yRatio: 0.45,
    radiusRatio: 0.6,
    bands: [
      { xf: 0.2, color: '#1e6bff' },
      { xf: 0.5, color: '#00d8ff' },
      { xf: 0.78, color: '#9b4dff' },
    ],
  },
} as const

export const LIGHTS = {
  ambient: { color: '#6688bb', intensity: 1.1 },
  cyan: { color: '#33aaff', intensity: 50, distance: 60, decay: 2 },
  purple: { color: '#9944ff', intensity: 50, distance: 60, decay: 2 },
  layout: { ratioX: 0.6, ratioY: 0.3, purpleOffsetZ: 40 },
} as const

export const PARTICLE = {
  layout: { baseRadius: 4, radiusVariance: 2, xMultiplier: 1.1 },
  color: {
    threshold1: 0.66,
    threshold2: 0.33,
    blue: [0.3, 0.6, 1],
    cyan: [0.5, 0.95, 1],
    purple: [0.65, 0.35, 1],
  },
  uniforms: { speed: 14, size: 0.35, flow: 2.5 },
  performance: { reducedRatio: 0.5 },
} as const

export const TUNNEL = {
  layout: { zOffset: 15, spanOffset: 30 },
  color: {
    neonBlue: [0.3, 0.7, 1.4],
    neonPurple: [0.7, 0.35, 1.5],
    baseWall: [0.05, 0.11, 0.22],
    seamGlow: [0.6, 0.8, 1],
    nodeGlow: [0.9, 0.95, 1],
    pulseGlow: [0.7, 0.85, 1],
  },
  fog: { density: 0.025 },
} as const
