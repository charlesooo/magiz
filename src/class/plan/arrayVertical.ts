import { Matrix4 } from 'three'
import { matchRatioAndCount, getLoopNext, sRand } from './handleMath'
import { TEMP, edgeUnitToTempBoxes, pushBoxData, getValidIndexes } from './handleBox'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { handleVertical }

function handleVertical(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  rayLoops: temp.ray[][]
) {
  const { vertical, elevations } = parsedStyle
  rayLoops.forEach((rayLoop) => {
    rayLoop.forEach((ray) => {
      vertical.forEach((params) => {
        raySpacing(result, elevations, ray, params)
      })
    })
  })
}

/** 沿一段线按间距组合阵列Boxes */
function raySpacing(
  result: magizTypes.rawBuilding,
  elevations: number[],
  ray: temp.ray,
  params: styleParsed.edgeArray
) {
  const { control, sandwich, endWidth, array } = params

  // 计算参数在该段上生成时的批数和缩放系数
  const distance = ray.direction.length()
  const spaces: number[] = []
  array.forEach((vu) => {
    for (let i = 0; i < vu.count; i++) spaces.push(vu.space)
  })
  const rc = matchRatioAndCount(spaces, distance, endWidth, sandwich)
  if (rc) {
    // 处理replace，将全部参数转为 temp.arrayUnit[]
    const arrayUnits: temp.arrayUnit[] = []
    array.forEach((edgeUnit) => {
      const { boxes, space, replace } = edgeUnit
      const tempBoxes = edgeUnitToTempBoxes(boxes, rc.ratio)
      const replaceBoxes = replace ? edgeUnitToTempBoxes(replace.with, rc.ratio) : undefined
      const spaceScaled = space * rc.ratio

      for (let i = 0; i < edgeUnit.count; i++) {
        arrayUnits.push({
          spaceScaled,
          tempBoxes: replace && sRand() < replace.chance ? replaceBoxes : tempBoxes,
        })
      }
    })

    /** 缩放后整个组合的长度 */
    const arrayD = arrayUnits.reduce((a, b) => a + b.spaceScaled, 0)
    /** 可以生成元素的序号列表 */
    const validIndexes = getValidIndexes(rc.count, control)
    // 按标高推送阵列数据到结果
    elevations.forEach((elevation) => {
      if (arrayUnits.length > 0) {
        // 按缩放后的数据偏移ray.start
        const start = ray.start.clone()
        if (endWidth) {
          console.log(312231)

          const d = ray.direction.clone()
          start.add(d.setLength((endWidth * rc.ratio) / 2))
        }
        /** 先将元素在原点处缩放、旋转+移动，再用这个矩阵移动到边线上的起点 */
        const placeMatrix = new Matrix4()
          .makeRotationZ(ray.direction.angle())
          .premultiply(TEMP.makeTranslation(start.x, start.y, elevation))

        // 按序号推送数据
        validIndexes.forEach((i) => {
          /** 该序号的起点位置 */
          let startD = i * arrayD
          arrayUnits.forEach((tempArrayUnit, n) => {
            pushArraygDataToResult(tempArrayUnit, startD, placeMatrix, result)
            startD += (tempArrayUnit.spaceScaled + getLoopNext(arrayUnits, n).spaceScaled) / 2
          })
        })

        // 默认在线段终点不生成元素以按环状阵列，sandwich反之
        if (sandwich)
          pushArraygDataToResult(arrayUnits[0]!, arrayD * rc.count, placeMatrix, result)
      }
    })
  }
}

/** 计算并推送最终的matrix和colorIndex */
function pushArraygDataToResult(
  tempArrayUnit: temp.arrayUnit,
  targetDistance: number,
  placeMatrix: Matrix4,
  result: magizTypes.rawBuilding
) {
  tempArrayUnit.tempBoxes?.forEach((tempBoxData) => {
    const mtx = tempBoxData.matrix
      .clone()
      .premultiply(TEMP.makeTranslation(targetDistance, 0, 0))
      .premultiply(placeMatrix)
    pushBoxData(result, tempBoxData.color, mtx)
  })
}
