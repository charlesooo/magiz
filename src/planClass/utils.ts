import { rand } from './handleMath'

import type { styleParsed } from '../types/stylesParsed'

export { passControl, SEED, getCenterOfPlans }

/** 是否通过生成控制器检查 */
function passControl(i: number, seed: SEED, control?: styleParsed.control) {
  let pass = true
  if (control) {
    const { everyIndex, skipIndex, chance } = control
    if (
      (everyIndex && i % everyIndex !== 0) ||
      (skipIndex && i % skipIndex === 0) ||
      (chance && rand(seed) > chance)
    ) {
      pass = false
    }
  }
  return pass
}

/** 自增随机数种子 */
class SEED {
  /** 递增值 */
  v: number
  /** 预设值，用于重置 */
  _v: number
  constructor(x?: number) {
    this.v = this._v = x || rand100()
  }
  /** 递增数值并返回 */
  get() {
    return this.v++
  }
  /** 重置为指定数值，或随机值 */
  set(x?: number) {
    this.v = this._v = x || rand100()
  }
  /** 重置递增数值为原数值 */
  reset() {
    this.v = this._v
  }
}

/** 生成一个100以内的随机整数 */
function rand100() {
  return Math.round(Math.random() * Math.pow(10, 3))
}

/** 计算多个平面的中心点 */
function getCenterOfPlans(plans: [x: number, y: number][][][]) {
  let count = 0
  const center: { x: number; y: number } = { x: 0, y: 0 }
  plans.forEach((plan) => {
    plan.forEach((loop) =>
      loop.forEach((pt) => {
        center.x += pt[0]
        center.y += pt[1]
        count++
      })
    )
  })
  center.x /= count
  center.y /= count
  return center
}
