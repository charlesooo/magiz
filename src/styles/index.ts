// import { styles as villa } from './paid/villa'
// import { styles as marseille } from './paid/marseille'
// import { styles as match } from './paid/match'
// import { styles as random } from './paid/random'
import { styles as free1 } from './free/1'

import { StyleHandler } from '../class/styleHandler'

export { styles }

/** 将多个样式文件整合成一个样式库实例变量，供解析时调用 */
const styles = new StyleHandler([free1])
