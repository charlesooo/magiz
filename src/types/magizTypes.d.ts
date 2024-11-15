import type { styleTypes } from './styleTypes'
import { COLOR, _COLOR } from '../color'

export namespace magizTypes {
  type remapType = {
    face?: { [prop in keyof typeof COLOR]?: string }
    others?: { [prop in keyof typeof _COLOR]?: string }
    custom?: { from: string; to: string }[]
  }

  type displayParams = {
    freeze: boolean
    remap: remapType
    time: number
    materialCN: boolean
    greyScale: boolean
    shadow: boolean
    edge: boolean
  }

  /** view初始化和默认的参数类型 */
  type viewOptions = {
    /** 雾气参数 */
    fog: { near: number; far: number }
    /** 方形地面的宽度 */
    groundSize: number
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
    /** 开关阴影显示 */
    shadow: boolean
  }

  type generateOptions = {
    /** 生成白模 */
    greyScale: boolean
    /** 生成边线 */
    edge: boolean
    /** 是否使用无光照效果的基本材质 */
    basicMaterial: boolean
    /** 颜色重映射 */
    remap: remapType
  }

  type tagsDataType = {
    title: string
    text: string | undefined
    position: [x: number, y: number, z: number]
  }

  /** 经过分类后的样式名称 */
  type styleOptions = {
    /** 付费样式，须订阅 */
    paid: string[]
    /** 免费样式，始终可用 */
    free: string[]
  }

  /** 基于Three.js中 instancedMesh 相同的数据结构，一种颜色对应多个实例的矩阵 */
  type instancedData = {
    /** 由16位矩阵构成的数组 */
    matrices: number[][]
    /** 颜色索引，对应 rawBuilding.colorMap 中的序号（从数组选中一个序号，如包含了多个表示随机颜色） */
    colors: number[]
  }
  /** 生成挤出 instancedMesh 的数据 */
  type extrudedInstancedData = instancedData & { loop: [x: number, y: number][] }

  /** 模型数据 */
  type rawBuilding = {
    /** 建筑生成参数 */
    params: styleParams
    /** 建筑模型的经济技术指标 (建筑高度保存在 params) */
    info: { floorArea: number; floors: number }

    /** 将中心重置到原点并将长边对齐X轴后的平面坐标点 */
    points: [x: number, y: number][][]
    /** 还原模型时原平面中心点坐标 */
    center: [x: number, y: number]
    /** 生成多个时原点为全部平面的中心点，此为该平面的相对中心点坐标 */
    centerRelative: [x: number, y: number]
    /** 还原模型时绕Z轴旋转的弧度 */
    rotate: number

    /** instancedMesh元素的颜色和矩阵数据 */
    instanced: {
      box: instancedData
      boxGlass: instancedData
      slope2: instancedData
      slope2Glass: instancedData
      slope4: instancedData
      slope4Glass: instancedData
    }
    extruded: {
      solid: extrudedInstancedData[]
      glass: extrudedInstancedData[]
    }
  }

  /** 从平面生成模型的全部数据 */
  type rawData = {
    /** 模型所用到的全部颜色值，用于索引和统一管理 */
    colorMap: string[]
    /** 模型数据 */
    models: rawBuilding[]
  }

  ////////////////////////// request /////////////////////////

  /** 解析请求 */
  type request = {
    /** 成组的解析请求 */
    requests: requestData[]
    /** 显示单个 requestData，为 data 中的序号 */
    focus?: number
  }

  /** 请求解析样式所需的参数，须注意多边形坐标的不能首尾重复 */
  type requestData = {
    /** 建筑生成参数 */
    params: styleParams
    /** 平面可以是任意多边形，之后将长边对齐X轴并平移到原点，并用矩形拟合 */
    loops: [x: number, y: number][][]
    /** 带有自定义样式的按自定义样式，反之按默认样式 */
    customStyles?: styleTypes.styles
  }

  /** 从平面生成建筑模型的参数。(内部参数不能省略!) */
  type styleParams = {
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
    /** 平面拟合的宽度，为0则不进行拟合 */
    match: number
  }
}
