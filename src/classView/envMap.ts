import { PMREMGenerator, DataTexture, EquirectangularReflectionMapping } from 'three'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'
import { presetFaceMaterials } from './materials'
import { View } from './view'

export { addGlassEnvMap }

/** 为 glassMaterial 添加环境光反射效果 */
function addGlassEnvMap(view: View, exrFile: string) {
  const pmremGenerator = new PMREMGenerator(view.renderer)
  return new EXRLoader().load(exrFile, (texture: DataTexture) => {
    texture.mapping = EquirectangularReflectionMapping
    const exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture)
    view.remapCaching.envMapTexture = exrCubeRenderTarget.texture

    // 背景设为环境贴图
    // this.playing.scene.background = texture

    const { glass } = presetFaceMaterials
    glass.envMap = exrCubeRenderTarget.texture
    glass.roughness = 0.1
    glass.metalness = 1
    glass.needsUpdate = true
  })
}
