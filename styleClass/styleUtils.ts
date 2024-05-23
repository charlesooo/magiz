export { mergeStyles }

/** 合并样式参数，并提示被替换的项 */
function mergeStyles(source: params.styles, a: params.styles[]): params.styles {
  const { preset, building } = source

  for (let i = 0; i < a.length; i++) {
    const s = a[i] as params.styles

    // 提示被替换项
    for (const key in s.preset) {
      if (preset[key]) console.log(`preset:${key} is replaceed`)
    }
    for (const key in s.building) {
      if (building[key]) console.log(`building:${key} is replaceed`)
    }

    Object.assign(building, s.building)
    Object.assign(preset, s.preset)
  }

  // 检查调用预设样式
  for (const name in building) {
    const b = building[name] as params.style
    b.section.roof?.floor?.forEach((f) => {
      f.preset?.forEach((p) => {
        if (p.name && !preset[p.name]) {
          console.error('无效的预设样式', p.name, '@', name)
        }
        const k = p.key
        if (k) {
          const keys = Object.keys(preset).filter((n) => n.includes(k))
          if (keys.length === 0) console.error('无效的样式名关键词', p.key)
        }
      })
    })
  }

  return source
}
