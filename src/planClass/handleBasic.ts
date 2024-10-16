import { Matrix4 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'

import type { temp } from '../types/temp'
import type { styleParsed } from '../types/stylesParsed'

export { TEMP, applyTransform, handleFacadeElements }

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

/** 应用 styleParsed.status.transform 到 matrix */
function applyTransform(
  status: styleParsed.status,
  matrix: Matrix4,
  temp: Matrix4,
  /** facade 调用时可能需要根据比例缩放x轴移动距离 */
  xRatio = 1
): void {
  status.transform?.forEach((t) => {
    if ('rotateX' in t) {
      matrix.premultiply(temp.makeRotationX(degToRad(t.rotateX)))
    } else if ('rotateY' in t) {
      matrix.premultiply(temp.makeRotationY(degToRad(t.rotateY)))
    } else if ('rotateZ' in t) {
      matrix.premultiply(temp.makeRotationZ(degToRad(t.rotateZ)))
    } else {
      matrix.premultiply(temp.makeTranslation(t.moveX * xRatio, t.moveY, t.moveZ))
    }
  })
}

/** 根据 styleParsed.box 生成 matrix 与颜色，作为facade元素时x相关数值须进行缩放 */
function setFacadeBox(
  box: styleParsed.box,
  xRatio: number,
  isFlex: boolean
): temp.box | undefined {
  let { x, y, z } = box
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
  matrix.premultiply(TEMP.makeScale(x * xRatio, y, z))
  applyTransform(box, matrix, TEMP, xRatio)

  return { matrix, colorID: box.colorID }
}

/** 处理facade中的构成元素(Box或FlexBox)，返回matrix和color，如果有尺寸为0返回空值 */
function handleFacadeElements(
  box: styleParsed.box | styleParsed.boxFlex,
  /** 如果存在flexBox，宽度按此值 */
  flexLength: number,
  /** 作为facade元素，可能需要按沿边线的比例缩放移动距离 */
  xRatio: number
): temp.box | undefined {
  return 'x' in box
    ? setFacadeBox(box, xRatio, false)
    : setFacadeBox(
        {
          x: flexLength - box.shrink,
          y: box.width,
          z: box.height,
          transform: box.transform,
          colorID: box.colorID,
        },
        xRatio,
        true
      )
}
