import { Vector3, MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three'
import { View } from '../src/class/viewClass'

export { setMovingMaterial }

/** 用于生成模型和相机不变，但视觉上匀速平移的场景 */
function setMovingMaterial(
  view: View,
  faceMaterial: MeshLambertMaterial,
  glassMaterial: MeshStandardMaterial,
  lineMaterial: LineBasicMaterial
) {
  view.animations.movingMaterial = () => {
    globalTime.value++
  }
  setMovingShader(faceMaterial, globalTime, movingVect, faceMaterialVects)
  setMovingShader(glassMaterial, globalTime, movingVect, glassMaterialVects)
  setMovingEdgeShader(lineMaterial, globalTime, movingVect, lineMaterialVects)
}

const movingVect = new Vector3(1, 0, 0)
const globalTime = { value: 0 }

// node_modules\three\src\renderers\shaders\ShaderChunk

type uniformVectorType = { [name: string]: { value: Vector3 } }

/** 颜色渐变矢量可视化 @see http://dev.thi.ng/gradients/ */

const faceMaterialVects = getUniformVectors(`
[[0.778 0.778 0.750] [0.198 0.034 -0.198] [-0.770 -0.492 0.490] [-4.670 -4.970 -5.428]]
`)

const glassMaterialVects = getUniformVectors(`
[[0.778 0.778 0.750] [0.198 0.034 -0.198] [-0.770 -0.492 0.490] [-4.670 -4.970 -5.428]]
`)

const lineMaterialVects = getUniformVectors(`
[[1 1 1] [0 0 0] [0 0 0] [0 0 0]]
`)

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

function getUniformVectors(s: string): uniformVectorType {
  const v = JSON.parse(s.trim().replace(/ +/g, ','))
  return {
    v1: { value: new Vector3(...v[0]) },
    v2: { value: new Vector3(...v[1]) },
    v3: { value: new Vector3(...v[2]) },
    v4: { value: new Vector3(...v[3]) },
  }
}

function setFS(shader: string) {
  return shader
    .replace(
      'uniform vec3 diffuse;',
      `varying float bufferRatio;
varying float xPos;
uniform vec3 diffuse;
uniform vec3 v1;
uniform vec3 v2;
uniform vec3 v3;
uniform vec3 v4;
      `
    )
    .replace(
      'void main() {',
      `vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
return a + b * cos( 6.28318 * (c * t + d) );
}

void main() {
if (bufferRatio < 0.01) discard;`
    )
    .replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>
vec3 col = palette( xPos/2000.0,v1,v2,v3,v4 );
gl_FragColor = vec4( col, 1.0 );`
    )
}

function setMovingShader(
  presetMaterial: MeshLambertMaterial | MeshStandardMaterial,
  time: { value: number },
  vect: Vector3,
  colorVector: uniformVectorType
) {
  presetMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, colorVector)
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
    shader.fragmentShader = setFS(shader.fragmentShader)
  }
}

function setMovingEdgeShader(
  lineMaterial: LineBasicMaterial,
  time: { value: number },
  vect: Vector3,
  colorVector: uniformVectorType
) {
  lineMaterial.depthWrite = false
  lineMaterial.forceSinglePass = true
  lineMaterial.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, colorVector)
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

    shader.fragmentShader = setFS(shader.fragmentShader)
  }
}

// 地面移动动画的部分函数
// setPlaneUvMovingX(x: number) {
//   if (this.ground) {
//     const { texture } = this.ground
//     // 0,1,1,1,0,0,1,0
//     this.animations.uvMovingX = () => {
//       texture.offset.x += x
//     }
//   }
// }
// new TextureLoader().load(
//   params.pictureURL,
//   (texture) => {
//     this.ground = { texture, size }
//     groundMaterial.map = texture
//     groundMaterial.needsUpdate = true
//     if (params.uvMoving) {
//       texture.wrapS = texture.wrapT = RepeatWrapping
//       const speed = params.uvMoving / size
//       this.animations.uvMovingX = () => {
//         texture.offset.x += -speed
//       }
//     }
//   },
//   (err) => console.error('TextureLoader error', params.pictureURL, err)
// )
