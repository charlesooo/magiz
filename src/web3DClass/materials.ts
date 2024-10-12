import { DoubleSide, MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three'

export { presetMaterials, setMaterialCN }

const glassPreset = {
  side: DoubleSide,
  opacity: 0.6,
  transparent: true,
}

const groundPreset = {
  color: '#eee',
  polygonOffset: true,
  polygonOffsetFactor: 1,
  polygonOffsetUnits: 0.1,
}

const presetMaterials = {
  face: {
    'Concrete | 混凝土': new MeshLambertMaterial(),
    'Metal | 金属': new MeshLambertMaterial(),
    'Wood | 木材': new MeshLambertMaterial(),
    'Brick |砖': new MeshLambertMaterial(),
    'Glass | 玻璃': new MeshStandardMaterial(glassPreset),
    'Roof | 屋顶': new MeshLambertMaterial({ side: 2 }),
    'Ground | 地面': new MeshLambertMaterial(groundPreset),
    //////////////// 待定 ////////////////
    // 'Road | 道路': new MeshLambertMaterial(groundPreset),
    // 'Grass | 草地': new MeshLambertMaterial(groundPreset),
    // 'Water | 水面': new MeshLambertMaterial(groundPreset),
  },
  edge: { 'Edge | 边线': new LineBasicMaterial({ color: '#000' }) },
}

// 通过shader渲染instancedMesh的边线
presetMaterials.edge['Edge | 边线'].onBeforeCompile = (shader) => {
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
  let n: keyof typeof presetMaterials.face
  if (on) {
    for (n in presetMaterials.face) {
      presetMaterials.face[n].onBeforeCompile = (shader) => {
        shader.fragmentShader = `
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1);
}`
      }
    }
  } else {
    for (n in presetMaterials.face) {
      presetMaterials.face[n].onBeforeCompile = () => {}
    }
  }
  // 设置边线
}
