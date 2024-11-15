import type { styleTypes } from '../../types/styleTypes'
import { COLOR } from '../../color'

export { COLOR, check, preset }

/** 为preset参数提供类型检查和提示 */
function check<
  U extends { [k: string]: styleTypes.ns },
  C extends { [k: string]: styleTypes.colorType }
>(params: styleTypes.preset<U, C>) {
  return params
}

/** 通过函数提示和检查自定义单位和颜色，将预设参数转为floor[]参数 */
function preset<
  U extends { [k: string]: styleTypes.ns },
  C extends { [k: string]: styleTypes.colorType }
>(
  floorPreset: styleTypes.preset<U, C>,
  params?: { unit?: Partial<U>; color?: Partial<C> }
): styleTypes.preset<U, C> {
  return {
    floor: floorPreset.floor,
    unit: Object.assign({ ...floorPreset.unit }, params?.unit),
    color: Object.assign({ ...floorPreset.color }, params?.color),
  }
}
