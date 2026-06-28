precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D iChannel0;
uniform float uIterations;
uniform float uStepSize;
uniform float uAccumDiv;

#define MAX_ITERATIONS 80.0

out vec4 outColor;

// "Starship" by @XorDev (adapted) — 21st.dev official bundle shader

void mainImage(out vec4 O, vec2 I) {
  vec2 r = iResolution.xy;
  vec2 p = (I + I - r) / r.y * mat2(3.0, 4.0, 4.0, -3.0) / 1e2;

  vec4 S = vec4(0.0);
  vec4 C = vec4(1.0, 2.0, 3.0, 0.0);
  vec4 W;
  float stepSize = uStepSize;
  float accumDiv = max(uAccumDiv, 1.0);

  for (float t = iTime, T = 0.1 * t + p.y, i = 0.0; i < MAX_ITERATIONS; i += 1.0) {
    float w = 1.0 - step(i, uIterations - 0.5);

    S += w * (cos(W = sin(i) * C) + 1.0)
      * exp(sin(i + i * T))
      / length(
        max(
          p,
          p / vec2(
            2.0,
            texture(iChannel0, p / exp(W.x) + vec2(i, t) / 8.0).r * 40.0
          )
        )
      ) / accumDiv;

    p += w * stepSize * cos(i * (C.xz + 8.0 + i) + T + T);
  }

  O = vec4(tanh((S * S).rgb), 1.0);
}

void main() {
  vec4 O;
  mainImage(O, gl_FragCoord.xy);
  outColor = O;
}
