import {
  Vector3,
  Color,
  Texture,
  WebGLRenderer,
  PerspectiveCamera,
  Group,
  Scene,
  DirectionalLight,
  AmbientLight,
  PlaneGeometry,
  Mesh,
  PCFSoftShadowMap,
  Fog,
} from 'three'
import { OrbitControls, addOrbitControls } from './controls'
import { presetOtherMaterials } from './materials'
import { generateModel } from './raw'

import type { temp } from '../types/temp'
import type { magizTypes } from '../types/magizTypes'

export { View }

///////////////////// Web3D /////////////////////
// js 必须在的一定数值范围内显示，否则会出现异常。这是3D渲染通病。如按
// 经纬度计算数值过小，出现部分EdgesGeometry不显示的问题。如离原点过远，会出
// 现模型旋转时不停闪烁的问题，即使设置logarithmicDepthBuffer 为 true，也
// 无法完全解决。
//
// 提升效率的方法：
// 1. render.shadowMap.autoUpdate 关闭阴影自动更新
//
// 从 instancedMesh 到 Mesh 用 SceneUtils.createMeshesFromInstancedMesh
// https://threejs.org/docs/#examples/zh/utils/SceneUtils

const viewOptions: magizTypes.viewOptions = {
  fog: { near: 900, far: 5000 },
  groundSize: 5000,
  cameraPosition: [200, 10, 200],
  sunDistance: 10000,

  lightColor: [
    { hour: 5, color: '#116', directional: 0, ambient: 0 },
    { hour: 6, color: '#f60', directional: 0.6, ambient: 0.2 },
    { hour: 9, color: '#fff', directional: 2, ambient: 0.6 },
    { hour: 12, color: '#fff', directional: 2, ambient: 0.6 },
    { hour: 16, color: '#fff', directional: 2, ambient: 0.6 },
    { hour: 18, color: '#d33', directional: 0.6, ambient: 0.2 },
    { hour: 19, color: '#116', directional: 0.1, ambient: 0.1 },
    { hour: 24, color: '#000', directional: 0, ambient: 0 },
  ],
  time: 10,
  shadow: true,
}

/** 管理Three.js场景及相关内容的工具类 */
class View {
  /** 创建的 Three.js 渲染器实例 */
  renderer: WebGLRenderer
  /** 创建的 Three.js 镜头实例 */
  camera: PerspectiveCamera
  /** 创建的 Three.js 控制器实例 */
  controls: OrbitControls
  /** 创建的 Three.js 场景 */
  scene: Scene
  /** 场景中不被自动清理的的元素（如光、地面、Helpers） */
  ignored: Group
  /** 场景中的直射光和环境光 */
  lights: {
    directional: DirectionalLight
    ambient: AmbientLight
  }
  /** 场景中的动画函数 */
  animations: { [name: string]: () => void }
  /** 太阳坐标 */
  sunPosition: Vector3
  /** 工具实例的参数 */
  options: magizTypes.viewOptions
  /** 绑定DOM元素，并生成用于Three.js渲染场景的canvas元素 */
  parent: Element
  /** 缓存特殊的重映射数据，用于还原 */
  remapCache: {
    envMapTexture: Texture | null
    edge: Color
    ground: Color
    lightFogSky: Color
  }

  /** 创建管理工具实例 */
  constructor(
    /** 通过querySelector绑定Canvas到Div */
    divID: string,
    /** 初始化工具实例的参数 */
    options?: Partial<magizTypes.viewOptions>
  ) {
    const dom = document.querySelector(divID)
    if (!dom) throw 'ERROR: invalid parentCSSID'
    const canvas = document.createElement('canvas')
    dom.appendChild(canvas)
    this.parent = dom
    this.scene = new Scene()
    this.ignored = new Group()
    this.animations = {}
    this.options = Object.assign(viewOptions, options)
    this.renderer = new WebGLRenderer({
      // logarithmicDepthBuffer: true,
      preserveDrawingBuffer: true,
      antialias: true,
      canvas,
    })
    this.renderer.setPixelRatio(window.devicePixelRatio)

    // 重映射相关设置
    this.remapCache = {
      envMapTexture: null,
      edge: new Color('#333'),
      ground: new Color('#bbb'),
      lightFogSky: new Color('#fff'),
    }
    presetOtherMaterials.ground.color.copy(this.remapCache.ground)
    presetOtherMaterials.edge.color.copy(this.remapCache.edge)

    // 阴影设置案例 https://threejs.org/docs/index.html?q=DirectionalLight#api/en/lights/shadows/DirectionalLightShadow
    // 部分材质不会产生阴影 https://threejs.org/manual/#zh/materials
    // 阴影效果可通过 light.shadow.mapSize 和 renderer.shadowMap.type 进行调整 https://threejs.org/docs/index.html#api/zh/constants/Renderer
    const ambient = new AmbientLight('#fff', 0)
    const directional = new DirectionalLight()
    this.lights = { directional, ambient }

    // 解决z-fighting的可用参数:
    // Material.polygonOffset + Material.polygonOffsetFactor + Material.polygonOffsetUnits
    // Material.depthWrite
    // 关闭 renderer.logarithmicDepthBuffer
    // Mesh.renderOrder

    // https://threejs.org/docs/#api/zh/lights/DirectionalLight.target
    this.ignored.add(ambient, directional, directional.target)
    this.ignored.userData.ignored = true
    this.scene.add(this.ignored)

    if (this.options.shadow) {
      directional.shadow.mapSize.set(4096, 4096)
      directional.castShadow = true
      const sc = directional.shadow.camera
      sc.far = this.options.sunDistance * 2

      const { shadowMap } = this.renderer
      shadowMap.type = PCFSoftShadowMap
      shadowMap.enabled = true

      this.setShadowArea(200, 200)
    }

    this.camera = new PerspectiveCamera(45, 1, 1, 1000000000)
    this.camera.position.set(...this.options.cameraPosition)
    this.controls = addOrbitControls(this)

    // 先初始化太阳位置才能设置时间
    this.sunPosition = new Vector3()
    this.setTime(this.options.time)

    window.addEventListener('resize', () => this.resizeScene())
    this.resizeScene()

    /////////////////// ANIMATIONS ///////////////////
    // 按需渲染会增加很多代码合复杂性！
    animate(this)
  }

  setShadowArea(width: number, height: number) {
    const { camera } = this.lights.directional.shadow
    camera.bottom = -(camera.top = height)
    camera.left = -(camera.right = width)
    camera.updateProjectionMatrix()
  }

  setShadow(on: boolean) {
    this.lights.directional.castShadow = on
  }

  /** 按24小时划分一天，设置场景的光影 */
  setTime(hour: number) {
    hour = hour % 24
    const { directional: dl, ambient: al } = this.lights
    let ambientIntensity: number
    let directionalIntensity: number
    let color: Color

    const { lightColor } = this.options
    lightColor.find((lc, i) => {
      if (lc.hour > hour) {
        // 计算颜色与强度
        const pc = lightColor[(i === 0 ? lightColor.length : i) - 1]!
        const ratio = (hour - pc.hour) / (lc.hour - pc.hour)
        color = new Color(pc.color).lerp(new Color(lc.color), ratio)
        directionalIntensity = pc.directional + (lc.directional - pc.directional) * ratio
        ambientIntensity = pc.ambient + (lc.ambient - pc.ambient) * ratio

        // 设置颜色与强度
        dl.color.set(color)
        dl.intensity = directionalIntensity
        al.color.set(color)
        al.intensity = ambientIntensity
        this.renderer.setClearColor(color)
        // 缓存到 remapCache
        this.remapCache.lightFogSky.copy(color)

        // 设置fog颜色
        if (this.scene.fog) this.scene.fog.color = color

        // 夜晚发光？
        // this.modelMaterials.glass.emissiveIntensity = Math.sin(2 * Math.PI * (ratio + 0.5)) * 3

        // 太阳与 y轴 (up)的极角，12点时为0，6点和18点为 PI/2，24点为 PI
        const phi = Math.PI * (Math.cos(Math.PI * 2 * (hour / 24)) + 1)
        // 太阳绕Y轴(up)的方位角，正北为0
        const theta = (-Math.PI * hour) / 12
        this.sunPosition.setFromSphericalCoords(this.options.sunDistance, phi < 0 ? 0 : phi, theta)
        dl.position.copy(this.sunPosition)
        dl.lookAt(new Vector3())
        return true
      }
      return false
    })
  }

  /** 按绑定的DOM设置render和camera尺寸 */
  resizeScene() {
    const { innerWidth, innerHeight } = window
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
  }

  /** 清理场景 */
  clean() {
    this.scene.children.forEach((x) => {
      if (!x.userData.ignored) {
        x.removeFromParent()
        disposeAll(x)
      }
    })
  }

  /** 清理场景并生成模型，返回总指标 */
  refresh(
    data: magizTypes.rawData,
    options?: Partial<magizTypes.generateOptions>
  ): Promise<{ floorArea: number; maxFloors: number }> {
    return new Promise((resolve, _) => {
      this.clean()
      const info = { floorArea: 0, maxFloors: 0 }
      let maxHeight = 0

      // 生成建筑
      generateModel(data, this.scene, options)

      // 计算指标
      data.models.forEach((rawBuilding) => {
        const h = rawBuilding.params.height
        const { floors, floorArea } = rawBuilding.info
        info.floorArea += floorArea * floors
        if (info.maxFloors < floors) info.maxFloors = floors
        if (maxHeight < h) maxHeight = h
      })
      resolve(info)
    })
  }

  /** 添加指定大小的地面 */
  addGround() {
    const s = this.options.groundSize
    const geom = new PlaneGeometry(s, s).rotateX(-Math.PI / 2)
    const ground = new Mesh(geom, presetOtherMaterials.ground)
    ground.renderOrder = -1
    ground.receiveShadow = true
    this.ignored.add(ground)

    // 缓存到 remapCache
    this.remapCache.ground.copy(presetOtherMaterials.ground.color)
  }

  /** 添加雾气效果 */
  addFog() {
    const { near, far } = this.options.fog
    this.scene.fog = new Fog(this.remapCache.lightFogSky, near, far)
  }
}

function animate(v: View) {
  v.renderer.render(v.scene, v.camera)
  for (const f in v.animations) v.animations[f]!()
  // 开发时的HMR导致多个渲染循环，须通过检查dom元素自动终止
  if (document.body.contains(v.renderer.domElement)) requestAnimationFrame(() => animate(v))
}

/** 统一调用Three.js的dispose函数 */
function disposeAll(x: temp.disposableType) {
  if (x.children) x.children.forEach(disposeAll)
  if (x.material) x.material.dispose()
  if (x.geometry) x.geometry.dispose()
}
