import {
  DoubleSide,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
} from 'three'

export { basicFaceMaterials, presetFaceMaterials, presetOtherMaterials }

const basicFaceMaterials = {
  solid: new MeshBasicMaterial(),
  glass: new MeshBasicMaterial({ color: '#eee' }),
  roof: new MeshBasicMaterial({ side: 2 }),
}

const presetFaceMaterials = {
  solid: new MeshLambertMaterial(),
  glass: new MeshStandardMaterial({
    color: '#eee',
    side: DoubleSide,
    opacity: 0.6,
    transparent: true,
  }),
  roof: new MeshLambertMaterial({ side: 2 }),
}

const presetOtherMaterials = {
  edge: new LineBasicMaterial({ color: '#333' }),
  ground: new MeshLambertMaterial({
    color: '#eee',
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 0.1,
  }),
}

// 通过shader渲染instancedMesh的边线
presetOtherMaterials.edge.onBeforeCompile = (shader) => {
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
