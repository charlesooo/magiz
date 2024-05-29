import { DoubleSide, MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three'

export { material, twoSideMaterial, glassMaterial, lineMaterial }

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

lineMaterial.onBeforeCompile = (shader) => {
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
