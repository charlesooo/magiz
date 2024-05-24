declare namespace params {
  /** 参数可以是数字或代表公式的字符串 */
  type ns = number | string

  /** 在特定的padding区域生成部件，未设置时默认在中部 */
  type paddingAreaType = 'BOTH' | 'START' | 'END' | 'MIDDLE'
  type topLikeType = 'ROUGH' | 'HILL' | 'VALLEY'
  type bottomLikeType = 'ROUGH' | 'TUNNEL'
  /** 按朝向生成。平面轴向WIDTH|DEPTH|RANDOM */
  type alongType = 'WIDTH' | 'DEPTH' | 'RANDOM' | 'LONGEST' | 'SHORTEST' | number
  type randomPlaceType = 'EDGE' | 'AREA'
  type paymentType = 'FREE' | 'BASIC'

  /** 按总长度等比限定生成范围 */
  type paddingType = {
    /** 从中间向两侧等距划分范围，默认按比例 */
    middle?: ns
    /** 从起点划分范围，默认按比例 */
    start?: ns
    /** 从终点划分范围，默认按比例 */
    end?: ns
    /** 默认按比例 */
    asRatio?: boolean
  }

  /** 边线缩放或偏移 */
  type scaleOrOffsetType = { x?: ns; y?: ns; asRatio?: boolean } | ns

  /** 将元素变形拆解为基本项目。例如按X轴旋转和按Y轴旋转，前后组合的不同，变形的结果也不同 */
  type transformType =
    | { rotateX: ns }
    | { rotateY: ns }
    | { rotateZ: ns }
    | { moveX?: ns; moveY?: ns; moveZ?: ns }

  /** 从楼层的顶部或底部限定生成范围 */
  type floorRangeType = {
    /** 选中顶部的楼层，默认按数量 */
    top?: ns
    /** 选中底部的楼层，默认按数量 */
    bottom?: ns
    /** 默认按数量 */
    asRatio?: boolean
    /** 因按浮点的比例计算整数楼层，同一比例无法推算出反向计算时的比例（例如三层时，按 topRatio=0.5 计算range=[0,1]，但如果按 bottomRatio=0.5 计算结果为果[2,2]，而非期望的 [1,2]），只能在算法层面选择是否反算 */
    reverse?: boolean
  }

  type clampRangeType = {
    /** 沿X轴坐标最小的边向内偏移，默认按比例 */
    xMin?: ns
    /** 沿X轴坐标最大的边向内偏移，默认按比例  */
    xMax?: ns
    /** 沿Y轴坐标最小的边向内偏移，默认按比例  */
    yMin?: ns
    /** 沿Y轴坐标最大的边向内偏移，默认按比例  */
    yMax?: ns
    /** 沿X轴向中间偏移到指定宽度，默认按比例  */
    xCentral?: ns
    /** 沿Y轴向中间偏移到指定宽度，默认按比例  */
    yCentral?: ns
    /** 默认按比例 */
    asRatio?: boolean
    /** 反向选择 */
    reverse?: boolean
  }

  /** 所有体块的基本状态参数 */
  type status = {
    /** 定义材质。字符串空格前颜色值，空格后表示玻璃还是实墙（默认为实墙），如: '#ff0000 G'，默认的玻璃材质表示为 'G'。也可以用数组表示随机颜色。 */
    color?: string | string[]
    /** 轴向的旋转和移动组合 */
    transform?: transformType[]
  }

  /** 组成构件的 box 元素 */
  type box = status & {
    /** 沿边线的宽度，正负值相同，可添加到末尾宽度 */
    x: ns
    /** 垂直边线的进深，正负值相同 */
    y: ns
    /** 竖向高度，负值表示朝下 */
    z: ns
  }
  /** 灵活的box，宽度后续按情况设定 */
  type boxFlex = status & {
    /** 水平深度，负值表示朝外 */
    depth: ns
    /** 垂直高度，负值表示朝下，省略表示仅占位 */
    height?: ns
    /** 加长，负值表示缩短 */
    extend?: ns
  }

  type control = {
    /** 跳过一定序号间隔生成 */
    skipIndex?: ns
    /** 按一定序号间隔生成 */
    everyIndex?: ns
    /** 按概率生成 */
    chance?: ns
  }

  type boxArray = {
    /** 指定所在区间 */
    area?: paddingAreaType
    /** 按所有项的间距组合阵列 */
    spacing?: {
      /** 该构件的间距 */
      space: ns
      /** 组成构件的元素，可选boxFlex作为填充块，可为空表示占位 */
      group?: (box | boxFlex)[]
      /** 生成控制参数 */
      control?: control
      /** 在已有基础上添加repeat个副本到spacing（当repaet等于2时共有3个） */
      repeat?: ns
    }[]
    /** 每一项按固定数量阵列 */
    divide?: {
      /** 划分的段数 */
      count: ns
      /** 组成构件的元素 */
      group: (box | boxFlex)[]
      /** 生成控制参数 */
      control?: control
    }[]
    /** 默认生成首位，可跳过 */
    first?: boolean
    /** 默认按loop生成阵列，不生成每条边阵列的末位以避免重复。可选按首项生成末项 */
    last?: boolean
    /** 默认不考虑末位宽度，可设置末尾宽度 */
    lastWidth?: ns
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  /** 用box拟合挤出的平面 */
  type extrude = status & {
    /** 挤出的高度，默认的单位：总高 `BH`、段高 `SH`、层高 `FH` */
    height: ns
    /** 有厚度时用box构成围墙，反之用box拟合挤出平面 */
    thickness?: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 根据 boundingBox 生成坡屋顶 */
  type slopingRoof = status & {
    /** 坡屋顶的高度，默认的单位：总高 `BH`、段高 `SH`、层高 `FH` */
    height: ns
    /** 檐口出挑距离 */
    overhang?: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** clamp 缩放后平面而成的 box 元素， */
  type clampBox = status & {
    /** 挤出的高度，默认的单位：总高 `BH`、段高 `SH`、层高 `FH` */
    height: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 用 box 组成细部 */
  type facade = {
    /** 两端按总长度的比例缩进 */
    padding?: paddingType
    /** 构件原型，均为按padding后的边线生成阵列 */
    proto?: boxArray[]
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 用 box 拟合挤出的平面。按特定方向依次连续排列元素，元素的宽度设为该方向上的切面与平面交叉线段的长度 */
  type match = {
    /** 构件原型，按组成元素的宽度进行拟合 */
    flexes: boxFlex[]
    /** 沿特定边线生成，省略则按随机角度 */
    along?: alongType
    /** 调整顶部形态 */
    top?: {
      /** 形态 */
      like: topLikeType
      /** 形态占总高度的比例 */
      ratio: ns
      /** 两端按总长度的比例缩进 */
      padding?: paddingType
    }
    /** 调整底部形态 */
    bottom?: {
      /** 形态 */
      like: bottomLikeType
      /** 形态占总高度的比例 */
      ratio: ns
      /** 两端按总长度的比例缩进f */
      padding?: paddingType
    }
    /** 生成控制参数 */
    control?: control
    /** 仅在该段的底部生成一次 */
    once?: boolean
    /** 将首项添加到末项 */
    sandwich?: boolean
  }

  /** 根据平面拟合的 rectangle 挤出为 box */
  type boxInside = {
    /** 构件原型，按组成元素的宽度进行拟合 */
    flex: boxFlex
    /** 生成的数量 */
    count: [min: ns, max: ns] | ns
    /** 按拟合数据总量及比例区间挑选拟合数据 */
    depthRatio?: [min: ns, max: ns] | ns
    /** 按拟合尺寸及比例区间修改构件的尺寸 */
    widthRatio?: [min: ns, max: ns] | ns
    /** 按拟合尺寸及比例区间修改构件的尺寸 */
    heightRatio?: [min: ns, max: ns] | ns

    /** 沿特定边线生成，默认按 WIDTH */
    along?: alongType
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 在屋顶生成的随机构件 */
  type adjunct = {
    /** 构件原型 */
    boxes: box[]
    /** 放置的位置，位于偏移后的边线或范围内 */
    place?: randomPlaceType
    /** 生成的数量 */
    count?: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  type floor = {
    /** 竖向生成控制参数 */
    floorControl?: control
    /** 指定具体层数，优先于其他选项，影响解析时的单位 SH */
    floorNumber?: ns
    /** 从顶部和底部向内偏移，选择范围内的楼层 */
    floorRange?: floorRangeType[]

    ///////// 边线相关修改须前置，以便extrude、facade等抽象为预设 /////////

    /** 根据参数组合修改边线，每条按 offset|clamp|orient 的顺序，仅有一项生效 */
    setEdges?: {
      /** 精确偏移边线，不影响 extrude，默认不按比例 */
      offset?: scaleOrOffsetType
      /** 按定界框向内偏移，选择在范围内的边线 */
      clamp?: clampRangeType
      /** 按轴向筛选边线 (不考虑世界轴向以简化逻辑) */
      orient?: alongType
      // 不考虑检查线段长度，通过算法保证长度不足时跳过生成
    }[]

    ///////////////////////////////////////////////////////////////

    /** 引用预设样式，非解析参数 */
    preset?: presetParamsType[]

    /** 从平面挤出体块 */
    extrude?: extrude[]

    /** 按boundingBox生成坡屋顶 */
    slopingRoof?: slopingRoof[]
    /** clamp平面而成的 box */
    clampBox?: clampBox[]
    /** 沿边线生成立面的 box 阵列 */
    facade?: facade[]
    /** 用box拟合平面和高度 */
    match?: match[]
    /** 用box拟合平面和高度 */
    boxInside?: boxInside[]
    /** 在平面内生成box组成的构件 */
    adjunct?: adjunct[]
  }

  /** 通过 mod.floor = 1 实现单层生成体块，sections只实现在垂直方向上分段，因此没有basic属性 */
  type section = {
    floor?: floor[]
    /** 该段的层高，省略则按解析时输入的标准层高 */
    floorHeight?: ns
  }

  /** 建筑样式 */
  type style = {
    /** 订阅类型 */
    type?: paymentType
    /** 用于解析 ns 的单位变量 */
    unit?: { [key: string]: number }
    /** 建筑特点 */
    tag?: string[]
    /** 建筑功能 */
    use?: string[]
    /** 按三段式进行分段。 */
    section: {
      /** 可设置高度但不计入层数 */
      roof?: section & { height?: ns }
      /** 不设置高度，按层高自动计算层数和段高 */
      middle?: section
      /** 设置高度，按中部段高修改高度 */
      bottom: section & { height: ns }
    }
  }

  /** 自定义样式 */
  type styles = {
    /** 附加信息 */
    info?: string
    /** 可重复利用的预设样式，基本格式：{ [name: string]: { floor: floor[] } } */
    preset: {
      /** 样式名称 */
      [name: string]: preset
    }
    /** 建筑样式 */
    building: { [name: string]: style }
  }

  type preset = {
    /** 预设样式变量的默认值 */
    unit?: { [key: string]: ns }
    /** 预设样式颜色的默认值 */
    color?: { [key: string]: string | string[] }
    /** 预设样式的参数组合 */
    floor: floor[]
  }

  type presetParamsType = {
    /** 重定义预设的单位 */
    unit?: { [key: string]: ns }
    /** 重定义预设的颜色 */
    color?: { [key: string]: string | string[] }
    /** 按关键词随机引用样式 */
    key?: string
    /** 预设样式的名称 */
    name?: string
  }
}
