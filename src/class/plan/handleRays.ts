import { Vector2 } from 'three'
import { lineInsideRect, offsetRay, rayIntersectRay, matchRatioAndCount } from './handleMath'

import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { offsetRayLoops, rectClampRayLoops, indentRayLoops, splitRayloops }

/** 偏移边线，返回新的 rayLoops */
function offsetRayLoops(
  rayLoops: temp.ray[][],
  /** 按比例计算偏移的尺寸依据 */
  sizeRef: { x: number; y: number },
  params: { x: number; y: number; asRatio: boolean }
): temp.ray[][] {
  const offsetParams = params.asRatio
    ? { x: sizeRef.x * params.x, y: sizeRef.y * params.y }
    : { x: params.x, y: params.y }
  const offsetted = rayLoops.map((rayLoop) => rayLoop.map((ray) => offsetRay(ray, offsetParams)))
  return offsetted.map((rayLoop) => {
    // 计算偏移后的交点
    const points: Vector2[] = []
    rayLoop.map((ray, i) => {
      const previous = rayLoop[i === 0 ? rayLoop.length - 1 : i - 1]!
      const point = rayIntersectRay(ray, previous)
      if (point) points.push(point)
    })
    // 返回temp.ray格式的结果
    return points.map((start, j) => {
      const end = points[j === points.length - 1 ? 0 : j + 1]!
      return { start, end, direction: end.clone().sub(start) }
    })
  })
}

/** 根据偏移后的定界框裁剪 edgeData （修改原数据） */
function rectClampRayLoops(
  rayLoops: temp.ray[][],
  rectangles: { min: Vector2; max: Vector2 }[]
): temp.ray[][] {
  return rayLoops.map((rayLoop) => {
    const clamped: temp.ray[] = []

    rectangles.forEach((rect) => {
      const { min, max } = rect
      const pt1 = new Vector2(min.x, max.y)
      const pt2 = new Vector2(max.x, min.y)
      const clampRect: temp.rectangle = {
        min,
        max,
        lines: [
          { start: min, end: pt1 },
          { start: pt1, end: max },
          { start: max, end: pt2 },
          { start: pt2, end: min },
        ],
      }

      rayLoop.forEach((ray) => {
        const newLine = lineInsideRect(ray, clampRect)
        if (newLine) {
          const { start, end } = newLine
          clamped.push({ start, end, direction: end.clone().sub(start) })
        }
      })
    })

    return clamped
  })
}

function indentRayLoops(rayLoops: temp.ray[][], params: styleParsed.indentType): temp.ray[][] {
  const { central, asRatio, reverse, start, end } = params
  return rayLoops.map((rayLoop) => {
    const newRayLoop: temp.ray[] = []
    // rayLoop 中前一end与后一start是相同的对象，indent须全部生成新的点
    rayLoop.forEach((ray) => {
      const distance = ray.direction.length()
      const dStart = asRatio ? distance * start : start
      const dEnd = asRatio ? distance * start : start
      const mStart = central ? distance / 2 - dStart : dStart
      const mEnd = central ? distance / 2 - dEnd : dEnd
      // 反向操作均生成新数据，正向操作修改原数据
      if (reverse) {
        if (start) {
          const direction = ray.direction.clone().setLength(mStart)
          newRayLoop.push({
            start: ray.start.clone(),
            end: ray.start.clone().add(direction),
            direction,
          })
        }
        if (end) {
          const direction = ray.direction.clone().setLength(mEnd)
          newRayLoop.push({
            start: ray.end.clone().add(direction.clone().negate()),
            end: ray.end.clone(),
            direction,
          })
        }
      } else {
        const d = ray.direction.clone()
        const rayStart = ray.start.clone()
        const rayEnd = ray.end.clone()
        if (start) rayStart.add(d.setLength(mStart))
        if (end) rayEnd.add(d.setLength(-mEnd))
        newRayLoop.push({
          start: rayStart,
          end: rayEnd,
          direction: rayEnd.clone().sub(rayStart),
        })
      }
    })
    return newRayLoop
  })
}

function splitRayloops(
  rayLoops: temp.ray[][],
  params: NonNullable<styleParsed.handleEdge['split']>
): temp.ray[][] {
  const { array, sandwich, select } = params

  function moveAndPushTo(saveAs: temp.ray[], isSelected: boolean, point: Vector2, move: Vector2) {
    const start = point.clone()
    point.add(move)
    if (isSelected) saveAs.push({ start, end: point.clone(), direction: move.clone() })
  }

  return rayLoops.map((rayLoop) => {
    const newRayLoop: temp.ray[] = []
    // rayLoop 中前一end与后一start是相同的对象，indent须全部生成新的点
    rayLoop.forEach((ray) => {
      const distance = ray.direction.length()
      const rc = matchRatioAndCount(array, distance, array[0]!, sandwich)

      if (rc) {
        const pt = ray.start.clone()
        const moves = array.map((s) => ray.direction.clone().setLength(s * rc.ratio))
        for (let i = 0; i < rc.count; i++) {
          moves.forEach((m, n) => moveAndPushTo(newRayLoop, n === select, pt, m))
        }
        if (sandwich && select === 0) moveAndPushTo(newRayLoop, true, pt, moves[0]!)
      }
    })
    return newRayLoop
  })
}
