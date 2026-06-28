precision mediump float;

out highp float vDist;
out highp float vZ;
out highp vec3 vWorld;

void main() {
  highp vec4 pos = modelMatrix * vec4(position, 1.0);
  vWorld = pos.xyz;
  vZ = pos.z;

  highp vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDist = -mv.z;

  gl_Position = projectionMatrix * mv;
}
