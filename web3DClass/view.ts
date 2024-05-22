import {
  Group,
  Scene,
  DirectionalLight,
  DirectionalLightHelper,
  AmbientLight,
  MeshLambertMaterial,
  PlaneGeometry,
  Mesh,
  PCFSoftShadowMap,
  Fog
} from 'three'
import WEB3D from '.'

/** 通过rotateX从生成平面时的默认Z轴朝上还原到Y轴朝上 */
const xRadian = -Math.PI / 2

const shadowArea = { width: 100, height: 100 }

/** 每个实例为一个Three.js场景，用于 WEB3D.views 和 WEB3D.playing */
export default class VIEW {
  /** 父级WEB3D入口 */
  parent: WEB3D
  /** 创建的 Three.js 场景 */
  scene: Scene
  /** 场景中的直射光和环境光 */
  lights: {
    directional: DirectionalLight
    ambient: AmbientLight
  }
  /** 场景中的动画函数 */
  animations: { [name: string]: () => void }
  /** 场景中建筑模型相关的元素 */
  meshes: Group
  /** 场景中的其它元素（如Helpers） */
  others: Group

  constructor(parent: WEB3D) {
    this.parent = parent
    this.scene = new Scene()
    this.others = new Group()
    this.meshes = new Group()
    this.meshes.name = 'updated'
    this.animations = {}

    // 阴影设置案例 https://threejs.org/docs/index.html?q=DirectionalLight#api/en/lights/shadows/DirectionalLightShadow
    // 部分材质不会产生阴影 https://threejs.org/manual/#zh/materials
    // 阴影效果可通过 light.shadow.mapSize 和 renderer.shadowMap.type 进行调整 https://threejs.org/docs/index.html#api/zh/constants/Renderer

    const ambient = new AmbientLight('#fff', 0)
    // const hemisphere = new HemisphereLight('#fff', '#bbb', 1)
    const directional = new DirectionalLight()
    this.lights = { directional, ambient }
    this.others.userData.ignored = true

    const helper = new DirectionalLightHelper(directional)

    // 解决z-fighting的可用参数:
    // Material.polygonOffset + Material.polygonOffsetFactor + Material.polygonOffsetUnits
    // Material.depthWrite
    // 关闭 renderer.logarithmicDepthBuffer
    // Mesh.renderOrder

    // https://threejs.org/docs/#api/zh/lights/DirectionalLight.target
    this.others.add(ambient, directional, directional.target, helper)
    this.scene.add(this.meshes, this.others)

    if (shadowArea) {
      const { width, height } = shadowArea
      const sm = parent.renderer.shadowMap
      const sc = directional.shadow.camera
      sm.type = PCFSoftShadowMap
      sm.enabled = true
      directional.castShadow = true
      directional.shadow.mapSize.set(4096, 4096)
      sc.far = this.parent.options.sunDistance * 2
      sc.bottom = -(sc.top = height)
      sc.left = -(sc.right = width)
      sc.updateProjectionMatrix()
    }
  }
  /** 添加指定大小的地面 */
  addGround(size: number) {
    const plane = new Mesh(
      new PlaneGeometry(size, size).rotateX(xRadian),
      new MeshLambertMaterial({
        color: '#aaa',
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 0.1
      })
    )
    plane.userData.ignored = true
    plane.renderOrder = -1
    plane.receiveShadow = plane.castShadow = true
    this.scene.add(plane)
  }

  /** 添加雾气效果 */
  addFog(
    /** 雾气过渡效果的最近距离 */
    near: number,
    /** 雾气过渡效果的最远距离 */
    far: number,
    /** 雾气的颜色 */
    color = '#fff'
  ) {
    this.scene.fog = new Fog(color, near, far)
  }
}
