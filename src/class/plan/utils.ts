import { Matrix4 } from 'three'
import { sRand, sSample } from './handleMath'
import { indentIndexes } from './handleIdent'

import type { styleParsed } from '../../types/stylesParsed'
import type { magizTypes } from '../../types/magizTypes'

export { getValidIndexes, pushBoxData }

/** 基于种子和控制器，计算需生成元素的序号 */
function getValidIndexes(count: number, control: styleParsed.indexController | undefined) {
  const result: number[] = []
  if (control) {
    const { total, indent } = control
    if (total > 0) count = total
    if (indent) {
      indentIndexes(count, indent, (i) => pushPassed(control, result, i))
    } else {
      for (let i = 0; i < count; i++) pushPassed(control, result, i)
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

/** 将 instancedBox 数据推送到结果 */
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
