import { sSample } from './handleMath'
import { TEMP, applyBasicTransform } from './handleBox'
import { handleMatch } from './planMatch'
import { crossLines } from './handleMath'
import { Matrix4, Vector2 } from './_imports'
import type { magizTypes, styleParsed, temp } from './_imports'

export { handleExtrude }

/** 按 parsed.block 挤出平面 */
function handleExtrude(
  result: magizTypes.rawBuilding,
  parsedStyle: Pick<styleParsed.floorResult, 'extrude' | 'elevations'>,
  rayLoops: temp.ray[][],

  /** 通过全局变量控制是否拟合 */
  globalMatchWidth: number
) {
  const { extrude, elevations } = parsedStyle
  extrude.forEach((params) => {
    const { color, trans, height, thickness } = params
    const { index, glass } = sSample(color)!
    const matrix = new Matrix4()
    if (thickness) {
      // 先判断是否用box生成围墙
      const moveY = thickness < 0 ? -0.5 : 0.5
      const moveZ = height < 0 ? -0.5 : 0.5
      const saveAs = result.instanced[glass ? 'boxGlass' : 'box']
      rayLoops.forEach((rayLoop) => {
        rayLoop.forEach((ray) => {
          const boxMatrix = new Matrix4()
            .premultiply(TEMP.makeTranslation(0.5, moveY, moveZ))
            .premultiply(
              TEMP.makeScale(ray.direction.length(), Math.abs(thickness), Math.abs(height))
            )
            .premultiply(TEMP.makeRotationZ(ray.direction.angle()))
          applyBasicTransform(params, boxMatrix)

          elevations.forEach((elevation) => {
            const m = boxMatrix.clone()
            m.premultiply(TEMP.makeTranslation(ray.start.x, ray.start.y, elevation))
            saveAs.matrices.push(m.toArray())
            saveAs.colors.push(index)
          })
        })
      })
    } else if (globalMatchWidth > 0) {
      const matchParam: styleParsed.match = {
        simplify: true,
        along: 'WIDTH',
        ctrlMatch: undefined,
        sandwich: false,
        array: [
          {
            count: 1,
            unitDepth: globalMatchWidth,
            flexHeight: params.height,
            color,
            trans,
            shrink: undefined,
          },
        ],
      }
      // 再判断通过全局变量是否用box挤出平面
      handleMatch(result, { match: [matchParam], elevations }, rayLoops)
    } else {
      const loop = outterRaysToLoop(rayLoops)
      const save = result.extruded[glass ? 'glass' : 'solid']
      let saveFound = save.find((e) => isSameLoop(e.loop, loop))
      if (!saveFound) save.push((saveFound = { loop, matrices: [], colors: [] }))
      const saveAs = saveFound
      if (height < 0) matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
      matrix.premultiply(TEMP.makeScale(1, 1, Math.abs(height)))
      applyBasicTransform(params, matrix)
      elevations.forEach((elevation) => {
        saveAs.matrices.push(
          matrix.clone().premultiply(TEMP.makeTranslation(0, 0, elevation)).toArray()
        )
        saveAs.colors.push(index)
      })
    }
  })
}

function isSameLoop(loopA: [x: number, y: number][], loopB: [x: number, y: number][]): boolean {
  return loopA.every((pt, i) => {
    const ptB = loopB[i]
    return ptB && pt[0] === ptB[0] && pt[1] === ptB[1]
  })
}

/** 边线修正后可能不连续，须重新格式化成连续点集 */
function outterRaysToLoop(rayLoops: temp.ray[][]): [x: number, y: number][] {
  const result: [x: number, y: number][] = []
  const outter = rayLoops[0]
  if (outter) {
    const newLoopRays = getLoopWithoutIntersects(outter)
    newLoopRays.forEach((ray, i) => {
      result.push(ray.start.toArray())
      // 下一个起点须与该终点重合，否则加入该终点
      const nextRay = newLoopRays[i === newLoopRays.length - 1 ? 0 : i + 1]!
      if (!ray.end.equals(nextRay.start)) {
        result.push(ray.end.toArray())
      }
    })
  }
  return result
}

function getLoopWithoutIntersects(rayLoop: temp.ray[]): temp.ray[] {
  let foundIntersects = true
  while (foundIntersects) {
    let intersect: undefined | [number, number, Vector2]
    rayLoop.find((r, i) => {
      // 遍历线段，排除相邻的，寻找与其之后相交的线段
      for (let j = i + 1; j < rayLoop.length; j++) {
        const nextRay = rayLoop[j]!
        if (!nextRay.end.equals(r.start) && !nextRay.start.equals(r.end)) {
          const intersection = crossLines(r, nextRay)
          if (intersection) {
            intersect = [i, j, intersection]
            break
          }
        }
      }
      if (intersect) return true
    })

    if (intersect) {
      // 删除相交线段之间的线段，替换相交线段的终点和起点，返回新的rayLoop
      const [min, max, intersection] = intersect
      const result: temp.ray[] = []
      rayLoop.forEach((r, i) => {
        if (i < min || i > max) {
          result.push(r)
        } else if (i === min) {
          result.push({
            start: r.start,
            end: intersection.clone(),
            direction: intersection.clone().sub(r.start),
          })
        } else if (i === max) {
          result.push({
            start: intersection.clone(),
            end: r.end,
            direction: r.end.clone().sub(r.start),
          })
        }
      })
      rayLoop = result
    } else {
      foundIntersects = false
    }
  }
  return rayLoop
}
