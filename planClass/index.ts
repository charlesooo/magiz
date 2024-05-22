import { Vector2, Matrix3 } from 'three'
import { ShapeUtils } from 'three/src/extras/ShapeUtils.js'
import { SEED } from './handleUtils'
import { rand, getScaleRatio, getBounds, isAlongAxis } from './handleMath'
import { handleExtrude } from './handleExtrude'
import { handleSlopingRoof } from './handleSlopingRoof'
import { handleClampBox } from './handleClampBox'
import { handleFacade } from './handleFacade'
import { handleMatch, handleBoxInside, handleAdjunct } from './handleMatchRelated'
import { scaleRays, offsetRays, rectClampRays } from './handleRays'
import polylabel from 'polylabel'

import type { temp } from '../types/temp'

/** 建筑平面类，包括用于生成模型的相关数据和方法 */
export default class PLAN {
  /** 建筑模型生成的参数 */
  styleParams: styleParamsType
  /** 平面的面积 */
  area: number
  /** 平面的中心点坐标 （用于移动模型到原位） */
  center: Vector2
  /** 平面的中心点对齐原点并将长边对齐轴线后的相对平面（用于简化计算） */
  relative: {
    /** 相对平面定界框的最小点和最大点 */
    bounds: { min: Vector2; max: Vector2 }
    /** 相对平面定界框的开间与进深 */
    size: { x: number; y: number }
    /** 边线转为计算用的向量数据 */
    rays: temp.ray[][]
    /** 围绕坐标轴原点旋转到原位的弧度 */
    radian: number
  }

  /** 创建建筑平面实例 */
  constructor(input: parseRequestType) {
    // Path,ShapeGeometry,ExtrudeGeometry 内部在创建时都会检查clockwise，但为了保证 pushRandomSquaresInside 计算正确，须提格式化
    const inputPoints2D = input.loopPoints.map((loop) => loop.map((p2) => new Vector2(...p2)))
    if (ShapeUtils.isClockWise(inputPoints2D[0])) inputPoints2D[0].reverse()
    this.area = ShapeUtils.area(inputPoints2D[0])
    for (let i = 1; i < inputPoints2D.length; i++) {
      if (!ShapeUtils.isClockWise(inputPoints2D[i])) inputPoints2D[i].reverse()
      this.area -= ShapeUtils.area(inputPoints2D[i])
    }

    // 计算外边线的矢量，寻找外边线最长的那段
    const outer = inputPoints2D[0]
    const longest = new Vector2()
    outer.forEach((current, i) => {
      const next = outer[i + 1 === outer.length ? 0 : i + 1]
      const v = new Vector2().subVectors(next, current)
      if (v.length() > longest.length()) longest.copy(v)
    })

    const origin = new Vector2(0, 0)
    const radian = longest.angle()
    const rawPoints = outer.map((v) => v.toArray())
    this.center = new Vector2(...polylabel([rawPoints]))

    const relativePoints = inputPoints2D.map((loop) =>
      loop.map((v2) => v2.sub(this.center).rotateAround(origin, -radian))
    )

    const { min, max } = getBounds(relativePoints[0])
    this.relative = {
      radian,
      bounds: { min, max },
      size: { x: max.x - min.x, y: max.y - min.y },
      rays: relativePoints.map((loop) =>
        loop.map((start, i) => {
          const end = loop[i + 1 === loop.length ? 0 : i + 1]
          const direction = end.clone().sub(start)
          return { start, end, direction }
        })
      ),
    }

    this.styleParams = input.styleParams || {
      style: '',
      height: 24,
      floorHeight: 3,
      elevation: 0,
      seed: 0,
    }
  }

  /** 根据样式参数中的 setEdges 处理边线向量并生成新的向量数组。不处理内部的边线。 */
  getEdges(
    params: parsed.handleEdgesType,
    seed: SEED,
    outerOnly: boolean,
    rotate?: number
  ): temp.ray[][] {
    let rays = outerOnly ? [this.relative.rays[0]] : this.relative.rays

    // 计算整体尺寸
    const { min, max } = getBounds(rays[0].map((line) => line.start))
    const size = { x: max.x - min.x, y: max.y - min.y }

    // 如果有scale，先整体缩放边线
    if (params.scale) rays = scaleRays(rays, getScaleRatio(size, params.scale))

    // 再处理边线
    params.set?.forEach((p) => {
      if (p.offset) {
        rays = offsetRays(rays, size, p.offset)
      } else if (p.clamp) {
        const bounds = getBounds(rays[0].map((line) => line.start))
        const rects = getClampedRects(bounds, p.clamp)
        rays = rectClampRays(rays, rects)
      } else if (p.orient) {
        const o = p.orient
        switch (o) {
          case 'WIDTH':
            rays = rays
              .map((loop) => loop.filter((ray) => isAlongAxis(ray.direction.angle())))
              .filter((loop) => loop.length > 0)
            break
          case 'DEPTH':
            rays = rays
              .map((loop) => loop.filter((ray) => !isAlongAxis(ray.direction.angle())))
              .filter((loop) => loop.length > 0)
            break
          case 'RANDOM':
            rays = rays
              .map((loop) => loop.filter(() => rand(seed) < 1))
              .filter((loop) => loop.length > 0)
            break
          case 'SHORTEST':
          case 'LONGEST':
            {
              // 找到最长的射线
              const r = rays[0].reduce((a, b) =>
                a.direction.length() > b.direction.length() ? a : b
              )
              rays =
                o === 'LONGEST'
                  ? rays.map((loop) =>
                      loop.filter((ray) => isAlongAxis(ray.direction.angleTo(r.direction)))
                    )
                  : rays.map((loop) =>
                      loop.filter((ray) => !isAlongAxis(ray.direction.angleTo(r.direction)))
                    )
            }
            break
          default:
            rays = rays
              .map((loop) =>
                loop.filter((ray) => Math.abs(ray.direction.angle() - o) < 10 * (Math.PI / 180))
              )
              .filter((loop) => loop.length > 0)
            break
        }
      }
    })

    if (rotate) {
      const matrix = new Matrix3().makeRotation(rotate)
      rays.forEach((loop) =>
        loop.forEach((ray) => {
          ray.direction.applyMatrix3(matrix)
          ray.start.applyMatrix3(matrix)
          ray.end.applyMatrix3(matrix)
        })
      )
    }

    return rays
  }
  /** 按Z轴向上计算生成建筑模型所需的JSON数据 */
  toRawData(
    /** 根据样式库中解析后的样式参数 */
    styleParsed: parsed.result,
    /** 全局更新的随机数种子，以确保不会重复 */
    seed: SEED
  ): rawDataType {
    const result: rawDataType = {
      info: { floorArea: this.area, floors: styleParsed.floorCount },
      points: this.relative.rays.map((loop) => loop.map((ray) => ray.start.toArray())),
      center: this.center.toArray(),
      params: this.styleParams,
      colorMap: styleParsed.colorMap,
      rotate: this.relative.radian,
      floorData: {
        block: { matrices: [], colors: [] },
        blockGlass: { matrices: [], colors: [] },
        sloping: { matrices: [], colors: [] },
        slopingGlass: { matrices: [], colors: [] },
      },
      boxData: {
        box: { matrices: [], colors: [] },
        boxGlass: { matrices: [], colors: [] },
      },
    }

    styleParsed.classified.forEach((s) => {
      // 保留包含内部孔洞的数据格式，但暂时只处理外边线
      const rays: temp.ray[][] = this.getEdges(s.edgeParams, seed, true)

      if (rays[0][0]) {
        const bounds = getBounds(rays[0].map((r) => r.start))

        handleExtrude(s.extrude, rays, result, seed, this.relative.size, s.edgeParams.scale)
        handleFacade(s.facade, rays, result, seed)
        handleMatch(s.match, rays, result, seed)
        handleAdjunct(s.adjunct, rays, result, seed)
        handleBoxInside(s.boxInside, rays, result, seed)
        handleClampBox(s.clampBox, bounds, result, seed)
        handleSlopingRoof(s.slopingRoof, bounds, result, seed)
      }
    })

    return result
  }
}

/** 根据参数返回偏移后的定界框 */
function getClampedRects(
  bounds: { min: Vector2; max: Vector2 },
  params: parsed.clampRangeType
): { min: Vector2; max: Vector2 }[] {
  const min = bounds.min.clone()
  const max = bounds.max.clone()
  const w = max.x - min.x
  const h = max.y - min.y
  const { xMin, xMax, yMin, yMax, xCentral, yCentral, asRatio, reverse } = params
  const result = [{ min, max }]

  pushRect(result, 'x', w, xCentral, xMin, xMax, asRatio, reverse)
  pushRect(result, 'y', h, yCentral, yMin, yMax, asRatio, reverse)

  return result
}

/** 按参数生成修改原 bounds 中定界框的坐标 */
function pushRect(
  bounds: { min: Vector2; max: Vector2 }[],
  key: 'x' | 'y',
  distance: number,
  central: number,
  min: number,
  max: number,
  asRatio: boolean,
  reverse: boolean
): void {
  const pushing: typeof bounds = []
  if (central) {
    const centralW = asRatio ? central * distance : central
    if (centralW > 0) {
      const sideW = (distance - centralW) / 2
      if (sideW)
        bounds.forEach((rect) => {
          if (reverse) {
            // 反向时将新增一个新的矩形
            const newRect = {
              min: rect.min.clone(),
              max: rect.max.clone(),
            }
            rect.max[key] = rect.min[key] + sideW
            newRect.min[key] = newRect.max[key] - sideW
            pushing.push(newRect)
          } else {
            // 修改最大和最小点坐标
            rect.min[key] += sideW
            rect.max[key] -= sideW
          }
        })
    }
  } else if (min || max) {
    const vMin = min ? (asRatio ? min * distance : min) : 0
    const vMax = max ? (asRatio ? max * distance : max) : 0
    bounds.forEach((rect) => {
      if (reverse) {
        // 反向选择时可能新增一个或0个矩形
        if (vMin && vMax) {
          // 复制一个新的矩形
          const newRect = {
            min: rect.min.clone(),
            max: rect.max.clone(),
          }
          // 推送新的矩形
          pushing.push(newRect)
          // 修改矩形数据
          rect.max[key] = rect.min[key] + vMin
          newRect.min[key] = newRect.max[key] - vMax
        } else if (vMin) {
          rect.max[key] = rect.min[key] + vMin
        } else if (vMax) {
          rect.min[key] = rect.max[key] - vMax
        }
      } else {
        rect.min[key] += vMin
        rect.max[key] -= vMax
      }
    })
  }
  bounds.push(...pushing)
}
