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

  vec3 s = normalize(FC.rgb * 2.1 - r.xyx), p, c = s / s.y;

  for (float i = 0.0, d = 0.0, z = 0.0; i++ < 3e1; o.rgb += (1.1 - sin(p)) / d) {
    p = s * z;
    p.z -= t;

    d = ++p.y;
    p.y = abs(mod(d - 2.0, 4.0) - 2.0);

    p += 0.03 * sin(dot(cos(c), sin(c / 0.6 - t)) / 0.1) * (p.y - d);

    z += (d = 0.7 * length(
      vec3(
        cos(p.z / 0.1) * 0.1,
        (p + sin(p.z * vec3(0.7, 1.0, 0.0) + t)).xy
      ) - 0.1
    ));
  }

  o = tanh(o / 2e2);
  fragColor = vec4(o.rgb, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
