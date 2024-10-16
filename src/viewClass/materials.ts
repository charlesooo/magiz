import { DoubleSide, MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three'
import type { magizTypes } from '../types/magizTypes'

export { presetFaceMaterials, presetLineMaterials, presetAlias, setMaterialCN }

const presetFaceMaterials = {
  solid: new MeshLambertMaterial(),
  glass: new MeshStandardMaterial({
    side: DoubleSide,
    opacity: 0.6,
    transparent: true,
  }),
  roof: new MeshLambertMaterial({ side: 2 }),
  ground: new MeshLambertMaterial({
    color: '#eee',
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 0.1,
  }),
}

const presetLineMaterials = { edge: new LineBasicMaterial({ color: '#000' }) }

const presetAlias: {
  face: { [prop in keyof magizTypes.remapColor['face']]: string }
  line: { [prop in keyof magizTypes.remapColor['line']]: string }
} = {
  face: {
    _GLASS: '玻璃 | Glass',
    _CONCRETE: '混凝土 | Concrete',
    _METAL: '金属 | Metal',
    _WOOD: '木材 | Wood',
    _BRICK: '砖 | Brick',
    _ROOF: '屋顶 | Roof',
    GROUND: '地面 | Ground',
  },
  line: {
    EDGE: '边线 | Edge',
  },
}

// 通过shader渲染instancedMesh的边线
presetLineMaterials.edge.onBeforeCompile = (shader) => {
  shader.vertexShader = shader.vertexShader
    .replace(
      'void main() {',
      `
attribute mat4 matrix;
void main() {`
    )
    .replace(
      '#include <project_vertex>',
      `vec4 mvPosition = matrix * vec4( transformed, 1.0 );
      gl_Position = projectionMatrix * modelViewMatrix * mvPosition;`
    )
}

/**设置显示基于色彩的 ControlNet 效果 */
function setMaterialCN(on: boolean) {
  let n: keyof typeof presetFaceMaterials
  if (on) {
    for (n in presetFaceMaterials) {
      presetFaceMaterials[n].onBeforeCompile = (shader) => {
        shader.fragmentShader = `
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1);
}`
      }
    }
  } else {
    for (n in presetFaceMaterials) {
      presetFaceMaterials[n].onBeforeCompile = () => {}
    }
  }
  // 设置边线
}
