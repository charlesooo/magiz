import { TEMP, edgeFlexToTempBoxes, pushBoxData } from './handleBox'

import type { magizTypes } from '../../types/magizTypes'
import type { styleParsed } from '../../types/stylesParsed'
import type { temp } from '../../types/temp'

export { handleHorizontal }

function handleHorizontal(
  result: magizTypes.rawBuilding,
  parsedStyle: Pick<styleParsed.floorResult, 'diverse' | 'horizontal' | 'elevations'>,
  rayLoops: temp.ray[][]
) {
  const { diverse, horizontal, elevations } = parsedStyle
  if (diverse) {
    elevations.forEach((elevation) => {
      rayLoops.forEach((rayLoop) => {
        rayLoop.forEach((ray) => {
          horizontal.forEach((params) => {
            const tempBoxes = edgeFlexToTempBoxes(params, ray.direction.length())
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
  } else {
    rayLoops.forEach((rayLoop) => {
      rayLoop.forEach((ray) => {
        horizontal.forEach((params) => {
          const tempBoxes = edgeFlexToTempBoxes(params, ray.direction.length())
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
}
