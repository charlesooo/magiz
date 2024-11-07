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
    colorID: styleParsed.colorDataType[]
  }

  type boxReplacable = {
    boxes: box[]
    replace: { chance: number; with: box[] } | undefined
  }

  /** spacing 和 dividing 通用的阵列数据，spacing时须整体沿X轴缩放，数据均为scaled */
  type scaledArrayData = {
    tempData: temp.boxReplacable[] | undefined
    spaceScaled: number
  }

  type match = styleParsed.status & {
    flexDepth: number
    height: number
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

  type rawExtrudedData = rawInstanceData & {
    /** offset以后的几何很可能与单纯缩放不同，须使用独立的几何体 */
    geom: BufferGeometry
    /** 对应了全部matrix的 InstancedBufferAttribute，用于生成边线 */
    edgeAttr: number[]
  }

  type rawInstanceDataResult = {
    /** 玻璃和实体材质须分成两个instance */
    instanced: {
      box: rawInstanceData
      boxGlass: rawInstanceData
      slope2: rawInstanceData
      slope2Glass: rawInstanceData
      slope4: rawInstanceData
      slope4Glass: rawInstanceData
    }
    /** 玻璃和实体的边线可以公用，因此独立保存边线数据 */
    instancedEdge: {
      boxAttribute: number[]
      slope2Attribute: number[]
      slope4Attribute: number[]
    }
    extruded: {
      solid: rawExtrudedData[]
      glass: rawExtrudedData[]
    }
  }
}
