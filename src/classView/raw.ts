import {
  Matrix4,
  Group,
  Color,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
  Vector2,
  Shape,
  ExtrudeGeometry,
  EdgesGeometry,
  LineSegments,
  BufferGeometry,
  BoxGeometry,
  InstancedMesh,
  Scene,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  BufferAttribute,
} from 'three'
import { presetColors } from '../classStyle/color'
import { basicFaceMaterials, presetFaceMaterials, presetOtherMaterials } from './materials'

import type { temp } from '../types/temp'
import type { magizTypes } from '../types/magizTypes'

export { generateModel }

const boxGeom = new BoxGeometry()
const slopingGeom = getSlopingRoofGeometry()

type SharedRawToInstancedType = {
  /** 计算时公用的临时矩阵 */
  tempMatrix: Matrix4
  /** 公用的经重映射后的最终颜色映射表 */
  finalColorMap: string[]
  /** 根据finalColorMap生成的公用颜色对象 */
  finalColors: { [name: string]: Color }
  /** 模型材质风格参数 */
  greyScale: boolean
}

/** 将 Magiz 解析的 magizTypes.rawBuilding 转为 Three.js 对象 */
function generateModel(
  rawModels: magizTypes.rawData,
  scene: Scene,
  options?: Partial<magizTypes.generateOptions>
) {
  // Group内以Z轴朝上生成，在JS中须切换到Y轴朝上
  const buildings = new Group().rotateX(-Math.PI / 2)
  const rawToInstancedParams: SharedRawToInstancedType = {
    tempMatrix: new Matrix4(),
    finalColorMap: getFinalColorMap(rawModels.colorMap, options?.remap),
    finalColors: {},
    greyScale: options?.greyScale || false,
  }

  const tempResult: temp.rawInstanceDataResult = {
    instanced: {
      box: { color: [], matrix: [] },
      boxGlass: { color: [], matrix: [] },
      sloping: { color: [], matrix: [] },
      slopingGlass: { color: [], matrix: [] },
    },
    instancedEdge: { boxAttribute: [], slopingAttribute: [] },
    extruded: { solid: [], glass: [] },
  }

  // STEP.1.将可序列化的rawModels转为生成所需threeJS数据到 tempResult
  const inplace = options?.inplace ? true : false

  rawModels.models.forEach((rawBuilding) => {
    const restoreParams = inplace
      ? { center: rawBuilding.centerRelative, rotate: rawBuilding.rotate }
      : undefined
    rawToInstancedTemp(rawBuilding.instanced, tempResult, restoreParams, rawToInstancedParams)
    rawToExtrudedTemp(rawBuilding.extruded, tempResult, restoreParams, rawToInstancedParams)
  })

  // STEP.2.根据 tempResult 生成proto体块
  const useMaterials = options?.basicMaterial ? basicFaceMaterials : presetFaceMaterials
  addInstance('box', tempResult.instanced.box, buildings, boxGeom, useMaterials.solid)
  addInstance('boxGlass', tempResult.instanced.boxGlass, buildings, boxGeom, useMaterials.glass)
  addInstance('sloping', tempResult.instanced.sloping, buildings, slopingGeom, useMaterials.roof)
  addInstance(
    'slopingGlass',
    tempResult.instanced.slopingGlass,
    buildings,
    slopingGeom,
    useMaterials.glass
  )
  // STEP.3.根据 tempResult 生成extruded体块
  tempResult.extruded.solid.forEach((data) => {
    addInstance('extrudedSolid', data, buildings, data.geom, useMaterials.solid)
  })
  tempResult.extruded.glass.forEach((data) => {
    addInstance('extrudedGlass', data, buildings, data.geom, useMaterials.glass)
  })

  // STEP.4.根据 tempResult 生成边线
  if (options?.edge) {
    const edgeMat = presetOtherMaterials.edge
    addInstancedEdges(tempResult.instancedEdge.boxAttribute, buildings, boxGeom, edgeMat)
    addInstancedEdges(
      tempResult.instancedEdge.slopingAttribute,
      buildings,
      getSlopingRoofGeometry(),
      edgeMat
    )

    tempResult.extruded.solid.forEach((data) => {
      addInstancedEdges(data.edgeAttr, buildings, data.geom, edgeMat)
    })
    tempResult.extruded.glass.forEach((data) => {
      addInstancedEdges(data.edgeAttr, buildings, data.geom, edgeMat)
    })
  }

  // 添加模型到场景
  buildings.userData.magizType = 'buildings'
  scene.add(buildings)
}

/** 一次生成多个的时候，通过restoreParams还原位置和旋转 */
function getInstanceMatrix(
  m: number[],
  restoreParams: { center: [x: number, y: number]; rotate: number } | undefined,
  tempMatrix: Matrix4
) {
  const matrix = new Matrix4().fromArray(m)
  if (restoreParams) {
    matrix
      .premultiply(tempMatrix.makeRotationZ(restoreParams.rotate))
      .premultiply(tempMatrix.makeTranslation(...restoreParams.center, 0))
  }
  return matrix
}

/** 转换rawBuilding.instanced为threeJS数据到result */
function rawToInstancedTemp(
  raw: magizTypes.rawBuilding['instanced'],
  result: temp.rawInstanceDataResult,
  restoreParams: { center: [x: number, y: number]; rotate: number } | undefined,
  params: SharedRawToInstancedType
) {
  let instanceType: keyof magizTypes.rawBuilding['instanced']
  const { tempMatrix, finalColorMap, finalColors, greyScale } = params
  for (instanceType in raw) {
    const instancedData = raw[instanceType]
    const resultRawData = result.instanced[instanceType]

    instancedData.matrices.forEach((m, i) => {
      const matrix = getInstanceMatrix(m, restoreParams, tempMatrix)
      // 最终作为 InstancedBufferAttribute 绑定到边线模型上
      result.instancedEdge[
        instanceType.includes('box') ? 'boxAttribute' : 'slopingAttribute'
      ].push(...matrix.toArray())
      // 保存矩阵数据
      resultRawData.matrix.push(matrix)
      // 保存颜色数据
      if (!greyScale) {
        const c = finalColorMap[instancedData.colors[i] || 0]
        if (c) {
          let color = finalColors[c]
          if (!color) {
            color = new Color(c)
            finalColors[c] = color
          }
          resultRawData.color.push(color)
        }
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
  const { tempMatrix, finalColorMap, finalColors, greyScale } = params
  let key: keyof typeof raw
  for (key in raw) {
    raw[key].forEach((extrudedInstancedData) => {
      const shape = new Shape(extrudedInstancedData.loop.map((pt) => new Vector2(...pt)))
      const geom = new ExtrudeGeometry(shape, extrudeParams)
      const resultRawData: temp.rawExtrudedData = { geom, edgeAttr: [], matrix: [], color: [] }
      extrudedInstancedData.matrices.forEach((matrixArray, i) => {
        const matrix = getInstanceMatrix(matrixArray, restoreParams, tempMatrix)
        // 最终作为 InstancedBufferAttribute 绑定到边线模型上
        resultRawData.edgeAttr.push(...matrixArray)
        // 保存矩阵数据
        resultRawData.matrix.push(matrix)
        // 保存颜色数据
        if (!greyScale) {
          const c = finalColorMap[extrudedInstancedData.colors[i] || 0]
          if (c) {
            let color = finalColors[c]
            if (!color) {
              color = new Color(c)
              finalColors[c] = color
            }
            resultRawData.color.push(color)
          }
        }
      })
      result.extruded[key].push(resultRawData)
    })
  }
}

function getFinalColorMap(
  colorMap: magizTypes.rawData['colorMap'],
  remap: magizTypes.presetColor | undefined
) {
  // 获取 finalRemap
  const finalRemap: { from: string; to: string }[] = []
  if (remap) {
    let k: keyof magizTypes.presetColor['face']
    for (k in remap.face) {
      const c = remap.face[k]
      if (c) finalRemap.push({ from: presetColors.face[k], to: c })
    }
    if (remap.custom) remap.custom.forEach((r) => finalRemap.push(r))
  }
  return colorMap.map((x) => finalRemap.find((r) => r.from === x)?.to || x)
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
    building.add(ls)
  }
}

/** 添加 instancedMesh 到场景，设置其matrix和color */
function addInstance(
  type: string,
  data: temp.rawInstanceData,
  buildings: Group,
  geom: BufferGeometry,
  mat: MeshBasicMaterial | MeshLambertMaterial | MeshStandardMaterial
) {
  const iMesh = new InstancedMesh(geom, mat, data.matrix.length)
  data.matrix.forEach((m, n) => {
    iMesh.setMatrixAt(n, m)
    const c = data.color[n]
    if (c) iMesh.setColorAt(n, c)
  })
  iMesh.castShadow = iMesh.receiveShadow = true
  iMesh.userData.magizType = type
  buildings.add(iMesh)
}

/** 生成尺寸为 1x1x1 ，最小点为原点，顶部缩进 indentRatio 的坡屋顶 */
function getSlopingRoofGeometry(indentRatio: number = 0.2) {
  const geometry = new BufferGeometry()
  const p1 = [indentRatio, 0.5, 1]
  const p2 = [1 - indentRatio, 0.5, 1]
  const c1 = [0, 0, 0]
  const c2 = [1, 0, 0]
  const c3 = [1, 1, 0]
  const c4 = [0, 1, 0]
  const vertices = new Float32Array([
    ...c2,
    ...p1,
    ...c1,
    ...c2,
    ...p2,
    ...p1,
    ...c4,
    ...p2,
    ...c3,
    ...c4,
    ...p1,
    ...p2,
    ...c1,
    ...p1,
    ...c4,
    ...c3,
    ...p2,
    ...c2,
  ])

  return geometry.setAttribute('position', new BufferAttribute(vertices, 3))
}

/** 将平面点转为高度为1的 ExtrudeGeometry */
// function toExtrudedGeometry(v2Points: Vector2[][]) {
//   const shape = new Shape(v2Points[0])
//   for (let i = 1; i < v2Points.length; i++) {
//     shape.holes.push(new Path(v2Points[i]))
//   }
//   return new ExtrudeGeometry(shape, { bevelEnabled: false })
// }
