precision mediump float;

#define MAX_RIPPLES 6

uniform sampler2D uTexture;
uniform vec3 uColorBg0;
uniform vec3 uColorBg1;
uniform vec3 uColorBg2;
uniform vec3 uColorGlassFrost;
uniform vec3 uColorGlassShadow;
uniform vec3 uColorGlassSheen;
uniform vec3 uColorGlint1;
uniform vec3 uColorGlint2;
uniform vec3 uColorPortalSpec;
uniform vec3 uColorPortalAmbient;
uniform vec3 uColorWaveGlow;
uniform vec3 uColorShockGlow;
uniform vec2 uOrigin;
uniform float uAspect;
uniform float uCorner;
uniform float uHover;
uniform float uProgress;
uniform float uRippleStrength;
uniform float uRefract;
uniform float uRippleLife;

uniform highp vec4 uRipples[MAX_RIPPLES];
uniform highp float uShockStart;
uniform highp vec2 uResolution;
uniform highp float uTime;

in vec2 vUv;

out vec4 outColor;

float roundedBoxSDF(vec2 point, vec2 halfSize, float radius) {
  vec2 edgeDist = abs(point) - halfSize + radius;
  return min(max(edgeDist.x, edgeDist.y), 0.0) + length(max(edgeDist, 0.0)) - radius;
}

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(41.3, 289.1))) * 43758.5453);
}

vec3 pageBackground(vec2 screenUv) {
  vec2 centered = screenUv - vec2(0.5, 0.42);
  centered.x *= uResolution.x / uResolution.y;
  float radial = clamp(length(centered) * 1.3, 0.0, 1.0);

  return radial < 0.5
    ? mix(uColorBg0, uColorBg1, radial / 0.5)
    : mix(uColorBg1, uColorBg2, (radial - 0.5) / 0.5);
}

float ringNoise(float angle, float seed) {
  return sin(angle * 3.0 + seed) * 0.65 + sin(angle * 6.0 - seed * 1.7) * 0.3;
}

float rippleHeight(vec2 uv) {
  if (uRippleStrength <= 0.0) return 0.0;
  float height = 0.0;

  for (int index = 0; index < MAX_RIPPLES; index++) {
    vec4 ripple = uRipples[index];
    float age = uTime - ripple.z;
    if (age < 0.0 || age > uRippleLife) continue;

    vec2 toFrag = (uv - ripple.xy) * vec2(uAspect, 1.0);
    float dist = length(toFrag);
    float angle = atan(toFrag.y, toFrag.x);
    float seed = ripple.x * 31.0 + ripple.y * 19.0;

    float waveRadius = dist + ringNoise(angle, seed) * 0.035 * (0.5 + dist);
    float wave = sin(waveRadius * 42.0 - age * 10.0) + 0.35 * sin(waveRadius * 88.0 - age * 16.0);
    float envelope = exp(-dist * 9.0) * exp(-age * 1.5) * smoothstep(0.0, 0.06, age);

    height += wave * envelope * 0.2 * ripple.w;
  }
  return height * uRippleStrength;
}

void calcShockwave(vec2 uv, out float shock, out vec2 shockDisp) {
  float shockAge = uTime - uShockStart;
  shock = 0.0;
  shockDisp = vec2(0.0);

  if (shockAge > 0.0 && shockAge < 1.6) {
    vec2 shockVec = (uv - uOrigin) * vec2(uAspect, 1.0);
    float shockDist = length(shockVec);
    float shockRadius = shockAge * 2.4;
    float ring = exp(-pow((shockDist - shockRadius) * 6.0, 2.0));
    float fade = 1.0 - shockAge / 1.6;

    shock = ring * fade;
    shockDisp = normalize(shockVec + 1e-4) * shock * 0.06;
  }
}

vec3 calcGlass(vec2 aspectPos, vec2 halfSize, float radius, float sdf, vec2 centered, out vec2 edgeDir, out vec3 glassNormal) {
  vec3 glass = vec3(0.0);
  edgeDir = vec2(0.0);
  glassNormal = vec3(0.0, 0.0, 1.0);

  if (uProgress >= 0.999) return glass;

  float epsilon = 0.004;
  vec2 gradient = vec2(
    roundedBoxSDF(aspectPos + vec2(epsilon, 0.0), halfSize, radius) - roundedBoxSDF(aspectPos - vec2(epsilon, 0.0), halfSize, radius),
    roundedBoxSDF(aspectPos + vec2(0.0, epsilon), halfSize, radius) - roundedBoxSDF(aspectPos - vec2(0.0, epsilon), halfSize, radius)
  );
  edgeDir = length(gradient) > 1e-5 ? normalize(gradient) : vec2(0.0);

  float bevelWidth = 0.18;
  float bevelT = 1.0 - clamp(-sdf / bevelWidth, 0.0, 1.0);
  float tilt = pow(bevelT, 1.5);
  glassNormal = normalize(vec3(edgeDir * tilt * 1.6, 1.0));

  highp vec2 screenUv = gl_FragCoord.xy / uResolution;
  highp vec2 refractUv = screenUv + glassNormal.xy * uRefract * 6.0;

  float blurOffset = 0.006;
  vec3 glassBg = (
    pageBackground(refractUv) +
    pageBackground(refractUv + vec2(blurOffset, blurOffset)) +
    pageBackground(refractUv - vec2(blurOffset, blurOffset))
  ) * (1.0 / 3.0);
  glass = mix(glassBg, uColorGlassFrost, 0.62);

  float vertShade = smoothstep(0.55, -0.55, centered.y);
  float edgeShade = smoothstep(0.0, 0.34, -sdf);
  float dome = smoothstep(0.75, 0.0, length(centered));

  glass *= mix(0.68, 1.0, edgeShade);
  glass *= mix(0.85, 1.12, vertShade);
  glass += vec3(1.0) * dome * 0.05;
  glass += (hash(floor(gl_FragCoord.xy * 1.5)) - 0.5) * 0.02;

  float shadow = (1.0 - edgeShade) * 0.65 + (1.0 - vertShade) * 0.45;
  glass += uColorGlassShadow * shadow * 0.34;

  float sheen = pow(max(dot(glassNormal, normalize(vec3(-0.4, 0.7, 0.6))), 0.0), 4.0);
  glass += uColorGlassSheen * sheen * 0.16;

  return glass;
}

vec3 calcSpace(vec2 uv, float sdf, vec2 shockDisp) {
  float edgeDamp = smoothstep(0.0, -0.16, sdf);
  float waveHeight = rippleHeight(uv) * edgeDamp;
  vec2 slope = -vec2(dFdx(waveHeight) / max(dFdx(uv.x), 1e-5), dFdy(waveHeight) / max(dFdy(uv.y), 1e-5));
  vec3 rippleNormal = normalize(vec3(slope, 1.0));

  vec2 sampleUv = uv + slope * uRefract + shockDisp;
  float chroma = uProgress * (1.0 - uProgress) * 4.0 * 0.02;
  vec3 space;

  if (chroma > 0.0005) {
    vec2 chromaDir = uv - 0.5;
    space.r = texture(uTexture, sampleUv + chromaDir * chroma).r;
    space.g = texture(uTexture, sampleUv).g;
    space.b = texture(uTexture, sampleUv - chromaDir * chroma).b;
  } else {
    space = texture(uTexture, sampleUv).rgb;
  }

  vec3 lightDir = normalize(vec3(-0.5, 0.6, 0.9));
  float ndl = max(dot(rippleNormal, lightDir), 0.0);
  float spec = pow(ndl, 30.0) * 0.8 + pow(ndl, 120.0);

  vec3 color = space + uColorPortalSpec * spec;
  color += uColorPortalAmbient * pow(1.0 - rippleNormal.z, 3.0) * 0.3;

  return color;
}

vec3 calcHighlights(float sdf, float hoverSmooth, vec2 edgeDir, vec3 glassNormal) {
  float restAmount = 1.0 - hoverSmooth;
  if (restAmount <= 0.0) return vec3(0.0);

  vec3 highlights = vec3(0.0);
  vec2 lightDir = normalize(vec2(-0.5, 1.0));
  float lit = clamp(dot(edgeDir, lightDir), 0.0, 1.0);

  float rimFront = smoothstep(0.011, 0.0, abs(sdf));
  highlights += vec3(1.0) * rimFront * (0.35 + 0.8 * lit) * restAmount;

  float glint = pow(max(dot(glassNormal, normalize(vec3(-0.3, 0.85, 0.45))), 0.0), 60.0);
  highlights += uColorGlint1 * glint * 1.2 * restAmount;

  float glintSoft = pow(max(dot(glassNormal, normalize(vec3(0.5, 0.55, 0.65))), 0.0), 16.0);
  highlights += uColorGlint2 * glintSoft * 0.28 * restAmount;

  return highlights;
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  vec2 aspectPos = vec2(centered.x * uAspect, centered.y);
  vec2 halfSize = vec2(uAspect * 0.5, 0.5);

  float radius = min(mix(uCorner, 0.0, uProgress), 0.5);
  float sdf = roundedBoxSDF(aspectPos, halfSize, radius);
  float aaWidth = fwidth(sdf) + 1e-4;
  float mask = smoothstep(aaWidth, -aaWidth, sdf);

  if (mask <= 0.001) {
    outColor = vec4(0.0);
    return;
  }

  float hoverSmooth = smoothstep(0.0, 1.0, uHover);

  float shock = 0.0;
  vec2 shockDisp = vec2(0.0);
  calcShockwave(uv, shock, shockDisp);

  vec2 edgeDir = vec2(0.0);
  vec3 glassNormal = vec3(0.0, 0.0, 1.0);
  vec3 color = calcGlass(aspectPos, halfSize, radius, sdf, centered, edgeDir, glassNormal);

  if (uHover > 0.001 || uProgress > 0.001) {
    vec3 portal = calcSpace(uv, sdf, shockDisp);

    vec2 originPos = vec2((uOrigin.x - 0.5) * uAspect, uOrigin.y - 0.5);
    float edgeWidth = 0.13;

    float maxDist = length(abs(originPos) + vec2(uAspect * 0.5, 0.5));
    float revealRadius = mix(-edgeWidth - 0.05, maxDist + edgeWidth + 0.05, uHover);
    float revealDist = length(aspectPos - originPos) + ringNoise(atan(aspectPos.y - originPos.y, aspectPos.x - originPos.x), 5.0) * 0.06;
    float reveal = smoothstep(revealRadius + edgeWidth, revealRadius - edgeWidth, revealDist);

    float immerseRadius = mix(-edgeWidth, length(halfSize) + edgeWidth, uProgress);
    float immerseDist = length(aspectPos) + ringNoise(atan(aspectPos.y, aspectPos.x), 3.0) * 0.05;
    float immerseMask = smoothstep(immerseRadius + edgeWidth, immerseRadius - edgeWidth, immerseDist);

    color = mix(color, portal, max(reveal, immerseMask));

    float front = smoothstep(edgeWidth, 0.0, abs(revealDist - revealRadius));
    float wave = smoothstep(0.0, 0.12, uHover) * smoothstep(1.0, 0.88, uHover);
    color += uColorWaveGlow * front * wave * 0.7;
  }

  color += uColorShockGlow * shock * 0.8;
  color += calcHighlights(sdf, hoverSmooth, edgeDir, glassNormal);

  float alpha = mask * mix(0.96, 1.0, hoverSmooth);
  outColor = vec4(color, alpha);
}
