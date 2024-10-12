import {
  Group,
  Scene,
  DirectionalLight,
  AmbientLight,
  PlaneGeometry,
  Mesh,
  PCFSoftShadowMap,
  Fog,
  Texture,
} from 'three'
import Web3D from './web3D'
import { presetMaterials } from './materials'

/** 通过rotateX从生成平面时的默认Z轴朝上还原到Y轴朝上 */
const xRadian = -Math.PI / 2

/** 每个实例为一个Three.js场景 */
export default class View {
  /** 父级Web3D入口 */
  parent: Web3D
  /** 创建的 Three.js 场景 */
  scene: Scene
  /** 场景中的直射光和环境光 */
  lights: {
    directional: DirectionalLight
    ambient: AmbientLight
  }
  /** 场景中的动画函数 */
  animations: { [name: string]: () => void }
  /** 场景中不被自动清理的的元素（如光、地面、Helpers） */
  ignored: Group
  /** 场景中地面相关数据 */
  ground?: {
    texture: Texture
    size: number
  }

  constructor(parent: Web3D, shadow = true) {
    this.parent = parent
    this.scene = new Scene()
    this.ignored = new Group()
    this.animations = {}

    // 阴影设置案例 https://threejs.org/docs/index.html?q=DirectionalLight#api/en/lights/shadows/DirectionalLightShadow
    // 部分材质不会产生阴影 https://threejs.org/manual/#zh/materials
    // 阴影效果可通过 light.shadow.mapSize 和 renderer.shadowMap.type 进行调整 https://threejs.org/docs/index.html#api/zh/constants/Renderer
    const ambient = new AmbientLight('#fff', 0)
    const directional = new DirectionalLight()
    this.lights = { directional, ambient }
    this.ignored.userData.ignored = true

    // 解决z-fighting的可用参数:
    // Material.polygonOffset + Material.polygonOffsetFactor + Material.polygonOffsetUnits
    // Material.depthWrite
    // 关闭 renderer.logarithmicDepthBuffer
    // Mesh.renderOrder

    // https://threejs.org/docs/#api/zh/lights/DirectionalLight.target
    this.ignored.add(ambient, directional, directional.target)
    this.scene.add(this.ignored)

    if (shadow) {
      directional.shadow.mapSize.set(4096, 4096)
      directional.castShadow = true
      const sc = directional.shadow.camera
      sc.far = parent.options.sunDistance * 2

      const sm = parent.renderer.shadowMap
      sm.type = PCFSoftShadowMap
      sm.enabled = true

      this.setShadowArea(200, 200)
    }
  }

  setShadowArea(width: number, height: number) {
    const sc = this.lights.directional.shadow.camera
    sc.bottom = -(sc.top = height)
    sc.left = -(sc.right = width)
    sc.updateProjectionMatrix()
  }

  /** 添加指定大小的地面 */
  addGround(size: number) {
    const geom = new PlaneGeometry(size, size).rotateX(xRadian)
    const ground = new Mesh(geom, presetMaterials.face['Ground | 地面'])
    ground.renderOrder = -1
    ground.receiveShadow = true
    this.ignored.add(ground)
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
