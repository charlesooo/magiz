import { Vector2, Vector3, Raycaster, Quaternion } from 'three'
import { View } from '../src/class/viewClass'

export { showMousePointed }

/** 按住 Ctrl 时显示鼠标点的坐标，按住 Shift 时显示相机矩阵，按住 Alt 提示悬停元素的信息 */
function showMousePointed(view: View) {
  function getPointed(event: PointerEvent) {
    const pointer = new Vector2()
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, view.camera)
    return raycaster.intersectObject(view.scene)
  }

  const raycaster = new Raycaster()
  const indicator = document.createElement('a')
  indicator.setAttribute('style', 'position:fixed;top:9px;left:9px')
  document.body.appendChild(indicator)
  document.addEventListener('pointermove', (e) => {
    if (e.altKey) {
      const i = getPointed(e)[0]
      if (i) indicator.innerText = `[${i.object.type}] ${i.object.name || '... no name'}`
    } else if (e.shiftKey) {
      const p = new Vector3()
      const q = new Quaternion()
      const s = new Vector3()
      view.camera.matrix.decompose(p, q, s)
      indicator.innerText = `{p:[${p.toArray()}],q:[${q.toArray()}]}`
    } else if (e.ctrlKey) {
      const i = getPointed(e)[0]
      if (i)
        indicator.innerText = i.point
          .toArray()
          .map((v) => v.toFixed(3))
          .join(' , ')
    }
  })
}
