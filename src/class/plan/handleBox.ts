import { Matrix4, Vector2 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { matchRatioAndCount, getBounds, sweepPolygonX, sSample, sRand } from './handleMath'

import type { temp } from '../../types/temp'
import type { styleParsed } from '../../types/stylesParsed'
import type { magizTypes } from '../../types/magizTypes'

export {
  TEMP,
  applyBasicTransform,
  handleBoxes,
  pushBoxData,
  getValidIndexes,
  edgeUnitToTempBoxes,
  flexEdgeToTempBoxes,
  matchUnitsToTempBoxRows,
}

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

function edgeUnitToTempBoxes(
  params: (styleParsed.box | styleParsed.flexVertical)[],
  xRatio: number
): temp.box[] {
  const result: temp.box[] = []
  params.forEach((element) => {
    'widthX' in element
      ? handleBoxParams(result, element, xRatio)
      : handleFlexVerticalParams(result, element, xRatio)
  })
  return result
}

function handleBoxParams(result: temp.box[], params: styleParsed.box, xRatio: number) {
  let { widthX, depthY, heightZ } = params
  if (widthX || depthY || heightZ) {
    const matrix = new Matrix4().makeTranslation(0, 0, 0.5)
    if (widthX < 0) widthX = -widthX
    if (depthY < 0) depthY = -depthY
    if (heightZ < 0) {
      matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
      heightZ = -heightZ
    }
    matrix.premultiply(TEMP.makeScale(widthX * xRatio, depthY, heightZ))
    applyBasicTransform(params, matrix)
    result.push({ matrix, color: params.color })
  }
}

function handleFlexVerticalParams(
  result: temp.box[],
  params: styleParsed.flexVertical,
  xRatio: number
) {
  const { unitHeight, totalHeight, flexDepth, flexwidth, dash } = params
  const vrc = matchRatioAndCount([unitHeight], totalHeight, unitHeight, false)
  if (vrc) {
    /** 根据参数合并未被替换的连续竖向box，计算最终的长度和标高 */
    const flexUnits: { moveZ: number; height: number }[] = []
    const validIndexes = getValidIndexes(vrc.count, dash)
    const height = unitHeight * vrc.ratio

    // 将参数转为垂直线段的全部标高和高度
    validIndexes.forEach((thisIndex, n) => {
      if (n === 0) {
        flexUnits.push({ moveZ: thisIndex * height, height })
      } else {
        const thisUnit = flexUnits[flexUnits.length - 1]!
        if (n > 0 && validIndexes[n - 1] === thisIndex - 1) {
          thisUnit.height += height
        } else {
          flexUnits.push({ moveZ: thisIndex * height, height })
        }
      }
    })

    // 将flexUnits转为矩阵和颜色数据
    flexUnits.forEach((u) => {
      const matrix = new Matrix4()
        .makeTranslation(0, 0, 0.5)
        .premultiply(TEMP.makeScale(flexwidth * xRatio, flexDepth, u.height))
      applyBasicTransform(params, matrix)
      matrix.premultiply(TEMP.makeTranslation(0, 0, u.moveZ))
      result.push({ matrix, color: params.color })
    })
  }
}

function matchUnitsToTempBoxRows(
  params: styleParsed.matchUnit[],
  lines: temp.line[],
  sandwich: boolean,
  simplify: boolean
): temp.box[][] {
  /** 按参数拟合平面，结果保存为 temp.lineSweepX[][] */
  function pushSweep(
    y: number,
    saveAs: temp.lineSweepX[][],
    lines: temp.line[],
    data: { depth: number; matchUnit: styleParsed.matchUnit }
  ) {
    const { depth, matchUnit } = data
    y += data.depth / 2
    saveAs.push(
      sweepPolygonX(y, lines).map((pair) => {
        return Object.assign(pair, {
          depth,
          matchUnit,
          statusJSON: JSON.stringify(matchUnit.trans) + JSON.stringify(matchUnit.color),
        })
      })
    )
    return y + depth / 2
  }

  const result: temp.box[][] = []
  const bounds = getBounds(lines.map((line) => line.start))
  if (bounds) {
    /** 处理matchUnit.count，生成间距序列 */
    const depths: number[] = []
    params.forEach((matchUnit) => {
      for (let i = 0; i < matchUnit.count; i++) depths.push(matchUnit.unitDepth)
    })

    // 计算沿Y轴的拟合次数和比例
    const rc = matchRatioAndCount(depths, bounds.max.y - bounds.min.y, depths[0]!, sandwich)

    if (rc) {
      const depthData: { depth: number; matchUnit: styleParsed.matchUnit }[] = []
      params.forEach((matchUnit) => {
        for (let i = 0; i < matchUnit.count; i++) {
          depthData.push({ matchUnit, depth: matchUnit.unitDepth * rc.ratio })
        }
      })
      // 计算沿X轴与平面重合的线段
      let rowsSweepX: temp.lineSweepX[][] = []
      let y = bounds.min.y
      for (let i = 0; i < rc.count; i++) {
        depthData.forEach((data) => {
          y = pushSweep(y, rowsSweepX, lines, data)
        })
      }

      if (sandwich) {
        pushSweep(y, rowsSweepX, lines, depthData[0]!)
      }

      if (simplify) rowsSweepX = simplifySweepX(rowsSweepX)

      rowsSweepX.forEach((row) => {
        const newRow: temp.box[] = []
        row.map((line) => {
          const { depth, start, end } = line
          const { flexHeight, color, indentWidth } = line.matchUnit
          const mtx = new Matrix4()
            .makeTranslation(0.5, 0, flexHeight > 0 ? 0.5 : -0.5)
            .premultiply(TEMP.makeScale(1, depth, Math.abs(flexHeight)))
          indentBoxFlexWidth(indentWidth, Math.abs(start.x - end.x), mtx).forEach((matrix) => {
            applyBasicTransform(line.matchUnit, matrix)
            matrix.premultiply(TEMP.makeTranslation(start.x, start.y, 0))
            newRow.push({ matrix, color })
          })
        })
        result.push(newRow)
      })
    }
  }
  return result
}

function simplifySweepX(rowsSweepX: temp.lineSweepX[][]) {
  /** 因浮点计算，须低精度比较大小 */
  function isSame(a: number, b: number) {
    const precision = 6
    return a.toFixed(precision) === b.toFixed(precision)
  }

  const result: temp.lineSweepX[][] = []
  rowsSweepX.forEach((row, i) => {
    if (i === 0) {
      result.push(row)
    } else {
      const lastRow = result[result.length - 1]!
      row.forEach((line) => {
        const thisRow: temp.lineSweepX[] = []
        const same = lastRow.find(
          (lastLine) =>
            isSame(lastLine.start.x, line.start.x) &&
            isSame(lastLine.end.x, line.end.x) &&
            isSame(lastLine.matchUnit.flexHeight, line.matchUnit.flexHeight) &&
            lastLine.statusJSON === line.statusJSON
        )

        if (same) {
          const moveY = line.depth / 2
          same.start.y += moveY
          same.end.y += moveY
          same.depth += line.depth
        } else {
          thisRow.push(line)
        }
        if (thisRow.length > 0) result.push(thisRow)
      })
    }
  })

  return result
}

function flexEdgeToTempBoxes(params: styleParsed.flexEdge, distance: number) {
  const result: temp.box[] = []
  const { dash, flexDepth, flexHeight, unitWidth } = params
  const rc = matchRatioAndCount([unitWidth], distance, unitWidth, false)
  if (rc) {
    const flexUnits: { move: number; width: number }[] = []
    const validIndexes = getValidIndexes(rc.count, dash)
    const width = unitWidth * rc.ratio

    // 将参数转为垂直线段的全部长度和起点距离
    validIndexes.forEach((thisIndex, n) => {
      if (n === 0) {
        flexUnits.push({ move: thisIndex * width, width })
      } else {
        const thisUnit = flexUnits[flexUnits.length - 1]!
        if (n > 0 && validIndexes[n - 1] === thisIndex - 1) {
          thisUnit.width += width
        } else {
          flexUnits.push({ move: thisIndex * width, width })
        }
      }
    })

    // 将flexUnits转为矩阵和颜色数据
    flexUnits.forEach((u) => {
      const matrix = new Matrix4()
        .makeTranslation(0.5, 0, flexHeight > 0 ? 0.5 : -0.5)
        .premultiply(TEMP.makeScale(u.width, Math.abs(flexDepth), Math.abs(flexHeight)))
      applyBasicTransform(params, matrix)
      matrix.premultiply(TEMP.makeTranslation(u.move, 0, 0))
      result.push({ matrix, color: params.color })
    })
  }

  return result
}

function handleBoxes(
  /** 推送可序列化数据到结果 */
  result: magizTypes.rawBuilding,
  /** 参数 */
  boxes: styleParsed.box[],
  /** 在每个标高生成一次 */
  elevations: number[],
  /** 生成的位置 */
  point: Vector2
) {
  boxes.forEach((box) => {
    const mtx = new Matrix4()
      .makeTranslation(0, 0, 0.5)
      .premultiply(TEMP.makeScale(box.widthX, box.depthY, box.heightZ))
    applyBasicTransform(box, mtx)

    elevations.forEach((elevation) => {
      pushBoxData(
        result,
        box.color,
        mtx.premultiply(TEMP.makeTranslation(point.x, point.y, elevation))
      )
    })
  })
}

/** 将 instancedBox 数据推送到结果 */
function pushBoxData(
  saveAs: magizTypes.rawBuilding,
  color: styleParsed.colorDataType[],
  matrix: Matrix4
) {
  const { index, glass } = sSample(color)!
  const target: magizTypes.instancedData = saveAs.instanced[glass ? 'boxGlass' : 'box']
  target.colors.push(index)
  target.matrices.push(matrix.toArray())
}

/** 基于种子和控制器，计算需生成元素的序号 */
function getValidIndexes(count: number, control: styleParsed.indexController | undefined) {
  function pushPassedIndexes(
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

  const result: number[] = []
  if (control) {
    const { total, indent } = control
    if (total > 0) count = total
    if (indent) {
      indentIndexes(count, indent, (i) => pushPassedIndexes(control, result, i))
    } else {
      for (let i = 0; i < count; i++) pushPassedIndexes(control, result, i)
    }
  } else {
    for (let i = 0; i < count; i++) result.push(i)
  }
  return result
}

function indentIndexes(
  total: number,
  indent: styleParsed.indentType,
  handleValidIndex: (i: number) => void
) {
  let startID = 0
  let endID = total - 1
  const { fromCenter, asRatio, reverse, start, end } = indent

  if (start) {
    const dStart = asRatio ? Math.round(total * start) : start
    startID = fromCenter ? Math.round((total - 1) / 2.0 - dStart) : dStart
  }
  if (end) {
    const dEnd = asRatio ? Math.round(total * end) : end
    endID = fromCenter ? Math.round((total - 1) / 2.0 + dEnd) : total - 1 - dEnd
  }

  if (reverse) {
    for (let i = 0; i < startID; i++) handleValidIndex(i)
    for (let i = endID + 1; i < total; i++) handleValidIndex(i)
  } else {
    for (let i = startID; i <= endID; i++) handleValidIndex(i)
  }
}

/** 按生成的flexWidth偏移boxFlex，因indent可能生成两段 */
function indentBoxFlexWidth(
  params: styleParsed.indentType | undefined,
  width: number,
  matrix: Matrix4
): Matrix4[] {
  const result: Matrix4[] = []
  if (params) {
    const { fromCenter, asRatio, reverse, start, end } = params
    const wStart = asRatio ? width * start : start
    const wEnd = asRatio ? width * end : end
    if (reverse) {
      if (start) {
        const w = fromCenter ? width / 2 - wStart : wStart
        if (w > 0) result.push(matrix.clone().premultiply(TEMP.makeScale(w, 1, 1)))
      }
      if (end < width - start) {
        const w = fromCenter ? width / 2 - wEnd : wEnd
        const x = fromCenter ? width / 2 + wEnd : width - wEnd
        if (w > 0)
          result.push(
            matrix
              .clone()
              .premultiply(TEMP.makeScale(w, 1, 1))
              .premultiply(TEMP.makeTranslation(x, 0, 0))
          )
      }
    } else {
      const w = fromCenter ? wStart + wEnd : width - wStart - wEnd
      if (w > 0) {
        matrix.premultiply(TEMP.makeScale(w, 1, 1))
        if (start) {
          matrix.premultiply(TEMP.makeTranslation(fromCenter ? width / 2 - wStart : wStart, 0, 0))
        }
        result.push(matrix)
      }
    }
  } else {
    result.push(matrix.premultiply(TEMP.makeScale(width, 1, 1)))
  }
  return result
}

/** 应用 styleParsed.status.transform 到 matrix */
function applyBasicTransform(status: styleParsed.status, matrix: Matrix4): void {
  status.trans?.forEach((transform) => {
    if ('rotateX' in transform) {
      matrix.premultiply(TEMP.makeRotationX(degToRad(transform.rotateX)))
    } else if ('rotateY' in transform) {
      matrix.premultiply(TEMP.makeRotationY(degToRad(transform.rotateY)))
    } else if ('rotateZ' in transform) {
      matrix.premultiply(TEMP.makeRotationZ(degToRad(transform.rotateZ)))
    } else {
      matrix.premultiply(TEMP.makeTranslation(transform.moveX, transform.moveY, transform.moveZ))
    }
  })
}
