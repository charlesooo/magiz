////////////////////////// CONTROLS /////////////////////////

const style = 'S4'
const height = 50
const grayScale = false
const showEdge = true
const devStyles = !true

////////////////////////// CONTROLS /////////////////////////

import { styles, PLAN, WEB3D } from './magiz.module.min.mjs'
import { requests } from './cs.mjs'
import Stats from 'https://cdn.bootcdn.net/ajax/libs/stats.js/r17/Stats.min.js'
const stats = new Stats()
document.getElementById('details')?.appendChild(stats.dom)
stats.dom.style = 'position: relative;'

// 初始化场景
const web3D = new WEB3D('#magiz')
web3D.setMovingMaterial()

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

  web3D.refresh(data, { grayScale, showEdge, inplace: true }).then((info) => {
    document.getElementById('cover')?.classList.add('hide')
  })

  web3D.playing.addGround(3000, {
    pictureURL: './map.jpg',
    uvMoving: 1,
  })
  web3D.playing.animations.updateStats = () => {
    stats.update()
  }
}
