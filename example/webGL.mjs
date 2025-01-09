import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js';

export { THREE, init }

function init() {
  const scene = new THREE.Scene()

  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 10000)
  camera.position.set(120, 20, 200)

  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true })
  renderer.setSize(innerWidth, innerHeight)
  renderer.setClearColor('#333')

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true;
  // controls.autoRotate = true
  // controls.rotateSpeed = 0.01;

  const lightA = new THREE.AmbientLight('#fff', 1)
  const lightD = new THREE.DirectionalLight('#fff', 3)
  lightD.position.set(100, 100, 100)
  scene.add(lightA, lightD)

  // Animation loop
  function animate(delta) {
    stats.update();
    controls.update()

    // const pixelRatio = renderer.getPixelRatio() / 199 / Math.sin(delta / 5000);
    // //@ts-ignore
    // const r = composer.passes[2].material.uniforms['resolution'].value
    // r.x = 1 / (innerWidth * pixelRatio);
    // r.y = 1 / (innerHeight * pixelRatio);

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

  animate()

  return { renderer, scene, camera, controls }
}
