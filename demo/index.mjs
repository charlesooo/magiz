////////////////////////// CONTROLS /////////////////////////

const style = 'S4'
const height = 50
const grayScale = false
const showEdge = true
const devStyles = !true

////////////////////////// CONTROLS /////////////////////////

import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js'
import { styles, PLAN, STYLES, WEB3D } from '../dist/magiz.module.min.js'
import { requests } from './cs.mjs'

// 系统监视
// @ts-ignore
const stats = new Stats()
document.body.appendChild(stats.dom)

// 初始化场景
const web3D = new WEB3D('#magiz')

if (devStyles) {
  // 创建建筑平面
  const plan = new PLAN({
    params: {
      style,
      height,
      floorHeight: 3,
      elevation: 0,
      seed: 0,
    },
    loops: [
      [
        [0, 0],
        [80, 0],
        [80, 30],
        [0, 30],
      ],
    ],
  })

  // 从平面按样式库生成建筑模型数据
  const data = plan.generate(styles)

  // 用数据更新场景
  web3D.refresh([data], { grayScale, showEdge })
} else {
  const data = []
  requests.forEach((req) => {
    const [style, height, floorHeight] = req[0]
    const r = {
      params: {
        style,
        height,
        floorHeight: 3,
        elevation: 0,
        seed: 0,
      },
      loops: req[1],
    }
    const plan = new PLAN(r)
    data.push(plan.generate(styles))
  })

  web3D.refresh(data, { grayScale, showEdge, inplace: true })

  web3D.playing.addGround(3000, './map.jpg', 1)
  web3D.playing.animations.updateStats = () => {
    stats.update()
  }
}

const centerRatio = [0.5, 0.3]
const back = document.getElementById('back')
if (back) {
  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window
    const center = {
      x: centerRatio[0] * innerWidth,
      y: centerRatio[1] * innerHeight,
    }
    const { clientX, clientY } = e
    const r = {
      x:
        clientX < center.x
          ? (center.x - clientX) / center.x
          : (center.x - clientX) / (innerWidth - center.x),
      y:
        clientY < center.y
          ? (center.y - clientY) / center.y
          : (center.y - clientY) / (innerHeight - center.y),
    }
    back.style.transform = `translate(${12 * r.x}px, ${12 * r.y}px)`
  })
}
