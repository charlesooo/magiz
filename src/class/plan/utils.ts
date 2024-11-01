import { Matrix4 } from 'three'
import { sRand, sSample } from './handleMath'

import type { styleParsed } from '../../types/stylesParsed'
import type { magizTypes } from '../../types/magizTypes'

export { indexesPassedControl, pushBoxData }

/** 基于种子和控制器，计算需生成元素的序号 */
function indexesPassedControl(count: number, control?: styleParsed.indexController) {
  const result: number[] = []
  if (control) {
    const { total, asRatio, reverse, first, last } = control
    if (total > 0) count = total
    const f = asRatio ? Math.round(count * first) : first
    const l = asRatio ? Math.round(count - count * last) : count - last
    if (reverse) {
      for (let i = 0; i < f; i++) pushPassed(control, result, i)
      for (let i = l; i < count; i++) pushPassed(control, result, i)
    } else {
      for (let i = f; i < l; i++) pushPassed(control, result, i)
    }
  } else {
    for (let i = 0; i < count; i++) result.push(i)
  }

  return result
}

function pushPassed(
  controls: { every: number; skip: number; chance: number },
  result: number[],
  i: number
) {
  const { every, skip, chance } = controls
  if (every > 0) {
    if (i % every !== 0) result.push(i)
  } else if (skip > 0) {
    if (i % skip === 0) result.push(i)
  } else if (chance > 0) {
    if (sRand() < chance) result.push(i)
  } else {
    result.push(i)
  }
}

function pushBoxData(
  saveAs: magizTypes.rawBuilding,
  colorID: styleParsed.colorDataType[],
  matrix: Matrix4
) {
  const { index, glass } = sSample(colorID)!
  const target: magizTypes.instancedData = saveAs.instanced[glass ? 'boxGlass' : 'box']
  target.colors.push(index)
  target.matrices.push(matrix.toArray())
}
