const audio = document.querySelector('#music audio')
const canvas = document.querySelector('#music canvas')
const ctx = canvas.getContext('2d')

// 设置初始化状态
let isInit = false
let analyser, data
// 绑定播放事件
audio.onplay = () => {
  // console.log("开始播放");
  if (isInit) return
  // 创建音频上下文
  const audioCtx = new AudioContext()
  // 创建音频源
  const source = audioCtx.createMediaElementSource(audio)
  // 创建分析器节点
  analyser = audioCtx.createAnalyser()
  // 设置窗口大小，窗口越大，分析结果越详细
  analyser.fftSize = 32
  data = new Uint8Array(analyser.frequencyBinCount)
  // 将源连接到分析器节点
  source.connect(analyser)
  // 将分析器节点连接到输出设备
  analyser.connect(audioCtx.destination)
  draw()
  isInit = true
}

// 绘制内容
function draw() {
  requestAnimationFrame(draw)
  // 清空画布
  const { width, height } = canvas
  ctx.clearRect(0, 0, width, height)
  if (!isInit) return
  // 把分析器节点的数据更新到data中
  analyser.getByteFrequencyData(data)
  const len = data.length
  const barWidth = width / len
  // 每一个方块的高度
  const blockHeight = 8
  for (let index = 0; index < data.length; index++) {
    // 拿到本列的数值
    const _data = data[index]
    const barHeight = (_data / 255) * height
    // 每列的横坐标
    const x = index * barWidth
    // 每列的方块数量
    const blockCount = Math.round(barHeight / 10)
    // 循环绘制每列的小方块
    for (let number = 0; number < blockCount; number++) {
      // 设置颜色
      ctx.fillStyle = gradient[number]
      // 每个小方块的纵坐标
      const y = height - blockHeight * number
      // 绘制圆角矩形
      drawRoundedRect(x, y, barWidth - 1, blockHeight - 1, 2)
    }
  }
}

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

function generateGradient(baseColor, count) {
  let hsl = baseColor.match(/hsla?\((\d+),\s*(\d+%),\s*(\d+%),\s*([\d.]+)\)/)
  let h = parseInt(hsl[1], 10) // Hue
  let s = parseInt(hsl[2], 10) // Saturation
  let l = parseInt(hsl[3], 10) // Lightness

  // 在色盘上按照数量均分，获取每个均分点的颜色
  let stepH = 360 / count
  // 提高每个等级的亮度
  let stepL = 100 / (count + 1)

  let gradientColors = []
  for (let i = 0; i < count; i++) {
    gradientColors.push(`hsl(${h + i * stepH}, ${s}%, ${l + i * stepL}%)`)
  }

  return gradientColors
}

let baseColor = 'hsla(240, 100%, 50%, 1)' // 蓝色
let gradient = generateGradient(baseColor, 200) // 200种颜色
