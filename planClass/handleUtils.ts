import { rand } from './handleMath'
export { passControl, SEED }

/** 是否通过生成控制器检查 */
function passControl(i: number, seed: SEED, control?: parsed.control) {
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

class SEED {
  /** 递增值 */
  v: number
  /** 预设值，用于重置 */
  _v: number
  constructor(x?: number) {
    this.v = this._v = x || randNum()
  }
  /** 递增数值并返回 */
  get() {
    return this.v++
  }
  /** 重置为指定数值，或随机值 */
  set(x?: number) {
    this.v = this._v = x || randNum()
  }
  /** 重置递增数值为原数值 */
  reset() {
    this.v = this._v
  }
}

function randNum() {
  return Math.round(Math.random() * Math.pow(10, 3))
}
