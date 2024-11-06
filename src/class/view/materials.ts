import {
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
} from 'three'
import { presetColors } from '../styleHandler/color'

export { basicFaceMaterials, presetFaceMaterials, presetOtherMaterials }

/** instancedMesh 材质的颜色，会与setColorAt的颜色混合 */
const basicFaceMaterials = {
  solid: new MeshBasicMaterial(),
  glass: new MeshBasicMaterial(),
  roof: new MeshBasicMaterial({ side: 2 }),
}

/** instancedMesh 材质的颜色，会与setColorAt的颜色混合 */
const presetFaceMaterials = {
  solid: new MeshLambertMaterial(),
  glass: new MeshStandardMaterial({
    side: 2,
    opacity: 0.6,
    transparent: true,
  }),
  roof: new MeshLambertMaterial({ side: 2 }),
}

const presetOtherMaterials = {
  edge: new LineBasicMaterial({ color: presetColors.other.EDGE }),
  ground: new MeshLambertMaterial({
    color: presetColors.other.GROUND,
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
