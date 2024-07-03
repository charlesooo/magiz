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
import type { temp } from '../types/temp'
import { material, glassMaterial, twoSideMaterial, lineMaterial } from './basicMaterials'

const boxGeom = new BoxGeometry()
const slopingGeom = getSlopingRoofGeometry()

/** 将 Magiz 解析的 rawDataType 转为 Three.js 对象 */
export default function handleRaw(
  input: rawDataType[],
  scene: Scene,
  options?: Partial<web3DRefreshOptionsType>
) {
  // Group内以Z轴朝上生成，在JS中须切换到Y轴朝上
  const buildings = new Group().rotateX(-Math.PI / 2)
  const colors: { [name: string]: Color } = {}
  const showEdge = options?.showEdge || false
  const grayScale = options?.grayScale || false
  const inplace = options?.inplace || false
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
  let instanceType: keyof rawDataType['data']

  // 整合输入的rawData到 result
  input.forEach((rawData) => {
    const restoreParams = inplace ? { center: rawData.center, rotate: rawData.rotate } : undefined
    for (instanceType in rawData.data) {
      const inputData = rawData.data[instanceType]
      const saveAs = result.instance[instanceType]

      inputData.matrices.forEach((m, i) => {
        const matrix = new Matrix4().fromArray(m)

        // 还原位置和旋转
        if (restoreParams) {
          matrix
            .premultiply(tempMatrix.makeRotationZ(restoreParams.rotate))
            .premultiply(tempMatrix.makeTranslation(...restoreParams.center, 0))
        }

        // 保存边线数据
        if (showEdge) {
          result.edge[instanceType.includes('box') ? 'boxMatrix' : 'slopingMatrix'].push(
            ...matrix.toArray()
          )
        }

        // 保存矩阵数据
        saveAs.matrix.push(matrix)

        // 断言是因为样式解析后的颜色索引必然对应
        let c = rawData.colorMap[inputData.colors[i] as number] as string
        if (grayScale) {
          c = rawData.colorMap[c.includes('G') ? 1 : 0] as string
        }
        let color = colors[c]
        if (!color) {
          color = new Color(c.replace(/ *G$/, ''))
          colors[c] = color
        }
        saveAs.color.push(color)
      })
    }
  })

  // 根据 result 生成体块
  addInstanceData(buildings, result.instance.box, boxGeom, material)
  addInstanceData(buildings, result.instance.boxGlass, boxGeom, glassMaterial)
  addInstanceData(buildings, result.instance.sloping, slopingGeom, twoSideMaterial)
  addInstanceData(buildings, result.instance.slopingGlass, slopingGeom, glassMaterial)

  // 根据 result 生成边线
  const { boxMatrix, slopingMatrix } = result.edge
  if (boxMatrix.length > 0) {
    const ibg = getEdgeIBG(boxGeom)
    buildings.add(getInstancedLineSegments(ibg, boxMatrix, lineMaterial))
  }
  if (slopingMatrix.length > 0) {
    const ibg = getEdgeIBG(getSlopingRoofGeometry())
    buildings.add(getInstancedLineSegments(ibg, slopingMatrix, lineMaterial))
  }

  // 添加模型到场景
  buildings.name = 'buildings'
  scene.add(buildings)
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
  material: MeshLambertMaterial | MeshStandardMaterial
) {
  if (data.matrix.length > 0) {
    const i = new InstancedMesh(geom, material, data.matrix.length)
    data.matrix.forEach((m, n) => {
      i.setMatrixAt(n, m)
      i.setColorAt(n, data.color[n] as Color)
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
