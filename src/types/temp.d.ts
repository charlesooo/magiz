import { Vector2, Matrix4, Material, BufferGeometry, Color } from 'three'
import type { styleParsed } from './stylesParsed'

/** 计算过程数据 */
export namespace temp {
  type partMatrixType = {
    box: { [textureName: string]: Matrix4[] }
    plane: { [textureName: string]: Matrix4[] }
  }

  type line = { start: Vector2; end: Vector2 }

  type lineSweepX = line & {
    depth: number
    matchUnit: styleParsed.flexMatchUnit
    /** color和transform拼接字符串，用于比较 */
    statusJSON: string
  }

  type ray = line & { direction: Vector2 }

  type raySplitted = ray & {
    split: { startRay?: ray; middleRay?: ray; endRay?: ray }
  }

  type rectangle = {
    min: Vector2
    max: Vector2
    lines: [line, line, line, line]
  }

  type box = {
    matrix: Matrix4
    color: styleParsed.colorDataType[]
  }

  /** spacing 和 dividing 通用的阵列数据，spacing时须整体沿X轴缩放，数据均为scaled */
  type arrayUnit = {
    tempBoxes: temp.box[] | undefined
    spaceScaled: number
  }

  type matchUnit = {
    tempBoxes: temp.box[] | undefined
    spaceScaled: number
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
