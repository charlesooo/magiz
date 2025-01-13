import { Plan, styles } from '../dist/magiz.module.min.js' // npm run build

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';

export { THREE, init, planParams, modelParams }

const planParams = {
  params: { style: 'SV11', height: 40, match: 0, floorHeight: 3, elevation: 0, seed: 0 },
  loops: [
    [
      [0, 0],
      [30, 0],
      [40, -10],
      [50, -10],
      [50, 15],
      [0, 15],
    ],
  ]
}
const modelParams = { basicMaterial: false, greyScale: false, edge: true }

function init() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000)
  camera.position.set(100, 50, 100)

  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor('#333')

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;
  // controls.autoRotate = true
  // controls.rotateSpeed = 0.01;

  const env = new THREE.Group()
  env.userData.ignored = true
  scene.add(env)

  const lightA = new THREE.AmbientLight('#fff', 1)
  const lightD = new THREE.DirectionalLight('#fff', 3)
  lightD.position.set(100, 100, 100)
  env.add(lightA, lightD)

  // Animation loop
  function animate(delta) {
    stats.update();
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  // Window resize handling
  window.addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight)
    camera.aspect = innerWidth / innerHeight
    camera.updateProjectionMatrix()
  })

  const stats = new Stats();
  document.body.appendChild(stats.dom);
  document.body.appendChild(renderer.domElement)

  const gui = new GUI();
  gui.add(planParams.params, 'style', styles.getNames()).name('style');
  gui.add(planParams.params, 'height', 3, 200, 0.5).name('height');
  gui.add(planParams.params, 'floorHeight', 3, 5, 0.5).name('floorHeight');
  gui.add(planParams.params, 'match', 0, 5, 1).name('match');
  const folder = gui.addFolder('model')
  folder.add(modelParams, 'basicMaterial').name('use basic material')
  folder.add(modelParams, 'greyScale').name('greyScale mode')
  folder.add(modelParams, 'edge').name('show edge')

  gui.onChange(() => {
    clearScene(scene)
    const plan = new Plan(planParams)
    const model = plan.toModel(styles, modelParams)
    scene.add(model)
  })

  animate()

  return { renderer, scene, camera, controls }
}

function clearScene(scene) {
  scene.children.forEach((x) => {
    if (!x.userData.ignored) {
      x.removeFromParent()
      disposeAll(x)
    }
  })
}

/** 统一调用Three.js的dispose函数 */
function disposeAll(x) {
  if (x.children) x.children.forEach(disposeAll)
  if (x.material) x.material.dispose()
  if (x.geometry) x.geometry.dispose()
}

