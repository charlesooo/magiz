import * as THREE from 'three/webgpu'
import * as TSL from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js';

export { THREE, TSL, init }

function init() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000)
  camera.position.set(120, 20, 200)

  const renderer = new THREE.WebGPURenderer({ antialias: true, logarithmicDepthBuffer: true })
  renderer.setPixelRatio(window.devicePixelRatio < 1.5 ? window.devicePixelRatio : 2.0)
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor('#333')
  renderer.setAnimationLoop(animate);

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;
  // controls.autoRotate = true
  // controls.rotateSpeed = 0.01;

  const lightA = new THREE.AmbientLight('#fff', 1)
  const lightD = new THREE.DirectionalLight('#fff', 3)
  scene.add(lightA, lightD)


  // Animation loop
  function animate() {
    stats.update();
    controls.update()
    renderer.renderAsync(scene, camera)
  }

  // Window resize handling
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  })

  document.body.appendChild(renderer.domElement)

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function add(target) {
    console.log('to compileAsync:', target);
    renderer.compileAsync(scene, camera, target)
  }

  return { renderer, scene, camera, controls, add }
}
