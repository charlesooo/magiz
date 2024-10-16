import type { styleTypes } from '../types/style'

export { mergeStyles }

/** 合并样式参数，并提示被替换的项 */
function mergeStyles(source: styleTypes.styles, input: styleTypes.styles[]): styleTypes.styles {
  const { preset, building } = source

  for (let i = 0; i < input.length; i++) {
    const inputStyles = input[i]!
    // 提示被替换项
    for (const key in inputStyles.preset) {
      if (preset[key]) console.log(`preset:${key} is replaceed`)
    }
    for (const key in inputStyles.building) {
      if (building[key]) console.log(`building:${key} is replaceed`)
    }

    Object.assign(building, inputStyles.building)
    Object.assign(preset, inputStyles.preset)
  }

  // 检查调用预设样式
  for (const name in building) {
    building[name]!.section.roof?.floor?.forEach((f) => {
      f.preset?.forEach((p) => {
        if (p.name && !preset[p.name]) {
          console.error('invalid style:', p.name, '@', name)
        }
        const k = p.key
        if (k) {
          const keys = Object.keys(preset).filter((n) => n.includes(k))
          if (keys.length === 0) console.error('invalid key of style:', p.key)
        }
      })
    })
  }

  return source
}
