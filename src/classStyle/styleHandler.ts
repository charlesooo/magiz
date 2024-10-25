import Mexp from 'math-expression-evaluator'
import { sample, Seed, passControl } from '../classPlan/utils'
import { presetColors } from './color'
import { mergeStyles } from './merge'

import type { magizTypes } from '../types/magizTypes'
import type { styleTypes } from '../types/styleTypes'
import type { styleParsed } from '../types/stylesParsed'

export { StyleHandler }

const evaluator = new Mexp()

/** 解析时全局缓存的字典 */
const GLOBAL: {
  UNITS: { [k: string]: number }
  UNITS_PRESET: { [k: string]: number }
  COLOR_PRESET: { [k: string]: string | string[] }
} = {
  UNITS: {},
  UNITS_PRESET: {},
  COLOR_PRESET: {},
}

/** 全局缓存的解析结果，以便拆分函数 */
const RESULT: styleParsed.result = {
  colorMapPTR: [],
  floorCount: 0,
  classifiedByEdge: [],
}

/** 用于管理多个样式文件的样式库类 */
class StyleHandler {
  /** 受保护的默认样式 Blocks */
  Blocks: styleTypes.style
  /** 整合后的样式参数 */
  data: styleTypes.styles

  /** 创建样式库实例，输入的样式将自动整合 */
  constructor(
    /** 输入多个样式参数并整合 */
    ...styles: styleTypes.styles[]
  ) {
    this.Blocks = {
      type: 'FREE',
      section: {
        bottom: {
          height: '1BH',
          floor: [{ extrude: [{ once: true, height: '1BH' }] }],
        },
      },
    }
    this.data = { preset: {}, building: {} }
    this.merge(styles)
  }

  /** 输入注册状态，检查样式是否可用 */
  isValid(name: string, regState: boolean) {
    if (name === 'Blocks') {
      return true
    } else {
      const found = this.data.building[name]
      return found && (found.type === 'FREE' || regState) ? true : false
    }
  }

  /** 合并样式参数（会提示被替换的项） */
  merge(a: styleTypes.styles[]): styleTypes.styles {
    mergeStyles(this.data, a)
    return this.data
  }

  /** @ignore 按是否免费返回分类后的样式名称 */
  getOptions(): magizTypes.styleOptions {
    const result: magizTypes.styleOptions = { paid: [], free: ['Blocks'] }
    const b = this.data.building
    for (const n in b) {
      b[n]!.type === 'FREE' ? result.free.push(n) : result.paid.push(n)
    }
    return result
  }

  /** 根据输入参数和随机种子解析样式。优先按custom解析 */
  parseStyle(
    /** 控制解析的参数 */
    styleParams: magizTypes.styleParams,
    /** 全局共用随机种子以避免碰撞 */
    globalSeed: Seed,
    /** 全局缓存 colorMap 以便生成多个时正确索引 */
    globalColorMap: string[]
  ): styleParsed.result {
    RESULT.colorMapPTR = globalColorMap
    RESULT.floorCount = 0
    RESULT.classifiedByEdge = []

    // 确保输入的参数为数字
    const height = Number(styleParams.height)
    // 部分参数具有默认值
    const floorHeight = Number(styleParams.floorHeight || 3)
    const elevation = Number(styleParams.elevation || 0)

    // 设置随机数种子
    globalSeed.set(Number(styleParams.seed || 0) || Math.round(Math.random() * 100000))

    const styleSelected =
      !styleParams.style || styleParams.style === 'Blocks'
        ? this.Blocks
        : this.data.building[styleParams.style]

    if (styleSelected) {
      /** 内部全局变量，保存解析公式所需的单位 */
      GLOBAL.UNITS = Object.assign({ BH: height, FH: floorHeight }, styleSelected.unit)

      const ss = styleSelected.section

      const rsh = parse(ss.roof?.height)
      const rfh = parse(ss.roof?.floorHeight) || floorHeight
      // 先估算底部高度，按比例计算时初始值最小不小于层高
      let bsh = parse(ss.bottom.height)
      let bfh = parse(ss.bottom.floorHeight) || floorHeight
      if (bsh < bfh) bsh = bfh
      // 中段按层数拟合，高度可变
      let msh = height - rsh - bsh
      const mfh = parse(ss.middle?.floorHeight) || floorHeight
      const middleFloors = Math.floor(msh / mfh)
      msh = middleFloors * mfh
      // 底部段高和层高最终根据中部拟合高度确定
      bsh = height - rsh - msh
      bfh = bsh / Math.floor(bsh / bfh)

      parseSection('bottom', ss, this, elevation, bsh, bfh, globalSeed)
      parseSection('middle', ss, this, elevation + bsh, msh, mfh, globalSeed)
      parseSection('roof', ss, this, elevation + height - rsh, rsh, rfh, globalSeed)
    } else {
      console.warn(`${styleParams.style} is invalid, returned empty data`)
    }

    // 解析完成后清理 custom
    return RESULT
  }
}

//////////////////////////////////////////////////////////

/** 解析包含 styleTypes.status 的参数 */
function parseStatus<MORE>(status: styleTypes.status, data: MORE): styleParsed.status & MORE {
  let c = status.color
  // c 可能为预设的颜色名称，先进行解析
  if (typeof c === 'string') c = GLOBAL.COLOR_PRESET[c] || c
  // 格式化为默认的颜色名称，特殊情况如：空值|""|"G"
  if (typeof c === 'string') c = c.trim()
  const colors = Array.isArray(c) ? c : !c ? ['_CONCRETE'] : c === 'G' ? ['_GLASS'] : [c]
  return Object.assign(
    {
      transform: status.transform
        ? status.transform.map((trans) => {
            if ('rotateX' in trans) {
              return { rotateX: parse(trans.rotateX) }
            } else if ('rotateY' in trans) {
              return { rotateY: parse(trans.rotateY) }
            } else if ('rotateZ' in trans) {
              return { rotateZ: parse(trans.rotateZ) }
            } else {
              return {
                moveX: parse(trans.moveX),
                moveY: parse(trans.moveY),
                moveZ: parse(trans.moveZ),
              }
            }
          })
        : [],
      colorID: colors.map((c) => {
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

/** 解析 (box|boxFlex)[]  */
function parseBoxGroup(
  model: (styleTypes.box | styleTypes.boxFlex)[]
): (styleParsed.box | styleParsed.boxFlex)[] {
  return model.map((b) => {
    return 'x' in b
      ? parseStatus(b, {
          x: parse(b.x),
          y: parse(b.y),
          z: parse(b.z),
        })
      : parseStatus(b, {
          width: parse(b.width),
          height: parse(b.height),
          shrink: parse(b.shrink),
        })
  })
}

/** 解析 box[] */
function parseBoxes(boxes: styleTypes.box[]): styleParsed.box[] {
  return boxes.map((b) =>
    parseStatus(b, {
      x: parse(b.x),
      y: parse(b.y),
      z: parse(b.z),
    })
  )
}

/** 解析 boxFlex[] */
function parseBoxFlex(boxFlex: styleTypes.boxFlex): styleParsed.boxFlex {
  return parseStatus(boxFlex, {
    width: parse(boxFlex.width),
    height: parse(boxFlex.height),
    shrink: parse(boxFlex.shrink),
  })
}

/** 解析样式的段，须调用 styles  */
function parseSection(
  key: keyof styleTypes.style['section'],
  sections: styleTypes.style['section'],
  styles: StyleHandler,
  sectionElevation: number,
  sectionHeight: number,
  floorHeight: number,
  seed: Seed
) {
  const section = sections[key]
  if (section) {
    GLOBAL.UNITS.FH = floorHeight
    let floorCount = 0
    if (key === 'roof') {
      floorCount = 1
    } else {
      floorCount = Math.round(sectionHeight / floorHeight)
      RESULT.floorCount += floorCount
    }

    if (floorCount > 0) {
      section.floor?.forEach((floorParams) => {
        // 先解析除预设外的样式参数
        parseFloor(floorCount, floorHeight, sectionHeight, sectionElevation, floorParams, seed)

        // 然后处理预设样式相关参数
        floorParams.preset?.forEach((floorPresetParams) => {
          const { name, key } = floorPresetParams
          try {
            /** 预设样式 */
            let foundStylePreset: styleTypes.stylePreset | undefined
            // 先搜索对应名称的样式数据
            if (name) {
              // 按名字指定预设样式
              foundStylePreset = styles.data.preset[name]
            } else if (key) {
              // 按包含的关键词指定预设样式
              if (!foundStylePreset) {
                const names = Object.keys(styles.data.preset).filter((n) => n.includes(key))
                if (names.length > 0) {
                  foundStylePreset = styles.data.preset[sample(names, seed)!]
                }
              }
            }

            // 仅在预设参数范围内更新数值
            if (foundStylePreset) {
              // 将预设的单位换算缓存到全局变量中
              if (foundStylePreset.unit) {
                GLOBAL.UNITS_PRESET = {}
                // 样式逻辑： floorPreset 中的参数须覆盖 stylePreset 中的参数
                if (floorPresetParams.unit) {
                  for (const key in foundStylePreset.unit) {
                    const inputUnit = floorPresetParams.unit[key]
                    GLOBAL.UNITS_PRESET[key] = parse(
                      // BUG FIXED: 避免值为 0 时不被解析
                      inputUnit !== undefined ? inputUnit : foundStylePreset.unit[key]
                    )
                  }
                } else {
                  for (const key in foundStylePreset.unit) {
                    GLOBAL.UNITS_PRESET[key] = parse(foundStylePreset.unit[key])
                  }
                }
              }
              // 将预设的颜色值缓存到全局变量中
              if (foundStylePreset.color) {
                GLOBAL.COLOR_PRESET = {}
                // 样式逻辑： floorPreset 中的参数须覆盖 stylePreset 中的参数
                if (floorPresetParams.color) {
                  for (const key in foundStylePreset.color) {
                    GLOBAL.COLOR_PRESET[key] = (floorPresetParams.color[key] ||
                      foundStylePreset.color[key])!
                  }
                } else {
                  for (const key in foundStylePreset.color) {
                    GLOBAL.COLOR_PRESET[key] = foundStylePreset.color[key]!
                  }
                }
              }

              foundStylePreset.floor.forEach((presetFloorParams) => {
                // 创建预设的深拷贝
                const presetClone = Object.assign({}, presetFloorParams)
                // 父级层数控制参数覆盖预设控制参数
                if (floorParams.floor) presetClone.floor = floorParams.floor
                // 父级边线控制参数与预设叠加
                presetClone.edge = [...(floorParams.edge || []), ...(presetClone.edge || [])]

                parseFloor(
                  floorCount,
                  floorHeight,
                  sectionHeight,
                  sectionElevation,
                  presetClone,
                  seed
                )
              })
              GLOBAL.COLOR_PRESET = GLOBAL.UNITS_PRESET = {}
            } else {
              console.warn('can not find preset:', name)
            }
          } catch (error) {
            console.error('handle preset error:', name, error)
          }
        })
      })
    }
  }
}

//////////////// INSIDE FUNCTIONS BELOW ////////////////

function parseFloor(
  /** 根据段高和层高拟合计算的层数 */
  totalFloors: number,
  floorHeight: number,
  sectionHeight: number,
  sectionElevation: number,
  floorParams: styleTypes.floor,
  seed: Seed
) {
  const control = parseControl(floorParams.floor?.control)
  const edgeParams = parseEdgeParams(floorParams)

  const edgeParamsStampJSON = JSON.stringify(edgeParams)
  const foundSameEdge = RESULT.classifiedByEdge.find(
    (s) => s.edgeParamsStampJSON === edgeParamsStampJSON
  )
  const saveAs: styleParsed.resultClassified = foundSameEdge || {
    edgeParams,
    edgeParamsStampJSON,
    extrude: [],
    slopingRoof: [],
    clampBox: [],
    facade: [],
    match: [],
    boxInside: [],
    adjunct: [],
  }
  if (!foundSameEdge) RESULT.classifiedByEdge.push(saveAs)

  // 修改层数范围
  const ranges = getFloorRanges(
    totalFloors,
    floorHeight,
    sectionHeight,
    floorParams.floor?.number,
    floorParams.floor?.range
  )
  ranges.forEach((range) => {
    // 每个范围都单独计算 SH
    GLOBAL.UNITS.SH = range.sectionHeight
    // 遍历每一层，按标高修改参数的 move.z，结果保存到 result
    for (let i = range.bf; i < range.tf; i++) {
      if (passControl(i, seed, control)) {
        const isOnce = i === range.bf
        const floorElevation = sectionElevation + i * floorHeight
        parseExtrude(floorElevation, isOnce, saveAs, floorParams.extrude)
        parseSlopingRoof(floorElevation, isOnce, saveAs, floorParams.slopingRoof)
        parseClampBox(floorElevation, isOnce, saveAs, floorParams.clampBox)
        parseMatch(floorElevation, isOnce, saveAs, floorParams.match)
        parseBoxInside(floorElevation, isOnce, saveAs, floorParams.boxInside)
        parseAdjuncts(floorElevation, isOnce, saveAs, floorParams.adjunct)
        parseFacade(floorElevation, isOnce, saveAs, floorParams.facade)
      }
    }
  })
}

/** 按 range 将floors重新分段 */
function getFloorRanges(
  totalFloors: number,
  floorHeight: number,
  sectionHeight: number,
  byCount: styleTypes.ns | undefined,
  byRange: styleTypes.floorRangeType[] | undefined
): { bf: number; tf: number; sectionHeight: number }[] {
  const result: ReturnType<typeof getFloorRanges> = []
  let tf = totalFloors
  let bf = 0
  if (byCount) {
    tf = parse(byCount)
    sectionHeight = tf * floorHeight
  }

  if (byRange) {
    byRange.forEach((range) => {
      const { asRatio, bottom, top, reverse } = range
      const bn = parse(bottom)
      const tn = parse(top)

      if (reverse) {
        if (asRatio) {
          if (bn) tf = bf + Math.round(totalFloors * bn)
          if (tn) bf = tf - Math.round(totalFloors * tn)
        } else {
          if (bn) tf = bf + bn
          if (tn) bf = tf - tn
        }
      } else {
        if (asRatio) {
          if (bn) bf += Math.round(totalFloors * bn)
          if (tn) tf -= Math.round(totalFloors * tn)
        } else {
          if (bn) bf += bn
          if (tn) tf -= tn
        }
      }

      if (bf < tf) result.push({ bf, tf, sectionHeight: (tf - bf) * floorHeight })
    })
  } else {
    result.push({ bf: 0, tf, sectionHeight })
  }
  return result
}

/** 解析 styleTypes.floor 中边线相关的参数 */
function parseEdgeParams(params: styleTypes.floor): styleParsed.handleEdgesType {
  const result: styleParsed.handleEdgesType = []
  params.edge?.forEach((modEdges) => {
    if ('offset' in modEdges) {
      result.push(parseOffsetEdge(modEdges))
    } else if ('along' in modEdges) {
      result.push(modEdges)
    } else {
      result.push(parseClamp(modEdges))
    }
  })
  return result
}

function parseExtrude(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  extrudes?: styleTypes.extrude[]
) {
  if (extrudes) {
    extrudes.forEach((extrudeParams) => {
      const { once, height, toWall } = extrudeParams
      if (!once || isOnce) {
        saveAs.extrude.push(
          parseStatus(extrudeParams, {
            height: parse(height),
            toWall: parse(toWall),
            elevation,
          })
        )
      }
    })
  }
}

function parseSlopingRoof(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  slopingRoofs?: styleTypes.slopingRoof[]
) {
  if (slopingRoofs) {
    slopingRoofs.forEach((roofParams) => {
      const { once, form, height, overhang } = roofParams
      if (!once || isOnce) {
        saveAs.slopingRoof.push(
          parseStatus(roofParams, {
            form,
            overhang: parse(overhang),
            height: parse(height),
            elevation,
          })
        )
      }
    })
  }
}

function parseClampBox(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  clampBox?: styleTypes.clampBox[]
) {
  if (clampBox) {
    clampBox.forEach((clampParams) => {
      const { once, height } = clampParams
      if (!once || isOnce) {
        saveAs.clampBox.push(parseStatus(clampParams, { height: parse(height), elevation }))
      }
    })
  }
}

function parseControl(params?: styleTypes.control): styleParsed.control | undefined {
  return params
    ? {
        skipIndex: parse(params.skipIndex),
        everyIndex: parse(params.everyIndex),
        chance: parse(params.chance),
      }
    : undefined
}

function parseFacade(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  facade?: styleTypes.facade[]
) {
  if (facade) {
    facade.forEach((f) => {
      const { once, padding, proto } = f
      if (!once || isOnce) {
        const parsed: styleParsed.facade = {
          elevation,
          padding: parsePadding(padding),
          proto: [],
        }

        if (proto) {
          proto.forEach((boxArray) => {
            const { area, spacing, divide, first, last, lastWidth } = boxArray
            parsed.proto.push({
              area: area || 'MIDDLE',
              spacing: spacing?.map((s) => {
                return {
                  space: parse(s.space),
                  group: s.group
                    ? parseBoxGroup(Array.isArray(s.group) ? s.group : [s.group])
                    : undefined,
                  control: parseControl(s.control),
                  repeat: parse(s.repeat),
                }
              }),
              divide: divide?.map((d) => {
                return {
                  count: parse(d.count),
                  group: parseBoxGroup(Array.isArray(d.group) ? d.group : [d.group]),
                  control: parseControl(d.control),
                }
              }),
              first: typeof first === 'boolean' ? first : true,
              last: last || false,
              lastWidth: parse(lastWidth),
            })
          })
        }

        if (parsed.proto[0]) saveAs.facade.push(parsed)
      }
    })
  }
}

function parseMatch(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  matches?: styleTypes.match[]
) {
  if (matches)
    matches.forEach((matchParam) => {
      const { once, along, top, bottom } = matchParam
      if (!once || isOnce) {
        const parsed: styleParsed.match = {
          elevation,
          along,
          flexes: matchParam.flexes.map(parseBoxFlex),
          bottom: undefined,
          top: undefined,
          control: parseControl(matchParam.control),
          sandwich: matchParam.sandwich || false,
        }

        if (top) {
          const { like, ratio, padding } = top
          parsed.top = {
            like,
            ratio: parse(ratio),
            padding: padding ? parsePadding(padding) : undefined,
          }
        }
        if (bottom) {
          const { like, ratio, padding } = bottom
          parsed.bottom = {
            like,
            ratio: parse(ratio),
            padding: padding ? parsePadding(padding) : undefined,
          }
        }

        saveAs.match.push(parsed)
      }
    })
}

/** 解析 floor.boxInside */
function parseBoxInside(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  boxInside?: styleTypes.boxInside[]
) {
  if (boxInside) {
    boxInside.forEach((boxParams) => {
      const { flex, count, widthRatio, depthRatio, heightRatio, along, once } = boxParams

      if (!once || isOnce) {
        saveAs.boxInside.push({
          flex: parseBoxFlex(flex),
          count: parseMinAndMax(count),
          widthRatio: parseMinAndMax(widthRatio),
          depthRatio: parseMinAndMax(depthRatio),
          heightRatio: parseMinAndMax(heightRatio),
          along,
          elevation,
        })
      }
    })
  }
}

function parseMinAndMax(
  v: [min: styleTypes.ns, max: styleTypes.ns] | styleTypes.ns | undefined
): [min: number, max: number] {
  if (typeof v === 'object') {
    return [parse(v[0]), parse(v[1])]
  } else {
    const x = v ? parse(v) : 1
    return [x, x]
  }
}

/** 解析 floor.adjunct */
function parseAdjuncts(
  elevation: number,
  isOnce: boolean,
  saveAs: styleParsed.resultClassified,
  adjuncts?: styleTypes.adjunct[]
) {
  if (adjuncts) {
    adjuncts.forEach((adjunct) => {
      const { once, boxes, place, count } = adjunct
      if (!once || isOnce) {
        saveAs.adjunct.push({
          count: count ? parse(count) : 1,
          place: place || 'EDGE',
          boxes: parseBoxes(boxes),
          elevation,
        })
      }
    })
  }
}

/** 解析偏移边线参数 */
function parseOffsetEdge(params: styleTypes.offsetEdgeType): styleParsed.offsetEdgeType {
  const { offset } = params
  if (typeof offset === 'object') {
    return { offset: { x: parse(offset.x), y: parse(offset.y), asRatio: offset.asRatio || false } }
  } else {
    const x = parse(offset)
    return { offset: { x, y: x, asRatio: false } }
  }
}

function parseClamp(params: styleTypes.clampEdgeType): styleParsed.clampEdgeType {
  const { clamp } = params
  return {
    clamp: {
      xMin: parse(clamp.xMin),
      xMax: parse(clamp.xMax),
      yMin: parse(clamp.yMin),
      yMax: parse(clamp.yMax),
      xCentral: parse(clamp.xCentral),
      yCentral: parse(clamp.yCentral),
      asRatio: typeof clamp.asRatio === 'boolean' ? clamp.asRatio : true,
      reverse: clamp.reverse || false,
    },
  }
}

function parsePadding(params?: styleTypes.paddingType): styleParsed.paddingType | undefined {
  if (params) {
    return {
      start: parse(params.start),
      middle: parse(params.middle),
      end: parse(params.end),
      asRatio: typeof params.asRatio === 'boolean' ? params.asRatio : true,
    }
  }
  return undefined
}

/** 解析带单位的公式。 */
function parse(ns?: styleTypes.ns): number {
  let n: number
  if (typeof ns === 'string') {
    // 计算单位值
    ns = replaceUnit(ns, GLOBAL.UNITS)
    ns = replaceUnit(ns, GLOBAL.UNITS_PRESET)

    try {
      n = evaluator.eval(ns)
      // n = eval(ns)
    } catch (error) {
      console.log('[parse fomula]', error, ns, GLOBAL.UNITS, GLOBAL.UNITS_PRESET)
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
