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

  vec3 s = normalize(FC.rgb * 2.1 - r.xyy), p, c = s;
  c /= max(1e-4, abs(c.y));
  c.z -= t;

  float z = 0.0, d = 1.0;
  for (float i = 0.0; i < 30.0; i++) {
    p = s * z;
    p.z -= t;
    float py = p.y;
    d = ++py;
    p.y = abs(mod(d - 2.0, 4.0) - 2.0);
    p += 0.03 * sin(c / 0.04) * abs(p.y - d);
    float dxz = abs(length(cos(p.xz)) - 0.4);
    float dy = abs(cos(p.y + z));
    float stepLen = 0.6 * dxz + 0.1 * dy;
    z += stepLen;
    d = max(stepLen, 1e-4);
    o.rgb += (1.1 - sin(p)) / d;
  }

  o = tanh(o / 400.0);
  fragColor = vec4(o.rgb, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
