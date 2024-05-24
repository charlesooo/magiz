import {
  DoubleSide,
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
  ShaderMaterial,
  WebGLRenderer,
  InstancedBufferGeometry,
  InstancedBufferAttribute,
  BufferAttribute,
  WebGLProgramParametersWithUniforms,
} from 'three'

export { handleRaw, glassMaterial }

const glassParams = {
  side: DoubleSide,
  opacity: 0.6,
  transparent: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetUnits: 1,
  polygonOffsetFactor: 0.1,
}

const boxGeom = new BoxGeometry()
const material = new MeshLambertMaterial()
const glassMaterial = new MeshStandardMaterial(glassParams)
const twoSideMaterial = new MeshLambertMaterial({ side: 2 })
const lineMaterial = new LineBasicMaterial({ color: '#333' })

/** 将 Magiz 解析的 rawDataType 转为 Three.js 对象 */
function handleRaw(input: rawDataType, scene: Scene, options?: Partial<web3DRefreshOptionsType>) {
  // Group内以Z轴朝上生成，在JS中须切换到Y轴朝上
  const building = new Group().rotateX(-Math.PI / 2)
  const colors: [name: string, color: Color][] = []

  // 白模风格
  if (options?.grayScale) {
    // 必然包含两个默认的材质颜色值
    const c = [0, 1].map((i) => {
      const c = input.colorMap[i] as string
      return new Color(c.split(/ +/)[0])
    }) as [Color, Color]
    input.colorMap.forEach((x) => colors.push([x, x.includes('G') ? c[1] : c[0]]))
  } else {
    input.colorMap.forEach((x) => colors.push([x, new Color(x.split(/ +/)[0])]))
  }

  // 生成模型元素
  let instanceType: keyof rawDataType['data']
  const showEdge = options?.showEdge || false
  const grayScale = options?.grayScale || false
  const tempMatrix = new Matrix4()
  const restoreParams = options?.inplace
    ? {
        center: input.center,
        rotate: input.rotate,
      }
    : undefined

  for (instanceType in input.data) {
    const g = instanceType.includes('box') ? boxGeom : getSlopingRoofGeometry()
    const m = instanceType.includes('Glass')
      ? glassMaterial
      : instanceType.includes('box')
      ? material
      : twoSideMaterial

    addInstance(
      building,
      input.data[instanceType],
      colors,
      g,
      m,
      grayScale,
      showEdge,
      tempMatrix,
      restoreParams
    )
  }

  scene.add(building)
}

/** 设置instancedMesh的matrix与color */
function addInstance(
  building: Group,
  data: instancedDataType,
  colors: [name: string, color: Color][],
  geom: BufferGeometry,
  material: MeshLambertMaterial | MeshStandardMaterial,
  grayScale: boolean,
  showEdge: boolean,
  tempMatrix: Matrix4,
  /** 还原模型到原坐标和旋转角度 */
  restoreParams?: {
    center: [x: number, y: number]
    rotate: number
  }
) {
  const matrix = new Matrix4()
  const count = data.matrices.length
  const instance = new InstancedMesh(geom, material, count)
  const edgeMatrixes: number[] = []

  data.matrices.forEach((m, i) => {
    matrix.fromArray(m)

    // 还原位置和旋转
    if (restoreParams) {
      matrix
        .premultiply(tempMatrix.makeRotationZ(restoreParams.rotate))
        .premultiply(tempMatrix.makeTranslation(...restoreParams.center, 0))
    }

    if (!grayScale) {
      // 样式解析后的颜色索引必然对应
      const c = colors[data.colors[i] as number] as [name: string, color: Color]
      instance.setColorAt(i, c[1])
    }
    instance.setMatrixAt(i, matrix)

    // if (showEdge) {
    //   const eg = new EdgesGeometry(geom).applyMatrix4(matrix)
    //   building.add(new LineSegments(eg, lineMaterial))
    // }

    if (showEdge) {
      edgeMatrixes.push(...matrix.toArray())
    }
  })

  if (showEdge) {
    const eg = new EdgesGeometry(geom)
    const eibg = new InstancedBufferGeometry()
    eibg.instanceCount = data.matrices.length
    eibg.setAttribute('position', eg.getAttribute('position'))
    eibg.setAttribute('matrix', new InstancedBufferAttribute(new Float32Array(edgeMatrixes), 16))

    const em2 = new LineBasicMaterial({ color: '#666' })

    em2.onBeforeCompile = (shader) => {
      shader.vertexShader = `
      attribute mat4 matrix;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * matrix * vec4( position, 1.0 );
      }
      `
    }
    building.add(new LineSegments(eibg, em2))
  }

  instance.castShadow = instance.receiveShadow = true
  building.add(instance)
}

/** 将平面点转为高度为1的 ExtrudeGeometry */
// function toExtrudedGeometry(v2Points: Vector2[][]) {
//   const shape = new Shape(v2Points[0])
//   for (let i = 1; i < v2Points.length; i++) {
//     shape.holes.push(new Path(v2Points[i]))
//   }
//   return new ExtrudeGeometry(shape, { bevelEnabled: false })
// }

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
