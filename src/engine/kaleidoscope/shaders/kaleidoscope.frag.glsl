#define PI 3.14159265359
#define TAU 6.28318530718

precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;
uniform float segments;
uniform float colorIntensity;
uniform float morphAmount;
uniform float rotationSpeed;

vec2 kaleidoscope(vec2 p, float n) {
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float slice = TAU / n;
  angle = mod(angle + slice * 0.5, slice);
  angle = abs(angle - slice * 0.5);
  return vec2(cos(angle), sin(angle)) * radius;
}

vec3 neonPalette(float t) {
  return 0.55 + 0.45 * cos(TAU * (vec3(0.0, 0.33, 0.67) + t * 1.4));
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float particles(vec2 p, float t) {
  vec2 grid = p * 10.0;
  vec2 id = floor(grid);
  vec2 gv = fract(grid) - 0.5;
  float h = hash21(id);
  float pulse = 0.5 + 0.5 * sin(t * 3.0 + h * TAU);
  float size = mix(0.08, 0.22, h);
  return smoothstep(size, size - 0.04, length(gv)) * pulse * step(0.35, h);
}

float geometry(vec2 p, float t) {
  float morph = mix(0.18, 0.42, morphAmount);
  vec2 q = abs(p) - vec2(morph);
  float box = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
  float ring = abs(length(p) - 0.35 - 0.05 * sin(t * 1.3)) - 0.015;
  float tri = abs(sin(p.x * 14.0 + t) * sin(p.y * 14.0 - t * 0.8));
  return min(box, ring) + tri * 0.08;
}

float abstractWaves(vec2 p, float t) {
  float w1 = sin(p.x * 8.0 + t * 1.2) * sin(p.y * 8.0 - t);
  float w2 = cos(length(p) * 16.0 - t * 2.2);
  float w3 = sin(atan(p.y, p.x) * segments + t * 0.7);
  return w1 * 0.35 + w2 * 0.25 + w3 * 0.2;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * resolution) / min(resolution.x, resolution.y);

  vec2 center = mouse * 0.18;
  uv -= center;

  float spin = time * rotationSpeed + mouse.x * 0.6;
  float c = cos(spin);
  float s = sin(spin);
  uv = mat2(c, -s, s, c) * uv;

  vec2 kp = kaleidoscope(uv, segments);

  float t = time;
  float geo = smoothstep(0.025, 0.0, geometry(kp, t));
  float dots = particles(kp + vec2(sin(t * 0.4), cos(t * 0.3)) * 0.05, t);
  float waves = abstractWaves(kp, t);
  float pattern = geo + dots * 0.9 + waves * morphAmount;

  float hue = pattern + length(kp) * 2.5 + t * 0.12 + mouse.y * 0.4;
  vec3 col = neonPalette(hue) * (0.15 + pattern * 1.4) * colorIntensity;
  col += neonPalette(hue + 0.25) * smoothstep(0.55, 0.0, length(kp)) * 0.35 * colorIntensity;
  col += vec3(geo) * neonPalette(hue + 0.5) * 0.6;

  col = pow(max(col, vec3(0.0)), vec3(0.92));
  col *= 1.15;

  gl_FragColor = vec4(col, 1.0);
}
