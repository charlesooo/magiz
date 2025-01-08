import { Matrix4, Vector2, degToRad } from './_imports'
import {
  matchRatioAndCount,
  getBounds,
  sweepPolygonX,
  sSample,
  getValidIndexes,
} from './handleMath'

import type { magizTypes, styleParsed, temp } from './_imports'

export {
  TEMP,
  applyBasicTransform,
  handleBoxes,
  pushBoxData,
  edgeUnitToTempBoxes,
  edgeFlexToTempBoxes,
  matchUnitsToTempBoxRows,
}

/** 计算过程中的缓存矩阵 */
const TEMP = new Matrix4()

function edgeUnitToTempBoxes(
  params: { boxes: styleParsed.box[]; flexes: styleParsed.flexVertical[] },
  xRatio: number
): temp.box[] {
  const result: temp.box[] = []
  boxesToTempBoxes(result, params.boxes, xRatio)
  flexVerticalsToTempBoxes(result, params.flexes, xRatio)
  return result
}

function boxesToTempBoxes(result: temp.box[], params: styleParsed.box[], xRatio: number) {
  params.forEach((boxParams) => {
    let { widthX, depthY, heightZ } = boxParams
    if (widthX || depthY || heightZ) {
      const matrix = new Matrix4().makeTranslation(0, 0, 0.5)
      if (widthX < 0) widthX = -widthX
      if (depthY < 0) depthY = -depthY
      if (heightZ < 0) {
        matrix.premultiply(TEMP.makeTranslation(0, 0, -1))
        heightZ = -heightZ
      }
      matrix.premultiply(TEMP.makeScale(widthX * xRatio, depthY, heightZ))
      applyBasicTransform(boxParams, matrix)
      result.push({ matrix, color: boxParams.color })
    }
  })
}

function flexVerticalsToTempBoxes(
  result: temp.box[],
  params: styleParsed.flexVertical[],
  xRatio: number
) {
  params.forEach((flexParams) => {
    const { unitHeight, flexHeight, flexDepth, flexWidth, dash, shrink, seg } = flexParams

    const flexResult = getFlexResult(flexHeight, [unitHeight], seg, false, dash, shrink)

    // 将flexResult转为矩阵和颜色数据
    flexResult.forEach((u) => {
      const matrix = new Matrix4()
        .makeTranslation(0, 0, 0.5)
        .premultiply(TEMP.makeScale(flexWidth * xRatio, flexDepth, u.space))
      applyBasicTransform(flexParams, matrix)
      matrix.premultiply(TEMP.makeTranslation(0, 0, u.move))
      result.push({ matrix, color: flexParams.color })
    })
  })
}

function edgeFlexToTempBoxes(params: styleParsed.edgeFlex, distance: number) {
  const result: temp.box[] = []
  const { flexDepth, flexHeight, array, seg, sandwich, control, shrink } = params
  const flexResult = getFlexResult(distance, array, seg, sandwich, control, shrink)

  // 将flexResult转为矩阵和颜色数据
  flexResult.forEach((u) => {
    const matrix = new Matrix4()
      .makeTranslation(0.5, 0, flexHeight > 0 ? 0.5 : -0.5)
      .premultiply(TEMP.makeScale(u.space, Math.abs(flexDepth), Math.abs(flexHeight)))
    applyBasicTransform(params, matrix)
    matrix.premultiply(TEMP.makeTranslation(u.move, 0, 0))
    result.push({ matrix, color: params.color })
  })

  return result
}

function matchUnitsToTempBoxRows(
  params: styleParsed.flexMatchUnit[],
  lines: temp.line[],
  sandwich: boolean,
  simplify: boolean
): temp.box[][] {
  /** 按参数拟合平面，结果保存为 temp.lineSweepX[][] */
  function pushSweep(
    y: number,
    saveAs: temp.lineSweepX[][],
    lines: temp.line[],
    data: { depth: number; matchUnit: styleParsed.flexMatchUnit }
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
      const depthData: { depth: number; matchUnit: styleParsed.flexMatchUnit }[] = []
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
          const { flexHeight, color, shrink } = line.matchUnit
          const mtx = new Matrix4()
            .makeTranslation(0.5, 0, flexHeight > 0 ? 0.5 : -0.5)
            .premultiply(TEMP.makeScale(1, depth, Math.abs(flexHeight)))
          indentBoxFlexWidth(shrink, Math.abs(start.x - end.x), mtx).forEach((matrix) => {
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

/** 按生成的flexWidth偏移boxFlex，因indent可能生成两段 */
function indentBoxFlexWidth(
  params: styleParsed.indentType | undefined,
  width: number,
  matrix: Matrix4
): Matrix4[] {
  const result: Matrix4[] = []
  if (params) {
    const { central, asRatio, reverse, start, end } = params
    const wStart = asRatio ? width * start : start
    const wEnd = asRatio ? width * end : end
    if (reverse) {
      if (start) {
        const w = central ? width / 2 - wStart : wStart
        if (w > 0) result.push(matrix.clone().premultiply(TEMP.makeScale(w, 1, 1)))
      }
      if (end < width - start) {
        const w = central ? width / 2 - wEnd : wEnd
        const x = central ? width / 2 + wEnd : width - wEnd
        if (w > 0)
          result.push(
            matrix
              .clone()
              .premultiply(TEMP.makeScale(w, 1, 1))
              .premultiply(TEMP.makeTranslation(x, 0, 0))
          )
      }
    } else {
      const w = central ? wStart + wEnd : width - wStart - wEnd
      if (w > 0) {
        matrix.premultiply(TEMP.makeScale(w, 1, 1))
        if (start) {
          matrix.premultiply(TEMP.makeTranslation(central ? width / 2 - wStart : wStart, 0, 0))
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

/** 计算横向和竖向的拟合结果 */
function getFlexResult(
  distance: number,
  spaceArray: number[],
  asSegments: boolean,
  sandwich: boolean,
  control?: styleParsed.indexController,
  shrink?: styleParsed.indentType
) {
  const flexUnits: { move: number; space: number }[] = []
  // 竖向计算时为楼层生成方式，一般按层高，sandwich和endWidth可以忽略。水平计算时为立面生成方式，这两个参数才有用。考虑matchRatioAndCount的计算逻辑，可以完全通过sandwich控制
  const rc = matchRatioAndCount(spaceArray, distance, sandwich ? spaceArray[0]! : 0, sandwich)
  if (rc) {
    const validIndexes = getValidIndexes(rc.count * spaceArray.length, control)
    const totalCount = rc.count * spaceArray.length
    const spacesScaled = spaceArray.map((s) => s * rc.ratio)

    // 计算每段的相对起点和长度
    let move = 0
    let lastValidIndex = -1
    for (let i = 0; i < totalCount; i++) {
      const space = spacesScaled[i % spaceArray.length]!
      lastValidIndex = handleEdgeFlex(
        lastValidIndex,
        i,
        move,
        space,
        asSegments,
        validIndexes,
        flexUnits
      )
      move += space
    }

    if (sandwich && validIndexes[0] === 0) {
      handleEdgeFlex(
        lastValidIndex,
        totalCount,
        move,
        spacesScaled[0]!,
        asSegments,
        [totalCount],
        flexUnits
      )
    }
  }

  // 处理shrink，reverse和central可能产生新的段落
  if (shrink) {
    const result: { move: number; space: number }[] = []
    const { start, end, asRatio, central, reverse } = shrink
    flexUnits.forEach((u) => {
      if (reverse) {
        // start, end 表示保留
        if (central) {
          // 反向时保留中部
          if (start) {
            const startD = u.space / 2 - (asRatio ? u.space * start : start)
            u.move += startD
            u.space -= startD
          }
          if (end) {
            const endD = u.space / 2 - (asRatio ? u.space * end : end)
            u.space -= endD
          }
          result.push(u)
        } else {
          // 反向时保留两端为两段
          if (start) {
            result.push({
              move: u.move,
              space: asRatio ? u.space * start : start,
            })
          }
          if (end) {
            const space = asRatio ? u.space * end : end
            result.push({ move: u.move + u.space - space, space })
          }
        }
      } else {
        // start, end 表示剔除
        if (central) {
          // 从中间向两端剔除为两段
          const half = u.space / 2
          const startPart = { move: u.move, space: half }
          const endPart = { move: u.move + half, space: half }
          if (start) {
            startPart.space -= asRatio ? u.space * start : start
          }
          if (end) {
            const endD = asRatio ? u.space * end : end
            endPart.space -= endD
            endPart.move += endD
          }
          result.push(startPart)
          result.push(endPart)
        } else {
          // 剔除两端
          if (start) {
            const startD = asRatio ? u.space * start : start
            u.move += startD
            u.space -= startD
          }
          if (end) {
            const endD = asRatio ? u.space * end : end
            u.space -= endD
          }
          result.push(u)
        }
      }
    })

    // 排除可能产生的非正向段落
    return result.filter((r) => r.space > 0)
  } else {
    return flexUnits
  }
}

function handleEdgeFlex(
  lastValidIndex: number,
  i: number,
  move: number,
  space: number,
  asSegments: boolean,
  validIndexes: number[],
  flexUnits: { move: number; space: number }[]
) {
  if (validIndexes.find((vi) => vi === i) !== undefined) {
    if (flexUnits.length === 0) {
      flexUnits.push({ move, space })
    } else {
      const thisUnit = flexUnits[flexUnits.length - 1]!
      if (!asSegments && lastValidIndex === i - 1) {
        thisUnit.space += space
      } else {
        flexUnits.push({ move, space })
      }
    }
    lastValidIndex = i
  }
  return lastValidIndex
}
