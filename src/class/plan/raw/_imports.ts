import { Matrix4, Matrix3, Vector2 } from 'three'
//@ts-ignore 单独导出，以便importmap仅需导入核心模块'three'
import { ShapeUtils } from '../../../../node_modules/three/src/extras/ShapeUtils.js'
//@ts-ignore 单独导出，以便importmap仅需导入核心模块'three'
import { seededRandom, degToRad } from '../../../../node_modules/three/src/math/MathUtils.js'

import type { magizTypes } from '../../../types/magizTypes'
import type { styleTypes } from '../../../types/styleTypes'
import type { styleParsed } from '../../../types/stylesParsed'
import type { temp } from '../../../types/temp'

export { Matrix4, Matrix3, Vector2, ShapeUtils, seededRandom, degToRad }
export type { magizTypes, styleTypes, styleParsed, temp }
