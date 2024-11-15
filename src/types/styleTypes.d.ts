import { preset } from '../class/styles/utils'
import type { magizTypes } from './magizTypes'

export namespace styleTypes {
  /** 参数可以是数字或代表公式的字符串 */
  type ns = number | string
  type colorType = magizTypes.presetFaceType | magizTypes.presetGlassType | string
  type alongType = 'WIDTH' | 'DEPTH' | 'RANDOM' | 'LONGEST' | 'SHORTEST' | number

  /** 将元素变形拆解为基本项目。例如按X轴旋转和按Y轴旋转，前后组合的不同，变形的结果也不同 */
  type transformType =
    | { rotateX: ns }
    | { rotateY: ns }
    | { rotateZ: ns }
    | { moveX?: ns; moveY?: ns; moveZ?: ns }

  /** 从两端向内缩进并生成范围 */
  type indentType = {
    /** 从起点缩进一定距离 */
    start?: ns
    /** 从终点缩进一定距离 */
    end?: ns
    /** 改为从中点向star和end偏移 */
    fromCenter?: boolean
    /** 按比例，默认按距离 */
    asRatio?: boolean
    /** 反向操作，可能生成一或二段范围 */
    reverse?: boolean
  }

  /** 对边线进行修正 */
  type handleEdge = {
    /** 偏移边线 */
    offset?: ns | { x: ns; y: ns; asRatio?: boolean }
    /** 按朝向生成或角度，默认along=0 (世界坐标X轴) */
    along?: 'WIDTH' | 'DEPTH' | 'RANDOM' | 'LONGEST' | 'SHORTEST' | number
    /** 按boundingBox裁剪边线 */
    clamp?: clampType
    /** 每条边线向内缩进 */
    indent?: indentType
  }

  type clampType = {
    /** 沿X轴坐标最小的边向内偏移 */
    startX?: ns
    /** 沿X轴坐标最大的边向内偏移  */
    endX?: ns
    /** 沿Y轴坐标最小的边向内偏移  */
    startY?: ns
    /** 沿Y轴坐标最大的边向内偏移  */
    endY?: ns
    /** 按比例，默认按距离 */
    asRatio?: boolean
    /** 反向操作，可能生成二或四段范围 */
    reverse?: boolean
  }

  /** 楼层、拟合和立面元素阵列时根据序号控制生成 */
  type indexController = {
    /** 指定从0开始的序号总数 */
    total?: ns
    /** 按序号缩进 */
    indent?: indentType
    /** 跳过一定序号间隔生成 */
    skip?: ns
    /** 按一定序号间隔生成 */
    every?: ns
    /** 按概率生成 */
    chance?: ns
  }

  /** 所有体块的基本状态参数 */
  type status = {
    /** 定义材质的颜色值，以"G"结尾表示玻璃（默认为实墙），如: '#ff0000 G' 或 'G'。也可以用数组表示随机颜色。 */
    color?: colorType | colorType[]
    /** 不同顺序的旋转和移动组合产生不同的变换效果 */
    trans?: transformType[]
  }

  /** 组成构件的 box 元素 */
  type box = status & {
    /** 沿边线的宽度，正负值相同，可添加到末尾宽度 */
    widthX: ns
    /** 垂直边线的进深，正负值相同 */
    depthY: ns
    /** 竖向高度，负值表示朝下 */
    heightZ: ns
  }

  /** 灵活线性元素，根据 unitHeight 拟合分段，合并未被replace的段落 */
  type flexVertical = status & {
    /** 基准段高 */
    unitHeight: ns
    /** 总高度 */
    totalHeight: ns
    /** 进深 */
    flexDepth: ns
    /** 开间 */
    flexwidth: ns
    /** 按序号控制生成 */
    dash: indexController
  }

  /** 沿边线阵列的立面基本单元 */
  type edgeUnit = {
    /** 该单元的间距，无 boxes 表示占位 */
    space: ns

    /** 该单元在阵列点处生成的元素 */
    boxes?: (box | flexVertical)[]
    /** 按概率替换该单元的元素 */
    replace?: { chance: ns; with?: (box | flexVertical)[] }
    /** 该单元的数量，默认为1，用于减少重复输入 */
    count?: ns
  }

  /** 拟合平面的基本单元，按平面计算最终的 width */
  type matchUnit = status & {
    /** 拟合的基准进深 */
    unitDepth: ns
    /** 垂直高度，负值表示朝下 */
    flexHeight: ns

    /** 最终长度从两端缩进，用于拟合平面时的立面效果 */
    indentWidth?: indentType
    /** 该单元的数量，默认为1，用于减少重复输入 */
    count?: ns
  }

  ////////////////////////// BASIC TYPES ABOVE //////////////////////////

  /** 用box拟合挤出的平面 */
  type extrude = status & {
    /** 挤出的高度，默认的单位：总高 `H`、段高 `SH`、层高 `FH` */
    height: ns

    /** 用box构成围墙，数值为围墙厚度 */
    thickness?: ns
    /** 拟合平面时的基准边线 */
    along?: handleEdge['along']
  }

  type match = {
    /** 由不同间距和构件组成的阵列原型 */
    array: matchUnit[]

    /** 每个序号生成一批 T[]，按序号进行控制  */
    control?: indexController
    /** 默认按生成元素的中心点生成环状阵列，每段的终点不生成。若想形成对称的外观，终点需生成与起点相同的元素 */
    sandwich?: boolean
    /** 沿特点边线阵列 */
    along?: handleEdge['along']
    /** 合并相同计算长度和颜色的box */
    simplify?: boolean
  }

  type edgeArray = {
    /** 由不同间距和构件组成的阵列原型 */
    array: edgeUnit[]

    /** 每个序号生成一批 T[]，按序号进行控制  */
    control?: indexController
    /** 默认时元素中心对齐线段的端点。若要将元素一边对齐起点则要添加元素宽度的一半 */
    endWidth?: ns
    /** 默认环状阵列时每段的终点不生成元素。此参数控制终点是否生成元素，以及是否将endWidth加入终点的计算 */
    sandwich?: boolean
  }

  /** 灵活边线元素，根据 unitWidth 拟合分段，合并未被replace的段落 */
  type flexEdge = status & {
    /** 基准开间 */
    unitWidth: ns
    /** 进深 */
    flexDepth: ns
    /** 高度 */
    flexHeight: ns
    /** 按序号控制生成 */
    dash: indexController
  }

  /** 根据 boundingBox 生成坡屋顶 */
  type slopingRoof = status & {
    /** 双坡或四坡 */
    form: '2' | '4'
    /** 坡屋顶的高度，默认的单位：总高 `H`、段高 `SH`、层高 `FH` */
    height: ns

    /** 檐口出挑距离 */
    overhang?: ns
  }

  /** clamp 缩放后平面而成的 box 元素， */
  type boundingBox = status & {
    /** 挤出的高度，默认的单位：总高 `H`、段高 `SH`、层高 `FH` */
    height: ns
    /** 按边线的 bounding 修正 */
    clamp?: clampType
  }

  /** 附属构件 */
  type appendent = {
    /** 构件的组合原型 */
    boxes: box[]

    /** 放置的位置，位于偏移后的边线或范围内 */
    place?: 'EDGE' | 'AREA'
    /** 自身的数量，默认大于0 */
    count?: ns
  }

  type floor = {
    /** 按楼层序号控制竖向生成 */
    control?: indexController
    /** 修改边线，按组合的顺序操作 */
    edge?: handleEdge[]

    /** 通过函数生成预设样式参数 */
    presets?: ReturnType<typeof preset>[]

    /** 从平面挤出高度 (可按此参数用box拟合平面和高度) */
    extrude?: extrude[]
    /** 用box拟合平面和高度 */
    match?: match[]
    /** 沿边线按间距组合生成立面的 box 阵列 */
    vertical?: edgeArray[]

    /** 沿边线生成灵活线性元素 */
    horizontal?: flexEdge[]

    /** 在平面内生成box组成的构件 */
    appendent?: appendent[]
    /** 按边线 bounding 生成Box元素 */
    boundingBox?: boundingBox[]
    /** 按按边线 bounding 生成坡屋顶 */
    slopingRoof?: slopingRoof[]
  }

  /** 通过 mod.floor = 1 实现单层生成体块，sections只实现在垂直方向上分段，因此没有basic属性 */
  type section = {
    floor?: floor[]
    /** 该段的层高，省略则按解析时输入的标准层高 */
    floorHeight?: ns
  }

  /** 建筑样式 */
  type buildingStyle = {
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
  type styles = { [name: string]: buildingStyle }

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
