import { Matrix4 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import type { temp } from '../types/temp'

export { TEMP, DEFAULT_COLOR, applyTransform, handleFacadeElements }

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

/** 默认的颜色参数 */
const DEFAULT_COLOR: parsed.colorType = { index: 0, glass: false }

/** 应用 parsed.status.transform 到 matrix */
function applyTransform(
  status: parsed.status,
  matrix: Matrix4,
  /** facade 调用时可能需要根据比例缩放x轴移动距离 */
  xRatio = 1
) {
  status.transform?.forEach((t) => {
    if ('rotateX' in t) {
      matrix.premultiply(TEMP.makeRotationX(degToRad(t.rotateX)))
    } else if ('rotateY' in t) {
      matrix.premultiply(TEMP.makeRotationY(degToRad(t.rotateY)))
    } else if ('rotateZ' in t) {
      matrix.premultiply(TEMP.makeRotationZ(degToRad(t.rotateZ)))
    } else {
      matrix.premultiply(TEMP.makeTranslation(t.moveX * xRatio, t.moveY, t.moveZ))
    }
  })
  return matrix
}

/** 根据 parsed.box 生成 matrix 与颜色，作为facade元素时x相关数值须进行缩放 */
function setFacadeBox(box: parsed.box, xRatio: number, isFlex: boolean): temp.box {
  let { x, y, z } = box
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

  return {
    matrix: applyTransform(box, matrix, xRatio),
    color: box.color || [DEFAULT_COLOR],
  }
}

/** 处理facade中的构成元素(Box或FlexBox)，返回matrix和color */
function handleFacadeElements(
  box: parsed.box | parsed.boxFlex,
  /** 如果存在flexBox，宽度按此值 */
  flexLength: number,
  /** 作为facade元素，可能需要按沿边线的比例缩放移动距离 */
  xRatio: number
): temp.box {
  return 'x' in box
    ? setFacadeBox(box, xRatio, false)
    : setFacadeBox(
        {
          x: flexLength + box.extend,
          y: box.depth,
          z: box.height,
          transform: box.transform,
          color: box.color,
        },
        xRatio,
        true
      )
}
