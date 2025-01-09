import type { styleTypes } from './styleTypes'

export namespace styleParsed {
  /** 考虑preset，通过使用 handleParse.replaceUnit 解析参数，最终结果为数字 */
  type bool = 1 | 0
  type colorDataType = { index: number; glass: bool }
  type unitType = { [key: string]: number }

  type transformType =
    | { rotateX: number }
    | { rotateY: number }
    | { rotateZ: number }
    | { moveX: number; moveY: number; moveZ: number }

  type indentType = {
    start: number
    end: number
    central: bool
    asRatio: bool
    reverse: bool
  }

  type clampType = {
    startX: number
    endX: number
    centralX: bool
    startY: number
    endY: number
    centralY: bool
    asRatio: bool
    reverse: bool
  }

  type handleEdge = {
    offset?: { x: number; y: number; asRatio: bool }
    along?: styleTypes.alongType
    clamp?: clampType
    indent?: indentType
    split?: { array: number[]; select: number; sandwich: bool }
  }

  type indexController = {
    total: number
    chance: number
    filter: undefined | number[]
    indent: undefined | indentType
  }

  type status = {
    trans: transformType[]
    color: colorDataType[]
  }

  type box = status & {
    widthX: number
    depthY: number
    heightZ: number
  }

  type flexVertical = status & {
    unitHeight: number
    flexHeight: number
    flexDepth: number
    flexWidth: number
    dash: indexController
    shrink: undefined | indentType
    seg: bool
  }

  type edgeUnit = {
    space: number
    boxes: box[]
    flexes: flexVertical[]
    replace:
      | undefined
      | {
          chance: number
          boxes: box[]
          flexes: flexVertical[]
        }
    count: number
  }

  type flexMatchUnit = status & {
    unitDepth: number
    flexHeight: number
    shrink: undefined | indentType
    count: number
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  type extrude = status & {
    height: number
    thickness: number
  }

  type match = {
    array: flexMatchUnit[]
    along: styleTypes.alongType
    ctrlMatch: indexController | undefined
    sandwich: bool
    simplify: bool
  }

  type edgeArray = {
    array: edgeUnit[]
    ctrlArray: indexController | undefined
    endWidth: number
    sandwich: bool
  }

  type edgeFlex = status & {
    array: number[]
    flexDepth: number
    flexHeight: number

    seg: bool
    sandwich: bool
    shrink: undefined | indentType
    ctrlFlex: undefined | indexController
  }

  type slopingRoof = status & {
    form: '2' | '4'
    height: number
    overhang: number
  }

  type boundingBox = status & {
    height: number
    clamp: undefined | clampType
  }

  type appendent = {
    boxes: box[]
    place: NonNullable<styleTypes.appendent['place']>
    count: number
  }

  type floorResult = {
    diverse: bool
    elevations: number[]
    edgeParams: handleEdge[]

    extrude: extrude[]
    match: match[]
    vertical: edgeArray[]
    horizontal: edgeFlex[]

    appendent: appendent[]
    boundingBox: boundingBox[]
    slopingRoof: slopingRoof[]
  }

  /** 解析样式的结果 */
  type result = {
    /** 全局缓存的colorMap指针，颜色映射尽量前置，以方便索引和重复利用颜色 */
    colors: string[]
    /** 生成的层数 */
    floorCount: number
    /** 参数按边线参数分类保存 */
    classified: {
      [edgeParamsJSON: string]: {
        params: handleEdge[]
        parsed: floorResult[]
      }
    }
  }
}
