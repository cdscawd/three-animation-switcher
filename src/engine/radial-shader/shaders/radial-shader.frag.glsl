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

  vec2 p = FC.xy - r * 0.5;
  for (float i, a; i++ < 7.0; ) {
    a = length(p) / r.y - (i * i) / 50.0;
    float denom = max(a, -a * 4.0) + 2.0 / r.y;

    a = atan(p.y, p.x) * 3.0 + t * sin(i * i) + i * i;
    float gate = smoothstep(0.0, 0.6, cos(a));

    o += 0.02 / denom * gate * (1.0 + sin(a - i + vec4(0.0, 0.2, 0.5, 0.0)));
  }

  o = tanh(o);
  fragColor = vec4(o.rgb, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
