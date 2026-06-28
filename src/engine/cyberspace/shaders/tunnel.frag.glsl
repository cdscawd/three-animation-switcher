precision mediump float;

uniform vec3 uColorBlue;
uniform vec3 uColorPurple;
uniform vec3 uColorBaseWall;
uniform vec3 uColorSeamGlow;
uniform vec3 uColorNodeGlow;
uniform vec3 uColorPulseGlow;
uniform float uHalf;
uniform float uFogDensity;

uniform highp float uInterval;
uniform highp float uSpan;
uniform highp float uTime;

in highp float vDist;
in highp float vZ;
in highp vec3 vWorld;

out vec4 outColor;

void main() {
  float across = clamp(min(abs(vWorld.x), abs(vWorld.y)) / uHalf, 0.0, 1.0);
  float edgeGlow = across * across * across;

  float mixv = 0.5 + 0.5 * sin(vZ * 0.15 + uTime * 0.5);
  vec3 neonColor = mix(uColorBlue, uColorPurple, mixv);

  vec3 color = uColorBaseWall;
  float cornerLine = smoothstep(0.9, 1.0, across);
  color += neonColor * edgeGlow * 1.0;
  color += neonColor * cornerLine * 0.9;

  float seam = smoothstep(0.94, 1.0, abs(sin(vZ * 0.85 + uTime * 0.6)));
  color += neonColor * seam * 0.6;
  color += uColorSeamGlow * seam * 0.35;

  float angle = atan(vWorld.y, vWorld.x);
  float node = pow(0.5 + 0.5 * cos(angle - uTime * 1.5 + vZ * 0.6), 16.0);
  color += uColorNodeGlow * seam * node * 2.0;

  float phase = fract(uTime / uInterval);
  float pulseZ = -phase * uSpan;
  float dz = vZ - pulseZ;
  float pulse = exp(-dz * dz * 0.01);
  color += neonColor * pulse * (0.4 + edgeGlow * 1.0);
  color += uColorPulseGlow * cornerLine * pulse * 0.6;

  float fog = exp(-vDist * uFogDensity);
  color *= fog;

  outColor = vec4(color, 1.0);
}
