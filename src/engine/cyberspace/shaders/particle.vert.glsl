precision mediump float;

uniform float uDepth;
uniform float uFlow;
uniform float uHeightPx;
uniform float uSize;
uniform float uSpeed;

uniform highp float uTime;

in vec3 aColor;
in float aSeed;

out vec3 vColor;
out float vSeed;
out float vFade;

void main() {
  highp vec3 pos = position;
  pos.z = mod(pos.z - uTime * uSpeed, uDepth) - uDepth;

  float time = uTime * 0.3;
  float bx = pos.x;
  float by = pos.y;
  pos.x += sin(by * 0.5 + pos.z * 0.08 + time) * uFlow;
  pos.y += cos(bx * 0.5 + pos.z * 0.08 + time * 0.85) * uFlow;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float dist = -mv.z;
  vSeed = aSeed;
  vColor = aColor;

  float nearFade = smoothstep(1.0, 5.0, dist);
  float farFade = 1.0 - smoothstep(uDepth * 0.7, uDepth, dist);
  vFade = nearFade * farFade;

  gl_PointSize = clamp(uSize * (uHeightPx * 0.5) / max(dist, 0.1), 0.0, 22.0);
}
