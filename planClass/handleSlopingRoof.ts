import { Vector2, Matrix4 } from 'three'
import { sample } from './handleMath'
import { SEED } from './handleUtils'
import { TEMP, DEFAULT_COLOR, applyTransform } from './handleBasic'

export { handleSlopingRoof }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleSlopingRoof(
  parsed: parsed.slopingRoof[],
  bounds: { min: Vector2; max: Vector2 },
  result: rawDataType,
  seed: SEED
) {
  parsed.forEach((roofParams) => {
    const { color, height, overhang, elevation } = roofParams
    const { min, max } = bounds
    const sampleColor = sample(color, seed) || DEFAULT_COLOR
    const matrix = new Matrix4().makeScale(
      max.x - min.x + overhang * 2,
      max.y - min.y + overhang * 2,
      Math.abs(height)
    )

    applyTransform(roofParams, matrix).premultiply(
      TEMP.makeTranslation(min.x - overhang, min.y - overhang, elevation)
    )

    const saveAs = result.data[sampleColor.glass ? 'slopingGlass' : 'sloping']
    saveAs.matrices.push(matrix.toArray())
    saveAs.colors.push(sampleColor.index)
  })
}
