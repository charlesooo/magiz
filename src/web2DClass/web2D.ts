import WEB3D from '../web3DClass/web3D'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import type { magizTypes } from '../types/magizTypes'

const far = 400
const near = 300

/** 辅助WEB3D显示文字图片信息的渲染器 */
export default class WEB2D {
  /** 创建的 Three.js 渲染器实例 */
  renderer: CSS2DRenderer
  /** 缓存生成的对象 */
  tags: CSS2DObject[]
  /** 绑定 WEB3D */
  web3D: WEB3D

  constructor(
    /** 通过querySelector绑定到Div */
    divID: string,
    web3D: WEB3D
  ) {
    this.web3D = web3D
    web3D.playing.animations['renderMagizTags'] = () => this.render()

    const dom = document.querySelector(divID)
    if (!dom) throw 'ERROR: invalid parentCSSID'
    this.renderer = new CSS2DRenderer({ element: dom as HTMLElement })
    this.tags = []

    this.resizeScene()
    window.addEventListener('resize', () => this.resizeScene())

    // 添加样式
    const style = document.createElement('style')
    document.head.appendChild(style)
    style.innerHTML = `${divID}{pointer-events:none;position:fixed;top:0}.magizTag{font-size:small;background:#fff;padding:6px}.magizTag h3{margin:0}.magizTag p{margin:0}`
  }

  resizeScene() {
    const { innerWidth, innerHeight } = window
    this.renderer.setSize(innerWidth, innerHeight)
  }

  render() {
    if (this.web3D) {
      const cmr = this.web3D.camera
      this.renderer.render(this.web3D.playing.scene, cmr)

      this.tags.forEach((t) => {
        const d = t.position.distanceTo(cmr.position)
        if (d < near) {
          t.element.style.opacity = '1'
        } else if (d < far) {
          t.element.style.opacity = (1 - (d - near) / (far - near)).toString()
        } else {
          t.element.style.opacity = '0'
        }
      })
    }
  }

  /** 重新添加2D标签 */
  refresh(data: magizTypes.tagsDataType[]) {
    // 垃圾回收
    this.tags.forEach((o) => o.removeFromParent())
    this.tags.length = 0

    const { web3D } = this
    if (web3D) {
      data.forEach((d) => {
        const div = document.createElement('div')
        div.className = 'magizTag'
        div.innerHTML = `<h3>${d.title || ''}</h3><p>${d.text || ''}</p>`
        const o = new CSS2DObject(div)
        o.position.set(...d.position)
        o.center.set(0.5, 0.5)
        web3D.playing.scene.add(o)
        this.tags.push(o)
      })
    }
  }

  toggle(on: boolean) {
    on ? this.tags.forEach((o) => o.layers.set(0)) : this.tags.forEach((o) => o.layers.set(1))
  }
}
