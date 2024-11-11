import type { styleTypes } from './styleTypes'

export namespace styleParsed {
  type colorDataType = { index: number; glass: boolean }
  type unitType = { [key: string]: number }

  type transformType =
    | { rotateX: number }
    | { rotateY: number }
    | { rotateZ: number }
    | { moveX: number; moveY: number; moveZ: number }

  type handleEdgeType = {
    offset?: { x: number; y: number; asRatio: boolean }
    along?: styleTypes.handleEdgeType['along']
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

  type indentType = {
    start: number
    end: number
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
    transform: transformType[]
    colorID: colorDataType[]
  }

  type box = status & {
    widthX: number
    depthY: number
    heightZ: number
  }

  type flexVertical = status & {
    unitHeight: number
    flexDepth: number
    flexwidth: number
    replace: undefined | flexReplace
  }

  type flexEdge = status & {
    unitWidth: number
    flexDepth: number
    flexHeight: number
    replace: undefined | flexReplace
  }

  type flexReplace = {
    chance: number
    with: box[]
    split: boolean
  }

  type verticalUnit = {
    space: number
    boxes: (box | flexVertical)[]
    replace: undefined | { chance: number; with: (box | flexVertical)[] }
    count: number
  }

  type matchUnit = status & {
    flexDepth: number
    flexHeight: number
    indentWidth?: indentType
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  type spacing<T> = {
    array: T[]
    control: undefined | indexController
    sandwich: boolean
    alignEnd: boolean
  }

  type extrude = status & {
    height: number
    thickness: number
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
    edgeParams: handleEdgeType[]

    extrude: extrude[]
    match: (spacing<matchUnit> & { along: handleEdgeType['along'] })[]
    vertical: spacing<verticalUnit>[]
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
        params: handleEdgeType[]
        parsed: floorResult[]
      }
    }
  }
}
