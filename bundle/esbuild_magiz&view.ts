// To bundle magiz and viewClass

/*!
  Magiz
  a light weight 3D building model generator for web
  Copyright (c) 2019-2024 周曦 <453154007@qq.com>
  http://www.architech.fun
  GPL Version 3 license
*/

import { View } from '../src/class/view'
import { Plan } from '../src/class/plan'
import { StyleHandler } from '../src/class/styles'
import { styles as simple } from '../src/defaultStyles/simple'

const styles = new StyleHandler([simple])

export { View, Plan, styles }
