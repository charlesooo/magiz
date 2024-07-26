import WEB3D from '../web3DClass/web3D'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const far = 400
const near = 300

/** 辅助WEB3D显示文字图片信息的渲染器 */
export default class RENDER2D {
  /** 创建的 Three.js 渲染器实例 */
  renderer: CSS2DRenderer
  /** 缓存生成的对象 */
  tags: CSS2DObject[]

  /** 绑定 WEB3D */
  web3D?: WEB3D

  constructor(
    /** 通过querySelector绑定到Div */
    divID: string
  ) {
    const dom = document.querySelector(divID)
    if (!dom) throw 'ERROR: invalid parentCSSID'
    this.renderer = new CSS2DRenderer({ element: dom as HTMLElement })
    this.tags = []

    this.resizeScene()
    window.addEventListener('resize', () => this.resizeScene())

    // 添加样式
    const style = document.createElement('style')
    document.head.appendChild(style)
    style.innerHTML =
      '.magizTag{pointer-events: none;font-size:small;background:#333;color:#fff;padding:6px}'
  }

  boundWEB3D(w: WEB3D) {
    this.web3D = w
    w.playing.animations['renderMagizTags'] = () => this.update()
    return this
  }

  resizeScene() {
    const { innerWidth, innerHeight } = window
    this.renderer.setSize(innerWidth, innerHeight)
  }

  update() {
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

  /** 添加2D标签 */
  addTag(title: string | undefined, text: string | undefined, x: number, y: number, z: number) {
    if (this.web3D) {
      const div = document.createElement('div')
      div.className = 'magizTag'
      div.innerHTML = `<h3>${title || ''}</h3><p>${text || ''}</p>`
      const o = new CSS2DObject(div)
      o.position.set(x, y, z)
      o.center.set(0.5, 0.5)
      o.layers.set(1)
      this.web3D.playing.scene.add(o)
      this.tags.push(o)
    }
  }

  toggle(on: boolean) {
    on ? this.tags.forEach((o) => o.layers.set(0)) : this.tags.forEach((o) => o.layers.set(1))
  }
}
