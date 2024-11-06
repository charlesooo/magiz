import { Vector2 } from 'three'

import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from 'src/types/temp'

export { indentIndexes, indentRays, indentBoxFlexWidth, indentBounds }

function indentIndexes(
  total: number,
  indent: styleParsed.indentType,
  handleValidIndex: (i: number) => void
) {
  let startID = 0
  let endID = total - 1
  const { asRatio, reverse, start, end } = indent
  if (start) startID = asRatio ? Math.round(total * start) : start
  if (end) endID = asRatio ? endID - Math.round(total * end) : endID - end
  if (reverse) {
    for (let i = 0; i < startID; i++) handleValidIndex(i)
    for (let i = endID + 1; i < total; i++) handleValidIndex(i)
  } else {
    for (let i = startID; i <= endID; i++) handleValidIndex(i)
  }
}

function indentRays(rays: temp.ray[], indent: styleParsed.indentType): temp.ray[] {
  const { asRatio, reverse, start, end } = indent
  const result: temp.ray[] = []
  rays.forEach((ray) => {
    const distance = ray.direction.length()
    const dStart = asRatio ? distance * start : start
    const dEnd = asRatio ? distance * start : start
    // 反向操作均生成新数据，正向操作修改原数据
    if (reverse) {
      if (start) {
        const direction = ray.direction.clone().setLength(dStart)
        result.push({
          start: ray.start.clone(),
          end: ray.start.clone().add(direction),
          direction,
        })
      }
      if (end) {
        const direction = ray.direction.clone().setLength(dEnd)
        result.push({
          start: ray.end.clone().add(direction.clone().negate()),
          end: ray.end.clone(),
          direction,
        })
      } else if (start) {
        ray.end.copy(ray.direction.clone().setLength(-dEnd))
      } else if (end) {
      }
    } else {
      if (start) ray.start.add(ray.direction.clone().setLength(dStart))
      if (end) ray.end.add(ray.direction.clone().setLength(-dEnd))
      result.push(ray)
    }
  })
  return result
}

/** 按生成的flexWidth偏移boxFlex，因indent可能生成两段 */
function indentBoxFlexWidth(inputBoxFlex: styleParsed.boxFlex, flexWidth: number) {
  const result: { boxFlex: styleParsed.boxFlex; boxWidth: number }[] = []
  if (inputBoxFlex.indentWidth) {
    const { asRatio, reverse, start, end } = inputBoxFlex.indentWidth
    const dStart = asRatio ? flexWidth * start : start
    const dEnd = asRatio ? flexWidth * end : end
    // 正反向操作均生成新数据
    if (reverse) {
      if (start) {
        result.push({ boxFlex: { ...inputBoxFlex }, boxWidth: dStart })
      }
      if (end) {
        const boxFlex = { ...inputBoxFlex }
        boxFlex.transform = [...boxFlex.transform, { moveX: flexWidth - dEnd, moveY: 0, moveZ: 0 }]
        result.push({ boxFlex, boxWidth: dEnd })
      }
    } else {
      if (start) {
        const boxFlex = { ...inputBoxFlex }
        boxFlex.transform = [...boxFlex.transform, { moveX: dStart, moveY: 0, moveZ: 0 }]
        result.push({ boxFlex, boxWidth: flexWidth - dStart })
      }
      if (end) {
        result.push({ boxFlex: { ...inputBoxFlex }, boxWidth: flexWidth - dEnd })
      }
    }
  } else {
    result.push({ boxFlex: { ...inputBoxFlex }, boxWidth: flexWidth })
  }
  return result
}

/** 偏移定界框 */
function indentBounds(
  bounds: { min: Vector2; max: Vector2 }[],
  indent: styleParsed.indentType,
  along: 'x' | 'y'
) {
  const result: { min: Vector2; max: Vector2 }[] = []
  const { asRatio, reverse, start, end } = indent
  bounds.forEach((bound) => {
    const distance = Math.abs(
      along === 'x' ? bound.max.x - bound.min.x : bound.max.y - bound.min.y
    )
    const dStart = start ? (asRatio ? start * distance : start) : 0
    const dEnd = end ? (asRatio ? end * distance : end) : 0
    // 反向操作均生成新数据，正向操作修改原数据
    if (reverse) {
      if (start) {
        const newBound = { min: bound.min.clone(), max: bound.max.clone() }
        newBound.max[along] = bound.min[along] + dStart
        result.push(newBound)
      }
      if (end) {
        const newBound = { min: bound.min.clone(), max: bound.max.clone() }
        newBound.min[along] = newBound.max[along] - dEnd
        result.push(newBound)
      }
    } else {
      bound.min[along] += dStart
      bound.max[along] -= dEnd
      result.push(bound)
    }
  })

  return result
}
