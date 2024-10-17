import {
  Matrix4,
  Group,
  Color,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
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
import { presetFaceColors } from '../styleClass/styles'
import { presetFaceMaterials, presetLineMaterials } from './materials'

import type { temp } from '../types/temp'
import type { magizTypes } from '../types/magizTypes'

export { generateModel }

const boxGeom = new BoxGeometry()
const slopingGeom = getSlopingRoofGeometry()

/** 将 Magiz 解析的 magizTypes.rawBuilding 转为 Three.js 对象 */
function generateModel(
  rawModels: magizTypes.rawData,
  scene: Scene,
  options?: Partial<magizTypes.generateOptions>
) {
  // Group内以Z轴朝上生成，在JS中须切换到Y轴朝上
  const buildings = new Group().rotateX(-Math.PI / 2)
  const showEdge = options?.edge ? true : false
  const greyScale = options?.greyScale ? true : false
  const inplace = options?.inplace ? true : false
  const finalColorMap = getFinalColorMap(rawModels.colorMap, options?.remap)
  const colors: { [name: string]: Color } = {}
  const tempMatrix = new Matrix4()
  const result: temp.rawInstanceDataResult = {
    instance: {
      box: { color: [], matrix: [] },
      boxGlass: { color: [], matrix: [] },
      sloping: { color: [], matrix: [] },
      slopingGlass: { color: [], matrix: [] },
    },
    edge: { boxMatrix: [], slopingMatrix: [] },
  }

  // 模型元素类型
  let instanceType: keyof magizTypes.rawBuilding['data']

  // 整合输入的rawBuilding到 result
  rawModels.models.forEach((rawBuilding) => {
    const restoreParams = inplace
      ? { center: rawBuilding.centerRelative, rotate: rawBuilding.rotate }
      : undefined
    for (instanceType in rawBuilding.data) {
      const inputData = rawBuilding.data[instanceType]
      const saveAs = result.instance[instanceType]

      inputData.matrices.forEach((m, i) => {
        const matrix = new Matrix4().fromArray(m)

        // 还原位置和旋转
        if (restoreParams) {
          matrix
            .premultiply(tempMatrix.makeRotationZ(restoreParams.rotate))
            .premultiply(tempMatrix.makeTranslation(...restoreParams.center, 0))
        }

        // 默认生成边线，根据参数设置visible属性
        result.edge[instanceType.includes('box') ? 'boxMatrix' : 'slopingMatrix'].push(
          ...matrix.toArray()
        )

        // 保存矩阵数据
        saveAs.matrix.push(matrix)

        let c = finalColorMap[inputData.colors[i]!]!
        if (!greyScale) {
          let color = colors[c]
          if (!color) {
            color = new Color(c)
            colors[c] = color
          }
          saveAs.color.push(color)
        }
      })
    }
  })

  // 根据 result 生成体块
  addInstanceData(buildings, result.instance.box, boxGeom, presetFaceMaterials.solid)
  addInstanceData(buildings, result.instance.boxGlass, boxGeom, presetFaceMaterials.glass)
  addInstanceData(buildings, result.instance.sloping, slopingGeom, presetFaceMaterials.roof)
  addInstanceData(buildings, result.instance.slopingGlass, slopingGeom, presetFaceMaterials.glass)

  // 根据 result 生成边线
  const { boxMatrix, slopingMatrix } = result.edge
  if (boxMatrix.length > 0) {
    const ils = getInstancedLineSegments(getEdgeIBG(boxGeom), boxMatrix, presetLineMaterials.edge)
    ils.visible = showEdge
    buildings.add(ils)
  }
  if (slopingMatrix.length > 0) {
    const ils = getInstancedLineSegments(
      getEdgeIBG(getSlopingRoofGeometry()),
      slopingMatrix,
      presetLineMaterials.edge
    )
    ils.visible = showEdge
    buildings.add(ils)
  }

  // 添加模型到场景
  buildings.name = 'buildings'
  scene.add(buildings)
}

function getFinalColorMap(
  colorMap: magizTypes.rawData['colorMap'],
  remap: magizTypes.remapColor | undefined
) {
  // 获取remap
  const finalRemap: { from: string; to: string }[] = []
  if (remap) {
    let ks = Object.keys(remap.face) as (keyof typeof remap.face)[]
    ks.forEach((k) => {
      const c = remap.face[k]
      if (c) finalRemap.push({ from: presetFaceColors[k], to: c })
    })
    if (remap.custom) remap.custom.forEach((r) => finalRemap.push(r))
  }
  return colorMap.map((x) => finalRemap.find((r) => r.from === x)?.to || x)
}

/** 初始化用于渲染边线的 InstancedBufferGeometry */
function getEdgeIBG(geom: BufferGeometry) {
  const eg = new EdgesGeometry(geom)
  const eibg = new InstancedBufferGeometry()
  eibg.setAttribute('position', eg.getAttribute('position'))
  eg.dispose()
  return eibg
}

function getInstancedLineSegments(
  ibg: InstancedBufferGeometry,
  matrixData: number[],
  edgeShaderMaterial: LineBasicMaterial
) {
  ibg.setAttribute('matrix', new InstancedBufferAttribute(new Float32Array(matrixData), 16))
  ibg.instanceCount = matrixData.length / 16
  const ls = new LineSegments(ibg, edgeShaderMaterial)
  ls.frustumCulled = false
  return ls
}

/** 设置instancedMesh的matrix与color */
function addInstanceData(
  buildings: Group,
  data: temp.rawInstanceData,
  geom: BufferGeometry,
  mat: MeshLambertMaterial | MeshStandardMaterial
) {
  if (data.matrix.length > 0) {
    const i = new InstancedMesh(geom, mat, data.matrix.length)
    data.matrix.forEach((m, n) => {
      i.setMatrixAt(n, m)
      const c = data.color[n]
      if (c) i.setColorAt(n, c)
    })
    i.castShadow = i.receiveShadow = true
    buildings.add(i)
  }
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
