import { Vector2, Matrix4, Material, BufferGeometry, Color } from 'three'
import type { styleParsed } from './stylesParsed'

/** 计算过程数据 */
export namespace temp {
  type partMatrixType = {
    box: { [textureName: string]: Matrix4[] }
    plane: { [textureName: string]: Matrix4[] }
  }

  type line = { start: Vector2; end: Vector2 }

  type ray = line & { direction: Vector2 }

  type splitted = ray & {
    split: { startRay?: ray; middleRay?: ray; endRay?: ray }
  }

  type rectangle = {
    min: Vector2
    max: Vector2
    lines: [line, line, line, line]
  }

  type box = {
    matrix: Matrix4
    color: styleParsed.colorType[]
  }

  type match = styleParsed.status & {
    width: number
    height: number
    elevation: number
    /** 如果有孔洞，可能一行存在多个pair */
    pairs: {
      center: { x: number; y: number }
      width: number
    }[]
  }

  type matchResult = {
    /** 拟合的结果 */
    matchData: match[]
    /** 拟合的角度，恢复原位须旋转 -radian */
    radian: number
  }

  /** 能被清理的对象类型 */
  type disposableType = {
    children?: disposableType[]
    material?: Material
    geometry?: BufferGeometry
  }

  type rawInstanceData = { color: Color[]; matrix: Matrix4[] }

  type rawInstanceDataResult = {
    instance: {
      box: rawInstanceData
      boxGlass: rawInstanceData
      sloping: rawInstanceData
      slopingGlass: rawInstanceData
    }
    edge: {
      boxMatrix: number[]
      slopingMatrix: number[]
    }
  }
}
