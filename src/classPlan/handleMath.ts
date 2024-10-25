// UPDATE: 24.3.28

import { Vector2, Matrix3 } from 'three'
import { seededRandom } from 'three/src/math/MathUtils.js'
import { Seed } from './utils'

import type { temp } from '../types/temp'
import type { styleParsed } from '../types/stylesParsed'
import type { styleTypes } from '../types/styleTypes'
export {
  rand,
  shuffleArray,
  randomBetween,
  getBounds,
  getMatchRatioAndCount,
  isClockwise,
  isAlongAxis,
  isParallel,
  isPerpendicular,
  isPointInPolygon,
  lineInsideRect,
  projectPointOnRay,
  projectPointOnLine,
  offsetRay,
  rayIntersectLine,
  rayIntersectRay,
  sweepPolygonLines,
  matchPolygonLinesAlongX,
  rotateLinesAlong,
}

function rand(seed: Seed) {
  // 前端绑定 seed._v，清空时为 null
  return seed._v ? seededRandom(seed.get()) : Math.random()
}

/** 将数组顺序打乱，返回原数组 */
function shuffleArray<T>(array: T[], seed: Seed) {
  return array.sort(() => rand(seed) - 0.5)
}

function randomBetween(seed: Seed, a: number, b: number, step?: number) {
  return step ? a + Math.floor(((b - a) / step) * rand(seed)) * step : a + (b - a) * rand(seed)
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

/** 使用 "面积法" 来判断一组点是否按顺时针方向排列 */
function isClockwise(points: [number, number][]) {
  let sum = 0
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!
    const b = points[i + 1]!
    sum += (b[0] - a[0]) * (b[1] + a[1])
  }
  return sum > 0
}

/** 根据边与X轴间的弧度判断是否为东西向 */
function isAlongAxis(r: number): boolean {
  return r < 0.7854 || r > 5.4978 || (2.3562 < r && r < 3.927)
}

/**
 * 计算线段与线段的交点（包括端点），排除平行的情况
 * @param {temp.line} line1 被检测的线段
 * @param {temp.line} line2 图形的边界
 * @returns {poinType | undefined} 相交点，如果没有相交则返回 undefined
 */
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
    // 计算包括交于端点情况在内的端点
    const intersections = rectangle.lines.map((l) => crossLines(l, line)).filter((p) => p)
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

/** 根据公式 P = A + ((B - A) · (P - A)) / ||B - A||^2 * (B - A) 计算点在线段上的投影点，不含线段的端点！ */
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

/** 计算用间距组合拟合指定长度的缩放系数 */
function getMatchRatioAndCount(spacing: number[], distance: number, addWidthToLast = 0) {
  const ss = spacing.reduce((v, space) => v + space, 0)
  if (ss > 0) {
    const count = Math.round((distance - addWidthToLast) / ss)

    if (count > 0)
      return {
        ratio: distance / (ss * count + addWidthToLast),
        count,
      }
  }
  return undefined
}

/** 计算平行Y轴的直线与多边形所有边的交点，排除在端点的情况，结果按x值从小到大排序 */
function sweepPolygonLines(y: number, lines: temp.line[]) {
  const result: [leftPoint: Vector2, rightPoint: Vector2][] = []
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

/** 根据输入的match参数，添加标高并按拟合缩放数值，返回计算结果。根据 steps 组合沿Y轴计算交点。返回的 pairs 为每个step中线的交点，Y值相同 */
function matchPolygonLinesAlongX(
  lines: temp.line[],
  flexBoxes: styleParsed.boxFlex[],
  elevation: number,
  sandwich: boolean
) {
  const result: temp.match[] = []
  const bounds = getBounds(lines.map((line) => line.start))
  /** 计算过程中当前的Y坐标 */
  let currentY = bounds.min.y

  // 将spacing按总长度拟合，以正好覆盖范围
  const distance = bounds.max.y - bounds.min.y
  const flexData = flexBoxes.map((flexBox) => Object.assign({ elevation }, flexBox))
  const widths = flexData.map((d) => d.width)
  const rc = getMatchRatioAndCount(widths, distance, sandwich ? widths[0] : 0)
  if (rc) {
    // 按拟合比例缩放间距
    flexData.forEach((data) => (data.width *= rc.ratio))

    for (let i = 0; i < rc.count; i++) {
      // if (!order) shuffleArray(matchData)
      flexData.forEach(pushMatchData)
    }

    // 推送首位到末位
    if (sandwich && flexData[0]) {
      pushMatchData(flexData[0])
    }
  }

  return result

  /** 调用公共变量currentY，将拟合结果推送到result */
  function pushMatchData(data: (typeof flexData)[0]) {
    // 先移动当前currentY坐标到计算的中点位置
    const s = data.width / 2
    currentY += s
    // 计算中点和总宽。sweepPolygonLines 排除在端点的情况，须在中线处拟合
    const pairs = sweepPolygonLines(currentY, lines).map((pair) => {
      const [p1, p2] = pair
      return {
        center: {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        },
        width: p2.x - p1.x,
      }
    })

    // 根据 shrink 调整结果
    if (data.shrink) {
      pairs.forEach((pair) => (pair.width -= data.shrink))
    }
    // 根据 tansform 中的位移调整结果，暂不考虑旋转
    data.transform?.forEach((t) => {
      if ('moveX' in t) {
        pairs.forEach((pair) => {
          pair.center.x += t.moveX
          pair.center.y += t.moveY
        })
      }
    })

    result.push(Object.assign({ pairs }, data))
    currentY += s
  }
}

/** 根据along旋转由Plane生成的lines数据，默认按 WIDTH */
function rotateLinesAlong(
  rays: temp.ray[],
  seed: Seed,
  along?: styleTypes.alongEdgeType['along']
) {
  let radian = 0
  if (along === 'RANDOM') {
    radian = Math.PI * 2 * rand(seed)
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
  } else if (typeof along === 'number') {
    radian = along * (Math.PI / 180)
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
