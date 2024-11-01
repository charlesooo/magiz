import { Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { View } from '.'

export { OrbitControls, addOrbitControls }

const orbitControlsOptions = {
  /** 速度大于 0 会自动旋转镜头 */
  autoRotate: 0,
  /** 缩放距离小于 moveIfClose 会持续向前移动 */
  moveIfClose: 0,
  zoomToCursor: false,
  enableDamping: false,
  enablePan: true,
}

/** 添加镜头控制 */
function addOrbitControls(view: View, params?: Partial<typeof orbitControlsOptions>) {
  const options: typeof orbitControlsOptions = Object.assign(orbitControlsOptions, params)
  const ctrl = new OrbitControls(view.camera, view.renderer.domElement)

  // OrbitControls 可以 saveState() 然后 reset()
  ctrl.zoomToCursor = options.zoomToCursor
  ctrl.enableDamping = options.enableDamping
  ctrl.enablePan = options.enablePan
  ctrl.maxDistance = 10000

  const { autoRotate, moveIfClose } = options
  if (autoRotate > 0) {
    ctrl.autoRotateSpeed = autoRotate
    ctrl.autoRotate = true
  }
  if (moveIfClose > 0) {
    ctrl.addEventListener('change', () => {
      if (ctrl.getDistance() < moveIfClose) {
        const v = new Vector3()
        ctrl.object.getWorldDirection(v)
        ctrl.target.add(v.setLength(9))
      }
    })
  }

  view.animations.updateControls = ctrl.update
  return ctrl
}
