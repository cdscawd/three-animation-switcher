precision highp float;

uniform vec2 r;
uniform float t;
uniform float uIterations;
uniform float uTimeScale;
uniform float uIntensity;

// WebGL1 requires a constant loop bound; uIterations caps work early.
#define MAX_ITERATIONS 80.0

// ATC by @XorDev — https://x.com/XorDev/status/1951031020909895817

vec4 tanh_vec4(vec4 x) {
  vec4 e2x = exp(2.0 * x);
  return (e2x - 1.0) / (e2x + 1.0);
}

void main() {
  vec4 o = vec4(0.0);
  vec3 v = vec3(1.0, 2.0, 6.0);
  vec3 p;
  float z = 0.0;
  float d = 0.0;
  float f = 0.0;

  for (float i = 0.0; i < MAX_ITERATIONS; i += 1.0) {
    if (i >= uIterations) break;

    p = z * normalize(
      vec3(
        gl_FragCoord.x * 2.0 - r.x,
        gl_FragCoord.y * 2.0 - r.y,
        gl_FragCoord.z * 2.0 - r.y
      )
    );

    vec4 rotCos = cos((p + sin(p)).y * 0.4 + vec4(0.0, 33.0, 11.0, 0.0));
    p.xz *= mat2(rotCos.x, rotCos.y, rotCos.z, rotCos.w);
    p.x += t / uTimeScale;

    float prevD = d;
    float field = length(cos(p / v) * v + vec3(v.z, v.x, v.x) / 7.0);
    f = 2.0 + prevD / exp(p.y * 0.2);
    d = field / f;
    z += d;

    o.rgb += (cos((vec3(p.x + z) + v) * 0.1) + 1.0) / d / f / z;
  }

  gl_FragColor = tanh_vec4(uIntensity * o);
}
