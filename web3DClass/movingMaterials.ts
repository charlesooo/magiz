import {
  Vector3,
  DoubleSide,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
} from 'three'

export { globalTime, movingVect, material, twoSideMaterial, glassMaterial, lineMaterial }

const movingVect = new Vector3(1, 0, 0)
const globalTime = { value: 0 }

// node_modules\three\src\renderers\shaders\ShaderChunk

const glassParams = {
  side: DoubleSide,
  opacity: 0.6,
  transparent: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetUnits: 1,
  polygonOffsetFactor: 0.1,
}

const material = new MeshLambertMaterial()
const twoSideMaterial = new MeshLambertMaterial({ side: 2 })
const glassMaterial = new MeshStandardMaterial(glassParams)
const lineMaterial = new LineBasicMaterial({ color: '#000' })

/** @see http://dev.thi.ng/gradients/ */
function parseColorVects(s: string) {
  const json = JSON.parse(s.trim().replace(/ +/g, ','))
  return json.map((a: number[]) => `vec3(${a.join()})`).join()
}

setMovingShader(
  material,
  globalTime,
  movingVect,
  parseColorVects(`
  [[0.910 0.910 0.910] [0.135 0.135 0.135] [1.072 1.072 0.670] [-3.142 -2.942 -2.642]]
  `)
)
setMovingShader(
  glassMaterial,
  globalTime,
  movingVect,
  parseColorVects(`
  [[0.450 0.450 0.450] [0.320 0.320 0.320] [1.056 1.056 0.660] [-3.142 -2.942 -2.642]]
  `)
)
setMovingEdgeShader(
  lineMaterial,
  globalTime,
  movingVect,
  parseColorVects(`
  [[0.680 0.680 0.680] [0.135 0.135 0.135] [1.072 1.072 0.670] [-3.142 -2.942 -2.642]]
  `)
)

const initVertexShader = `
uniform float time;
uniform vec3 vect;
varying float bufferRatio;
varying float xPos;

mat4 translate(vec3 v, float t) {
  return mat4(1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              v.x*t, v.y*t, v.z*t, 1.0);
}

`

const mvPositionClamp = `
  float range = 1500.0;
  float bufferDistance = 500.0;
  float r2 = range * 2.0;

  bufferRatio = 1.0;
  mvPosition.x -= floor((mvPosition.x + range) / r2) * r2 ;

  float minX = bufferDistance - range;
  float maxX = range - bufferDistance;
  float b = bufferDistance / 2.0;
  xPos = mvPosition.x;
  if (xPos > maxX) {
    bufferRatio = (range - xPos - b) / b;
    if (bufferRatio < 0.0) bufferRatio = 0.0;
  } else if (xPos < minX) {
    bufferRatio = (xPos + range - b) / b;
    if (bufferRatio < 0.0) bufferRatio = 0.0;
  }
  mvPosition.z *= bufferRatio;
`

function discardFS(shader: string, colorVectors: string) {
  return shader
    .replace(
      'uniform vec3 diffuse;',
      `varying float bufferRatio;
      varying float xPos;
      uniform vec3 diffuse;`
    )
    .replace(
      'void main() {',
      `
vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
  return a + b * cos( 6.28318 * (c * t + d) );
}

void main() {
if (bufferRatio < 0.01) discard;`
    )
    .replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>

vec3 col = palette( xPos/3000.0, ${colorVectors} );
gl_FragColor = vec4( col, 1.0 );`
    )
}

function setMovingShader(
  material: MeshLambertMaterial | MeshStandardMaterial,
  time: { value: number },
  vect: Vector3,
  colorVectors: string
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    shader.uniforms.vect = { value: vect }
    shader.vertexShader = shader.vertexShader
      .replace('varying vec3 vViewPosition;', 'varying vec3 vViewPosition;' + initVertexShader)
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

        ${mvPositionClamp}

        gl_Position = projectionMatrix * modelViewMatrix * mvPosition;`
      )
    shader.fragmentShader = discardFS(shader.fragmentShader, colorVectors)
  }
}

function setMovingEdgeShader(
  material: LineBasicMaterial,
  time: { value: number },
  vect: Vector3,
  colorVectors: string
) {
  material.depthWrite = false
  material.forceSinglePass = true
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    shader.uniforms.vect = { value: vect }

    shader.vertexShader = shader.vertexShader
      .replace(
        'void main() {',
        `
${initVertexShader}
attribute mat4 matrix;
void main() {`
      )
      .replace(
        '#include <project_vertex>',
        `vec4 mvPosition = vec4( transformed, 1.0 );

        #ifdef USE_BATCHING
          mvPosition = batchingMatrix * mvPosition;
        #endif

        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
        #endif

        mvPosition = translate( vect, time ) * matrix * mvPosition;

        ${mvPositionClamp}

        gl_Position = projectionMatrix * modelViewMatrix * mvPosition;`
      )

    shader.fragmentShader = discardFS(shader.fragmentShader, colorVectors)
  }
}
