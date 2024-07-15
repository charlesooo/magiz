import STYLES from '../styleClass/styles'
import { styles as basic } from './advanced/basic'
import { styles as villa } from './advanced/villa'
import { styles as marseille } from './advanced/marseille'
import { styles as match } from './advanced/match'
import { styles as random } from './advanced/random'
import { styles as free1 } from './free/1'

/** 将多个样式文件整合成一个样式库实例变量，供解析时调用 */
const styles = new STYLES(basic, villa, marseille, match, random, free1)

export default styles
