precision mediump float;

uniform highp float uTime;

in vec3 vColor;
in float vSeed;
in float vFade;

out vec4 outColor;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  float alpha = smoothstep(0.5, 0.0, dist);
  alpha *= alpha;

  float twinkle = 0.5 + 0.5 * sin(vSeed * 40.0 + uTime * 2.5);
  vec3 color = vColor * (0.6 + 0.6 * twinkle);

  outColor = vec4(color, alpha * vFade);
}
