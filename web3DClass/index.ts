import { Vector3, Color, Texture, WebGLRenderer, PerspectiveCamera } from 'three'
import { OrbitControls, addOrbitControls } from './controls'
import { handleRaw } from './raw'
import VIEW from './view'

import type { temp } from '../types/temp'

///////////////////////////////////////////////////////////////////////
/////////////////////////////// WEB3D /////////////////////////////////
///////////////////////////////////////////////////////////////////////
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

const web3DOptions: web3DOptionsType = {
  cameraPosition: [-900, 600, 900],
  cameraLookAt: [0, 90, 0],
  sunDistance: 10000,
  time: 10,
  lightColor: [
    { hour: 5, color: '#116', directional: 0, ambient: 0 },
    { hour: 6, color: '#f60', directional: 0.6, ambient: 0.2 },
    { hour: 9, color: '#fff', directional: 6, ambient: 1 },
    { hour: 12, color: '#fff', directional: 9, ambient: 1 },
    { hour: 16, color: '#fff', directional: 6, ambient: 1 },
    { hour: 18, color: '#d33', directional: 0.6, ambient: 0.2 },
    { hour: 19, color: '#116', directional: 0.1, ambient: 0.1 },
    { hour: 24, color: '#000', directional: 0, ambient: 0 },
  ],
}

/** 管理Three.js场景及相关内容的工具类 */
export default class WEB3D {
  /** 创建的 Three.js 渲染器实例 */
  renderer: WebGLRenderer
  /** 创建的 Three.js 镜头实例 */
  camera: PerspectiveCamera
  /** 创建的 Three.js 控制器实例 */
  constrols: OrbitControls
  /** 工具所管理的全部场景，都使用相同的相机 */
  views: VIEW[]
  /** 当前显示的场景 */
  playing: VIEW
  /** 太阳坐标 */
  sunPosition: Vector3
  /** 工具实例的参数 */
  options: web3DOptionsType
  /** 绑定DOM元素，并生成用于Three.js渲染场景的canvas元素 */
  parent: Element
  /** 绑定材质用于镜面材质的环境反射效果 */
  envTexture?: Texture
  /** 控制controls的镜头须实例化一个矢量 */
  cameraTarget?: Vector3
  /** 缓存controls的镜头状态 */
  cameraDynamicTarget?: {
    moveSpeed: number
    targetSpeed: number
    positon: [x: number, y: number, z: number]
    lookAt: [x: number, y: number, z: number]
  }

  /** 创建管理工具实例 */
  constructor(
    /** 通过querySelector绑定DOM并生成canvas元素 */
    parentCSSID: string,
    /** 初始化工具实例的参数 */
    options?: Partial<web3DOptionsType>
  ) {
    // 初始化参数，须最先设置 Z 轴方向
    // Object3D.DEFAULT_UP = new Vector3(0, 0, 1)
    const dom = document.querySelector(parentCSSID)
    if (!dom) throw 'ERROR: invalid parentCSSID'
    const canvas = document.createElement('canvas')
    dom.appendChild(canvas)
    this.parent = dom

    this.options = Object.assign(web3DOptions, options)
    const renderer = (this.renderer = new WebGLRenderer({
      // logarithmicDepthBuffer: true,
      antialias: true,
      canvas,
    }))

    renderer.setPixelRatio(window.devicePixelRatio)

    this.views = [(this.playing = new VIEW(this))]
    this.camera = new PerspectiveCamera(45, 1, 1, 1000000000000)
    this.constrols = addOrbitControls(this, { zoomToCursor: false, enablePan: false })

    /////////////////// 场景初始化 ///////////////////

    // 先初始化太阳位置才能设置时间
    this.sunPosition = new Vector3()
    this.setTime(this.options.time)

    this.resizeScene()
    window.addEventListener('resize', () => this.resizeScene())

    /////////////////// ANIMATIONS ///////////////////
    // 按需渲染会增加很多代码合复杂性！
    animate(this)
  }
  /** 设置相机位置和焦点（所有场景都调用同一相机） */
  setCamera(params: { position?: [number, number, number]; lookAt?: [number, number, number] }) {
    // 如调用了controls, 因 animatie() 中的 controls.update() 会不停修改 camera.target, camera.lookAt() 设置无效
    if (params.lookAt)
      this.cameraTarget
        ? this.cameraTarget.set(...params.lookAt)
        : this.camera.lookAt(...params.lookAt)
    if (params.position) this.camera.position.set(...params.position)
  }
  /** 按时间设置场景的光影 */
  setTime(
    /** 按24小时划分一天 */
    hour: number,
    /** 仅修改当前显示的场景 */
    playingOnly = true
  ) {
    hour = hour % 24
    const views = playingOnly ? [this.playing] : this.views
    views.forEach((v) => {
      const dl = v.lights.directional
      const al = v.lights.ambient
      let ambientIntensity: number
      let directionalIntensity: number
      let color: Color

      const lightColor = this.options.lightColor
      lightColor.find((l2, i) => {
        if (l2.hour > hour) {
          // 计算颜色与强度
          const l1 = lightColor[
            (i === 0 ? lightColor.length : i) - 1
          ] as (typeof lightColor)[number]
          const ratio = (hour - l1.hour) / (l2.hour - l1.hour)
          color = new Color(l1.color).lerp(new Color(l2.color), ratio)
          directionalIntensity = l1.directional + (l2.directional - l1.directional) * ratio
          ambientIntensity = l1.ambient + (l2.ambient - l1.ambient) * ratio

          // 设置颜色与强度
          dl.color.set(color)
          dl.intensity = directionalIntensity
          al.color.set(color)
          al.intensity = ambientIntensity
          this.renderer.setClearColor(color, (1 - ambientIntensity) * 0.9)

          // 夜晚发光？
          // this.modelMaterials.glass.emissiveIntensity = Math.sin(2 * Math.PI * (ratio + 0.5)) * 3

          // 太阳与 y轴 (up)的极角，12点时为0，6点和18点为 PI/2，24点为 PI
          const phi = Math.PI * (Math.cos(Math.PI * 2 * (hour / 24)) + 1)

          // 太阳绕Y轴(up)的方位角，正北为0
          const theta = (-Math.PI * hour) / 12

          this.sunPosition.setFromSphericalCoords(
            this.options.sunDistance,
            phi < 0 ? 0 : phi,
            theta
          )
          dl.position.copy(this.sunPosition)
          dl.lookAt(new Vector3())
          return true
        }
        return false
      })
    })
  }
  /** 按绑定的DOM设置render和camera尺寸 */
  resizeScene() {
    const { innerWidth, innerHeight } = window
    this.renderer.setSize(innerWidth, innerHeight)
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
  }
  /** 清理场景中除设置了 userData.ignored 以外的全部对象 */
  clean(
    /** 默认仅清理当前显示的场景 */
    playingOnly = true
  ) {
    playingOnly ? cleanView(this.playing) : this.views.forEach(cleanView)
  }
  /** 清理场景并生成模型，返回总指标 */
  refresh(data: rawDataType[], options?: Partial<web3DRefreshOptionsType>) {
    this.clean()
    const info = { floorArea: 0, maxFloors: 0 }
    let maxHeight = 0

    // 生成建筑
    data.forEach((rawData) => {
      handleRaw(rawData, this.playing.scene, options)

      // 计算指标
      const { floors, floorArea } = rawData.info
      info.floorArea += floorArea * floors
      if (info.maxFloors < floors) info.maxFloors = floors
      if (maxHeight < rawData.params.height) maxHeight = rawData.params.height
    })

    // console.log('info:', this.renderer.info.render, this.playing)

    // 调整镜头
    this.setCamera({ lookAt: [0, maxHeight / 2, 0] })

    return info
  }
}

function animate(web3D: WEB3D) {
  const c = web3D.playing
  web3D.renderer.render(c.scene, web3D.camera)
  for (const f in c.animations) (c.animations[f] as Function)()

  // 开发时的HMR导致多个渲染循环，须通过检查dom元素自动终止
  if (document.body.contains(web3D.renderer.domElement))
    requestAnimationFrame(() => animate(web3D))
}

/** 清理单个场景 */
function cleanView(v: VIEW) {
  const removing = v.scene.children.map((x) => x)
  removing.forEach((x) => {
    if (!x.userData.ignored) {
      x.removeFromParent()
      disposeAll(x)
    }
  })
}

/** 统一调用Three.js的dispose函数 */
function disposeAll(x: temp.disposableType) {
  if (x.children) x.children.forEach(disposeAll)
  if (x.material) x.material.dispose()
  if (x.geometry) x.geometry.dispose()
}
