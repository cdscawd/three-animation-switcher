precision highp float;

uniform vec2 resolution;
uniform float time;

#define FC gl_FragCoord.xy
#define R resolution
#define T time
#define MN min(R.x, R.y)

void main(void) {
  vec2 uv = (FC - 0.5 * R) / MN;
  uv.x += T * 0.1;

  vec3 col = vec3(0.0);
  float s = 12.0;
  float e = 9e-4;

  col += e / (sin(uv.x * s) * cos(uv.y * s));

  gl_FragColor = vec4(col, 1.0);
}
