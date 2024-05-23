import { Matrix4 } from 'three'
import { SEED } from './handleUtils'
import { sample, getScaleRatio } from './handleMath'
import { TEMP, DEFAULT_COLOR, applyTransform } from './handleBasic'

import type { temp } from '../types/temp'

export { handleExtrude }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleExtrude(
  parsed: parsed.extrude[],
  rays: temp.ray[][],
  result: rawDataType,
  seed: SEED,
  size: { x: number; y: number },
  scale: parsed.scaleOrOffsetType | undefined
) {
  parsed.forEach((extrudeParams) => {
    const { color, height, thickness, elevation } = extrudeParams
    const sampleColor = sample(color, seed) || DEFAULT_COLOR
    const matrix = new Matrix4()

    if (thickness) {
      // 按 thickness 偏移后的边线生成有厚度墙面
      const moveY = thickness < 0 ? -0.5 : 0.5
      const moveZ = height < 0 ? -0.5 : 0.5
      const saveAs = result.boxData[sampleColor.glass ? 'boxGlass' : 'box']
      rays.forEach((loop) => {
        loop.forEach((ray) => {
          const boxMatrix = matrix.clone()
          boxMatrix
            .premultiply(TEMP.makeTranslation(0.5, moveY, moveZ))
            .premultiply(
              TEMP.makeScale(ray.direction.length(), Math.abs(thickness), Math.abs(height))
            )
            .premultiply(TEMP.makeRotationZ(ray.direction.angle()))

          applyTransform(extrudeParams, boxMatrix).premultiply(
            TEMP.makeTranslation(ray.start.x, ray.start.y, elevation)
          )

          saveAs.matrices.push(boxMatrix.toArray())
          saveAs.colors.push(sampleColor.index)
        })
      })
    } else {
      // 按 scale 挤出体块
      const scaleRatio = getScaleRatio(size, scale)
      // extrudeGeometry 生成时高度预设为 1
      if (height < 0) matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
      matrix.premultiply(TEMP.makeScale(...scaleRatio, Math.abs(height)))
      applyTransform(extrudeParams, matrix).premultiply(TEMP.makeTranslation(0, 0, elevation))
      const saveAs = result.floorData[sampleColor.glass ? 'blockGlass' : 'block']
      saveAs.matrices.push(matrix.toArray())
      saveAs.colors.push(sampleColor.index)
    }
  })
}
