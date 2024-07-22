const style = 'S4',
  height = 50,
  grayScale = !1,
  showEdge = !0,
  devStyles = !1
import { styles, PLAN, WEB3D } from '../dist/magiz.module.js'
import { requests } from './cs.js'
import Stats from 'https://cdn.staticfile.net/stats.js/r17/Stats.min.js'
const stats = new Stats()
document.getElementById('details')?.appendChild(stats.dom),
  (stats.dom.style = 'position: relative;')
const web3D = new WEB3D('#magiz')
const colorMap = []
const center = { x: 0, y: 0 }
if ((web3D.setMovingMaterial(), 0)) {
  const e = new PLAN({
    params: { style: 'S4', height: 50, floorHeight: 3, elevation: 0, seed: 0 },
    loops: [
      [
        [0, 0],
        [80, 0],
        [80, 30],
        [0, 30],
      ],
    ],
  }).toModel(colorMap, styles, center)
  web3D.refresh([e], { grayScale: false, showEdge: true })
} else {
  const e = []
  requests.forEach((t) => {
    const [s, a, o] = t[0],
      i = { params: { style: s, height: a, floorHeight: 3, elevation: 0, seed: 0 }, loops: t[1] },
      plan = new PLAN(i)
    e.push(plan.toModel(colorMap, styles, center))
  }),
    console.log(e),
    web3D.refresh(e, { grayScale: false, showEdge: true, inplace: !0 }).then((e) => {
      document.getElementById('cover')?.classList.add('hide')
    }),
    web3D.playing.addGround(3e3, { pictureURL: './map.jpg', uvMoving: 1 }),
    (web3D.playing.animations.updateStats = () => {
      stats.update()
    })
}
