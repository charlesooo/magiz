import { Matrix4 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { indentBoxFlexWidth } from './handleIdent'
import { matchRatioAndCount, sRand } from './handleMath'

import type { temp } from '../../types/temp'
import type { styleParsed } from '../../types/stylesParsed'

export { TEMP, applyBasicTransform, getTempData }

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

/** 处理facade中的构成元素(FlexBox均格式化为Box)。如有尺寸为0则不会生成数据 */
function getTempData(
  verticalUnit: styleParsed.verticalUnit,
  flexSpace: number
): temp.boxReplacable[] {
  const result: temp.boxReplacable[] = []
  verticalUnit.boxes.forEach((b) => {
    let replace: temp.boxReplacable['replace']
    const br = boxEnumReplacable.replace
    if (br) {
      replace = {
        chance: br.chance,
        with: verticalToTempBoxes(br.with, flexSpace),
      }
    }
    result.push({ replace, boxes: verticalToTempBoxes([boxEnumReplacable], flexSpace) })
  })
  return result
}

function verticalToTempBoxes(
  boxes: (styleParsed.box | styleParsed.flexVertical)[],
  totalHeight: number
): temp.box[] {
  const result: temp.box[] = []
  boxes.forEach((x) => {
    const d = 'widthX' in x ? boxToTemp(x) : flexVerticalToTemp(x, totalHeight)
    if (d) result.push(d)
  })
  return result
}

function boxToTemp(box: styleParsed.box): temp.box | undefined {
  let { widthX, depthY, heightZ } = box
  if (!widthX || !depthY || !heightZ) return undefined

  const matrix = new Matrix4().makeTranslation(0, 0, 0.5)
  if (widthX < 0) widthX = -widthX
  if (depthY < 0) depthY = -depthY
  if (heightZ < 0) {
    matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
    heightZ = -heightZ
  }
  matrix.premultiply(TEMP.makeScale(widthX, depthY, heightZ))
  applyBasicTransform(box, matrix, TEMP)
  return { matrix, colorID: box.colorID }
}

function flexVerticalToTemp(
  flexVertical: styleParsed.flexVertical,
  totalHeight: number
): temp.box | undefined {
  let { unitHeight, flexDepth, flexwidth, replace } = flexVertical
  if (!unitHeight || !flexDepth || !flexwidth) return undefined
  if (flexDepth < 0) flexDepth = -flexDepth
  if (flexwidth < 0) flexwidth = -flexwidth

  const rc = matchRatioAndCount(unitHeight, [unitHeight], totalHeight, false, false)
  if (rc) {
    const matrix = new Matrix4().makeTranslation(0, 0, 0.5)
    const { ratio, count } = rc

    /** 根据参数合并未被替换的连续竖向box，计算最终的长度和标高 */
    const dataUnits: { moveZ: number; height: number }[] = []
    if (replace) {
      const height = unitHeight * ratio
      let moveZ = 0
      for (let i = 0; i < count; i++) {
        const isReplaced = sRand() < replace.chance
        let thisUnit = dataUnits[dataUnits.length - 1]
        if (isReplaced || !thisUnit) {
          thisUnit = { moveZ, height }
          dataUnits.push(thisUnit)
        }

        if (!isReplaced && !replace.split) thisUnit.height += height
        moveZ += height
      }
    }
  }
}

function boxFlexToTemp(boxFlex: styleParsed.boxFlex, flexWidth: number): temp.box | undefined {
  let { flexDepth, flexHeight } = boxFlex
  if (!flexDepth || !flexHeight) return undefined

  const matrix = new Matrix4().makeTranslation(0.5, 0, 0.5)
  if (flexWidth < 0) {
    matrix.premultiply(TEMP.makeTranslation(-1, 0, 0))
    flexWidth = -flexWidth
  }
  if (flexDepth < 0) flexDepth = -flexDepth
  if (flexHeight < 0) {
    matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
    flexHeight = -flexHeight
  }
  matrix.premultiply(TEMP.makeScale(flexWidth, flexDepth, flexHeight))
  applyBasicTransform(boxFlex, matrix, TEMP)
  return { matrix, colorID: boxFlex.colorID }
}

/** 应用 styleParsed.status.transform 到 matrix */
function applyBasicTransform(
  status: styleParsed.status,
  matrix: Matrix4,
  tempMatrix: Matrix4
): void {
  status.transform?.forEach((t) => {
    if ('rotateX' in t) {
      matrix.premultiply(tempMatrix.makeRotationX(degToRad(t.rotateX)))
    } else if ('rotateY' in t) {
      matrix.premultiply(tempMatrix.makeRotationY(degToRad(t.rotateY)))
    } else if ('rotateZ' in t) {
      matrix.premultiply(tempMatrix.makeRotationZ(degToRad(t.rotateZ)))
    } else {
      matrix.premultiply(tempMatrix.makeTranslation(t.moveX, t.moveY, t.moveZ))
    }
  })
}
