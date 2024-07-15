import { Vector2, Vector3, Matrix4, Raycaster, Quaternion } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import WEB3D from './web3D'

export { OrbitControls, addOrbitControls, autoSaveCameraState, loadCameraState, showMousePointed }

const orbitControlsOptions = {
  /** 速度大于 0 会自动旋转镜头 */
  autoRotateSpeed: 0,
  /** 缩放距离小于 zoomMinDistance 会持续向前移动 */
  zoomMinDistance: 0,
  /** 自动保存相机视角 */
  saveStatus: true,
  /** 创建相机时恢复最后保存的视角 */
  lastStatus: true,

  zoomToCursor: false,
  enableDamping: false,
  enablePan: false,
}

/** 添加镜头控制 */
function addOrbitControls(web3D: WEB3D, params: Partial<typeof orbitControlsOptions>) {
  const options: typeof orbitControlsOptions = Object.assign(orbitControlsOptions, params)
  const ctrl = new OrbitControls(web3D.camera, web3D.renderer.domElement)

  // OrbitControls 可以 saveState() 然后 reset()
  ctrl.zoomToCursor = options.zoomToCursor
  ctrl.enableDamping = options.enableDamping
  ctrl.enablePan = options.enablePan

  const rotateSpeed = options.autoRotateSpeed
  const zoomMinDistance = options.zoomMinDistance
  if (rotateSpeed > 0) {
    ctrl.autoRotateSpeed = rotateSpeed
    ctrl.autoRotate = true
  }
  if (zoomMinDistance > 0) {
    ctrl.addEventListener('change', () => {
      if (ctrl.getDistance() < zoomMinDistance) {
        const v = new Vector3()
        ctrl.object.getWorldDirection(v)
        ctrl.target.add(v.setLength(9))
      }
    })
  }
  if (options.saveStatus) {
    ctrl.addEventListener('change', () => {
      // console.log('saved', JSON.stringify(web3D.camera.matrixWorld.toArray()))
      localStorage.setItem('cameraMatrix', JSON.stringify(web3D.camera.matrix.toArray()))
    })
  }
  if (options.lastStatus) {
    const json = localStorage.getItem('cameraMatrix')
    if (json) {
      web3D.camera.applyMatrix4(new Matrix4().fromArray(JSON.parse(json)))
    }
  }

  web3D.cameraTarget = ctrl.target
  web3D.playing.animations.updateControls = ctrl.update
  return ctrl
}

/** 每次移动结束记录相机位置 */
function autoSaveCameraState(web3D: WEB3D, controls: OrbitControls) {
  controls.addEventListener('end', () => {
    window.localStorage.setItem(
      'cameraState',
      JSON.stringify({
        pos: web3D.camera.position.toArray(),
        tgt: controls.target.toArray(),
      })
    )
  })
}

/** 每次启动刷新尝试重置相机到记录的状态 */
function loadCameraState(web3D: WEB3D, controls: OrbitControls) {
  const cameraState = window.localStorage.getItem('cameraState')
  if (cameraState) {
    const a = JSON.parse(cameraState)
    web3D.camera.position.set(...(a.pos as [number, number, number]))
    controls.target.set(...(a.tgt as [number, number, number]))
  }
}

/** 按住 Ctrl 时显示鼠标点的坐标，按住 Shift 时显示相机矩阵，按住 Alt 提示悬停元素的信息 */
function showMousePointed(web3D: WEB3D) {
  function getPointed(event: PointerEvent) {
    const pointer = new Vector2()
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, web3D.camera)
    return raycaster.intersectObject(web3D.playing.scene)
  }

  const raycaster = new Raycaster()
  const indicator = document.createElement('a')
  indicator.setAttribute('style', 'position:fixed;bottom:9px;left:9px')
  document.body.appendChild(indicator)
  document.addEventListener('pointermove', (e) => {
    if (e.altKey) {
      const i = getPointed(e)[0]
      if (i) indicator.innerText = `[${i.object.type}] ${i.object.name || '... no name'}`
    } else if (e.shiftKey) {
      const p = new Vector3()
      const q = new Quaternion()
      const s = new Vector3()
      web3D.camera.matrix.decompose(p, q, s)
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
