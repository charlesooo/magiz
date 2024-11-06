import { Vector2, Matrix4 } from 'three'
import { sSample } from './handleMath'
import { TEMP, applyBasicTransform } from './handleBasic'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'

export { handleSlopingRoof }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleSlopingRoof(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  bounds: { min: Vector2; max: Vector2 }
) {
  const { slopingRoof, elevations } = parsedStyle
  slopingRoof.forEach((params) => {
    const { form, height, overhang } = params
    const { min, max } = bounds

    const mtx = new Matrix4().makeScale(
      max.x - min.x + overhang * 2,
      max.y - min.y + overhang * 2,
      Math.abs(height)
    )
    applyBasicTransform(params, mtx, TEMP)
    mtx.premultiply(TEMP.makeTranslation(min.x - overhang, min.y - overhang, 0))

    const { index, glass } = sSample(params.colorID)!
    const target: magizTypes.instancedData =
      result.instanced[
        form === '2' ? (glass ? 'slope2Glass' : 'slope2') : glass ? 'slope4Glass' : 'slope4'
      ]
    target.colors.push(index)

    elevations.forEach((elevation) => {
      target.matrices.push(mtx.premultiply(TEMP.makeTranslation(0, 0, elevation)).toArray())
    })
  })
}
