////////////////////////// CONTROLS /////////////////////////

const style = 'S4'
const height = 50
const grayScale = false
const showEdge = true
const devStyles = !true

////////////////////////// CONTROLS /////////////////////////

import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js'
import { styles, PLAN, WEB3D } from '../dist/magiz.module.min.js'
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

////////////////////////// AUDIO /////////////////////////

let ratio = 1
let key = 0.2
const rythm = new Rythm()
const ratioEl = document.querySelector('#ratio')
const danceType = {
  dance: (elem, v, options = { max: 1.1, min: 0.9 }) => {
    ratioEl.innerHTML = v.toFixed(1)
    ratio = v > key ? v - key : 0
    web3D.materialVects.basic.v4.value.x = -4.67 + ratio
    web3D.materialVects.glass.v4.value.x = -4.67 + ratio
    elem.style.transform = `scale(${options.min + (options.max - options.min) * v})`
  },
  reset: (elem) => {
    elem.style.transform = ''
  },
}
rythm.addRythm('cyberDance', danceType, 600, 100)
rythm.setMusic('really.mp3')

rythm.start()

// const audio = document.querySelector('#music audio')
// const canvas = document.querySelector('#music canvas')
// const ctx = canvas.getContext('2d')
// const ratioEl = document.querySelector('#ratio')

// // 设置初始化状态
// let isInit = false

// const audioCtx = new AudioContext()
// const analyser = audioCtx.createAnalyser()
// analyser.fftSize = 32
// const data = new Uint8Array(analyser.frequencyBinCount)

// // 绑定播放事件
// audio.onplay = () => {
//   if (isInit) return
//   const source = audioCtx.createMediaElementSource(audio)
//   source.connect(analyser)
//   analyser.connect(audioCtx.destination)
//   draw()
//   isInit = true
// }

// const freq = { max: -Infinity, up: 0, down: 0 }

// // 绘制内容
// function draw() {
//   requestAnimationFrame(draw)
//   // 清空画布
//   const { width, height } = canvas
//   ctx.clearRect(0, 0, width, height)
//   if (!isInit) return
//   // 把分析器节点的数据更新到data中
//   analyser.getByteFrequencyData(data)
//   const len = data.length
//   const barWidth = width / len
//   // 每一个方块的高度
//   const blockHeight = 8

//   for (let i = 0; i < data.length; i++) {
//     // 拿到本列的数值
//     const _data = data[i]
//     const barHeight = (_data / 255) * height
//     const x = i * barWidth
//     const blockCount = Math.round(barHeight / 10)
//     for (let number = 0; number < blockCount; number++) {
//       const y = height - blockHeight * number
//       drawRoundedRect(x, y, barWidth - 1, blockHeight - 1, 2)
//     }
//   }

//   /////////////////// 控制模型颜色 ////////////////////

//   let v = 0
//   const d = data[Math.round(data.length * 0.7)]

//   if (d > freq.max) {
//     freq.max = d
//     freq.up = Math.round(d * 0.9)
//     freq.down = Math.round(d * 0.2)
//   }

//   if (d > freq.up) {
//     v = 1
//   } else if (d < freq.down) {
//     v = 0
//   } else {
//     v = 0.5
//   }
//   ratioEl.innerHTML = `${v} = ${d} (${freq.down}..${freq.up}) / ${data.length}`

//   /////////////////// 控制模型颜色 ////////////////////
// }

function drawRoundedRect(x, y, width, height, radius) {
  if (height === 0) return
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.fill()
}

////////////////////////// MOUSE /////////////////////////

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

    /////////////////// 控制模型颜色 ////////////////////

    const v = r.x / 6 + 0.3
    // web3D.materialVects.basic.v2.value.x = -v
    // web3D.materialVects.basic.v2.value.y = v
    // // web3D.materialVects.basic.v2.value.z = v / 2
    // web3D.materialVects.glass.v2.value.x = -v
    // web3D.materialVects.glass.v2.value.y = v
    // web3D.materialVects.basic.v2.value.z = v / 2
    // web3D.materialVects.basic.v4.value.y = v + 0.2
    // web3D.materialVects.basic.v4.value.z = v + 0.5
    // ratioEl.innerHTML = v

    /////////////////// 控制模型颜色 ////////////////////
  })
}
