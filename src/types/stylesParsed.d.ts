import type { styleTypes } from './styleTypes'

export namespace styleParsed {
  type colorDataType = { index: number; glass: boolean }
  type unitType = { [key: string]: number }

  type transformType =
    | { rotateX: number }
    | { rotateY: number }
    | { rotateZ: number }
    | { moveX: number; moveY: number; moveZ: number }

  type indentType = {
    start: number
    end: number
    fromCenter: boolean
    asRatio: boolean
    reverse: boolean
  }

  type handleEdge = {
    offset?: { x: number; y: number; asRatio: boolean }
    along?: styleTypes.alongType
    clamp?: clampType
    indent?: indentType
  }

  type clampType = {
    startX: number
    endX: number
    startY: number
    endY: number
    asRatio: boolean
    reverse: boolean
  }

  type indexController = {
    total: number
    skip: number
    every: number
    chance: number
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
    totalHeight: number
    flexDepth: number
    flexwidth: number
    dash: indexController
  }

  type edgeUnit = {
    space: number
    boxes: (box | flexVertical)[]
    replace: undefined | { chance: number; with: (box | flexVertical)[] }
    count: number
  }

  type matchUnit = status & {
    unitDepth: number
    flexHeight: number
    indentWidth?: indentType
    count: number
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  type extrude = status & {
    height: number
    thickness: number
  }

  type match = {
    array: matchUnit[]
    along: styleTypes.alongType
    control: indexController | undefined
    sandwich: boolean
    simplify: boolean
  }

  type edgeArray = {
    array: edgeUnit[]
    control: indexController | undefined
    sandwich: boolean
    alignEnd: boolean
  }

  type flexEdge = status & {
    unitWidth: number
    flexDepth: number
    flexHeight: number
    dash: indexController
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
    elevations: number[]
    edgeParams: handleEdge[]

    extrude: extrude[]
    match: match[]
    vertical: edgeArray[]
    horizontal: flexEdge[]

    appendent: appendent[]
    boundingBox: boundingBox[]
    slopingRoof: slopingRoof[]
  }

  /** 解析样式的结果 */
  type result = {
    /** 全局缓存的colorMap指针，颜色映射尽量前置，以方便索引和重复利用颜色 */
    colorMapPTR: string[]
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
