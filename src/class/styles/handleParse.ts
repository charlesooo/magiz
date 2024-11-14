import Mexp from 'math-expression-evaluator'
import { presetColors } from './color'

import type { styleTypes } from '../../types/styleTypes'
import type { styleParsed } from '../../types/stylesParsed'

export {
  MAIN,
  PRESET,
  RESULT,
  parse,
  parseStatus,
  parseIndent,
  parseControl,
  parseClamp,
  parseEdgeParams,
  parseEdgeUnits,
  parseFlexEdge,
  parseBox,
  parseBoxes,
}

const evaluator = new Mexp()

/** 解析时全局缓存的字典 */
const MAIN: { UNITS: { [k: string]: number } } = { UNITS: {} }
const PRESET: {
  UNITS?: { [k: string]: number }
  COLOR?: { [k: string]: string | string[] }
} = {
  UNITS: undefined,
  COLOR: undefined,
}

/** 全局缓存的解析结果，以便拆分函数 */
const RESULT: styleParsed.result = {
  colorMapPTR: [],
  floorCount: 0,
  classified: {},
}

/** 解析带单位的公式。 */
function parse(ns?: styleTypes.ns): number {
  let n: number
  if (typeof ns === 'string') {
    // 计算单位值
    ns = replaceUnit(ns, MAIN.UNITS)
    ns = replaceUnit(ns, PRESET.UNITS)

    try {
      n = evaluator.eval(ns)
      // n = eval(ns)
    } catch (error) {
      console.log('[parse fomula]', error, ns)
      n = 0
    }
  } else {
    n = ns || 0
  }

  return n
}

/** 替换单位值，单位必以数字开头字母结尾 */
function replaceUnit(input: string, units?: styleParsed.unitType) {
  if (units) {
    // 优先解析长字符的变量，防止"变量A"先于"变量AB"解析导致后者错误
    const keys = Object.keys(units).sort((a, b) => b.length - a.length)
    keys.forEach((k) => {
      input = input.replace(new RegExp(`\\d+(\\.\\d+)?${k}`, 'g'), (m) => {
        const u = Number(units[k])
        return (Number(m.replace(k, '')) * u).toString()
      })
    })
  }
  return input
}

function parseIndent(params?: styleTypes.indentType): styleParsed.indentType | undefined {
  return params
    ? {
        start: parse(params.start),
        end: parse(params.end),
        fromCenter: params.fromCenter || false,
        asRatio: params.asRatio || false,
        reverse: params.reverse || false,
      }
    : undefined
}

/** 解析包含 styleTypes.status 的参数 */
function parseStatus<MORE>(status: styleTypes.status, data: MORE): styleParsed.status & MORE {
  let c = status.color
  // c 可能为预设的颜色名称，先进行解析
  if (typeof c === 'string') c = PRESET.COLOR?.[c] || c
  // 非string[]时，格式化为默认的颜色名称，特殊情况如：空值|""|"G"
  const colors = Array.isArray(c)
    ? c.map((str) => str.trim())
    : !c
    ? ['_CONCRETE']
    : c === 'G'
    ? ['_GLASS']
    : [c.trim()]
  return Object.assign(
    {
      trans: status.trans
        ? status.trans.map((transform) => {
            if ('rotateX' in transform) {
              return { rotateX: parse(transform.rotateX) }
            } else if ('rotateY' in transform) {
              return { rotateY: parse(transform.rotateY) }
            } else if ('rotateZ' in transform) {
              return { rotateZ: parse(transform.rotateZ) }
            } else {
              return {
                moveX: parse(transform.moveX),
                moveY: parse(transform.moveY),
                moveZ: parse(transform.moveZ),
              }
            }
          })
        : [],
      color: colors.map((c) => {
        const isPresetGlass = c === '_GLASS'
        const cv =
          isPresetGlass ||
          c === '_CONCRETE' ||
          c === '_METAL' ||
          c === '_WOOD' ||
          c === '_BRICK' ||
          c === '_ROOF'
            ? presetColors.face[c]
            : c.replace(/ *G$/, '')
        if (!/^#/.test(cv)) console.log(colors, status, data)

        // 颜色先加入 colorMap 再从中索引
        let index = RESULT.colorMapPTR.indexOf(cv)
        if (index < 0) {
          index = RESULT.colorMapPTR.length
          RESULT.colorMapPTR.push(cv)
        }
        return { index, glass: isPresetGlass || /G$/i.test(c) }
      }),
    },
    data
  )
}

// function parseReplace(
//   replace?: styleTypes.replaceBoxEnum
// ): styleParsed.replaceBoxEnum | undefined {
//   if (replace) {
//     return {
//       chance: parse(replace.chance),
//       with: replace.with.map((w) => ('widthX' in w ? parseBox(w) : parseBoxFlex(w))),
//     }
//   } else return undefined
// }

// function parseBoxEnums(boxEnums?: styleTypes.arrayUnit['boxes']): styleParsed.arrayUnit['boxes'] {
//   return boxEnums
//     ? boxEnums.map((b) => {
//         if ('widthX' in b) {
//           return { ...parseBox(b), replace: parseReplace(b.replace) }
//         } else {
//           return { ...parseBoxFlex(b), replace: parseReplace(b.replace) }
//         }
//       })
//     : []
// }

// function parseBoxFlex(b: styleTypes.boxFlex): styleParsed.boxFlex {
//   return parseStatus(b, {
//     flexDepth: parse(b.flexDepth),
//     flexHeight: parse(b.flexHeight),
//     indentWidth: parseIndent(b.indentWidth),
//   })
// }

function parseBox(b: styleTypes.box): styleParsed.box {
  return parseStatus(b, {
    widthX: parse(b.widthX),
    depthY: parse(b.depthY),
    heightZ: parse(b.heightZ),
  })
}

function parseBoxes(bs?: styleTypes.box[]): styleParsed.box[] {
  return bs?.map(parseBox) || []
}

function parseVerticalBoxes(
  boxes?: (styleTypes.box | styleTypes.flexVertical)[]
): (styleParsed.box | styleParsed.flexVertical)[] {
  return boxes
    ? boxes.map((x) => {
        if ('widthX' in x) {
          return parseBox(x)
        } else {
          return parseStatus(x, {
            unitHeight: parse(x.unitHeight),
            totalHeight: parse(x.totalHeight),
            flexDepth: parse(x.flexDepth),
            flexwidth: parse(x.flexwidth),
            dash: parseControl(x.dash)!,
          })
        }
      })
    : []
}

function parseEdgeUnits(params: styleTypes.edgeUnit[]): styleParsed.edgeUnit[] {
  return params.map((unit) => {
    const { replace } = unit
    return {
      space: parse(unit.space),
      boxes: parseVerticalBoxes(unit.boxes),
      replace: replace
        ? { chance: parse(replace.chance), with: parseVerticalBoxes(replace.with) }
        : undefined,
      count: parse(unit.count) || 1,
    }
  })
}

function parseFlexEdge(params: styleTypes.flexEdge): styleParsed.flexEdge {
  return parseStatus(params, {
    unitWidth: parse(params.unitWidth),
    flexDepth: parse(params.flexDepth),
    flexHeight: parse(params.flexHeight),
    dash: parseControl(params.dash)!,
  })
}

/** 解析 styleTypes.floor 中边线相关的参数 */
function parseEdgeParams(params?: styleTypes.handleEdge[]): styleParsed.handleEdge[] {
  const result: styleParsed.handleEdge[] = []
  params?.forEach((handleEdge) => {
    const { offset, along, clamp, indent } = handleEdge
    if (offset) {
      result.push({ offset: parseOffsetEdge(offset) })
    } else if (along) {
      result.push({ along })
    } else if (clamp) {
      result.push({ clamp: parseClamp(clamp) })
    } else if (indent) {
      result.push({ indent: parseIndent(indent) })
    }
  })
  return result
}

/** 解析偏移边线参数 */
function parseOffsetEdge(
  params: styleTypes.handleEdge['offset']
): styleParsed.handleEdge['offset'] {
  if (typeof params === 'object') {
    return {
      x: parse(params.x),
      y: parse(params.y),
      asRatio: params.asRatio || false,
    }
  } else {
    const x = parse(params)
    return { x, y: x, asRatio: false }
  }
}

function parseClamp(params?: styleTypes.clampType): styleParsed.clampType | undefined {
  return params
    ? {
        startX: parse(params.startX),
        startY: parse(params.startY),
        endX: parse(params.endX),
        endY: parse(params.endY),
        asRatio: params.asRatio || false,
        reverse: params.reverse || false,
      }
    : undefined
}

function parseControl(
  params?: styleTypes.indexController
): styleParsed.indexController | undefined {
  return params
    ? {
        total: parse(params.total),
        indent: parseIndent(params.indent),
        skip: parse(params.skip),
        every: parse(params.every),
        chance: parse(params.chance),
      }
    : undefined
}
