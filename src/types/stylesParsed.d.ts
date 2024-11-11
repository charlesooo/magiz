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

  type status = {
    transform: transformType[]
    colorID: colorDataType[]
  }

  type box = status & {
    widthX: number
    depthY: number
    heightZ: number
  }

  type boxFlex = status & {
    depth: number
    height: number
    indentWidth: undefined | indentType
  }

  type replaceBoxEnum = {
    chance: number
    with: (box | boxFlex)[]
  }

  type arrayUnit = {
    space: number
    boxes: (
      | (box & { replace: undefined | replaceBoxEnum })
      | (boxFlex & { replace: undefined | replaceBoxEnum })
    )[]
    count: number
  }

  type indexController = {
    total: number
    skip: number
    every: number
    chance: number
    indent: undefined | indentType
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

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

  type spacing = {
    array: arrayUnit[]
    control: undefined | indexController
    sandwich: boolean
    alignEnd: boolean
  }

  type appendent = {
    parts: box[]
    place: NonNullable<styleTypes.appendent['place']>
    count: number
  }

  type floorResult = {
    elevations: number[]
    edgeParams: handleEdgeType[]
    extrude: extrude[]
    matchSpacing: (spacing & { along: handleEdgeType['along'] })[]
    spacing: spacing[]
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
