// UPDATE: 24.3.28

import { Vector2, Matrix3 } from 'three'
import { seededRandom } from 'three/src/math/MathUtils.js'

import type { temp } from '../../types/temp'
import type { styleParsed } from '../../types/stylesParsed'
import type { styleTypes } from '../../types/styleTypes'

export {
  seed,
  sRand,
  sSample,
  sShuffleArray,
  sRandBetween,
  getBounds,
  matchRatioAndCount,
  isAlongAxis,
  isParallel,
  isPerpendicular,
  isPointInPolygon,
  crossLines,
  lineInsideRect,
  projectPointOnRay,
  projectPointOnLine,
  offsetRay,
  rayIntersectLine,
  rayIntersectRay,
  sweepPolygonX,
  spacingMatchPolygonX,
  sRotateLinesAlong,
  getVerticalUnitWidth,
  getClampedRects,
  getLoopNext,
  formatBoxArray,
}

/** 生成一个100以内原始的随机整数 */
function rand100() {
  return Math.round(Math.random() * Math.pow(10, 3))
}

let v = rand100()

/** 自增随机数种子 */
const seed = {
  /** 预设值，用于重置 */
  _v: v,
  /** 递增数值并返回 */
  get v() {
    return v++
  },
  /** 重置为指定数值，或随机值 */
  set(x: number | 'RANDOM') {
    return (v = this._v = x === 'RANDOM' ? rand100() : x)
  },
  /** 重置递增数值为原数值 */
  reset() {
    return (v = this._v)
  },
}

/** 基于种子的随机数 */
function sRand() {
  return seededRandom(seed.v)
}

/** 数组随机采样。如果数量小于2直接返回 a[0]。如果有种子则按种子随机数采样 */
function sSample<T>(a: T[]) {
  let i = Math.floor(sRand() * a.length)
  return a[i < a.length ? i : 0]
}

/** 基于种子将数组顺序打乱，返回原数组 */
function sShuffleArray<T>(array: T[]) {
  return array.sort(() => sRand() - 0.5)
}

/** 基于种子的区间随机数 */
function sRandBetween(a: number, b: number, step?: number) {
  return step ? a + Math.floor(((b - a) / step) * sRand()) * step : a + (b - a) * sRand()
}

/** 根据点积计算定界框的最小点和最大点 */
function getBounds(points2D: Vector2[]) {
  const pt = points2D[0]!
  const min = pt.clone()
  const max = pt.clone()
  points2D.forEach((v2) => {
    const { x, y } = v2
    x < min.x ? (min.x = x) : x > max.x ? (max.x = x) : 0
    y < min.y ? (min.y = y) : y > max.y ? (max.y = y) : 0
  })
  return { min, max }
}

// threejs 的 ShapeUtils 有相同功能
// /** 使用 "面积法" 来判断一组点是否按顺时针方向排列 */
// function isClockwise(points: [number, number][]) {
//   let sum = 0
//   for (let i = 0; i < points.length - 1; i++) {
//     const a = points[i]!
//     const b = points[i + 1]!
//     sum += (b[0] - a[0]) * (b[1] + a[1])
//   }
//   return sum > 0
// }

/** 根据边与X轴间的弧度判断是否为东西向 */
function isAlongAxis(r: number): boolean {
  return r < 0.7854 || r > 5.4978 || (2.3562 < r && r < 3.927)
}

/** 计算线段与线段的交点（包括端点），排除平行的情况 */
function crossLines(line1: temp.line, line2: temp.line): Vector2 | undefined {
  const { x: x1, y: y1 } = line1.start
  const { x: x2, y: y2 } = line1.end
  const { x: x3, y: y3 } = line2.start
  const { x: x4, y: y4 } = line2.end

  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  // d值判断是否平行
  if (d !== 0) {
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / d
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / d
    // 判断是否在各自的线段之上，包括端点
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return new Vector2(x1 + t * (x2 - x1), y1 + t * (y2 - y1))
    }
  }

  return undefined
}

/** 检测线段与线段是否相交，包括端点和线段之上 */
function isPointInRect(point: Vector2, rectangle: temp.rectangle) {
  const { x, y } = point
  return (
    x >= rectangle.min.x && x <= rectangle.max.x && y >= rectangle.min.y && y <= rectangle.max.y
  )
}

/** 计算 line 与 box 相交的部分，返回新线段或 undefined */
function lineInsideRect(line: temp.line, rectangle: temp.rectangle): temp.line | undefined {
  // start 和 end 不会相同
  const pointsInside = [line.start, line.end].filter((point) => isPointInRect(point, rectangle))
  const insideCount = pointsInside.length

  // 位于在框内、边线上、端点的点的数量
  if (insideCount === 2) {
    return { start: line.start.clone(), end: line.end.clone() }
  } else {
    // 计算包括交于端点情况在内的交点
    const intersections: Vector2[] = []
    rectangle.lines.forEach((l) => {
      const i = crossLines(l, line)
      if (i) intersections.push(i)
    })
    const pt = pointsInside[0]
    const i = intersections[0]
    const i1 = intersections[1]

    if (pt) {
      if (i) {
        if (i && i1) {
          // 有1个非外部点和2交点，返回两个交点
          return getSameDirection(line, i, i1)
        } else {
          // 有1个非外部点则至少有1交点，须排除非外部点位于边线上时的情况
          if (i.x !== pt.x || i.y !== pt.y) return getSameDirection(line, i, pt)
        }
      }
    } else if (i && i1 && (i.x !== i1.x || i.y !== i1.y)) {
      // 有0个非外部点，可能两个交点，交于端点时两个交点相同，须排除
      return getSameDirection(line, i, i1)
    }
  }
  return undefined
}

/** 通过计算点积，返回由p1和p2组成的与line1方向一致的新线段 */
function getSameDirection(line1: temp.line, p1: Vector2, p2: Vector2): temp.line {
  const direction1 = { x: line1.end.x - line1.start.x, y: line1.end.y - line1.start.y }
  const direction2 = { x: p2.x - p1.x, y: p2.y - p1.y }
  return direction1.x * direction2.x + direction1.y * direction2.y > 0
    ? { start: p1, end: p2 }
    : { start: p2, end: p1 }
}

// 根据公式 P = A + ((B - A) · (P - A)) / ||B - A||^2 * (B - A)
/** 计算点在线段上的投影点，不含线段的端点！ */
function projectPointOnLine(point: Vector2, line: temp.line): Vector2 | undefined {
  const { start, end } = line
  const PA = new Vector2().subVectors(point, start)
  const BA = new Vector2().subVectors(end, start)
  const t = PA.dot(BA) / BA.lengthSq()

  return t > 0 && t < 1 ? new Vector2(start.x + t * BA.x, start.y + t * BA.y) : undefined
}

/** 计算点在射线上的投影点 */
function projectPointOnRay(point: Vector2, ray: temp.ray): Vector2 {
  const { start, direction } = ray
  const PA = new Vector2().subVectors(point, start)
  const t = PA.dot(direction) / direction.lengthSq()
  return new Vector2(start.x + t * direction.x, start.y + t * direction.y)
}

function rayIntersectLine(ray: temp.ray, line: temp.line): Vector2 | undefined {
  const { x: sx, y: sy } = ray.start
  const { x: dx, y: dy } = ray.direction
  const { x: lsx, y: lsy } = line.start
  const rx = line.end.x - lsx
  const ry = line.end.y - lsy
  const r = dx * ry - dy * rx
  // Not parallel lines
  if (r !== 0) {
    const qmp = { x: lsx - sx, y: lsy - sy }
    const t = (qmp.x * ry - qmp.y * rx) / r
    const u = (qmp.x * dy - qmp.y * dx) / r

    if (t >= 0 && u >= 0 && u <= 1) {
      return new Vector2(sx + t * dx, sy + t * dy)
    }
  }
  return
}

function rayIntersectRay(ray1: temp.ray, ray2: temp.ray): Vector2 | undefined {
  const { x: sx1, y: sy1 } = ray1.start
  const { x: dx1, y: dy1 } = ray1.direction
  const { x: sx2, y: sy2 } = ray2.start
  const { x: dx2, y: dy2 } = ray2.direction
  const r = dx1 * dy2 - dy1 * dx2
  // Not parallel lines
  if (r !== 0) {
    const qmp = { x: sx2 - sx1, y: sy2 - sy1 }
    const t = (qmp.x * dy2 - qmp.y * dx2) / r
    return new Vector2(sx1 + t * dx1, sy1 + t * dy1)
  }
  return
}

/** 按轴向偏移射线 */
function offsetRay(ray: temp.ray, offsetParams: { x: number; y: number }): temp.ray {
  const { x, y } = ray.direction
  const crossV = new Vector2(-y, x)
  crossV.setLength(isAlongAxis(crossV.angle()) ? offsetParams.x : offsetParams.y)
  const start = crossV.add(ray.start)
  return {
    start,
    end: start.clone().add(ray.direction),
    direction: ray.direction,
  }
}

/** 根据叉积判断Vector2是否平行 */
function isParallel(v1: Vector2, v2: Vector2): boolean {
  return v1.x * v2.y - v1.y * v2.x === 0
}

/** 根据点积判断Vector2是否垂直 */
function isPerpendicular(v1: Vector2, v2: Vector2): boolean {
  return v1.x * v2.x + v1.y * v2.y === 0
}

/** 使用射线法判断点是否在多边形内部 */
function isPointInPolygon(point: Vector2, polygon: Vector2[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const { x: xi, y: yi } = polygon[i]!
    const { x: xj, y: yj } = polygon[j]!
    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** 返回多边形内部的随机点，采样的方式运算效率较低。另有画线与面向交并计算相交线段内的点的方法 */

/** 计算用间距组合拟合指定长度的缩放系数，alignEnd等于firstWidth是否为0 */
function matchRatioAndCount(
  /** 生成的第一个元素的宽度 */
  firstWidth: number,
  /** 用于拟合的基准间距组合 */
  spaces: number[],
  /** 用于拟合的总长度 */
  distance: number,
  /** 默认不在终点生成元素。将终点纳入考虑时将在计算终点时添加起点元素firstWidth让阵列对齐两端 */
  sandwich: boolean,
  /** 默认按元素中心点对齐线段两端，起点元素宽度视为0。加入起点元素宽度以保证元素一端对齐起点 */
  alignEnd: boolean
) {
  alignEnd ? (distance -= sandwich ? firstWidth : firstWidth / 2) : (firstWidth = 0)
  const totalSpace = spaces.reduce((v, s) => v + s, 0)
  if (totalSpace > 0) {
    const count = Math.round(distance / totalSpace)
    return {
      ratio: distance / (totalSpace * count),
      count,
    }
  }

  return undefined
}

/** group 由不同宽度的box组成，不考虑boxFlex计算最大宽度 */
function getVerticalUnitWidth(unit?: styleParsed.verticalUnit): number {
  return unit
    ? unit.boxes.reduce((a, b) => {
        const w = 'widthX' in b ? b.widthX : b.flexwidth
        return a < w ? w : a
      }, 0)
    : 0
}

/** 计算平行X轴的直线与多边形所有边的交点，排除在端点的情况，结果按x值从小到大排序 */
function sweepPolygonX(y: number, lines: temp.line[]) {
  const result: [start: Vector2, end: Vector2][] = []
  const a: Vector2[] = []
  lines.forEach((line) => {
    const i = pointAt(y, line)
    if (i) a.push(i)
  })

  // 边的排序无规律，交点也无规律，须按x值从小到大排序
  a.sort((a, b) => a.x - b.x)
  // 保证成对
  if (a.length % 2 === 0)
    for (let i = 0; i < a.length; i += 2) {
      const a1 = a[i]!
      const a2 = a[i + 1]!
      result.push([a1, a2])
    }
  return result

  /** 沿水平方向计算交叉点的简易方法，不包括线段的端点，排除直线与多边线交点为奇数的情况 */
  function pointAt(y: number, line: temp.line): Vector2 | undefined {
    const { x: sx, y: sy } = line.start
    const { x: ex, y: ey } = line.end
    if (sy < ey ? sy < y && y < ey : ey < y && y < sy) {
      const k = (ey - sy) / (ex - sx)
      const x = (y - sy) / k + sx
      return new Vector2(x, y)
    }
    return
  }
}

/** 沿X轴拟合平面。 */
function spacingMatchPolygonX(
  lines: temp.line[],
  array: styleParsed.spacing['array'],
  sandwich: boolean,
  alignEnd: boolean
) {
  const result: temp.match[] = []
  const bounds = getBounds(lines.map((line) => line.start))

  // 计算沿Y轴的拟合次数和比例
  const first = array[0]
  const firstWidth = first ? getBoxesWidth(first) : 0
  const rc = matchRatioAndCount(array, firstWidth, bounds.max.y - bounds.min.y, sandwich, alignEnd)
  if (rc) {
    const boxDataArray: temp.box[] = []
    const { ratio, count } = rc
    // 按拟合比例缩放间距
    const flexSpacesY: number[] = []
    array.forEach((p) => {
      const fs = p.space * ratio
      for (let i = 0; i < p.count; i++) flexSpacesY.push(fs)
    })
    // 按 count 生成参数组合
    const boxArray = formatBoxArray(array)
    let y = bounds.min.y
    for (let i = 0; i < count; i++) {
      boxArray.forEach((data, n) => {
        pushTempMatch(boxDataArray, data.boxes, flexSpacesY[n]!, y)
        y += flexSpacesY[n]!
      })
    }

    // 推送首位到末位
    if (sandwich && boxArray[0]) {
      pushTempMatch(boxDataArray, boxArray[0].boxes, flexSpacesY[0]!, y)
    }
  }

  return result

  /** 调用公共变量currentY，将拟合结果推送到公共变量result */
  function pushTempMatch(
    result: temp.box[],
    boxes: (styleParsed.box | styleParsed.boxFlex)[],
    /** 当前缩放后的间距 */
    flexSpaceY: number,
    /** 当前批次的相对Y坐标 */
    y: number
  ) {
    // 计算用中线拟合的交点。sweepPolygonX 排除在端点的情况
    let pointPairs = sweepPolygonX(y + flexSpaceY / 2, lines)

    // pointPairs.forEach((pair) => {
    //   const flexWidth = Math.abs(pair[1].x - pair[0].x)
    //   getTempData()
    //   boxes.forEach((boxEnum) => {
    //     getBoxData(boxEnum, flexWidth).forEach((bd) => result.push(bd))
    //   })
    // })
  }
}

/** 因其中的 count 参数，先格式化为数组 */
function formatBoxArray(array: styleParsed.spacing['array']) {
  const result: Omit<styleParsed.spacing['array'][number], 'count'>[] = []
  array.forEach((params) => {
    const { space, boxes } = params
    const p = { space, boxes }
    for (let i = 0; i < params.count; i++) result.push(p)
  })
  return result
}

/** 根据along旋转由Plane生成的lines数据，默认按 WIDTH */
function sRotateLinesAlong(rays: temp.ray[], along?: styleTypes.handleEdgeType['along']) {
  let radian = 0
  if (typeof along === 'number') {
    radian = along * (Math.PI / 180)
  } else if (along === 'RANDOM') {
    radian = Math.PI * 2 * sRand()
  } else if (along === 'DEPTH') {
    radian = Math.PI / 2
  } else if (along === 'WIDTH') {
    radian = 0
  } else if (along === 'LONGEST') {
    // 找到最长的射线
    const r = rays.reduce((a, b) => (a.direction.length() > b.direction.length() ? a : b))
    radian = r.direction.angle()
  } else if (along === 'SHORTEST') {
    const r = rays.reduce((a, b) => (a.direction.length() < b.direction.length() ? a : b))
    radian = r.direction.angle()
  }

  if (radian) {
    const matrix = new Matrix3().makeRotation(radian)
    rays = rays.map((r) => {
      return {
        direction: r.direction.clone().applyMatrix3(matrix),
        start: r.start.clone().applyMatrix3(matrix),
        end: r.end.clone().applyMatrix3(matrix),
      }
    })
  } else {
    rays = rays.map((r) => {
      return {
        direction: r.direction.clone(),
        start: r.start.clone(),
        end: r.end.clone(),
      }
    })
  }

  return { newRays: rays, radian }
}

/** 根据参数返回偏移后的定界框 */
function getClampedRects(
  bounds: { min: Vector2; max: Vector2 },
  params: styleParsed.clampType
): { min: Vector2; max: Vector2 }[] {
  const min = bounds.min.clone()
  const max = bounds.max.clone()
  const w = max.x - min.x
  const h = max.y - min.y
  const { startX, endX, startY, endY, asRatio, reverse } = params
  const result = [{ min, max }]

  setClamped(result, w, 'x', startX, endX, asRatio, reverse)
  setClamped(result, h, 'y', startY, endY, asRatio, reverse)

  return result
}

/** 按参数生成修改原 bounds 中定界框的坐标 */
function setClamped(
  bounds: { min: Vector2; max: Vector2 }[],
  distance: number,
  axis: 'x' | 'y',
  start: number,
  end: number,
  asRatio: boolean,
  reverse: boolean
): void {
  if (start || end) {
    const dStart = start ? (asRatio ? start * distance : start) : 0
    const dEnd = end ? (asRatio ? end * distance : end) : 0
    bounds.forEach((rect) => {
      if (reverse) {
        if (dStart && dEnd) {
          // 反向两端同时缩进，新增一个矩形
          const newRect = {
            min: rect.min.clone(),
            max: rect.max.clone(),
          }
          bounds.push(newRect)
          // 修改矩形数据
          newRect.min[axis] = newRect.max[axis] - dEnd
          rect.max[axis] = rect.min[axis] + dStart
        } else if (dStart) {
          rect.max[axis] = rect.min[axis] + dStart
        } else if (dEnd) {
          rect.min[axis] = rect.max[axis] - dEnd
        }
      } else {
        rect.min[axis] += dStart
        rect.max[axis] -= dEnd
      }
    })
  }
}

function getLoopNext<T>(a: T[], i: number) {
  let nextID = i + 1
  if (nextID >= a.length) nextID = 0
  return a[nextID]!
}
