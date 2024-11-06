import { Vector2, Matrix4 } from 'three'
import { TEMP, applyBasicTransform } from './handleBasic'
import { getClampedRects } from './handleMath'
import { pushBoxData } from './utils'

import type { styleParsed } from '../../types/stylesParsed'
import type { magizTypes } from '../../types/magizTypes'

export { handleBoundingBox }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleBoundingBox(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  bounds: { min: Vector2; max: Vector2 }
) {
  const { boundingBox, elevations } = parsedStyle
  boundingBox.forEach((params) => {
    const { colorID, height, clamp } = params
    const rects = clamp ? getClampedRects(bounds, clamp) : [bounds]
    rects.forEach((rect) => {
      const { min, max } = rect
      // 按最小点为基准进行变换
      const mtx = new Matrix4().makeTranslation(0.5, 0.5, 0.5)
      if (height < 0) mtx.premultiply(TEMP.makeTranslation(0, 0, -1))

      mtx.premultiply(TEMP.makeScale(max.x - min.x, max.y - min.y, Math.abs(height)))
      applyBasicTransform(params, mtx, TEMP)
      elevations.forEach((elevation) => {
        pushBoxData(
          result,
          colorID,
          mtx.premultiply(TEMP.makeTranslation(min.x, min.y, elevation))
        )
      })
    })
  })
}
