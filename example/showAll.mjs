import { Plan, styles } from '../dist/magiz.module.min.js'
export { showAll }

const height = 50
const match = 0
const countX = 5
const spacing = { x: 100, y: 100 }
const loops = [[[0, 0], [60, 0], [60, 20], [0, 20]]]
// const loops = [[[0, 0], [40, 0], [50, -10], [60, -10], [60, 20], [0, 20]]]

const planParams = { style: '', height, match, floorHeight: 3, elevation: 0, seed: 0 }
const generateParams = { basicMaterial: false, greyScale: false, edge: true, inplace: true }

/** 按库中的全部样式生成模型 */
function showAll(handler, repeat = 0) {
  let i = 0
  let iy = 0

  for (let r = 0; r < repeat + 1; r++) {
    for (const style in styles.data) {
      const ix = spacing.x * (i % countX)
      if (i % countX === 0) iy = spacing.y * (i / countX)
      const newLoops = loops.map(loop => loop.map(pt => [pt[0] + ix, pt[1] + iy]))
      planParams.style = style
      const model = new Plan({ params: planParams, loops: newLoops }).toModel(styles, generateParams)

      // console.log(model);

      handler.scene.add(model)
      i++
    }
  }

  handler.controls.target.set(spacing.x * (countX / 2), 0, -iy / 2)
}


