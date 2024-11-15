import {
  MAIN,
  PRESET,
  RESULT,
  parse,
  parseStatus,
  parseClamp,
  parseControl,
  parseIndent,
  parseBox,
  parseVerticalBoxes,
} from './handleParse'
import { getValidIndexes } from '../plan/handleBox'

import type { magizTypes } from '../../types/magizTypes'
import type { styleTypes } from '../../types/styleTypes'
import type { styleParsed } from '../../types/stylesParsed'

export { StyleHandler }

/** 用于管理多个样式文件的样式库类 */
class StyleHandler {
  /** 默认样式 Blocks */
  Blocks: styleTypes.buildingStyle
  /** 整合后的样式参数 */
  data: styleTypes.styles

  /** 创建样式库实例，输入的样式将自动整合 */
  constructor(
    /** 输入多个样式参数并整合 */
    stylesArray: styleTypes.styles[]
  ) {
    this.Blocks = {
      type: 'FREE',
      tags: {},
      section: {
        bottom: {
          height: '1H',
          floor: [{ control: { total: 1 }, extrude: [{ height: '1H' }] }],
        },
      },
    }
    this.data = {}
    this.merge(stylesArray)
  }

  merge(stylesArray: styleTypes.styles[]) {
    stylesArray.forEach((style) => {
      for (const key in style) {
        if (this.data[key]) console.warn(`Style overwrited: ${key}`)
        this.data[key] = style[key]!
      }
    })
  }

  /** 输入注册状态，检查样式是否可用 */
  isValid(name: string, regState: boolean) {
    if (name === 'Blocks') {
      return true
    } else {
      const found = this.data[name]
      return found && (found.type === 'FREE' || regState) ? true : false
    }
  }

  /** @ignore 按是否免费返回分类后的样式名称 */
  getOptions(): magizTypes.styleOptions {
    const result: magizTypes.styleOptions = { paid: [], free: ['Blocks'] }
    for (const n in this.data) {
      this.data[n]!.type === 'FREE' ? result.free.push(n) : result.paid.push(n)
    }
    return result
  }

  /** 根据输入参数和随机种子解析样式。优先按custom解析 */
  parseStyle(
    /** 控制解析的参数 */
    styleParams: magizTypes.styleParams,
    /** 全局缓存 colorMap 以便生成多个时正确索引 */
    globalColorMap: string[]
  ): styleParsed.result {
    RESULT.colorMapPTR = globalColorMap
    RESULT.floorCount = 0
    RESULT.classified = {}

    // 确保输入的参数为数字
    const height = Number(styleParams.height)
    // 部分参数具有默认值
    const floorHeight = Number(styleParams.floorHeight || 3)
    const elevation = Number(styleParams.elevation || 0)

    const styleSelected =
      !styleParams.style || styleParams.style === 'Blocks'
        ? this.Blocks
        : this.data[styleParams.style]

    if (styleSelected) {
      /** 内部全局变量，保存解析公式所需的单位 */
      MAIN.UNITS = Object.assign({ H: height, FH: floorHeight }, styleSelected.unit)

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

      MAIN.UNITS.RH = rsh
      MAIN.UNITS.MH = msh
      MAIN.UNITS.BH = bsh

      parseSection('bottom', ss, elevation, bsh, bfh)
      parseSection('middle', ss, elevation + bsh, msh, mfh)
      parseSection('roof', ss, elevation + height - rsh, rsh, rfh)
    } else {
      console.warn(`${styleParams.style} is invalid, ignored.`)
    }

    // 解析完成后清理 custom
    return RESULT
  }
}

//////////////////////////////////////////////////////////

/** 解析样式的段，须调用 styles  */
function parseSection(
  type: keyof styleTypes.buildingStyle['section'],
  sectionParams: styleTypes.buildingStyle['section'],
  sectionElevation: number,
  sectionHeight: number,
  floorHeight: number
) {
  const section = sectionParams[type]
  if (section) {
    MAIN.UNITS.SH = sectionHeight
    MAIN.UNITS.FH = floorHeight
    let floorCount = 0
    if (type === 'roof') {
      floorCount = 1
    } else {
      floorCount = Math.round(sectionHeight / floorHeight)
      RESULT.floorCount += floorCount
    }

    if (floorCount > 0) {
      section.floor?.forEach((floorParams) => {
        // 先解析除预设外的样式参数
        parseFloor(floorCount, floorHeight, sectionElevation, floorParams)

        // 然后处理预设样式相关参数
        floorParams.presets?.forEach((floorPresetParams) => {
          const { unit, color, floor } = floorPresetParams

          // 将预设的单位和颜色缓存到全局变量中
          PRESET.UNITS = {}
          PRESET.COLOR = {}
          for (const key in unit) {
            PRESET.UNITS[key] = parse(unit[key as keyof typeof unit])
          }
          for (const key in color) {
            PRESET.COLOR[key] = color[key as keyof typeof color]!
          }

          floor.forEach((params) => {
            // 创建预设的深拷贝
            const presetClone = { ...params }
            // 父级层数控制参数覆盖预设控制参数
            if (floorParams.control) presetClone.control = floorParams.control
            // 父级边线控制参数与预设叠加
            presetClone.edge = [...(floorParams.edge || []), ...(presetClone.edge || [])]

            parseFloor(floorCount, floorHeight, sectionElevation, presetClone)
          })

          // 清除预设的全局缓存
          PRESET.UNITS = undefined
          PRESET.COLOR = undefined
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
  sectionElevation: number,
  floorParams: styleTypes.floor
) {
  // 获取将生成元素的标高
  const elevations = getValidIndexes(totalFloors, parseControl(floorParams.control)).map(
    (i) => sectionElevation + i * floorHeight
  )

  // 格式化边线控制参数序列
  const edgeParams: styleParsed.handleEdge[] = []
  floorParams.edge?.forEach((handleEdge) => {
    const { offset, along, clamp, indent } = handleEdge
    if (offset) {
      edgeParams.push({ offset: parseOffsetEdge(offset) })
    } else if (along) {
      edgeParams.push({ along })
    } else if (clamp) {
      edgeParams.push({ clamp: parseClamp(clamp) })
    } else if (indent) {
      edgeParams.push({ indent: parseIndent(indent) })
    }
  })

  const edgeParamsJSON = JSON.stringify(edgeParams)
  const saveAs: styleParsed.floorResult = {
    diverse: floorParams.diverse || false,
    elevations,
    edgeParams,
    extrude: [],
    match: [],
    vertical: [],
    horizontal: [],
    appendent: [],
    boundingBox: [],
    slopingRoof: [],
  }

  const sameEdge = RESULT.classified[edgeParamsJSON]
  sameEdge
    ? sameEdge.parsed.push(saveAs)
    : (RESULT.classified[edgeParamsJSON] = { params: edgeParams, parsed: [saveAs] })

  parseExtrude(saveAs, floorParams)
  parseMatch(saveAs, floorParams)
  parseVertical(saveAs, floorParams)
  parseHorizontal(saveAs, floorParams)
  parseAppendent(saveAs, floorParams)
  parseSlopingRoof(saveAs, floorParams)
  parseBoundingBox(saveAs, floorParams)
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

function parseExtrude(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.extrude?.forEach((p) => {
    to.extrude.push(
      parseStatus(p, {
        height: parse(p.height),
        thickness: parse(p.thickness),
      })
    )
  })
}

function parseMatch(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.match?.forEach((p) => {
    to.match.push({
      array: p.array.map((u) => {
        return parseStatus(u, {
          count: parse(u.count) || 1,
          unitDepth: parse(u.unitDepth),
          flexHeight: parse(u.flexHeight),
          indentWidth: parseIndent(u.indentWidth),
        })
      }),
      along: p.along || 'WIDTH',
      control: parseControl(p.control),
      sandwich: p.sandwich || false,
      simplify: p.simplify || false,
    })
  })
}

function parseVertical(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.vertical?.forEach((p) => {
    to.vertical.push({
      array: p.array.map((unit) => {
        const { replace } = unit
        return {
          space: parse(unit.space),
          boxes: parseVerticalBoxes(unit.boxes),
          replace: replace
            ? { chance: parse(replace.chance), with: parseVerticalBoxes(replace.with) }
            : undefined,
          count: parse(unit.count) || 1,
        }
      }),
      control: parseControl(p.control),
      sandwich: p.sandwich || false,
      endWidth: parse(p.endWidth),
    })
  })
}

function parseHorizontal(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.horizontal?.forEach((p) =>
    to.horizontal.push(
      parseStatus(p, {
        flexDepth: parse(p.flexDepth),
        flexHeight: parse(p.flexHeight),
        extend: parse(p.extend),
        array: p.array.map(parse),
        control: parseControl(p.control),
        sandwich: p.sandwich || false,
        endWidth: parse(p.endWidth),
      })
    )
  )
}

function parseSlopingRoof(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.slopingRoof?.forEach((p) => {
    to.slopingRoof.push(
      parseStatus(p, {
        form: p.form,
        overhang: parse(p.overhang),
        height: parse(p.height),
      })
    )
  })
}

function parseBoundingBox(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.boundingBox?.forEach((p) => {
    to.boundingBox.push(
      parseStatus(p, {
        height: parse(p.height),
        clamp: parseClamp(p.clamp),
      })
    )
  })
}

/** 解析 floor.adjunct */
function parseAppendent(to: styleParsed.floorResult, params?: styleTypes.floor) {
  params?.appendent?.forEach((p) => {
    to.appendent.push({
      count: parse(p.count) || 1,
      place: p.place || 'EDGE',
      boxes: p.boxes.map(parseBox),
    })
  })
}
