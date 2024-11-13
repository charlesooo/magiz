import { Vector2, Matrix4 } from 'three'
import { TEMP, applyBasicTransform, pushBoxData } from './handleBox'
import { getClampedRects, sRand, sSample, sweepPolygonX } from './handleMath'

import type { styleParsed } from '../../types/stylesParsed'
import type { magizTypes } from '../../types/magizTypes'
import type { temp } from '../../types/temp'

export { handleBoundingBox, handleSlopingRoof, handleAppendent }

/** 将 parsed.block 转为纯数据保存到结果 */
function handleBoundingBox(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  bounds: { min: Vector2; max: Vector2 }
) {
  const { boundingBox, elevations } = parsedStyle
  boundingBox.forEach((params) => {
    const { color, height, clamp } = params
    const rects = clamp ? getClampedRects(bounds, clamp) : [bounds]
    rects.forEach((rect) => {
      const { min, max } = rect
      // 按最小点为基准进行变换
      const mtx = new Matrix4().makeTranslation(0.5, 0.5, 0.5)
      if (height < 0) mtx.premultiply(TEMP.makeTranslation(0, 0, -1))

      mtx.premultiply(TEMP.makeScale(max.x - min.x, max.y - min.y, Math.abs(height)))
      applyBasicTransform(params, mtx)
      elevations.forEach((elevation) => {
        pushBoxData(result, color, mtx.premultiply(TEMP.makeTranslation(min.x, min.y, elevation)))
      })
    })
  })
}

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
    applyBasicTransform(params, mtx)
    mtx.premultiply(TEMP.makeTranslation(min.x - overhang, min.y - overhang, 0))

    const { index, glass } = sSample(params.color)!
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

function handleAppendent(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  rayLoops: temp.ray[][]
) {
  const { appendent, elevations } = parsedStyle
  appendent.forEach((params) => {
    const { boxes, place, count } = params
    const isOnEdge = place === 'EDGE'

    for (let i = 0; i < count; i++) {
      const point = isOnEdge ? randomPointOnEdge(rayLoops) : randomPointInPolygon(rayLoops)
      if (point) {
        boxes.forEach((box) => {
          const mtx = new Matrix4()
            .makeTranslation(0, 0, 0.5)
            .premultiply(TEMP.makeScale(box.widthX, box.depthY, box.heightZ))
          applyBasicTransform(box, mtx)

          elevations.forEach((elevation) => {
            pushBoxData(
              result,
              box.color,
              mtx.premultiply(TEMP.makeTranslation(point.x, point.y, elevation))
            )
          })
        })
      }
    }
  })
}

/** 返回多边形的随机内部点 */
function randomPointInPolygon(loops: temp.line[][]) {
  // 多边形沿Y轴的范围内随机取点
  const rangeY = { min: Infinity, max: -Infinity }
  loops[0]?.forEach((p) => {
    rangeY.min = Math.min(rangeY.min, p.start.y)
    rangeY.max = Math.max(rangeY.max, p.start.y)
  })
  const randomY = rangeY.min + sRand() * (rangeY.max - rangeY.min)

  // 随机选择一个交点的pair，从中随机取一个内部点
  const sweepX = sweepPolygonX(randomY, loops.flat())
  const pair = sweepX[Math.round(sRand() * (sweepX.length - 1))]!
  return pair
    ? new Vector2(pair.start.x + (pair.end.x - pair.start.x) * sRand(), randomY)
    : undefined
}

/** 返回多边形边线上的随机点 */
function randomPointOnEdge(loops: temp.line[][]) {
  const loop = loops[0]
  if (loop) {
    const line = sSample(loop)
    if (line) {
      const { start, end } = line
      const t = sRand()
      return new Vector2(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t)
    }
  }
  return undefined
}
