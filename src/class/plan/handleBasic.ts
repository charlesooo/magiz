import { Matrix4 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { indentBoxFlexWidth } from './handleIdent'

import type { temp } from '../../types/temp'
import type { styleParsed } from '../../types/stylesParsed'

export { TEMP, applyBasicTransform, getBoxData }

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

/** 处理facade中的构成元素(FlexBox均格式化为Box)，如有尺寸为0返回空值。沿X轴缩放将导致末尾无法对齐终点 */
function getBoxData(
  boxEnum: styleParsed.box | styleParsed.boxFlex,
  /** 如果存在flexBox，宽度按此值 */
  flexWidth: number
): temp.box[] {
  const result: temp.box[] = []
  if ('flexDepth' in boxEnum) {
    indentBoxFlexWidth(boxEnum, flexWidth).forEach((data) => {
      const { boxFlex } = data
      const bid = getBoxInstanceData(
        {
          widthX: data.boxWidth,
          depthY: boxFlex.flexDepth,
          heightZ: boxFlex.height,
          colorID: boxFlex.colorID,
          transform: boxFlex.transform,
        },
        true
      )
      if (bid) result.push(bid)
    })
  } else {
    const bid = getBoxInstanceData(boxEnum, false)
    if (bid) result.push(bid)
  }
  return result

  /** 根据 styleParsed.box 生成 matrix 与颜色，作为facade元素时x相关数值须进行缩放 */
  function getBoxInstanceData(box: styleParsed.box, isFlex: boolean): temp.box | undefined {
    let { widthX: x, depthY: y, heightZ: z } = box
    if (x === 0 || y === 0 || z === 0) return undefined

    const v = isFlex ? 0.5 : 0
    const matrix = new Matrix4().makeTranslation(v, 0, 0.5)
    // FlexBox 的锚点在底部中线的左端，Box的锚点在底部正中
    if (x < 0) {
      if (isFlex) matrix.premultiply(TEMP.makeTranslation(-1, 0, 0))
      x = -x
    }
    // y值正负不影响定位
    if (y < 0) {
      y = -y
    }
    if (z < 0) {
      matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
      z = -z
    }
    matrix.premultiply(TEMP.makeScale(x, y, z))
    applyBasicTransform(box, matrix, TEMP)

    return { matrix, colorID: box.colorID }
  }
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
