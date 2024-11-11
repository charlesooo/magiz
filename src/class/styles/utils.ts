import type { styleTypes } from '../../types/styleTypes'

export { check, preset }

/** 为 preset 参数单元提供类型检查和提示 */
function check<
  U extends { [k: string]: styleTypes.ns },
  C extends { [k: string]: styleTypes.colorType | styleTypes.colorType[] }
>(params: styleTypes.preset<U, C>) {
  return params
}

/** 通过函数将 任意floorPreset 转为带自定义单位的floor[]参数 */
function preset<
  U extends { [k: string]: styleTypes.ns },
  C extends { [k: string]: styleTypes.colorType | styleTypes.colorType[] },
  P extends styleTypes.preset<U, C>
>(
  floorPreset: P,
  params?: {
    unit?: Partial<P['unit']>
    color?: Partial<P['color']>
  }
): {
  floor: styleTypes.floor[]
  unit: P['unit']
  color: P['color']
} {
  return {
    floor: floorPreset.floor,
    unit: Object.assign({ ...floorPreset.unit }, params?.unit),
    color: Object.assign({ ...floorPreset.color }, params?.color),
  }
}
