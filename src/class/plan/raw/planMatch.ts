import { sRotateLinesAlong, getValidIndexes } from './handleMath'
import { TEMP, pushBoxData, matchUnitsToTempBoxRows } from './handleBox'
import type { magizTypes, styleParsed, temp } from './_imports'

export { handleMatch }

/** 将 parsed.match 转为纯数据保存到结果 */
function handleMatch(
  result: magizTypes.rawBuilding,
  parsedStyle: Pick<styleParsed.floorResult, 'match' | 'elevations'>,
  rayLoops: temp.ray[][]
) {
  const { match, elevations } = parsedStyle
  match.forEach((params) => {
    // 根据参数旋转平面再进行拟合
    const { control, sandwich, array, along, simplify } = params
    const { newRays, radian } = sRotateLinesAlong(rayLoops.flat(), along)
    const tempBoxRows = matchUnitsToTempBoxRows(array, newRays, sandwich, simplify)
    getValidIndexes(tempBoxRows.length, control).forEach((i) => {
      tempBoxRows[i]!.forEach((data) => {
        elevations.forEach((elevation) => {
          pushBoxData(
            result,
            data.color,
            data.matrix
              .clone()
              .premultiply(TEMP.makeRotationZ(-radian))
              .premultiply(TEMP.makeTranslation(0, 0, elevation))
          )
        })
      })
    })
  })
}
