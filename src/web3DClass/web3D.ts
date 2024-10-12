import { Vector3, Color, Texture, WebGLRenderer, PerspectiveCamera } from 'three'
import { OrbitControls, addOrbitControls } from './controls'
import handleRaw from './raw'
import View from './view'

import type { temp } from '../types/temp'
import type { magizTypes } from '../types/magizTypes'

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

const web3DOptions: magizTypes.webOptions = {
  cameraPosition: [900, 900, 900],
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
export default class Web3D {
  /** 创建的 Three.js 渲染器实例 */
  renderer: WebGLRenderer
  /** 创建的 Three.js 镜头实例 */
  camera: PerspectiveCamera
  /** 创建的 Three.js 控制器实例 */
  constrols: OrbitControls
  /** 当前显示的场景 */
  playing: View
  /** 太阳坐标 */
  sunPosition: Vector3
  /** 工具实例的参数 */
  options: magizTypes.webOptions
  /** 绑定DOM元素，并生成用于Three.js渲染场景的canvas元素 */
  parent: Element
  /** 绑定材质用于镜面材质的环境反射效果 */
  envTexture?: Texture

  /** 创建管理工具实例 */
  constructor(
    /** 通过querySelector绑定Canvas到Div */
    divID: string,
    /** 初始化工具实例的参数 */
    options?: Partial<magizTypes.webOptions>
  ) {
    const dom = document.querySelector(divID)
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
    this.playing = new View(this, this.options.shadow)
    this.camera = new PerspectiveCamera(45, 1, 1, 1000000000)
    this.camera.position.set(...this.options.cameraPosition)

    this.constrols = addOrbitControls(this)

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
  /** 按24小时划分一天，设置场景的光影 */
  setTime(hour: number) {
    hour = hour % 24
    const { directional: dl, ambient: al } = this.playing.lights
    let ambientIntensity: number
    let directionalIntensity: number
    let color: Color

    const lightColor = this.options.lightColor
    lightColor.find((l2, i) => {
      if (l2.hour > hour) {
        // 计算颜色与强度
        const l1 = lightColor[(i === 0 ? lightColor.length : i) - 1] as (typeof lightColor)[number]
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

  /** 清理场景并生成模型，返回总指标 */
  refresh(
    data: magizTypes.rawData,
    options?: Partial<magizTypes.webRefreshOptions>
  ): Promise<{ floorArea: number; maxFloors: number }> {
    return new Promise((resolve, _) => {
      cleanView(this.playing)
      const info = { floorArea: 0, maxFloors: 0 }
      let maxHeight = 0

      // 生成建筑
      handleRaw(data, this.playing.scene, options)

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

  setShadow(on: boolean) {
    this.playing.lights.directional.castShadow = on
  }
}

function animate(web3D: Web3D) {
  const v = web3D.playing
  web3D.renderer.render(v.scene, web3D.camera)
  for (const f in v.animations) (v.animations[f] as Function)()
  // 开发时的HMR导致多个渲染循环，须通过检查dom元素自动终止
  if (document.body.contains(web3D.renderer.domElement))
    requestAnimationFrame(() => animate(web3D))
}

/** 清理单个场景 */
function cleanView(v: View) {
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
