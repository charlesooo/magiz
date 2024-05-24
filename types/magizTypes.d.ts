/** @hidden 边线整体缩放或偏移 */
declare type scaleOrOffsetParams = {
  scale: { x: number; y: number } | undefined
  offset: { x: number; y: number } | undefined
}

/** web3D初始化和默认的参数类型 */
type web3DOptionsType = {
  /** 相机焦点坐标 */
  cameraLookAt: [x: number, y: number, z: number]
  /** 相机位置坐标 */
  cameraPosition: [x: number, y: number, z: number]
  /** 光影相关参数，每一项指定某一时间点直射光和环境光的颜色与强度 */
  lightColor: {
    hour: number
    color: string
    ambient: number
    directional: number
  }[]
  /** 太阳到原点的距离，用于计算直射光的起点坐标 */
  sunDistance: number
  /** 通过时间设置光影 */
  time: number
}

type web3DRefreshOptionsType = {
  /** 生成白模 */
  grayScale: boolean
  /** 生成边线 */
  showEdge: boolean
  /** 模型按原位生成 */
  inplace: boolean
}

/** 从平面生成建筑模型的参数 */
declare type styleParamsType = {
  /** 指定样式名称 */
  style: string
  /** 建筑高度 */
  height: number
  /** 建筑层高 */
  floorHeight: number
  /** 底标高 */
  elevation: number
  /** 随机数种子，0表示使用随机值 */
  seed: number
}

/** @hidden 经过分类后的样式名称 */
declare type styleOptionsType = {
  /** 付费样式，须订阅 */
  paid: string[]
  /** 免费样式，始终可用 */
  free: string[]
}

/** 请求解析样式所需的参数，须注意多边形坐标的不能首尾重复 */
declare type parseRequestType = {
  /** 建筑生成参数 */
  params: styleParamsType
  /** 平面可以是任意多边形，之后将长边对齐X轴并平移到原点，并用矩形拟合 */
  loops: [x: number, y: number][][]
  /** 平面也可以直接指定矩形组合，之后将长边对齐X轴并平移到原点 */
  rects?: [x: number, y: number][][]
}

/** 基于Three.js中 instancedMesh 相同的数据结构，一种颜色对应多个实例的矩阵 */
declare type instancedDataType = {
  /** 由16位矩阵构成的数组 */
  matrices: number[][]
  /** 颜色索引，对应 rawDataType.colorMap 中的序号（从数组选中一个序号，如包含了多个表示随机颜色） */
  colors: number[]
}

/** 从平面生成模型的全部数据 */
declare type rawDataType = {
  /** 建筑生成参数 */
  params: styleParamsType
  /** 建筑模型的经济技术指标 (建筑高度保存在 params) */
  info: {
    /** 建筑面积 */
    floorArea: number
    /** 建筑层数 */
    floors: number
  }

  /** 将中心重置到原点并将长边对齐X轴后的平面坐标点 */
  points: [x: number, y: number][][]

  /** 还原模型时原平面中心点坐标 */
  center: [x: number, y: number]
  /** 还原模型时绕Z轴旋转的弧度 */
  rotate: number

  /** 模型所用到的全部颜色值，用于索引和统一管理 */
  colorMap: string[]

  /** instancedMesh元素的颜色和矩阵数据 */
  data: {
    box: instancedDataType
    boxGlass: instancedDataType
    sloping: instancedDataType
    slopingGlass: instancedDataType
  }
}
