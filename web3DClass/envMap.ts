import { WebGLRenderer, PMREMGenerator, DataTexture, EquirectangularReflectionMapping } from 'three'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

import { glassMaterial } from './raw'

/** 为 glassMaterial 添加环境光反射效果 */
export default function addEnvMap(renderer: WebGLRenderer, exrFile: string) {
  const pmremGenerator = new PMREMGenerator(renderer)

  try {
    new EXRLoader().load(exrFile, (texture: DataTexture) => {
      texture.mapping = EquirectangularReflectionMapping
      const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture)

      // 背景设为环境贴图
      // this.playing.scene.background = texture

      glassMaterial.envMap = exrCubeRenderTarget.texture
      glassMaterial.roughness = 0.1
      glassMaterial.metalness = 1
      glassMaterial.needsUpdate = true
    })
  } catch (error) {
    console.log('no envMap')
  }
}
