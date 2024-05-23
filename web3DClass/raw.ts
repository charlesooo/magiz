import {
  DoubleSide,
  Matrix4,
  Vector2,
  Group,
  Shape,
  Path,
  Color,
  MeshLambertMaterial,
  MeshStandardMaterial,
  LineBasicMaterial,
  EdgesGeometry,
  LineSegments,
  BufferGeometry,
  BoxGeometry,
  ExtrudeGeometry,
  InstancedMesh,
  Scene,
  BufferAttribute,
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
function handleRaw(input: rawDataType, scene: Scene, grayscale: boolean, showEdge: boolean) {
  // Group内以Z轴朝上生成，在THREE.JS中须切换到Y轴朝上
  const building = new Group().rotateX(-Math.PI / 2)

  const v2Points = input.points.map((loop) => loop.map((p2) => new Vector2(...p2)))
  const colors: [name: string, color: Color][] = []
  if (grayscale) {
    const c = [0, 1].map((i) => {
      // 必然包含两个默认的材质颜色值
      const c = input.colorMap[i] as string
      return new Color(c.split(/ +/)[0])
    }) as [Color, Color]
    input.colorMap.forEach((x) => colors.push([x, x.includes('G') ? c[1] : c[0]]))
  } else {
    input.colorMap.forEach((x) => colors.push([x, new Color(x.split(/ +/)[0])]))
  }

  let m: MeshLambertMaterial | MeshStandardMaterial
  let g: ExtrudeGeometry | BufferGeometry

  // 生成block元素
  let floorType: keyof rawDataType['floorData']
  for (floorType in input.floorData) {
    const data = input.floorData[floorType]
    const num = data.matrices.length
    if (num > 0) {
      switch (floorType) {
        case 'block':
          g = toExtrudedGeometry(v2Points)
          m = material
          break
        case 'blockGlass':
          g = toExtrudedGeometry(v2Points)
          m = glassMaterial
          break
        case 'sloping':
          g = getSlopingRoofGeometry()
          m = twoSideMaterial
          break
        case 'slopingGlass':
          g = getSlopingRoofGeometry()
          m = glassMaterial
          break
      }
      addInstance(data, colors, g, m)
    }
  }

  // 生成box元素
  let boxType: keyof rawDataType['boxData']
  for (boxType in input.boxData) {
    addInstance(
      input.boxData[boxType],
      colors,
      boxGeom,
      boxType === 'box' ? material : glassMaterial
    )
  }

  scene.add(building)

  //////////////////// INTERNAL FUNCTIONS /////////////////////

  /** 设置instancedMesh的matrix与color */
  function addInstance(
    data: instancedDataType,
    colors: [name: string, color: Color][],
    geom: BufferGeometry,
    material: MeshLambertMaterial | MeshStandardMaterial
  ) {
    const tempMatrix = new Matrix4()
    const count = data.matrices.length
    const instance = new InstancedMesh(geom, material, count)

    data.matrices.forEach((m, i) => {
      tempMatrix.fromArray(m)
      // 样式解析后的颜色索引必然对应
      const c = colors[data.colors[i] as number] as [name: string, color: Color]
      instance.setColorAt(i, c[1])
      instance.setMatrixAt(i, tempMatrix)

      if (showEdge) {
        const g = new EdgesGeometry(geom).applyMatrix4(tempMatrix)
        building.add(new LineSegments(g, lineMaterial))
      }
    })

    instance.castShadow = instance.receiveShadow = true
    building.add(instance)
  }
}

/** 将平面点转为高度为1的 ExtrudeGeometry */
function toExtrudedGeometry(v2Points: Vector2[][]) {
  const shape = new Shape(v2Points[0])
  for (let i = 1; i < v2Points.length; i++) {
    shape.holes.push(new Path(v2Points[i]))
  }
  return new ExtrudeGeometry(shape, { bevelEnabled: false })
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
