import { Vector2, Matrix4 } from 'three'
import { Seed, sample } from './utils'
import { TEMP, applyBasicTransform } from './handleBasic'

import type { magizTypes } from '../types/magizTypes'
import type { styleParsed } from '../types/stylesParsed'

export { handleSlopingRoof }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleSlopingRoof(
  parsed: styleParsed.slopingRoof[],
  bounds: { min: Vector2; max: Vector2 },
  result: magizTypes.rawBuilding,
  seed: Seed
) {
  parsed.forEach((roofParams) => {
    const { form, height, overhang, elevation } = roofParams
    const { min, max } = bounds

    const mtx = new Matrix4().makeScale(
      max.x - min.x + overhang * 2,
      max.y - min.y + overhang * 2,
      Math.abs(height)
    )
    applyBasicTransform(roofParams, mtx, TEMP)
    mtx.premultiply(TEMP.makeTranslation(min.x - overhang, min.y - overhang, elevation))

    const { index, glass } = sample(roofParams.colorID, seed)!
    const target: magizTypes.instancedData =
      result.instanced[
        form === '2' ? (glass ? 'slope2Glass' : 'slope2') : glass ? 'slope4Glass' : 'slope4'
      ]
    target.colors.push(index)
    target.matrices.push(mtx.toArray())
  })
}
