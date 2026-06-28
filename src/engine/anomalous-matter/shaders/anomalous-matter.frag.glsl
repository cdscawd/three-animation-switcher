uniform vec3 color;
uniform vec3 pointLightPosition;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(pointLightPosition - vPosition);
  float diffuse = max(dot(normal, lightDir), 0.0);

  float fresnel = 1.0 - dot(normal, vec3(0.0, 0.0, 1.0));
  fresnel = pow(fresnel, 2.0);

  vec3 finalColor = color * diffuse + color * fresnel * 0.5;
  gl_FragColor = vec4(finalColor, 1.0);
}
