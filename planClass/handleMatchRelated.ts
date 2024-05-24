import { Vector2, Matrix4 } from 'three'
import {
  rand,
  sample,
  randomBetween,
  sweepPolygonLines,
  rotateLinesAlong,
  matchPolygonLinesAlongX,
} from './handleMath'
import { TEMP, DEFAULT_COLOR, applyTransform } from './handleBasic'
import { passControl, SEED } from './handleUtils'

import type { temp } from '../types/temp'

export { handleMatch, handleBoxInside, handleAdjunct, handleExtrude }

// TODO: handleExtrude 可缓存计算结果以减少重复计算

/** 首尾对齐的结果进行合并 */
function simplifyMatchData(matchData: temp.match[]) {
  const result: temp.match[] = []
  let x = matchData[0]
  if (x) {
    result.push(x)
    // 第一个推送到结果，再比较之后的数据
    for (let i = 1; i < matchData.length; i++) {
      const current = matchData[i] as temp.match
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
          x.depth += current.depth
          x.height = (x.height + current.height) / 2
          x.elevation = (x.elevation + current.elevation) / 2
          const moveY = current.depth / 2
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
function handleMatch(parsed: parsed.match[], rays: temp.ray[][], result: rawDataType, seed: SEED) {
  parsed.forEach((matchParsed) => {
    // 根据参数旋转平面再进行拟合
    const { along, flexes, elevation, sandwich } = matchParsed
    const { newRays, radian } = rotateLinesAlong(rays.flat(), seed, along)

    const matchData = simplifyMatchData(
      matchPolygonLinesAlongX(newRays, flexes, elevation, sandwich)
    )
    if (!matchData) return

    /** 拟合结果的总深度（） */
    let total = 0
    matchData.forEach((data) => (total += data.depth))

    let tStart = 0
    let tEnd = total
    let bStart = 0
    let bEnd = total
    const paddingT = matchParsed.top?.padding
    const paddingB = matchParsed.bottom?.padding
    if (paddingB || paddingT) {
      if (paddingT) {
        tStart = total * paddingT.start
        tEnd = total * (1 - paddingT.end)
      }
      if (paddingB) {
        bStart = total * paddingB.start
        bEnd = total * (1 - paddingB.end)
      }
    }

    /** 顶部padding后的序号范围 */
    const tRange = tEnd - tStart
    /** 底部padding后的序号范围 */
    const bRange = bEnd - bStart
    /** 用于 padding */
    let current = 0

    matchData.forEach((data, i) => {
      if (passControl(i, seed, matchParsed.control)) {
        const { depth, pairs } = data
        let { height, elevation } = data

        // 处理height为负的情况
        let moveH = 0
        if (height < 0) {
          moveH = height
          height = -height
        }

        // 非占位
        if (height > 0) {
          current += depth / 2

          // 调整顶部形态
          if (matchParsed.top && tRange > 0) {
            const { like, ratio } = matchParsed.top

            if (tStart < current && current < tEnd) {
              const v =
                like === 'HILL'
                  ? 1 - Math.sin(((current - tStart) / tRange) * Math.PI)
                  : like === 'VALLEY'
                  ? Math.sin(((current - tStart) / tRange) * Math.PI)
                  : rand(seed)
              height *= 1 - ratio * v
            }
          }

          // 调整底部形态
          if (matchParsed.bottom && bRange > 0) {
            const { like, ratio } = matchParsed.bottom
            if (bStart < current && current < bEnd) {
              const v =
                like === 'TUNNEL' ? Math.sin(((current - bStart) / bRange) * Math.PI) : rand(seed)
              const n = height * ratio * v
              elevation += n
              height -= n
            }
          }

          current += depth / 2
          const restoreMatrix = new Matrix4().makeRotationZ(-radian)

          // pair 为每个step代表中线的交点
          pairs.forEach((pair) => {
            // 随机颜色须每个单独sample
            const color = sample(data.color, seed) || DEFAULT_COLOR
            const matrix = applyTransform(data, new Matrix4().makeScale(pair.width, depth, height))
              .premultiply(
                TEMP.makeTranslation(pair.center.x, pair.center.y, elevation + moveH + height / 2)
              )
              .premultiply(restoreMatrix)

            const saveAs: instancedDataType = result.data[color.glass ? 'boxGlass' : 'box']
            saveAs.matrices.push(matrix.toArray())
            saveAs.colors.push(color.index)
          })
        } else {
          current += depth
        }
      }
    })
  })
}

function handleBoxInside(
  parsed: parsed.boxInside[],
  rays: temp.ray[][],
  result: rawDataType,
  seed: SEED
) {
  parsed.forEach((boxInside) => {
    const { flex, count, depthRatio, widthRatio, heightRatio, along, elevation } = boxInside
    const { newRays, radian } = rotateLinesAlong(rays.flat(), seed, along)
    /** 生成拟合数据 */
    const matchData = matchPolygonLinesAlongX(newRays, [flex], elevation, false)
    if (!matchData) return
    /** 确定生成体块的数量 */
    const total = randomBetween(seed, ...count)

    if (matchData.length > 0) {
      /** 从拟合数据中挑选最终数据 */
      const selected: {
        matchDataIndex: number
        props: {
          /** 最终宽度 */
          w: number
          /** 最终深度 */
          d: number
          /** 最终元素中点的x坐标 */
          x: number
          /** 最终元素中点的y坐标 */
          y: number
        }
      }[] = []

      for (let i = 0; i < total; i++) {
        // 随机选择开始的 matchData.pairs
        const c = rand(seed)
        let matchDataIndex = 0
        if (c < 0.2) {
          matchDataIndex = Math.floor(matchData.length * rand(seed))
        } else if (c < 0.6) {
          matchDataIndex = Math.floor(matchData.length * randomBetween(seed, 0, 0.2, 0.02))
        } else {
          matchDataIndex = Math.floor(matchData.length * randomBetween(seed, 0.8, 1, 0.02))
        }

        const data = matchData[matchDataIndex]
        if (data) {
          const pi = Math.floor(data.pairs.length * rand(seed))

          // 从matchData中提取box的中点坐标和长宽
          const count = Math.floor(matchData.length * randomBetween(seed, ...depthRatio))
          const props = collectPairs(matchData, matchDataIndex, pi, count)
          if (props) selected.push({ matchDataIndex, props })
        }
      }

      // 按面积从小到大排列以分配高度，避免因为面积大的高于面积小的而大的完全包裹住小的
      selected.sort((a, b) => a.props.w * a.props.d - b.props.w * b.props.d)
      const heightStep = (heightRatio[1] - heightRatio[0]) / selected.length

      selected.forEach((c, i) => {
        const { props, matchDataIndex } = c
        const data = matchData[matchDataIndex]
        if (data) {
          let h = flex.height

          if (props.d > 0) {
            // 计算元素的横向长度与位移
            const w = props.w * randomBetween(seed, ...widthRatio, 0.05)
            let moveX = props.w - w
            const c = rand(seed)
            if (c < 0.2) {
              // 控制生成的元素只有20%概率靠近中心点
              moveX *= 0.2 - randomBetween(seed, 0, 0.4, 0.02)
            } else if (c < 0.6) {
              moveX *= 0.5 - randomBetween(seed, 0, 0.2, 0.02)
            } else {
              moveX *= randomBetween(seed, 0, 0.2, 0.02) - 0.5
            }

            const moveY = Math.round(10 * (rand(seed) - 0.5)) * 0.2

            // 计算元素的高度，面积越大(i越大)高度越低
            h *= 1 - i * heightStep

            let matrix = new Matrix4().premultiply(TEMP.makeScale(w, props.d, h))

            matrix = applyTransform(data, matrix)
              .premultiply(
                TEMP.makeTranslation(props.x + moveX, props.y + moveY, elevation + h / 2)
              )
              .premultiply(TEMP.makeRotationZ(-radian))

            const color = sample(data.color, seed) || DEFAULT_COLOR
            const saveAs: instancedDataType = result.data[color.glass ? 'boxGlass' : 'box']
            saveAs.matrices.push(matrix.toArray())
            saveAs.colors.push(color.index)
          }
        }
      })
    }
  })
}

function handleAdjunct(
  parsed: parsed.adjunct[],
  rays: temp.ray[][],
  result: rawDataType,
  seed: SEED
) {
  parsed.forEach((adjunct) => {
    const { boxes, place, count, elevation } = adjunct
    const isOnEdge = place === 'EDGE'

    for (let i = 0; i < count; i++) {
      const point = isOnEdge ? randomPointOnEdge(rays, seed) : randomPointInPolygon(rays, seed)
      if (point) {
        boxes.forEach((box) => {
          const color = sample(box.color, seed) || DEFAULT_COLOR
          const matrix = new Matrix4()
            .makeTranslation(0, 0, 0.5)
            .premultiply(TEMP.makeScale(box.x, box.y, box.z))
          applyTransform(box, matrix).premultiply(
            TEMP.makeTranslation(point.x, point.y, elevation)
          )
          const saveAs: instancedDataType = result.data[color.glass ? 'boxGlass' : 'box']
          saveAs.matrices.push(matrix.toArray())
          saveAs.colors.push(color.index)
        })
      }
    }
  })
}

/** 返回多边形的随机内部点 */
function randomPointInPolygon(loops: temp.line[][], seed: SEED) {
  // 多边形沿Y轴的范围内随机取点
  const rangeY = { min: Infinity, max: -Infinity }
  loops[0]?.forEach((p) => {
    rangeY.min = Math.min(rangeY.min, p.start.y)
    rangeY.max = Math.max(rangeY.max, p.start.y)
  })
  const randomY = rangeY.min + rand(seed) * (rangeY.max - rangeY.min)

  // 随机选择一个交点的pair，从中随机取一个内部点
  const sweepResult = sweepPolygonLines(randomY, loops.flat())
  const pair = sweepResult[Math.floor(rand(seed) * sweepResult.length)]
  return pair ? new Vector2(pair[0].x + (pair[1].x - pair[0].x) * rand(seed), randomY) : undefined
}

/** 返回多边形边线上的随机点 */
function randomPointOnEdge(loops: temp.line[][], seed: SEED) {
  const loop = loops[0]
  if (loop) {
    const line = sample(loop, seed)
    if (line) {
      const { start, end } = line
      const t = rand(seed)
      return new Vector2(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t)
    }
  }
}

/** 根据拟合的结果matchData，从指定序号开始向两侧收集符合条件的结果，用于生成随机大小的 boxInside */
function collectPairs(
  matchData: temp.match[],
  matchIndex: number,
  pairIndex: number,
  count: number
) {
  const pair = matchData[matchIndex]?.pairs[pairIndex]
  if (pair) {
    const { center, width } = pair
    const vars = {
      xLeftMin: center.x - width / 2,
      xRightMax: center.x + width / 2,
      centerMinY: center.y,
      centerMaxY: center.y,
    }

    matching(matchData, matchIndex, 1, count, vars)
    matching(matchData, matchIndex, -1, count, vars)

    return {
      w: vars.xRightMax - vars.xLeftMin,
      d: vars.centerMaxY - vars.centerMinY,
      x: (vars.xLeftMin + vars.xRightMax) / 2,
      y: (vars.centerMinY + vars.centerMaxY) / 2,
    }
  }
}

/** 从index开始朝一个方向进行拟合，同步更新 xLeftMin, xRightMax, centerMaxY, centerMinY */
function matching(
  matchData: temp.match[],
  index: number,
  direction: number,
  count: number,
  vars: {
    xLeftMin: number
    xRightMax: number
    centerMinY: number
    centerMaxY: number
  }
) {
  let found = true
  while (count > 0 && found) {
    found = false
    index += direction
    matchData[index]?.pairs.forEach((pair) => {
      const { center, width } = pair
      const xL = center.x - width / 2
      const xR = center.x + width / 2

      if (!(xR <= vars.xLeftMin || xL >= vars.xRightMax)) {
        if (vars.xLeftMin < xL) vars.xLeftMin = xL
        if (vars.xRightMax > xR) vars.xRightMax = xR
        if (direction > 0) {
          vars.centerMaxY = center.y
        } else {
          vars.centerMinY = center.y
        }
        found = true
        count--
      }
    })
  }
}

/** 平面多边形用box拟合以轻量化模型 */
function handleExtrude(
  parsed: parsed.extrude[],
  rays: temp.ray[][],
  result: rawDataType,
  seed: SEED,
  /** 用box拟合挤出平面的块厚度 */
  depth: number
) {
  parsed.forEach((extrudeParams) => {
    const { color, transform, height, thickness, elevation } = extrudeParams
    const sampleColor = sample(color, seed) || DEFAULT_COLOR
    const matrix = new Matrix4()

    if (thickness) {
      // 按偏移后的边线用box构成围墙
      const moveY = thickness < 0 ? -0.5 : 0.5
      const moveZ = height < 0 ? -0.5 : 0.5
      const saveAs = result.data[sampleColor.glass ? 'boxGlass' : 'box']
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
      // 按偏移后的边线用box拟合挤出平面
      const parsedMatchParams: parsed.match[] = [
        {
          along: 'WIDTH',
          flexes: [{ extend: 0, depth, height, transform, color }],
          elevation,
          sandwich: false,
          top: undefined,
          bottom: undefined,
          control: undefined,
        },
      ]
      handleMatch(parsedMatchParams, rays, result, seed)
    }
  })
}
