#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 r = iResolution.xy;
  float t = iTime;
  vec3 FC = vec3(fragCoord, t);
  vec4 o = vec4(0.0);

  vec3 v = vec3(0.0, -2.0, 7.0);
  vec3 rd = normalize(FC.rgb * 2.0 - r.xyx);
  vec3 tv = t * v;

  for (float i, z, d, f; i++ < 64.0; o += vec4(3.0, 1.0, d, z / f) / z) {
    vec3 p = z * rd + v;
    vec3 a = p;
    a.y *= 0.3;
    for (d = 1.0; d++ < 7.0; ) {
      a -= 0.1 * sin((a.zxy + tv + d) * d) * p.y / d;
    }

    z += d = min(
      max(-p.y, length(a) - 2.0),
      f = 0.2 + abs(length(a.xz - cos(a.zx * 6.0)) + max(p.y * 10.0, -0.6))
    ) * 0.125;
  }

  o = tanh(o * o.a / 1e3);
  fragColor = vec4(o.rgb, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
