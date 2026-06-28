#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 r = iResolution.xy;
  float t = iTime;
  vec3 FC = vec3(fragCoord, t);
  vec4 o = vec4(0.0);

  vec3 p;
  for (float i, z, d; i++ < 5e1; o += (sin(p.y + vec4(6.0, 1.0, 2.0, 3.0)) + 2.0) / d / z) {
    p = z * normalize(FC.rgb * 2.0 - r.xyx) + t;
    z += d = length(vec2(
      length(cos(sin(0.5 * p) + p).xy + 1.0) - 2.0,
      min(d = p.z - t + 9.0, d * 0.1) * 0.5
    ));
  }

  o = tanh(o / 5e1);
  fragColor = vec4(o.rgb, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
