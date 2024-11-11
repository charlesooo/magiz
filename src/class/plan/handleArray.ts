import { Matrix4 } from 'three'
import {
  matchRatioAndCount,
  getVerticalUnitWidth,
  getLoopNext,
  sRand,
  sSample,
} from './handleMath'
import { TEMP, getTempData } from './handleBasic'
import { indentIndexes } from './handleIdent'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { handleVertical, getValidIndexes, pushBoxData }

function handleVertical(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  rayLoops: temp.ray[][]
) {
  const { vertical, elevations } = parsedStyle
  rayLoops.forEach((rayLoop) => {
    rayLoop.forEach((ray) => {
      vertical.forEach((params) => {
        raySpacingVertical(result, elevations, ray, params)
      })
    })
  })
}

// function handleSpacing(
//   result: magizTypes.rawBuilding,
//   parsedStyle: styleParsed.floorResult,
//   rayLoops: temp.ray[][]
// ) {
//   const { spacing, elevations } = parsedStyle
//   rayLoops.forEach((rayLoop) => {
//     rayLoop.forEach((ray) => {
//       spacing.forEach((params) => {
//         raySpacing(result, elevations, ray, params)
//       })
//     })
//   })
// }

/** 沿一段线按间距组合阵列Boxes */
function raySpacingVertical(
  result: magizTypes.rawBuilding,
  elevations: number[],
  ray: temp.ray,
  spacingParams: styleParsed.spacing<styleParsed.verticalUnit>
) {
  const { control, sandwich, alignEnd, array } = spacingParams

  // 计算参数在该段上生成时的批数和缩放系数
  const distance = ray.direction.length()
  const spaces: number[] = []
  array.forEach((vu) => {
    for (let i = 0; i < vu.count; i++) spaces.push(vu.space)
  })
  const firstWidth = getVerticalUnitWidth(array[0])
  const rc = matchRatioAndCount(firstWidth, spaces, distance, sandwich, alignEnd)
  if (rc) {
    // 按 ratio, count 缩放数据
    const { ratio, count } = rc
    const scaledArrayData: temp.scaledArrayData[] = []
    array.forEach((verticalUnit) => {
      const spaceScaled = verticalUnit.space * ratio
      const tempData = getTempData(verticalUnit, spaceScaled)
      for (let i = 0; i < verticalUnit.count; i++) {
        scaledArrayData.push({ spaceScaled, tempData })
      }
    })

    // 按标高推送阵列数据到结果
    elevations.forEach((elevation) => {
      pushArraygData(
        result,
        scaledArrayData,
        firstWidth,
        control,
        count,
        elevation,
        ray,
        sandwich,
        alignEnd
      )
    })
  }
}

/** 将格式化的阵列数据arrayDataType[]转为instance数据并保存到结果 */
function pushArraygData(
  result: magizTypes.rawBuilding,
  scaledArrayData: temp.scaledArrayData[],
  firstWidth: number,
  control: styleParsed.indexController | undefined,
  count: number,
  elevation: number,
  ray: temp.ray,
  /** 默认在线段终点不生成元素以按环状阵列 */
  sandwich: boolean,
  /** 默认不考虑元素宽度，因此不对齐线段两端 */
  alignEnd: boolean
) {
  if (scaledArrayData.length > 0) {
    const firstData = scaledArrayData[0]!
    // 按缩放后的数据偏移ray.start
    const start = ray.start.clone()
    if (alignEnd) {
      const d = ray.direction.clone()
      start.add(d.setLength(firstWidth / 2))
    }
    /** 先将元素在原点处缩放、旋转+移动，再用这个矩阵移动到边线上的起点 */
    const placeMatrix = new Matrix4()
      .makeRotationZ(ray.direction.angle())
      .premultiply(TEMP.makeTranslation(start.x, start.y, elevation))
    /** 缩放后整个组合的长度 */
    const arrayD = scaledArrayData.reduce((a, b) => a + b.spaceScaled, 0)

    // 按序号推送数据
    getValidIndexes(count, control).forEach((i) => {
      let startD = i * arrayD
      scaledArrayData.forEach((data, n) => {
        pushArraygDataToResult(data, startD, placeMatrix, result)
        startD += (data.spaceScaled + getLoopNext(scaledArrayData, n).spaceScaled) / 2
      })
    })

    // 默认在线段终点不生成元素以按环状阵列，sandwich反之
    if (sandwich) pushArraygDataToResult(firstData, arrayD * count, placeMatrix, result)
  }

  /** 计算并推送最终的matrix和colorIndex */
  function pushArraygDataToResult(
    data: temp.scaledArrayData,
    targetDistance: number,
    placeMatrix: Matrix4,
    result: magizTypes.rawBuilding
  ) {
    data.tempData?.forEach((td) => {
      let target = td.boxes
      const { replace } = td
      if (replace && sRand() < replace.chance) {
        target = replace.with
      }
      target.forEach((tempBoxData) => {
        const mtx = tempBoxData.matrix
          .clone()
          .premultiply(TEMP.makeTranslation(targetDistance, 0, 0))
          .premultiply(placeMatrix)
        pushBoxData(result, tempBoxData.colorID, mtx)
      })
    })
  }
}

/** 基于种子和控制器，计算需生成元素的序号 */
function getValidIndexes(count: number, control: styleParsed.indexController | undefined) {
  function pushPassed(
    controls: { every: number; skip: number; chance: number },
    result: number[],
    i: number
  ) {
    const { every, skip, chance } = controls
    if (every > 0) {
      if (i % every !== 0) result.push(i)
    } else if (skip > 0) {
      if (i % skip === 0) result.push(i)
    } else if (chance > 0) {
      if (sRand() < chance) result.push(i)
    } else {
      result.push(i)
    }
  }

  const result: number[] = []
  if (control) {
    const { total, indent } = control
    if (total > 0) count = total
    if (indent) {
      indentIndexes(count, indent, (i) => pushPassed(control, result, i))
    } else {
      for (let i = 0; i < count; i++) pushPassed(control, result, i)
    }
  } else {
    for (let i = 0; i < count; i++) result.push(i)
  }
  return result
}

/** 将 instancedBox 数据推送到结果 */
function pushBoxData(
  saveAs: magizTypes.rawBuilding,
  colorID: styleParsed.colorDataType[],
  matrix: Matrix4
) {
  const { index, glass } = sSample(colorID)!
  const target: magizTypes.instancedData = saveAs.instanced[glass ? 'boxGlass' : 'box']
  target.colors.push(index)
  target.matrices.push(matrix.toArray())
}
