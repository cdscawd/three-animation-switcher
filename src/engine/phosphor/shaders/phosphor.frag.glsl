precision highp float;

uniform vec2 r;
uniform float t;
uniform float uIterations;
uniform float uOutputScale;

// WebGL1 requires a constant loop bound; uIterations caps work early.
#define MAX_ITERATIONS 120.0

// Phosphor 3 by @XorDev — https://21st.dev/community/components/xordev/phosphor-30/default

vec4 tanh_vec4(vec4 x) {
  vec4 e2x = exp(2.0 * x);
  return (e2x - 1.0) / (e2x + 1.0);
}

void main() {
  vec4 o = vec4(0.0);
  float s = 0.0;
  float z = 0.0;
  float d = 0.0;

  for (float i = 0.0; i < MAX_ITERATIONS; i += 1.0) {
    if (i >= uIterations) break;

    vec3 p = z * normalize(vec3(gl_FragCoord.xy, t) * 2.0 - vec3(r.x, r.y, r.y));
    vec3 a = normalize(cos(vec3(5.0, 0.0, 1.0) + t - d * 4.0));
    p.z += 5.0;

    a = a * dot(a, p) - cross(a, p);
    for (float turb = 1.0; turb < 9.0; turb += 1.0) {
      a -= sin(a * turb + t).zxy / turb;
    }

    z += d = 0.1 * abs(length(p) - 3.0) + 0.07 * abs(cos(s = a.y));
    o += (cos(s + vec4(0.0, 1.0, 8.0, 0.0)) + 1.0) / d;
  }

  gl_FragColor = tanh_vec4(o / uOutputScale);
}
