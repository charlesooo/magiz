import { MeshLambertMaterial, MeshStandardMaterial, LineBasicMaterial } from 'three'
import type { styleTypes } from './style'

export namespace magizTypes {
  /** 预设的玻璃颜色 */
  type presetGlassType = '_GLASS'
  /** 预设的表皮颜色 */
  type presetFaceType = '_CONCRETE' | '_METAL' | '_WOOD' | '_BRICK' | '_ROOF'
  /** 预设的其他颜色 */
  type presetOtherColorType = 'GROUND' | 'EDGE' | 'SKY'

  type remapColor = {
    face: { [prop in presetFaceType | presetGlassType]: string }
    other: { [prop in presetOtherColorType]: string }
    // 其他自定义的face映射
    custom?: { from: string; to: string }[]
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
    /** 模型按原位生成 */
    inplace: boolean
    /** 是否使用无光照效果的基本材质 */
    basicMaterial: boolean
    /** 颜色重映射 */
    remap: remapColor
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
    /** 重置后的平面中心点坐标，生成多个时可能不在原点 */
    centerRelative: [x: number, y: number]
    /** 还原模型时绕Z轴旋转的弧度 */
    rotate: number

    /** instancedMesh元素的颜色和矩阵数据 */
    data: {
      box: instancedData
      boxGlass: instancedData
      sloping: instancedData
      slopingGlass: instancedData
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
    data: requestData[]
    /** 显示单个 requestData，为 data 中的序号 */
    focus: number
  }

  /** 请求解析样式所需的参数，须注意多边形坐标的不能首尾重复 */
  type requestData = {
    /** 建筑生成参数 */
    params: styleParams
    /** 平面可以是任意多边形，之后将长边对齐X轴并平移到原点，并用矩形拟合 */
    loops: [x: number, y: number][][]
    /** 带有自定义样式的按自定义样式，反之按默认样式 */
    customStyles?: styleTypes.styles
    /** 用于显示的ID */
    id?: string
    /** 用于显示的附加信息 */
    info?: any
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
