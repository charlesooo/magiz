import { Vector2, Matrix4 } from 'three'
import {
  sRand,
  sSample,
  sweepPolygonX,
  sRotateLinesAlong,
  spacingMatchPolygonX,
} from './handleMath'
import { getValidIndexes, pushBoxData } from './handleArray'
import { TEMP, applyBasicTransform } from './handleBasic'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { handleSpacingMatch, handleAppendent }

/** 首尾对齐的结果进行合并 */
function simplifyMatchData(matchData: temp.match[]) {
  const result: temp.match[] = []
  let x = matchData[0]
  if (x) {
    result.push(x)
    // 第一个推送到结果，再比较之后的数据
    for (let i = 1; i < matchData.length; i++) {
      const current = matchData[i]!
      if (current.pairs.length !== x.pairs.length) {
        // 拟合结果的数量发生变化，修改目标设为当前并推送到结果
        x = current
        result.push(x)
      } else {
        // 拟合结果的数量相同，寻找当前的和目标的不同点
        const difference = x.pairs.find((xp, n) => {
          const cp = current.pairs[n]
          // 宽度和X坐标的差别超过阈值
          return cp && Math.abs(xp.width - cp.width) < 1 && Math.abs(xp.center.x - cp.center.x) < 1
            ? false
            : true
        })
        if (difference) {
          // 差别超过阈值，修改目标设为当前并推送到结果
          x = current
          result.push(x)
        } else {
          // 没有差别时更新修改目标
          x.flexDepth += current.flexDepth
          x.height = (x.height + current.height) / 2
          const moveY = current.flexDepth / 2
          x.pairs.forEach((pair) => {
            pair.center.y += moveY
          })
        }
      }
    }
  }
  return result
}

/** 将 parsed.match 转为纯数据保存到结果 */
function handleSpacingMatch(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  rayLoops: temp.ray[][],

  /** 拟合平面时可以简化结果 */
  simplify = false
) {
  const { matchSpacing, elevations } = parsedStyle
  matchSpacing.forEach((params) => {
    // 根据参数旋转平面再进行拟合
    const { control, sandwich, alignEnd, array, along } = params

    const { newRays, radian } = sRotateLinesAlong(rayLoops.flat(), along)

    let matchData = spacingMatchPolygonX(newRays, array, sandwich, alignEnd)
    if (simplify) matchData = simplifyMatchData(matchData)
    if (!matchData) return

    // 调用spacing函数

    getValidIndexes(matchData.length, control).forEach((i) => {
      const data = matchData[i]!
      const matchDepth = data.flexDepth
      let h = data.height

      // 处理height为负的情况
      let moveH = 0
      if (h < 0) {
        moveH = h
        h = -h
      }

      if (h > 0) {
        data.pairs.forEach((pair) => {
          const matrix = new Matrix4().makeScale(pair.width, matchDepth, h)
          applyBasicTransform(data, matrix, TEMP)
          matrix
            .premultiply(TEMP.makeTranslation(pair.center.x, pair.center.y, moveH + h / 2))
            .premultiply(TEMP.makeRotationZ(-radian))

          elevations.forEach((elevation) => {
            pushBoxData(
              result,
              data.colorID,
              matrix.clone().premultiply(TEMP.makeTranslation(0, 0, elevation))
            )
          })
        })
      }
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
    const { parts, place, count } = params
    const isOnEdge = place === 'EDGE'

    for (let i = 0; i < count; i++) {
      const point = isOnEdge ? randomPointOnEdge(rayLoops) : randomPointInPolygon(rayLoops)
      if (point) {
        parts.forEach((box) => {
          const mtx = new Matrix4()
            .makeTranslation(0, 0, 0.5)
            .premultiply(TEMP.makeScale(box.widthX, box.depthY, box.heightZ))
          applyBasicTransform(box, mtx, TEMP)

          elevations.forEach((elevation) => {
            pushBoxData(
              result,
              box.colorID,
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
  const sweepResult = sweepPolygonX(randomY, loops.flat())
  const pair = sweepResult[Math.floor(sRand() * sweepResult.length)]
  return pair ? new Vector2(pair[0].x + (pair[1].x - pair[0].x) * sRand(), randomY) : undefined
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

// /** 根据拟合的结果matchData，从指定序号开始向两侧收集符合条件的结果，用于生成随机大小的 boxInside */
// function collectPairs(
//   matchData: temp.match[],
//   matchIndex: number,
//   pairIndex: number,
//   count: number
// ) {
//   const pair = matchData[matchIndex]?.pairs[pairIndex]
//   if (pair) {
//     const { center, width } = pair
//     const vars = {
//       xLeftMin: center.x - width / 2,
//       xRightMax: center.x + width / 2,
//       centerMinY: center.y,
//       centerMaxY: center.y,
//     }

//     matching(matchData, matchIndex, 1, count, vars)
//     matching(matchData, matchIndex, -1, count, vars)

//     return {
//       w: vars.xRightMax - vars.xLeftMin,
//       d: vars.centerMaxY - vars.centerMinY,
//       x: (vars.xLeftMin + vars.xRightMax) / 2,
//       y: (vars.centerMinY + vars.centerMaxY) / 2,
//     }
//   }
//   return undefined
// }

// /** 从index开始朝一个方向进行拟合，同步更新 xLeftMin, xRightMax, centerMaxY, centerMinY */
// function matching(
//   matchData: temp.match[],
//   index: number,
//   direction: number,
//   count: number,
//   vars: {
//     xLeftMin: number
//     xRightMax: number
//     centerMinY: number
//     centerMaxY: number
//   }
// ) {
//   let found = true
//   while (count > 0 && found) {
//     found = false
//     index += direction
//     matchData[index]?.pairs.forEach((pair) => {
//       const { center, width } = pair
//       const xL = center.x - width / 2
//       const xR = center.x + width / 2

//       if (!(xR <= vars.xLeftMin || xL >= vars.xRightMax)) {
//         if (vars.xLeftMin < xL) vars.xLeftMin = xL
//         if (vars.xRightMax > xR) vars.xRightMax = xR
//         if (direction > 0) {
//           vars.centerMaxY = center.y
//         } else {
//           vars.centerMinY = center.y
//         }
//         found = true
//         count--
//       }
//     })
//   }
// }
