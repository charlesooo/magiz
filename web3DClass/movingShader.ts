import { Material, LineBasicMaterial, Vector3 } from 'three'

export { setMovingShader, setMovingEdgeShader }

const initShader = `
uniform float time;
uniform vec3 vect;
varying float rangeRatio;

mat4 translate(vec3 v, float t) {
  return mat4(1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              v.x*t, v.y*t, v.z*t, 1.0);
}`

const clamp_mvPosition = `
float range = 1500.0;
float r2 = range * 2.0;
float br = 200.0;

mvPosition.x -= floor(mvPosition.x / r2) * r2;

rangeRatio = 1.0;
float r = range - br;
if (mvPosition.x > r) {
  float x = range - mvPosition.x;
  if (x < 0.0) x = 0.0;
  rangeRatio = x / r;
} else if (mvPosition.x < br) {
  float x = mvPosition.x;
  if (x < 0.0) x = 0.0;
  rangeRatio = x / br;
}
`

function discardFS(shader: string) {
  return shader
    .replace(
      'uniform vec3 diffuse;',
      `varying float rangeRatio;
uniform vec3 diffuse;`
    )
    .replace(
      'void main() {',
      `void main() {
if (rangeRatio < 0.01) discard;`
    )
    .replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
    gl_FragColor.w = rangeRatio;
    `
    )
}

function setMovingShader(material: Material, time: { value: number }, vect: Vector3) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    shader.uniforms.vect = { value: vect }
    shader.vertexShader = shader.vertexShader
      .replace('varying vec3 vViewPosition;', 'varying vec3 vViewPosition;' + initShader)
      .replace(
        '#include <project_vertex>',
        `vec4 mvPosition = vec4( transformed, 1.0 );

        #ifdef USE_BATCHING
          mvPosition = batchingMatrix * mvPosition;
        #endif

        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif

        mvPosition = translate( vect, time ) * mvPosition;

        ${clamp_mvPosition}

        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;`
      )
    shader.fragmentShader = discardFS(shader.fragmentShader)
  }
}

function setMovingEdgeShader(material: LineBasicMaterial, time: { value: number }, vect: Vector3) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    shader.uniforms.vect = { value: vect }
    shader.vertexShader =
      initShader +
      `attribute mat4 matrix;

      void main() {
        vec4 mvPosition = translate( vect, time ) * matrix * vec4( position, 1.0 );

        ${clamp_mvPosition}

        gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
      }`

    shader.fragmentShader = discardFS(shader.fragmentShader)
  }
}
