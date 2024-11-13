import { TEMP, flexEdgeToTempBoxes, pushBoxData } from './handleBox'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { handleHorizontal }

function handleHorizontal(
  result: magizTypes.rawBuilding,
  parsedStyle: styleParsed.floorResult,
  rayLoops: temp.ray[][]
) {
  const { horizontal, elevations } = parsedStyle
  rayLoops.forEach((rayLoop) => {
    rayLoop.forEach((ray) => {
      horizontal.forEach((params) => {
        const tempBoxes = flexEdgeToTempBoxes(params, ray.direction.length())
        elevations.forEach((elevation) => {
          tempBoxes.forEach((tempBoxData) => {
            const matrix = tempBoxData.matrix
              .clone()
              .premultiply(TEMP.makeRotationZ(ray.direction.angle()))
              .premultiply(TEMP.makeTranslation(ray.start.x, ray.start.y, elevation))
            pushBoxData(result, tempBoxData.color, matrix)
          })
        })
      })
    })
  })
}
