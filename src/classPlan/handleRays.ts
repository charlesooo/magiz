import { Vector2 } from 'three'
import { lineInsideRect, offsetRay, rayIntersectRay } from './handleMath'
import type { temp } from '../types/temp'

export { offsetRays, rectClampRays }

/** 偏移边线，返回新的rays */
function offsetRays(
  rays: temp.ray[][],
  size: { x: number; y: number },
  params: { x: number; y: number; asRatio: boolean }
): temp.ray[][] {
  const offsetParams = params.asRatio
    ? { x: size.x * params.x, y: size.y * params.y }
    : { x: params.x, y: params.y }

  const offsetted = rays.map((rayLoop) => rayLoop.map((ray) => offsetRay(ray, offsetParams)))

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
function rectClampRays(
  rays: temp.ray[][],
  rectangles: { min: Vector2; max: Vector2 }[]
): temp.ray[][] {
  return rays.map((loop) => {
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

      loop.forEach((ray) => {
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
