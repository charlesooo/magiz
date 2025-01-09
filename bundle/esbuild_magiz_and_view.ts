// To bundle magiz and viewClass to js

/*!
  Magiz
  light weight 3D building generator for web
  Copyright (c) 2019-2024 周曦 <453154007@qq.com>
  http://www.architech.fun
  GPL Version 3 license
*/

import { View } from '../src/class/viewClass'
import { Plan } from '../src/class/planClass'
import { MagizStyles } from '../src/class/styleClass'
import { styles as simple } from '../src/styles/simple'

const styles = new MagizStyles([simple])

export { View, Plan, styles }
