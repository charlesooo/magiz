import { Matrix4, Vector2 } from 'three'
import { passControl, SEED } from './handleUtils'
import { sample, getMatchRatioAndCount } from './handleMath'
import { TEMP, DEFAULT_COLOR, handleFacadeElements } from './handleBasic'
import type { temp } from '../types/temp'

export { handleFacade }

type spacingDataType = {
  model: { matrix: Matrix4; color: parsed.colorType[] }[] | undefined
  control: parsed.control | undefined
  space: number
}

function handleFacade(
  parsed: parsed.facade[],
  rays: temp.ray[][],
  result: rawDataType,
  seed: SEED
) {
  parsed.forEach((facadeParams) => {
    handleBoxes(result.data, handlePadding(rays, facadeParams.padding), facadeParams, seed)
  })
}

/** 按padding将每条边线分解，并计算长度。没有padding也须计算middleRay */
function handlePadding(rays: temp.ray[][], padding?: parsed.paddingType): temp.splitted[][] {
  if (padding) {
    const { start, middle, end, asRatio } = padding
    return rays.map((loop) =>
      loop.map((ray) => {
        const data: temp.splitted = Object.assign({ split: {} }, ray)
        const d = ray.direction
        const l = d.length()
        const sp = ray.start.clone()
        const ep = ray.end.clone()
        let midStart = sp,
          midEnd = ep
        let sl = 0,
          ml = 0,
          el = 0

        // padding 仅向内，并考虑一端为0的情况均单独处理
        if (middle > 0) {
          ml = asRatio ? middle * l : middle
          sl = el = (l - ml) / 2
        } else {
          sl = asRatio ? start * l : start
          el = asRatio ? end * l : end
          ml = l - sl - el
        }

        if (sl !== 0) {
          const sd = d.clone().setLength(sl)
          midStart = sp.clone().add(sd)
          data.split.startRay = { start: sp, end: midStart, direction: sd }
        }
        if (el !== 0) {
          const ed = d.clone().setLength(el)
          midEnd = ep.clone().add(ed.clone().negate())
          data.split.endRay = { start: midEnd, end: ep, direction: ed }
        }
        if (ml !== 0) {
          data.split.middleRay = {
            start: midStart,
            end: midEnd,
            direction: d.clone().setLength(ml),
          }
        }
        return data
      })
    )
  } else {
    return rays.map((loop) =>
      loop.map((ray) => {
        return Object.assign({ split: { middleRay: ray } }, ray)
      })
    )
  }
}

/** 如果有 divide，计算在偏移区内的点阵数据 */
function handleBoxes(
  result: rawDataType['data'],
  lineData: temp.splitted[][],
  partPared: parsed.facade,
  seed: SEED
) {
  const { proto, elevation } = partPared
  proto?.forEach((boxArray) => {
    const { area } = boxArray
    if (area === 'MIDDLE') {
      lineData.forEach((loop) =>
        loop.forEach((data) =>
          pushDividePoints(boxArray, result, elevation, seed, data.split.middleRay)
        )
      )
    } else {
      const pushStart = area === 'BOTH' || area === 'START'
      const pushEnd = area === 'BOTH' || area === 'END'
      lineData.forEach((loop) => {
        if (pushStart) {
          loop.forEach((data) =>
            pushDividePoints(boxArray, result, elevation, seed, data.split.startRay)
          )
        }
        if (pushEnd) {
          loop.forEach((data) =>
            pushDividePoints(boxArray, result, elevation, seed, data.split.endRay)
          )
        }
      })
    }
  })
}

/** 在给定的起点、方向、距离内，按间距返回点阵。考虑美观，间距都按参数的近似值。moveZ 在之后结合标高一起计算。如果ray不存在则跳过 */
function pushDividePoints(
  boxArray: parsed.boxArray,
  result: rawDataType['data'],
  elevation: number,
  seed: SEED,
  ray?: temp.ray
) {
  if (ray) {
    // 推送矩阵到结果，必须先缩放，再移动，再旋转加，最后移动到点位
    const { start, direction } = ray
    const { spacing, divide, first, last, lastWidth } = boxArray

    const totalDistance = direction.length()

    // 计算生成段数 spacingCount 和初始化间距组合 spacingData，生成时默认用spacing的第一个补齐整个阵列的最后一个。
    let data: spacingDataType[] = []

    if (spacing) {
      const spaces: number[] = []
      spacing.forEach((s) => {
        for (let i = -1; i < s.repeat; i++) {
          spaces.push(s.space)
        }
      })
      const rc = getMatchRatioAndCount(spaces, totalDistance, lastWidth)

      if (rc) {
        const { ratio, count } = rc
        const data: spacingDataType[] = []
        spacing.forEach((s) => {
          const model = s.group?.map((b) => handleFacadeElements(b, s.space, ratio))
          const control = s.control
          for (let i = -1; i < s.repeat; i++) {
            data.push({ model, control, space: s.space * ratio })
          }
        })

        pushData(data, count, result, elevation, direction, start, first, last, seed)
      }
    }

    if (divide) {
      divide.map((d) => {
        let space = totalDistance / d.count
        const rc = getMatchRatioAndCount([space], totalDistance, lastWidth)
        if (rc) {
          const { ratio, count } = rc
          space *= ratio
          data = [
            {
              model: d.group.map((b) => handleFacadeElements(b, space, ratio)),
              control: d.control,
              space: space * ratio,
            },
          ]
          pushData(data, count, result, elevation, direction, start, first, last, seed)
        }
      })
    }
  }
}

function pushData(
  data: spacingDataType[],
  count: number,
  result: rawDataType['data'],
  elevation: number,
  direction: Vector2,
  startPoint: Vector2,
  first: boolean,
  last: boolean,
  seed: SEED
) {
  /** 沿边线移动的总距离，用于直接从起点移动 */
  let distance = 0

  /** 先将元素在原点处缩放、旋转+移动，再用这个矩阵移动到边线上的起点 */
  const placeMatrix = new Matrix4()
    .makeRotationZ(direction.angle())
    .premultiply(TEMP.makeTranslation(startPoint.x, startPoint.y, elevation))

  const firstData = data[0]

  for (let i = 0; i < count; i++) {
    data.forEach((d) => {
      if ((i || first) && passControl(i, seed, d.control))
        pushSpacingData(d, distance, placeMatrix, seed, result)
      distance += d.space
    })
  }

  // 默认整个阵列的最后一项与第一项相同
  if (last && firstData) pushSpacingData(firstData, distance, placeMatrix, seed, result)
}

/** 计算并推送最终的matrix和colorIndex */
function pushSpacingData(
  data: spacingDataType,
  distance: number,
  placeMatrix: Matrix4,
  seed: SEED,
  result: rawDataType['data']
) {
  data.model?.forEach((m) => {
    const newMatrix = m.matrix
      .clone()
      .premultiply(TEMP.makeTranslation(distance, 0, 0))
      .premultiply(placeMatrix)

    const c = sample(m.color, seed) || DEFAULT_COLOR
    const saveAs = result[c.glass ? 'boxGlass' : 'box']
    saveAs.matrices.push(newMatrix.toArray())
    saveAs.colors.push(c.index)
  })
}
