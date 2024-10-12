import {
  WebGLRenderer,
  PMREMGenerator,
  DataTexture,
  EquirectangularReflectionMapping,
} from 'three'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

import { presetMaterials } from './materials'

/** 为 glassMaterial 添加环境光反射效果 */
export default function addEnvMap(renderer: WebGLRenderer, exrFile: string) {
  const pmremGenerator = new PMREMGenerator(renderer)

  try {
    new EXRLoader().load(exrFile, (texture: DataTexture) => {
      texture.mapping = EquirectangularReflectionMapping
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture)

      // 背景设为环境贴图
      // this.playing.scene.background = texture
      const m = presetMaterials.face['Glass | 玻璃']
      m.envMap = exrCubeRenderTarget.texture
      m.roughness = 0.1
      m.metalness = 1
      m.needsUpdate = true
    })
  } catch (error) {
    console.log('no envMap')
  }
}
