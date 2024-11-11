import { Matrix4 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { indentBoxFlexWidth } from './handleIdent'

import type { temp } from '../../types/temp'
import type { styleParsed } from '../../types/stylesParsed'

export { TEMP, applyBasicTransform, getTempData }

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

/** 处理facade中的构成元素(FlexBox均格式化为Box)。如有尺寸为0则不会生成数据 */
function getTempData(arrayUnit: styleParsed.arrayUnit, flexSpace: number): temp.boxReplacable[] {
  const result: temp.boxReplacable[] = []
  arrayUnit.boxes.forEach((boxEnumReplacable) => {
    let replace: temp.boxReplacable['replace']
    const br = boxEnumReplacable.replace
    if (br) {
      replace = {
        chance: br.chance,
        with: boxEnumsToTemp(br.with, flexSpace),
      }
    }
    result.push({ replace, boxes: boxEnumsToTemp([boxEnumReplacable], flexSpace) })
  })
  return result
}

function boxEnumsToTemp(
  boxEnums: (styleParsed.box | styleParsed.boxFlex)[],
  flexSpace: number
): temp.box[] {
  const result: temp.box[] = []
  boxEnums.forEach((b) => {
    if ('widthX' in b) {
      const d = boxToTemp(b)
      if (d) result.push(d)
    } else {
      indentBoxFlexWidth(b, flexSpace).forEach((data) => {
        const d = boxFlexToTemp(data.boxFlex, data.boxWidth)
        if (d) result.push(d)
      })
    }
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

function boxFlexToTemp(boxFlex: styleParsed.boxFlex, flexWidth: number): temp.box | undefined {
  let { depth, height } = boxFlex
  if (!depth || !height) return undefined

  const matrix = new Matrix4().makeTranslation(0.5, 0, 0.5)
  if (flexWidth < 0) {
    matrix.premultiply(TEMP.makeTranslation(-1, 0, 0))
    flexWidth = -flexWidth
  }
  if (depth < 0) depth = -depth
  if (height < 0) {
    matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
    height = -height
  }
  matrix.premultiply(TEMP.makeScale(flexWidth, depth, height))
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
