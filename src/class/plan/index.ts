import { Vector2 } from 'three'
import { ShapeUtils } from 'three/src/extras/ShapeUtils.js'
import { sRand, getBounds, isAlongAxis, getClampedRects } from './handleMath'
import { handleBoundingBox, handleSlopingRoof, handleAppendent } from './others'
import { handleVertical } from './arrayVertical'
import { handleHorizontal } from './arrayHorizontal'
import { handleMatch } from './planMatch'
import { handleExtrude } from './planExtrude'
import { offsetRayLoops, rectClampRays, indentRays } from './handleRays'
import { StyleHandler } from '../styles'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { Plan }

/** 建筑平面类，包括用于生成模型的相关数据和方法 */
class Plan {
  /** 建筑模型生成的参数 */
  styleParams: magizTypes.styleParams
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
    /** 边线转为计算用的顺时针向量数据 */
    rayLoops: temp.ray[][]
    /** 围绕坐标轴原点旋转到原位的弧度 */
    radian: number
  }
  /** 输入的源坐标 */
  orignal: Vector2[][]

  /** 创建建筑平面实例 */
  constructor(input: magizTypes.requestData) {
    // Path,ShapeGeometry,ExtrudeGeometry 内部在创建时都会检查clockwise，但为了保证 pushRandomSquaresInside 计算正确，须提格式化
    this.orignal = input.loops.map((loop) => loop.map((pt) => new Vector2(...pt)))

    const outterLoop = this.orignal[0]

    // 确保外圈至少包含3个点
    if (outterLoop && outterLoop.length > 2) {
      if (ShapeUtils.isClockWise(outterLoop)) outterLoop.reverse()

      // 计算面积
      this.area = ShapeUtils.area(outterLoop)
      for (let i = 1; i < this.orignal.length; i++) {
        const loop = this.orignal[i]!
        if (!ShapeUtils.isClockWise(loop)) loop.reverse()
        this.area -= ShapeUtils.area(loop)
      }

      // 计算外边线的矢量，寻找外边线最长的那段
      const longest = new Vector2()
      outterLoop.forEach((current, i) => {
        const next = outterLoop[i + 1 === outterLoop.length ? 0 : i + 1]!
        const v = new Vector2().subVectors(next, current)
        if (v.length() > longest.length()) longest.copy(v)
      })

      const origin = new Vector2(0, 0)
      const radian = longest.angle()
      this.center = getCenter(outterLoop)

      // 将坐标点的中心重置到原点
      const relativePoints = this.orignal.map((loop) =>
        loop.map((v2) => v2.sub(this.center).rotateAround(origin, -radian))
      )

      const { min, max } = getBounds(relativePoints[0]!)
      this.relative = {
        radian,
        bounds: { min, max },
        size: { x: max.x - min.x, y: max.y - min.y },
        rayLoops: relativePoints.map((loop) =>
          loop.map((start, i) => {
            const end = loop[i + 1 === loop.length ? 0 : i + 1]!
            const direction = end.clone().sub(start)
            return { start, end, direction }
          })
        ),
      }
    } else {
      throw 'ERROR: invalid input.loops'
    }

    this.styleParams = Object.assign(
      {
        style: '',
        height: 24,
        floorHeight: 3,
        elevation: 0,
        seed: 0,
        match: 2,
      },
      input.params
    )
  }

  /** 根据样式参数中的 setEdges 处理边线向量并生成新的向量数组。不处理内部的边线。 */
  getEdges(edgeParams: styleParsed.handleEdge[]) {
    let rayLoops: temp.ray[][] = []
    const outter = this.relative.rayLoops[0]
    if (outter) {
      rayLoops.push(outter)
      const sizeRef = { x: 0, y: 0, caculated: false }
      // 按顺序多次修正边线
      edgeParams.forEach((params) => {
        const { offset, along, clamp, indent } = params
        if (offset) {
          // 如有偏移边线，先计算整体尺寸，之后的任何偏移都以此sizeRef为准
          if (!sizeRef.caculated) {
            const { min, max } = getBounds(outter.map((line) => line.start))
            sizeRef.x = max.x - min.x
            sizeRef.y = max.y - min.y
            sizeRef.caculated = true
          }
          rayLoops = offsetRayLoops(rayLoops, sizeRef, offset)
        } else if (clamp) {
          const bounds = getBounds(outter.map((line) => line.start))
          const rects = getClampedRects(bounds, clamp)
          rayLoops = rectClampRays(rayLoops, rects)
        } else if (along !== undefined) {
          switch (along) {
            case 'WIDTH':
              rayLoops = rayLoops
                .map((loop) => loop.filter((ray) => isAlongAxis(ray.direction.angle())))
                .filter((loop) => loop.length > 0)
              break
            case 'DEPTH':
              rayLoops = rayLoops
                .map((loop) => loop.filter((ray) => !isAlongAxis(ray.direction.angle())))
                .filter((loop) => loop.length > 0)
              break
            case 'RANDOM':
              rayLoops = rayLoops
                .map((loop) => loop.filter(() => sRand() < 1))
                .filter((loop) => loop.length > 0)
              break
            case 'SHORTEST':
            case 'LONGEST':
              {
                // 找到最长的射线
                const { direction } = outter.reduce((a, b) =>
                  a.direction.length() > b.direction.length() ? a : b
                )
                rayLoops =
                  along === 'LONGEST'
                    ? rayLoops.map((loop) =>
                        loop.filter((ray) => isAlongAxis(ray.direction.angleTo(direction)))
                      )
                    : rayLoops.map((loop) =>
                        loop.filter((ray) => !isAlongAxis(ray.direction.angleTo(direction)))
                      )
              }
              break
            default:
              rayLoops = rayLoops
                .map((loop) =>
                  loop.filter(
                    (ray) => Math.abs(ray.direction.angle() - along) < 10 * (Math.PI / 180)
                  )
                )
                .filter((loop) => loop.length > 0)
              break
          }
        } else if (indent) {
          rayLoops = rayLoops.map((rl) => indentRays(rl, indent))
        }
      })
    }

    return rayLoops
  }
  /** 按平面和样式生成可序列化的建筑模型数据 */
  toRawModel(
    /** 批量生成时统一缓存到 result */
    result: magizTypes.rawData,
    styles: StyleHandler,
    centerOfAll?: { x: number; y: number }
  ): magizTypes.rawBuilding {
    const centerX = centerOfAll?.x || 0
    const centerY = centerOfAll?.y || 0
    // 将结果保存到公共变量，以便同时处理多个plan生成，以及每个平面都正确映射colorMap
    const styleParsed = styles.parseStyle(this.styleParams, result.colorMap)

    // 按相对坐标还是源坐标生成
    const building: magizTypes.rawBuilding = {
      info: { floorArea: this.area, floors: styleParsed.floorCount },
      points: this.relative.rayLoops.map((loop) => loop.map((ray) => ray.start.toArray())),
      center: this.center.toArray(),
      centerRelative: [this.center.x - centerX, this.center.y - centerY],
      rotate: this.relative.radian,
      params: this.styleParams,

      instanced: {
        box: { matrices: [], colors: [] },
        boxGlass: { matrices: [], colors: [] },
        slope2: { matrices: [], colors: [] },
        slope2Glass: { matrices: [], colors: [] },
        slope4: { matrices: [], colors: [] },
        slope4Glass: { matrices: [], colors: [] },
      },
      extruded: { solid: [], glass: [] },
    }

    const { classified } = styleParsed
    for (const edgeParamsJSON in classified) {
      const { params, parsed } = classified[edgeParamsJSON]!
      const rayLoops = this.getEdges(params)
      parsed.forEach((dataParsed) => {
        handleExtrude(building, dataParsed, rayLoops, this.styleParams.match)
        handleMatch(building, dataParsed.match, dataParsed.elevations, rayLoops)
        handleVertical(building, dataParsed, rayLoops)
        handleHorizontal(building, dataParsed, rayLoops)
        handleAppendent(building, dataParsed, rayLoops)

        const outter = rayLoops[0]
        if (outter) {
          const bounds = getBounds(outter.map((r) => r.start))
          handleBoundingBox(building, dataParsed, bounds)
          handleSlopingRoof(building, dataParsed, bounds)
        }
      })
    }

    result.models.push(building)
    return building
  }
}

function getCenter(loop: Vector2[]) {
  const c: [number, number] = [0, 0]
  loop.forEach((v) => {
    c[0] += v.x
    c[1] += v.y
  })
  c[0] /= loop.length
  c[1] /= loop.length
  return new Vector2(...c)
}
