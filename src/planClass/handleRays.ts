import { Vector2, Matrix3 } from 'three'
import { lineInsideRect, offsetRay, rayIntersectRay } from './handleMath'
import type { temp } from '../types/temp'

export { offsetRays, rectClampRays }

/** 按比例整体缩放边线，返回新的rays */
// function scaleRays(
//   rays: temp.ray[][],
//   ratio: [x: number, y: number],
//   rotate?: number
// ): temp.ray[][] {
//   const matrix = new Matrix3().makeScale(...ratio)
//   if (rotate) matrix.premultiply(new Matrix3().makeRotation(rotate))
//   return rays.map((loop) =>
//     loop.map((ray) => {
//       const start = ray.start.clone().applyMatrix3(matrix)
//       const end = ray.end.clone().applyMatrix3(matrix)
//       return { start, end, direction: end.clone().sub(start) }
//     })
//   )
// }

/** 偏移边线，返回新的rays */
function offsetRays(
  rays: temp.ray[][],
  size: { x: number; y: number },
  params: { x: number; y: number; asRatio: boolean },
  rotate?: number
): temp.ray[][] {
  const matrix = rotate ? new Matrix3().makeRotation(rotate) : undefined
  const distance = params.asRatio
    ? { x: size.x * params.x, y: size.y * params.y }
    : { x: params.x, y: params.y }

  return rays.map((loop) => {
    const points: Vector2[] = []
    loop.forEach((ray, i) => {
      const previous = loop[i === 0 ? loop.length - 1 : i - 1] as temp.ray
      const ray2: temp.ray = {
        start: previous.start,
        end: previous.end,
        direction: previous.end.clone().sub(previous.start),
      }
      // ray.direction 仍为原对象
      const point = rayIntersectRay(offsetRay(ray, distance), offsetRay(ray2, distance))
      if (point) {
        points.push(matrix ? point.applyMatrix3(matrix) : point)
      }
    })

    return points.map((start, j) => {
      const end = points[j === points.length - 1 ? 0 : j + 1] as Vector2
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
