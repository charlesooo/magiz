import { preset } from '../class/style'
import type { magizTypes } from './magizTypes'

export namespace styleTypes {
  /** 参数可以是数字或代表公式的字符串 */
  type ns = number | string
  type colorType = magizTypes.presetFaceType | magizTypes.presetGlassType | string

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

  /** 将元素变形拆解为基本项目。例如按X轴旋转和按Y轴旋转，前后组合的不同，变形的结果也不同 */
  type transformType =
    | { rotateX: ns }
    | { rotateY: ns }
    | { rotateZ: ns }
    | { moveX?: ns; moveY?: ns; moveZ?: ns }

  /** 从楼层的顶部或底部限定生成范围 */
  type floorRangeType = {
    /** 范围从底部起始的楼层数，默认 asRatio:false */
    bottom?: ns
    /** 范围距顶部终止的楼层数，默认 asRatio:false */
    top?: ns
    /** 默认按数量 */
    asRatio?: boolean
    /** 如反向，上部和下部独立计算，生成一或两段范围 */
    reverse?: boolean
  }

  /** 边线缩放或偏移 */
  type offsetEdgeType = { offset: ns | { x: ns; y: ns; asRatio?: boolean } }

  /** 按朝向生成。平面轴向WIDTH|DEPTH|RANDOM */
  type alongEdgeType = { along: 'WIDTH' | 'DEPTH' | 'RANDOM' | 'LONGEST' | 'SHORTEST' | number }

  type clampEdgeType = {
    clamp: {
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
  }

  /** 所有体块的基本状态参数 */
  type status = {
    /** 定义材质的颜色值，以"G"结尾表示玻璃（默认为实墙），如: '#ff0000 G' 或 'G'。也可以用数组表示随机颜色。 */
    color?: colorType | colorType[]
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
    /** 水平宽度，负值表示朝外 */
    width: ns
    /** 垂直高度，负值表示朝下，省略表示仅占位 */
    height?: ns
    /** 加长深度，正值表示缩短 */
    shrink?: ns
  }

  /** 楼层、拟合和立面元素阵列时根据序号控制生成 */
  type indexController = {
    /** 指定从0开始的序号总数 */
    total?: ns

    /** 参数视为按序号总数的比例 */
    asRatio?: boolean
    /** 反向操作 */
    reverse?: boolean
    /** 生成时跳过起始的数量 */
    first?: ns
    /** 生成时跳过末尾的数量 */
    last?: ns
    /** 跳过一定序号间隔生成 */
    skip?: ns
    /** 按一定序号间隔生成 */
    every?: ns
    /** 按概率生成 */
    chance?: ns
  }

  type boxArray = {
    /** 按所有项的间距组合阵列 */
    spacing?: {
      /** 该构件的间距 */
      space: ns
      /** 组成构件的元素，可选boxFlex作为填充块，可为空表示占位 */
      group?: (box | boxFlex)[]
      /** 生成控制参数 */
      control?: indexController
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
      control?: indexController
    }[]
    /** 指定所在区间 */
    area?: 'BOTH' | 'START' | 'END' | 'MIDDLE'
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  /** 用box拟合挤出的平面 */
  type extrude = status & {
    /** 挤出的高度，默认的单位：总高 `BH`、段高 `SH`、层高 `FH` */
    height: ns
    /** 用box构成围墙，数值为围墙厚度 */
    thickness?: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 根据 boundingBox 生成坡屋顶 */
  type slopingRoof = status & {
    /** 双坡或四坡 */
    form: '2' | '4'
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
  type match = Partial<alongEdgeType> & {
    /** 构件原型，按组成元素的宽度进行拟合 */
    flexes: boxFlex[]
    /** 调整顶部形态 */
    top?: {
      /** 形态 */
      like: 'ROUGH' | 'HILL' | 'VALLEY'
      /** 形态占总高度的比例 */
      ratio: ns
      /** 两端按总长度的比例缩进 */
      padding?: paddingType
    }
    /** 调整底部形态 */
    bottom?: {
      /** 形态 */
      like: 'ROUGH' | 'TUNNEL'
      /** 形态占总高度的比例 */
      ratio: ns
      /** 两端按总长度的比例缩进f */
      padding?: paddingType
    }
    /** 生成控制参数 */
    control?: indexController
    /** 仅在该段的底部生成一次 */
    once?: boolean
    /** 将首项添加到末项 */
    sandwich?: boolean
  }

  /** 根据平面拟合的 rectangle 挤出为 box */
  type boxInside = Partial<alongEdgeType> & {
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
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  /** 在屋顶生成的随机构件 */
  type adjunct = {
    /** 构件原型 */
    boxes: box[]
    /** 放置的位置，位于偏移后的边线或范围内 */
    place?: 'EDGE' | 'AREA'
    /** 生成的数量 */
    count?: ns
    /** 仅在该段的底部生成一次 */
    once?: boolean
  }

  type floor = {
    /** 按楼层序号控制竖向生成 */
    control?: indexController
    /** 修改边线，按组合的顺序操作 */
    edge?: (offsetEdgeType | clampEdgeType | alongEdgeType)[]

    /** 引用预设样式，非解析参数 */
    presets?: ReturnType<typeof preset>[]

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
    /** 用于按样式特点进行筛选的标签 */
    tags: {
      /** V:竖向 | L:横向 */
      orient?: 'V' | 'L'
      /** R:住宅 | C:商业 | P:公建 */
      use?: 'R' | 'C' | 'P'
    }
    /** 按三段式进行分段。 */
    section: {
      /** 可设置高度但不计入层数 */
      roof?: section & { height?: ns }
      /** 不设置高度，按层高自动计算层数和段高 */
      middle?: section
      /** 设置高度，按中部段高修改高度 */
      bottom: section & { height: ns }
    }

    /** 订阅类型，默认须付费 */
    type?: 'FREE'
    /** 附加信息 */
    info?: string
    /** 用于解析 ns 的单位变量 */
    unit?: { [key: string]: number }
  }

  /** 建筑样式 */
  type styles = { [name: string]: style }

  /** 可重复利用的楼层预设样式 */
  type preset<
    U extends { [k: string]: ns },
    C extends { [k: string]: colorType | colorType[] }
  > = {
    /** 预设的样式参数 */
    floor: floor[]
    /** 预设的样式变量 */
    unit: U
    /** 预设的样式颜色 */
    color: C
  }
}
