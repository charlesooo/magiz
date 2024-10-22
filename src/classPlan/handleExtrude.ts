import { Matrix4 } from 'three'
import { Seed, sample } from './utils'
import { TEMP, applyBasicTransform } from './handleBasic'
import { handleMatch } from './handleMatchRelated'

import type { temp } from '../types/temp'
import type { magizTypes } from '../types/magizTypes'
import type { styleParsed } from '../types/stylesParsed'

export { handleExtrude }

/** 按 parsed.block 挤出平面 */
function handleExtrude(
  parsed: styleParsed.extrude[],
  rays: temp.ray[][],
  result: magizTypes.rawBuilding,
  seed: Seed,
  /** 通过全局变量控制是否拟合 */
  globalMatchWidth: number
) {
  parsed.forEach((extrudeParams) => {
    const { colorID, transform, elevation, height, toWall } = extrudeParams
    const { index, glass } = sample(colorID, seed)!
    const matrix = new Matrix4()
    if (toWall) {
      // 先判断是否用box生成围墙
      const moveY = toWall < 0 ? -0.5 : 0.5
      const moveZ = height < 0 ? -0.5 : 0.5
      const saveAs = result.instanced[glass ? 'boxGlass' : 'box']
      rays.forEach((loop) => {
        loop.forEach((ray) => {
          const boxMatrix = matrix.clone()
          boxMatrix
            .premultiply(TEMP.makeTranslation(0.5, moveY, moveZ))
            .premultiply(
              TEMP.makeScale(ray.direction.length(), Math.abs(toWall), Math.abs(height))
            )
            .premultiply(TEMP.makeRotationZ(ray.direction.angle()))
          applyBasicTransform(extrudeParams, boxMatrix, TEMP)
          boxMatrix.premultiply(TEMP.makeTranslation(ray.start.x, ray.start.y, elevation))

          saveAs.matrices.push(boxMatrix.toArray())
          saveAs.colors.push(index)
        })
      })
    } else if (globalMatchWidth > 0) {
      // 再判断通过全局变量是否用box挤出平面
      const parsedMatchParams: styleParsed.match[] = [
        {
          along: 'WIDTH',
          flexes: [{ shrink: 0, width: globalMatchWidth, height, transform, colorID }],
          elevation,
          sandwich: false,
          top: undefined,
          bottom: undefined,
          control: undefined,
        },
      ]
      handleMatch(parsedMatchParams, rays, result, seed, true)
    } else {
      if (height < 0) matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
      matrix.premultiply(TEMP.makeScale(1, 1, Math.abs(height)))
      applyBasicTransform(extrudeParams, matrix, TEMP)
      matrix.premultiply(TEMP.makeTranslation(0, 0, elevation))
      const loop = edgesModdedToLoop(rays)
      const saveAsType = result.extruded[glass ? 'glass' : 'solid']
      let saveAs = saveAsType.find((e) => isSameLoop(e.loop, loop))
      if (!saveAs) {
        saveAs = { loop, matrices: [], colors: [] }
        saveAsType.push(saveAs)
      }
      saveAs.matrices.push(matrix.toArray())
      saveAs.colors.push(index)
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
function edgesModdedToLoop(rays: temp.ray[][]): [x: number, y: number][] {
  const result: [x: number, y: number][] = []
  const outterRays = rays[0]
  if (outterRays)
    outterRays.forEach((ray, i) => {
      result.push(ray.start.toArray())
      const nextStart = outterRays[i === outterRays.length - 1 ? 0 : i + 1]!.start
      if (ray.end.x !== nextStart.x || ray.end.y !== nextStart.y) {
        result.push(ray.end.toArray())
      }
    })

  return result
}
