import Mexp from 'math-expression-evaluator'
import { COLOR } from '../../color'

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
  parseBox,
  parseVerticalBoxes,
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

function formatColor(color?: string | string[]): { index: number; glass: boolean }[] {
  const a = Array.isArray(color) ? color : [color]
  return a.map((x) => {
    let c = x ? x.trim() : COLOR.CONCRETE
    if (c === 'G') c = COLOR.GLASS
    const cv = c.replace(/ *G$/, '')

    // 颜色先加入 colorMap 再从中索引
    let index = RESULT.colorMapPTR.indexOf(cv)
    if (index < 0) {
      index = RESULT.colorMapPTR.length
      RESULT.colorMapPTR.push(cv)
    }
    return { index, glass: /G$/.test(c) }
  })
}

/** 解析包含 styleTypes.status 的参数 */
function parseStatus<MORE>(status: styleTypes.status, data: MORE): styleParsed.status & MORE {
  let c = status.color
  // c 可能为预设的颜色名称，先进行解析
  if (typeof c === 'string') c = PRESET.COLOR?.[c] || c
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
      color: formatColor(c),
    },
    data
  )
}

function parseBox(b: styleTypes.box): styleParsed.box {
  return parseStatus(b, {
    widthX: parse(b.widthX),
    depthY: parse(b.depthY),
    heightZ: parse(b.heightZ),
  })
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
