import { View } from '../classView/view'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

import type { magizTypes } from '../types/magizTypes'

export { ViewTag }

const far = 400
const near = 300

/** 给View中的模型添加信息标签 */
class ViewTag {
  /** 创建的 Three.js 渲染器实例 */
  renderer: CSS2DRenderer
  /** 缓存生成的对象 */
  tags: CSS2DObject[]
  /** 绑定 View */
  view: View

  constructor(
    /** 通过querySelector绑定到Div */
    divID: string,
    view: View
  ) {
    this.view = view
    view.animations['renderMagizTags'] = () => this.render()

    const dom = document.querySelector<HTMLElement>(divID)
    if (!dom) throw 'ERROR: invalid parentCSSID'
    this.renderer = new CSS2DRenderer({ element: dom })
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
    if (this.view) {
      const cmr = this.view.camera
      this.renderer.render(this.view.scene, cmr)

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

    const { view } = this
    if (view) {
      data.forEach((d) => {
        const div = document.createElement('div')
        div.className = 'magizTag'
        div.innerHTML = `<h3>${d.title || ''}</h3><p>${d.text || ''}</p>`
        const o = new CSS2DObject(div)
        o.position.set(...d.position)
        o.center.set(0.5, 0.5)
        view.scene.add(o)
        this.tags.push(o)
      })
    }
  }

  toggle(on: boolean) {
    on ? this.tags.forEach((o) => o.layers.set(0)) : this.tags.forEach((o) => o.layers.set(1))
  }
}

// /** 重新添加标签 */
// function refreshTags(
//   input: magizTypes.requestData[],
//   result: magizTypes.rawData,
//   web2D: Web2D | undefined
// ) {
//   if (web2D) {
//     const tagsData: magizTypes.tagsDataType[] = []
//     result.models.forEach((b, i) => {
//       const info = input[i].info
//       if (info) {
//         tagsData.push({
//           title: info.name,
//           text: info.school,
//           position: [b.centerRelative[0], b.params.height / 2, -b.centerRelative[1]],
//         })
//       }
//     })
//     web2D.refresh(tagsData)
//   }
// }
