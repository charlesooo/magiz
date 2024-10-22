import { Vector2, Matrix4 } from 'three'
import { TEMP, applyBasicTransform } from './handleBasic'
import { Seed, pushInstancedData } from './utils'

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
    const { colorID, height, elevation } = clampParams
    const { min, max } = bounds

    const mtx = new Matrix4().makeTranslation(0.5, 0.5, 0.5)
    if (height < 0) mtx.premultiply(TEMP.makeTranslation(0, 0, -1))
    mtx.premultiply(TEMP.makeScale(max.x - min.x, max.y - min.y, Math.abs(height)))
    applyBasicTransform(clampParams, mtx, TEMP)
    mtx.premultiply(TEMP.makeTranslation(min.x, min.y, elevation))
    pushInstancedData(result, seed, colorID, mtx)
  })
}
