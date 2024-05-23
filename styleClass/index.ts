import { evaluate } from 'mathjs'
import { SEED, passControl } from '../planClass/handleUtils'
import { mergeStyles } from './styleUtils'
import { sample } from '../planClass/handleMath'

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

/** 解析时全局临时缓存的结果 */
const RESULT: parsed.result = { colorMap: [], floorCount: 0, classified: [] }

/** 用于管理多个样式文件的样式库类 */
export default class STYLES {
  /** 整合后的样式参数 */
  params: params.styles

  /** 创建样式库实例，输入的样式将自动整合 */
  constructor(
    /** 输入多个样式参数并整合 */
    ...styles: params.styles[]
  ) {
    this.params = {
      info: 'v24.4 copyright 2024 周曦',
      preset: {},
      building: {},
    }
    this.merge(...styles)
  }

  /** 合并样式参数（会提示被替换的项） */
  merge(...a: params.styles[]): params.styles {
    return mergeStyles(this.params, a)
  }

  /** @ignore 按是否免费返回分类后的样式名称 */
  getOptions(): styleOptionsType {
    const result: styleOptionsType = { paid: [], free: [] }
    const b = this.params.building
    for (const n in b) {
      const s = b[n] as params.style
      s.type === 'FREE' ? result.free.push(n) : result.paid.push(n)
    }
    return result
  }

  /** 根据输入参数和随机种子解析样式 */
  parseStyle(
    /** 控制解析的参数 */
    styleParams: styleParamsType,
    /** 全局随机种子 */
    seed: SEED
  ): parsed.result {
    RESULT.colorMap = ['#eee', '#bdf G']
    RESULT.floorCount = 0
    RESULT.classified = []

    // 确保输入的参数为数字
    const height = Number(styleParams.height)
    const floorHeight = Number(styleParams.floorHeight)
    const elevation = Number(styleParams.elevation)

    // 设置随机数种子
    seed.set(Number(styleParams.seed) || Math.round(Math.random() * 100000))

    const selected = this.params.building[styleParams.style]
    if (selected) {
      /** 内部全局变量，保存解析公式所需的单位 */
      GLOBAL.UNITS = Object.assign({ BH: height }, selected.unit)

      const ss = selected.section
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

      parseSection(this, styleParams, elevation, bsh, bfh, seed, ss.bottom)
      parseSection(this, styleParams, elevation + bsh, msh, mfh, seed, ss.middle)
      parseSection(this, styleParams, elevation + height - rsh, rsh, rfh, seed, ss.roof, true)
    } else {
      console.warn('未找到建筑样式，返回空的解析结果')
    }

    return RESULT
  }
}

//////////////////////////////////////////////////////////

/** 解析包含 params.status 的参数 */
function parseStatus<MORE>(status: params.status, data: MORE): parsed.status & MORE {
  let colors: string[] = []
  const c = status.color
  if (c) {
    // 仅当字符串时检查是否有预设
    if (typeof c === 'string') {
      const pc = GLOBAL.COLOR_PRESET[c]
      if (pc) {
        // 如果有对应预设，按预设的颜色值
        colors = typeof pc === 'string' ? [pc] : pc
      } else {
        colors.push(c)
      }
    } else {
      colors = c
    }
  }

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
      color: colors.map((c) => {
        /** 在colorMap中的序号 */
        let index = 0
        let glass = false
        if (c === 'G') {
          // 默认的玻璃材质
          index = 1
          glass = true
        } else {
          glass = /G$/i.test(c)
          index = RESULT.colorMap.indexOf(c)
          if (index < 0) {
            index = RESULT.colorMap.length
            RESULT.colorMap.push(c)
          }
        }
        return { index, glass }
      }),
    },
    data
  )
}

/** 解析 (box|boxFlex)[]  */
function parseBoxGroup(model: (params.box | params.boxFlex)[]): (parsed.box | parsed.boxFlex)[] {
  return model.map((b) => {
    return 'x' in b
      ? parseStatus(b, {
          x: parse(b.x),
          y: parse(b.y),
          z: parse(b.z),
        })
      : parseStatus(b, {
          depth: parse(b.depth),
          height: parse(b.height),
          extend: parse(b.extend),
        })
  })
}

/** 解析 box[] */
function parseBoxes(boxes: params.box[]): parsed.box[] {
  return boxes.map((b) =>
    parseStatus(b, {
      x: parse(b.x),
      y: parse(b.y),
      z: parse(b.z),
    })
  )
}

/** 解析 boxFlex[] */
function parseBoxFlex(boxFlex: params.boxFlex): parsed.boxFlex {
  return parseStatus(boxFlex, {
    depth: parse(boxFlex.depth),
    height: parse(boxFlex.height),
    extend: parse(boxFlex.extend),
  })
}

/** 解析样式的段，须调用 style、styleParams  */
function parseSection(
  styles: STYLES,
  styleParams: styleParamsType,
  sectionElevation: number,
  sectionHeight: number,
  floorHeight: number,
  seed: SEED,
  section?: params.section,
  isRoof?: boolean
) {
  if (section) {
    GLOBAL.UNITS.FH = floorHeight
    let floorCount = 0
    if (isRoof) {
      floorCount = 1
    } else {
      floorCount = Math.round(sectionHeight / GLOBAL.UNITS.FH)
      RESULT.floorCount += floorCount
    }

    if (floorCount > 0) {
      section.floor?.forEach((floorParams) => {
        // 解析样式
        parseFloor(floorCount, floorHeight, sectionHeight, sectionElevation, floorParams, seed)

        // 带入参数解析预设样式
        floorParams.preset?.forEach((floorPresetParams) => {
          const { name, key, unit, color } = floorPresetParams
          try {
            // 如果缓存中有对应名称的样式
            if (styles.params.preset) {
              /** 预设样式 */
              let p: (typeof styles.params.preset)[string] | undefined
              if (name) {
                // 按名字指定预设样式
                p = styles.params.preset[name]
              } else if (key) {
                // 按关键词随机选择预设样式
                const names = Object.keys(styles.params.preset).filter((n) => n.includes(key))
                if (names.length > 0) {
                  p = styles.params.preset[sample(names, seed) as string]
                }
              }

              // 仅在预设参数范围内更新数值
              if (p) {
                if (p.unit) {
                  GLOBAL.UNITS_PRESET = {}
                  if (unit) {
                    for (const key in p.unit) {
                      const inputUnit = unit[key]
                      GLOBAL.UNITS_PRESET[key] = parse(
                        // 避免值为 0 时不被解析
                        inputUnit !== undefined ? inputUnit : p.unit[key]
                      )
                    }
                  } else {
                    for (const key in p.unit) {
                      GLOBAL.UNITS_PRESET[key] = parse(p.unit[key])
                    }
                  }
                }

                if (p.color) {
                  GLOBAL.COLOR_PRESET = {}
                  // 如果输入的参数中有color
                  if (color) {
                    for (const key in p.color) {
                      GLOBAL.COLOR_PRESET[key] = color[key] || (p.color[key] as string | string[])
                    }
                  } else {
                    for (const key in p.color) {
                      GLOBAL.COLOR_PRESET[key] = p.color[key] as string | string[]
                    }
                  }
                }

                p.floor.forEach((f) => {
                  // 创建预设的深拷贝
                  const fp = Object.assign({}, f)
                  // 如果父级参数有除生成体块外的其他部分，与预设进行整合，以便在预设基础上增加自定义
                  if (floorParams.floorControl) fp.floorControl = floorParams.floorControl
                  if (floorParams.floorNumber) fp.floorNumber = floorParams.floorNumber
                  if (floorParams.floorRange) fp.floorRange = floorParams.floorRange
                  if (floorParams.scaleEdges) fp.scaleEdges = floorParams.scaleEdges
                  if (floorParams.setEdges) fp.setEdges = floorParams.setEdges

                  parseFloor(floorCount, floorHeight, sectionHeight, sectionElevation, fp, seed)
                })
                GLOBAL.COLOR_PRESET = GLOBAL.UNITS_PRESET = {}
              } else {
                console.warn('没找到预设的样式：', name, '@', styleParams.style)
              }
            }
          } catch (error) {
            console.warn('handle preset error:', name, error)
          }
        })
      })
    }
  }
}

//////////////// INSIDE FUNCTIONS BELOW ////////////////

function parseFloor(
  /** 根据段高和层高拟合计算的层数 */
  floorCount: number,
  /** 层高 */
  floorHeight: number,
  /** 段高 */
  sectionHeight: number,
  sectionElevation: number,
  floorParams: params.floor,
  seed: SEED
) {
  const control = parseControl(floorParams.floorControl)
  const edgeParams = parseEdgeParams(floorParams)

  const edgesJSON = JSON.stringify(edgeParams)
  const found = RESULT.classified.find((s) => s.edgesJSON === edgesJSON)
  const saveAs: parsed.resultClassified = found || {
    edgeParams,
    edgesJSON,
    extrude: [],
    slopingRoof: [],
    clampBox: [],
    facade: [],
    match: [],
    boxInside: [],
    adjunct: [],
  }
  if (!found) RESULT.classified.push(saveAs)

  // 修改层数范围
  const { floorNumber, floorRange } = floorParams
  const ranges = limitFloorRange(0, floorCount, floorNumber, floorRange)

  ranges.forEach((range) => {
    const total = range[1] - range[0]

    // 修改层数后 SH 也变了
    GLOBAL.UNITS.SH = floorNumber || floorRange ? total * floorHeight : sectionHeight

    // 遍历每一层，按标高修改参数的 move.z，结果保存到 result
    for (let i = range[0]; i < range[1]; i++) {
      if (passControl(i, seed, control)) {
        const isOnce = i === range[0]
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
function limitFloorRange(
  bottomFloor: number,
  topFloor: number,
  count: params.floor['floorNumber'],
  range: params.floor['floorRange']
) {
  const result: [bottom: number, top: number][] = []

  if (count) {
    result.push([bottomFloor, bottomFloor + parse(count)])
  } else if (range) {
    const total = topFloor - bottomFloor
    range.forEach((r) => {
      const { asRatio, bottom, top, reverse } = r
      const bn = parse(bottom)
      const tn = parse(top)
      let bf = bottomFloor
      let tf = topFloor

      if (reverse) {
        if (asRatio) {
          if (bn) tf = bf + Math.round(total * bn)
          if (tn) bf = tf - Math.round(total * tn)
        } else {
          if (bn) tf = bf + bn
          if (tn) bf = tf - tn
        }
      } else {
        if (asRatio) {
          if (bn) bf += Math.round(total * bn)
          if (tn) tf -= Math.round(total * tn)
        } else {
          if (bn) bf += bn
          if (tn) tf -= tn
        }
      }

      if (bf < tf) result.push([bf, tf])
    })
  } else {
    result.push([bottomFloor, topFloor])
  }
  return result
}

/** 解析 params.floor 中边线相关的参数 */
function parseEdgeParams(params: params.floor): parsed.handleEdgesType {
  return {
    scale: parseOffsetOrScale(params.scaleEdges),
    set: params.setEdges?.map((setEdges) => {
      const { offset, clamp, orient } = setEdges
      return {
        offset: parseOffsetOrScale(offset),
        clamp: parseClamp(clamp),
        orient,
      }
    }),
  }
}

/** 解析偏移边线参数 */
function parseOffsetOrScale(
  params?: params.scaleOrOffsetType
): parsed.scaleOrOffsetType | undefined {
  if (params) {
    if (typeof params === 'object') {
      return {
        x: parse(params.x),
        y: parse(params.y),
        asRatio: params.asRatio ? true : false,
      }
    } else {
      const v = parse(params)
      return { x: v, y: v, asRatio: false }
    }
  }
  return undefined
}

/** 将样式中 blocks 解析到 result */
function parseExtrude(
  elevation: number,
  isOnce: boolean,
  saveAs: parsed.resultClassified,
  extrudes?: params.extrude[]
) {
  if (extrudes) {
    extrudes.forEach((extrudeParams) => {
      const { once, height, thickness } = extrudeParams
      if (!once || isOnce) {
        saveAs.extrude.push(
          parseStatus(extrudeParams, {
            thickness: parse(thickness),
            height: parse(height),
            elevation,
          })
        )
      }
    })
  }
}

/** 将样式中 blocks 解析到 result */
function parseSlopingRoof(
  elevation: number,
  isOnce: boolean,
  saveAs: parsed.resultClassified,
  slopingRoofs?: params.slopingRoof[]
) {
  if (slopingRoofs) {
    slopingRoofs.forEach((roofParams) => {
      const { once, height, overhang } = roofParams
      if (!once || isOnce) {
        saveAs.slopingRoof.push(
          parseStatus(roofParams, {
            overhang: parse(overhang),
            height: parse(height),
            elevation,
          })
        )
      }
    })
  }
}

/** 将样式中 blocks 解析到 result */
function parseClampBox(
  elevation: number,
  isOnce: boolean,
  saveAs: parsed.resultClassified,
  clampBox?: params.clampBox[]
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

function parseControl(params?: params.control): parsed.control | undefined {
  return params
    ? {
        skipIndex: parse(params.skipIndex),
        everyIndex: parse(params.everyIndex),
        chance: parse(params.chance),
      }
    : undefined
}

/** 将样式中 parts 解析到 result */
function parseFacade(
  elevation: number,
  isOnce: boolean,
  saveAs: parsed.resultClassified,
  facade?: params.facade[]
) {
  if (facade) {
    facade.forEach((f) => {
      const { once, padding, proto } = f
      if (!once || isOnce) {
        const parsed: parsed.facade = {
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
  saveAs: parsed.resultClassified,
  matches?: params.match[]
) {
  if (matches)
    matches.forEach((matchParam) => {
      const { once, along, top, bottom } = matchParam
      if (!once || isOnce) {
        const parsed: parsed.match = {
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
  saveAs: parsed.resultClassified,
  boxInside?: params.boxInside[]
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
  v: [min: params.ns, max: params.ns] | params.ns | undefined
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
  saveAs: parsed.resultClassified,
  adjuncts?: params.adjunct[]
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

function parseClamp(params?: params.clampRangeType): parsed.clampRangeType | undefined {
  if (params) {
    return {
      xMin: parse(params.xMin),
      xMax: parse(params.xMax),
      yMin: parse(params.yMin),
      yMax: parse(params.yMax),
      xCentral: parse(params.xCentral),
      yCentral: parse(params.yCentral),
      asRatio: typeof params.asRatio === 'boolean' ? params.asRatio : true,
      reverse: params.reverse || false,
    }
  } else {
    return undefined
  }
}

function parsePadding(params?: params.paddingType): parsed.paddingType | undefined {
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
function parse(ns?: params.ns): number {
  let n: number
  if (typeof ns === 'string') {
    // 计算单位值
    ns = replaceUnit(ns, GLOBAL.UNITS)
    ns = replaceUnit(ns, GLOBAL.UNITS_PRESET)

    try {
      n = evaluate(ns)
    } catch (error) {
      console.log('Error parse fomula:', error, ns, GLOBAL.UNITS, GLOBAL.UNITS_PRESET)
      n = 0
    }
  } else {
    n = ns || 0
  }

  return n
}

/** 替换单位值，单位必以数字开头字母结尾 */
function replaceUnit(input: string, units?: parsed.unitType) {
  if (units) {
    // 优先解析长字符的变量，防止"变量A"先于"变量AB"解析导致后者错误
    const keys = Object.keys(units).sort((a, b) => b.length - a.length)
    keys.forEach((k) => {
      input = input.replace(new RegExp(`\\d+(\\.\\d+)?${k}`, 'g'), (m) => {
        const u = units[k] as number
        return (Number(m.replace(k, '')) * u).toString()
      })
    })
  }
  return input
}
