import { Plan, styles } from '../dist/magizAndView.module.js'

export { createAll }

const height = 50
const match = 0
const countX = 6
const spacing = { x: 100, y: 100 }
const loops = [[[0, 0], [60, 0], [60, 20], [0, 20]]]
// const loops = [[[0, 0], [40, 0], [50, -10], [60, -10], [60, 20], [0, 20]]]

function create(loops, style, height, match, data, view) {
  const params = { style, height, match, floorHeight: 3, elevation: 0, seed: 0 }
  new Plan({ params, loops }).toRawModel(data, styles)
  view.refresh(data, { basicMaterial: false, greyScale: false, edge: true })
}

function createAll(view) {
  const data = { colorMap: [], models: [] }
  let i = 0
  let y = 0

  for (const style in styles.data) {
    const x = spacing.x * (i % countX)
    if (i % countX === 0) y = spacing.y * (i / countX)
    const newLoops = loops.map(loop => loop.map(pt => [pt[0] + x, pt[1] + y]))
    create(newLoops, style, height, match, data, view)
    i++
  }

  view.refresh(data, { basicMaterial: false, greyScale: false, edge: true })
  view.controls.target.set(spacing.x * (countX / 2), 0, -y / 2)
}
