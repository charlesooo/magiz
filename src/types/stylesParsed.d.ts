import type { styleTypes } from './styleTypes'

export namespace styleParsed {
  type paddingType = { start: number; middle: number; end: number; asRatio: boolean }
  type transformType =
    | { rotateX: number }
    | { rotateY: number }
    | { rotateZ: number }
    | { moveX: number; moveY: number; moveZ: number }
  type colorDataType = { index: number; glass: boolean }
  type unitType = { [key: string]: number }
  type status = {
    transform: transformType[]
    colorID: colorDataType[]
  }

  type box = status & { x: number; y: number; z: number }
  type boxFlex = status & { width: number; height: number; shrink: number }

  type indexController = {
    total: number
    asRatio: boolean
    reverse: boolean
    first: number
    last: number
    skip: number
    every: number
    chance: number
  }

  type offsetEdgeType = {
    offset: { x: number; y: number; asRatio: boolean }
  }

  type clampEdgeType = {
    clamp: {
      xMin: number
      xMax: number
      yMin: number
      yMax: number
      xCentral: number
      yCentral: number
      asRatio: boolean
      reverse: boolean
    }
  }

  type boxArray = {
    area: NonNullable<styleTypes.boxArray['area']>
    spacing:
      | {
          space: number
          group: (box | boxFlex)[] | undefined
          control: indexController | undefined
          repeat: number
        }[]
      | undefined
    divide:
      | {
          count: number
          group: (box | boxFlex)[]
          control: indexController | undefined
        }[]
      | undefined
  }

  /** 解析styleTypes.floor与边线相关的参数 */
  type handleEdgesType = (offsetEdgeType | clampEdgeType | styleTypes.alongEdgeType)[]

  type extrude = status & {
    elevation: number
    height: number
    thickness: number
  }

  type slopingRoof = status & {
    form: '2' | '4'
    height: number
    overhang: number
    elevation: number
  }

  type clampBox = status & {
    height: number
    elevation: number
  }

  type facade = {
    padding: paddingType | undefined
    proto: boxArray[]
    elevation: number
  }

  type match = {
    along: styleTypes.alongEdgeType['along'] | undefined
    flexes: boxFlex[]
    top:
      | {
          ratio: number
          like: NonNullable<styleTypes.match['top']>['like']
          padding: paddingType | undefined
        }
      | undefined
    bottom:
      | {
          ratio: number
          like: NonNullable<styleTypes.match['bottom']>['like']
          padding: paddingType | undefined
        }
      | undefined
    elevation: number
    control: indexController | undefined
    sandwich: boolean
  }

  type boxInside = {
    flex: boxFlex
    count: [min: number, max: number]
    widthRatio: [min: number, max: number]
    depthRatio: [min: number, max: number]
    heightRatio: [min: number, max: number]
    along: styleTypes.alongEdgeType['along'] | undefined
    elevation: number
  }

  type adjunct = {
    boxes: box[]
    place: NonNullable<styleTypes.adjunct['place']>
    count: number
    elevation: number
  }

  type resultClassified = {
    /** 解析后边线相关的参数 */
    edgeParams: handleEdgesType
    /** handleEdgesType保存为JSON，用于按此参数分类存储生成的模型元素 */
    edgeParamsStampJSON: string

    /** 从平面挤出体块 */
    extrude: extrude[]
    /** 按平面定界框生成坡屋顶 */
    slopingRoof: slopingRoof[]
    /** clamp平面而成的 box */
    clampBox: clampBox[]
    /** 沿边线生成立面的 box 阵列 */
    facade: facade[]
    /** 用box拟合平面和高度 */
    match: match[]
    /** 用box拟合平面和高度 */
    boxInside: boxInside[]
    /** 在平面内生成box组成的构件 */
    adjunct: adjunct[]
  }

  /** 解析样式的结果 */
  type result = {
    /** 全局缓存的colorMap指针，颜色映射尽量前置，以方便索引和重复利用颜色 */
    colorMapPTR: string[]
    /** 生成的层数 */
    floorCount: number
    /** 参数按边线参数分类保存 */
    classifiedByEdge: resultClassified[]
  }
}
