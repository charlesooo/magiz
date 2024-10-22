import { Matrix4 } from 'three'
import { rand } from './handleMath'

import type { styleParsed } from '../types/stylesParsed'
import type { magizTypes } from '../types/magizTypes'

export { Seed, passControl, pushInstancedData, sample }

/** 自增随机数种子 */
class Seed {
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

/** 是否通过生成控制器检查 */
function passControl(i: number, seed: Seed, control?: styleParsed.control) {
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

/** 生成一个100以内的随机整数 */
function rand100() {
  return Math.round(Math.random() * Math.pow(10, 3))
}

function pushInstancedData(
  saveAs: magizTypes.rawBuilding,
  seed: Seed,
  colorID: styleParsed.colorDataType[],
  matrix: Matrix4
) {
  const { index, glass } = sample(colorID, seed)!
  const target: magizTypes.instancedData = saveAs.instanced[glass ? 'boxGlass' : 'box']
  target.colors.push(index)
  target.matrices.push(matrix.toArray())
}

/** 数组随机采样。如果数量小于2直接返回 a[0]。如果有种子则按种子随机数采样 */
function sample<T>(a: T[], seed: Seed) {
  let i = Math.floor(rand(seed) * a.length)
  return a[i < a.length ? i : 0]
}
