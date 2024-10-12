import { Vector2, Matrix4 } from 'three'
import { sample } from './handleMath'
import { TEMP, DEFAULT_COLOR, applyTransform } from './handleBasic'
import { Seed } from './utils'

import type { styleParsed } from '../types/stylesParsed'
import type { magizTypes } from '../types/magizTypes'

export { handleClampBox }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleClampBox(
  parsed: styleParsed.clampBox[],
  bounds: { min: Vector2; max: Vector2 },
  result: magizTypes.rawBuilding,
  seed: Seed
) {
  parsed.forEach((clampParams) => {
    const { color, height, elevation } = clampParams
    const { min, max } = bounds

    const sampleColor = sample(color, seed) || DEFAULT_COLOR
    const matrix = new Matrix4().makeTranslation(0.5, 0.5, 0.5)
    if (height < 0) matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
    matrix.premultiply(TEMP.makeScale(max.x - min.x, max.y - min.y, Math.abs(height)))
    applyTransform(clampParams, matrix).premultiply(TEMP.makeTranslation(min.x, min.y, elevation))

    const saveAs = result.data[sampleColor.glass ? 'boxGlass' : 'box']
    saveAs.matrices.push(matrix.toArray())
    saveAs.colors.push(sampleColor.index)
  })
}
