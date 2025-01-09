import {
  Matrix4,
  Group,
  Color,
  Material,
  LineBasicMaterial,
  Vector2,
  Shape,
  ExtrudeGeometry,
  EdgesGeometry,
  LineSegments,
  BufferGeometry,
  BoxGeometry,
  InstancedMesh,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  BufferAttribute,
} from 'three'

import { basicFaceMaterials, presetFaceMaterials, presetOtherMaterials } from './materials'
import { COLOR } from '../../../color'

import type { temp } from '../../../types/temp'
import type { magizTypes } from '../../../types/magizTypes'

export { generate }

type SharedRawToInstancedType = {
  /** 计算时公用的临时矩阵 */
  tempMatrix: Matrix4
  /** 经重映射后的最终颜色映射表 */
  finalColors: string[]
  /** 模型材质风格参数 */
  greyScale: boolean
}

const boxGeom = new BoxGeometry()
const slopeGeom: { '2'?: BufferGeometry; '4'?: BufferGeometry } = {}

/** 坡屋顶的原型仅在使用时才缓存并加载 */
function getSlopeGeom(type: '2' | '4') {
  let g = slopeGeom[type]
  if (!g) {
    g = type === '2' ? getSlope2() : getSlope4()
    slopeGeom[type] = g
  }
  return g
}

/** 将 magizTypes.rawBuilding 数据转为 Three.js 模型 */
function generate(raw: magizTypes.rawBuilding, params?: Partial<magizTypes.generateOptions>) {
  /** 缓存生成的过程数据 */
  const tempResult: temp.rawInstanceDataResult = {
    instanced: {
      box: { color: [], matrix: [] },
      boxGlass: { color: [], matrix: [] },
      slope2: { color: [], matrix: [] },
      slope2Glass: { color: [], matrix: [] },
      slope4: { color: [], matrix: [] },
      slope4Glass: { color: [], matrix: [] },
    },
    instancedEdge: { boxAttribute: [], slope2Attribute: [], slope4Attribute: [] },
    extruded: { solid: [], glass: [] },
  }

  // Group内以Z轴朝上生成，在世界中须切换到Y轴朝上
  const model = new Group().rotateX(-Math.PI / 2)

  // STEP.1.将可序列化的rawModels转为生成所需threeJS数据到 tempResult
  const rawToInstancedParams: SharedRawToInstancedType = {
    tempMatrix: new Matrix4(),
    finalColors: getRemappedColors(raw.colors, params?.remap),
    greyScale: params?.greyScale || false,
  }
  const tr = params?.inplace ? { center: raw.centerRelative, rotate: raw.rotate } : undefined
  rawToInstancedTemp(raw.instanced, tempResult, tr, rawToInstancedParams)
  rawToExtrudedTemp(raw.extruded, tempResult, tr, rawToInstancedParams)

  // STEP.2.根据 tempResult 生成proto体块
  function addInstanceByKey(
    key: keyof temp.rawInstanceDataResult['instanced'],
    geom: BufferGeometry,
    mat: Material
  ) {
    addInstance(key, tempResult.instanced[key], model, geom, mat)
  }

  const useMaterials = params?.basicMaterial ? basicFaceMaterials : presetFaceMaterials
  addInstanceByKey('box', boxGeom, useMaterials.solid)
  addInstanceByKey('boxGlass', boxGeom, useMaterials.glass)
  addInstanceByKey('slope2', getSlopeGeom('2'), useMaterials.roof)
  addInstanceByKey('slope4', getSlopeGeom('4'), useMaterials.roof)
  addInstanceByKey('slope2Glass', getSlopeGeom('2'), useMaterials.glass)
  addInstanceByKey('slope4Glass', getSlopeGeom('4'), useMaterials.glass)

  // STEP.3.根据 tempResult 生成extruded体块
  tempResult.extruded.solid.forEach((data) => {
    addInstance('extrudedSolid', data, model, data.geom, useMaterials.solid)
  })
  tempResult.extruded.glass.forEach((data) => {
    addInstance('extrudedGlass', data, model, data.geom, useMaterials.glass)
  })

  // STEP.4.根据 tempResult 生成边线
  if (params?.edge) {
    const edgeMat = presetOtherMaterials.edge
    addInstancedEdges(tempResult.instancedEdge.boxAttribute, model, boxGeom, edgeMat)
    addInstancedEdges(tempResult.instancedEdge.slope2Attribute, model, getSlopeGeom('2'), edgeMat)
    addInstancedEdges(tempResult.instancedEdge.slope4Attribute, model, getSlopeGeom('4'), edgeMat)

    tempResult.extruded.solid.forEach((data) => {
      addInstancedEdges(data.edgeAttr, model, data.geom, edgeMat)
    })
    tempResult.extruded.glass.forEach((data) => {
      addInstancedEdges(data.edgeAttr, model, data.geom, edgeMat)
    })
  }

  // 添加模型到场景
  model.userData.magizType = 'building'
  return model
}

/** 一次生成多个的时候，通过restoreParams还原位置和旋转 */
function getInstanceMatrix(
  m: number[],
  transRelative: { center: [x: number, y: number]; rotate: number } | undefined,
  tempMatrix: Matrix4
) {
  const matrix = new Matrix4().fromArray(m)
  if (transRelative) {
    matrix
      .premultiply(tempMatrix.makeRotationZ(transRelative.rotate))
      .premultiply(tempMatrix.makeTranslation(...transRelative.center, 0))
  }
  return matrix
}

/** 转换rawBuilding.instanced为threeJS数据到result */
function rawToInstancedTemp(
  raw: magizTypes.rawBuilding['instanced'],
  result: temp.rawInstanceDataResult,
  transRelative: { center: [x: number, y: number]; rotate: number } | undefined,
  params: SharedRawToInstancedType
) {
  let instanceType: keyof magizTypes.rawBuilding['instanced']
  const { tempMatrix, finalColors, greyScale } = params
  for (instanceType in raw) {
    const instancedData = raw[instanceType]
    const resultRawData = result.instanced[instanceType]

    instancedData.matrices.forEach((m, i) => {
      const matrix = getInstanceMatrix(m, transRelative, tempMatrix)
      // 最终作为 InstancedBufferAttribute 绑定到边线模型上
      result.instancedEdge[
        instanceType.includes('box')
          ? 'boxAttribute'
          : instanceType.includes('slope2')
          ? 'slope2Attribute'
          : 'slope4Attribute'
      ].push(...matrix.toArray())
      // 保存矩阵数据
      resultRawData.matrix.push(matrix)
      // 保存颜色数据
      if (!greyScale) {
        const c = finalColors[instancedData.colors[i] || 0]
        if (c) resultRawData.color.push(new Color(c))
      }
    })
  }
}

const extrudeParams = { depth: 1, bevelEnabled: false }

function rawToExtrudedTemp(
  raw: magizTypes.rawBuilding['extruded'],
  result: temp.rawInstanceDataResult,
  restoreParams: { center: [x: number, y: number]; rotate: number } | undefined,
  params: SharedRawToInstancedType
) {
  const { tempMatrix, finalColors, greyScale } = params
  let key: keyof typeof raw
  for (key in raw) {
    raw[key].forEach((extrudedInstancedData) => {
      const shape = new Shape(extrudedInstancedData.loop.map((pt) => new Vector2(...pt)))
      const geom = new ExtrudeGeometry(shape, extrudeParams)
      const resultRawData: temp.rawExtrudedData = { geom, edgeAttr: [], matrix: [], color: [] }
      extrudedInstancedData.matrices.forEach((matrixArray, i) => {
        const matrix = getInstanceMatrix(matrixArray, restoreParams, tempMatrix)
        // 最终作为 InstancedBufferAttribute 绑定到边线模型上
        resultRawData.edgeAttr.push(...matrix.toArray())
        // 保存矩阵数据
        resultRawData.matrix.push(matrix)
        // 保存颜色数据
        if (!greyScale) {
          const c = finalColors[extrudedInstancedData.colors[i] || 0]
          if (c) resultRawData.color.push(new Color(c))
        }
      })
      result.extruded[key].push(resultRawData)
    })
  }
}

function getRemappedColors(
  colors: magizTypes.rawData['colorMap'],
  remap: magizTypes.remapColorType | undefined
) {
  // 获取 finalRemap
  const finalRemap: { from: string; to: string }[] = []
  if (remap) {
    let k: keyof typeof COLOR
    if (remap.face) {
      for (k in remap.face) {
        const c = remap.face[k]
        if (c) finalRemap.push({ from: COLOR[k], to: c })
      }
    }
    if (remap.custom) remap.custom.forEach((r) => finalRemap.push(r))
  }
  return colors.map((x) => finalRemap.find((r) => r.from === x)?.to || x)
}

function addInstancedEdges(
  matrixAttribute: number[],
  building: Group,
  geom: BufferGeometry,
  edgeShaderMaterial: LineBasicMaterial
) {
  if (matrixAttribute.length > 0) {
    const eg = new EdgesGeometry(geom)
    const eibg = new InstancedBufferGeometry()
    const ls = new LineSegments(eibg, edgeShaderMaterial)
    eibg.setAttribute('position', eg.getAttribute('position'))
    eibg.setAttribute(
      'matrix',
      new InstancedBufferAttribute(new Float32Array(matrixAttribute), 16)
    )
    eibg.instanceCount = matrixAttribute.length / 16
    eg.dispose()
    ls.frustumCulled = false
    ls.renderOrder = 9
    building.add(ls)
  }
}

/** 添加 instancedMesh 到场景，设置其matrix和color */
function addInstance(
  type: string,
  data: temp.rawInstanceData,
  group: Group,
  geom: BufferGeometry,
  mat: Material
) {
  if (data.matrix.length > 0) {
    const iMesh = new InstancedMesh(geom, mat, data.matrix.length)
    data.matrix.forEach((m, n) => {
      iMesh.setMatrixAt(n, m)
      const c = data.color[n]
      if (c) iMesh.setColorAt(n, c)
    })
    iMesh.castShadow = iMesh.receiveShadow = true
    iMesh.userData.magizType = type

    group.add(iMesh)
  }
}

/** 生成尺寸为 1x1x1，最小点为原点，顶部缩进 indentRatio 的四坡顶 */
function getSlope4(indentRatio: number = 0.2) {
  const geometry = new BufferGeometry()
  const t1 = [indentRatio, 0.5, 1]
  const t2 = [1 - indentRatio, 0.5, 1]
  const r1 = [0, 0, 0]
  const r2 = [1, 0, 0]
  const r3 = [1, 1, 0]
  const r4 = [0, 1, 0]
  const vertices = new Float32Array([
    ...r2,
    ...t1,
    ...r1,
    ...r2,
    ...t2,
    ...t1,
    ...r4,
    ...t2,
    ...r3,
    ...r4,
    ...t1,
    ...t2,
    ...r1,
    ...t1,
    ...r4,
    ...r3,
    ...t2,
    ...r2,
  ])
  return geometry.setAttribute('position', new BufferAttribute(vertices, 3))
}

/** 生成尺寸为 1x1x1，山墙一角为原点的双坡顶 */
function getSlope2() {
  /** 按1x1x1出檐 */
  const geometry = new BufferGeometry()
  const t1 = [0, 0.5, 1]
  const t2 = [1, 0.5, 1]
  const r1 = [0, 0, 0]
  const r2 = [1, 0, 0]
  const r3 = [1, 1, 0]
  const r4 = [0, 1, 0]
  const vertices = new Float32Array([
    ...r2,
    ...t1,
    ...r1,
    ...r2,
    ...t2,
    ...t1,
    ...r4,
    ...t2,
    ...r3,
    ...r4,
    ...t1,
    ...t2,
  ])

  return geometry.setAttribute('position', new BufferAttribute(vertices, 3))
}

/** 将带孔洞的平面点转为高度为1的 ExtrudeGeometry */
// function toExtrudedGeometry(v2Points: Vector2[][]) {
//   const shape = new Shape(v2Points[0])
//   for (let i = 1; i < v2Points.length; i++) {
//     shape.holes.push(new Path(v2Points[i]))
//   }
//   return new ExtrudeGeometry(shape, { bevelEnabled: false })
// }
