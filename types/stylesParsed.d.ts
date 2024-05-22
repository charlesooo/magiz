declare namespace parsed {
  type paddingType = { start: number; middle: number; end: number; asRatio: boolean }
  type scaleOrOffsetType = { x: number; y: number; asRatio: boolean }
  type transformType =
    | { rotateX: number }
    | { rotateY: number }
    | { rotateZ: number }
    | { moveX: number; moveY: number; moveZ: number }
  type colorType = { index: number; glass: boolean }
  type unitType = { [key: string]: number }

  type status = {
    transform: transformType[]
    color: colorType[]
  }

  type box = status & { x: number; y: number; z: number }
  type boxFlex = status & { depth: number; height: number; extend: number }

  type control = {
    skipIndex: number
    everyIndex: number
    chance: number
  }

  type clampRangeType = {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    xCentral: number
    yCentral: number
    asRatio: boolean
    reverse: boolean
  }

  type boxArray = {
    area: params.paddingAreaType
    spacing:
      | {
          space: number
          group: (box | boxFlex)[] | undefined
          control: control | undefined
          repeat: number
        }[]
      | undefined
    divide:
      | {
          count: number
          group: (box | boxFlex)[]
          control: control | undefined
        }[]
      | undefined
    first: boolean
    last: boolean
    lastWidth: number
  }

  /** 解析params.floor与边线相关的参数 */
  type handleEdgesType = {
    scale: scaleOrOffsetType | undefined
    set:
      | {
          offset: scaleOrOffsetType | undefined
          clamp: parsed.clampRangeType | undefined
          orient: params.alongType | undefined
        }[]
      | undefined
  }

  type extrude = status & {
    height: number
    thickness: number
    elevation: number
  }

  type slopingRoof = status & {
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
    along: params.alongType | undefined
    flexes: boxFlex[]
    top:
      | {
          ratio: number
          like: params.topLikeType
          padding: paddingType | undefined
        }
      | undefined
    bottom:
      | {
          ratio: number
          like: params.bottomLikeType
          padding: paddingType | undefined
        }
      | undefined
    elevation: number
    control: control | undefined
    sandwich: boolean
  }

  type boxInside = {
    flex: boxFlex
    count: [min: number, max: number]
    widthRatio: [min: number, max: number]
    depthRatio: [min: number, max: number]
    heightRatio: [min: number, max: number]
    along: params.alongType | undefined
    elevation: number
  }

  type adjunct = {
    boxes: box[]
    place: params.randomPlaceType
    count: number
    elevation: number
  }

  type resultClassified = {
    /** 解析后边线相关的参数 */
    edgeParams: handleEdgesType
    /** handleEdgesType保存为JSON，用于按此参数分类存储 */
    edgesJSON: string

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
    /** 颜色映射尽量前置，以编辑样式时得知颜色总量，或可方便重复利用颜色 */
    colorMap: string[]
    /** 生成的层数 */
    floorCount: number
    /** 参数按边线参数分类保存 */
    classified: resultClassified[]
  }
}
