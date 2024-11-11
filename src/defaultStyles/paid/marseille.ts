import { preset } from '../../class/styles'
import { floorPreset } from '../floorPreset'
import type { styleTypes } from '../../types/styleTypes'

export const styles: styleTypes.styles = {
  Marseille: {
    tags: { use: 'R' },
    section: {
      roof: {
        height: 2,
        floor: [
          {
            extrude: [{ height: 1.5, thickness: 0.4 }, { height: 0.4 }],
          },
          {
            control: { total: 1 },
            edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
            presets: [preset(floorPreset['CB:马赛通风塔'], { unit: { 数量: 3 } })],
            boxInside: [
              {
                once: true,
                along: 'LONGEST',
                count: 9,
                flex: { width: 2, height: 4 },
                widthRatio: [0.1, 0.3],
                depthRatio: [0.2, 0.6],
                heightRatio: [0.2, 1],
              },
            ],
          },
        ],
      },
      middle: {
        floor: [
          // 楼板
          {
            // scaleEdges: -0.4,
            extrude: [{ height: -0.6 }],
          },
          // 整段玻璃
          {
            extrude: [{ once: true, height: '1SH', color: 'G' }],
          },
          // 竖向两段中间的格栅
          {
            control: { first: 0.35, last: 0.5, asRatio: true },
            edge: [{ clamp: { xMax: 0.5 } }],
            facade: [
              {
                proto: [
                  {
                    spacing: [{ group: [{ x: 0.2, y: 1, z: '1SH' }], space: 1 }],
                  },
                ],
              },
            ],
          },
          // 竖向分两段的立面阳台
          {
            control: { first: 0.35, last: 0.5, asRatio: true, reverse: true },
            edge: [{ clamp: { xMax: 0.5 } }],
            presets: [preset(floorPreset['CS:马赛撞色阳台'])],
          },
          {
            edge: [{ clamp: { xMin: 0.6, xMax: 0.1 } }],
            presets: [preset(floorPreset['CS:马赛撞色阳台'])],
          },
          {
            edge: [{ clamp: { xMin: 0.9 } }, { along: 'DEPTH' }],
            presets: [preset(floorPreset['CS:马赛撞色阳台'])],
          },
          // 中部方窗
          {
            edge: [{ clamp: { xMin: 0.5, xMax: 0.4 } }],
            presets: [preset(floorPreset['CM:马赛中段方窗'])],
          },
          // 端部板墙
          {
            edge: [{ clamp: { xMin: 0.9 } }, { along: 'WIDTH' }],
            facade: [
              {
                once: true,
                proto: [{ divide: [{ group: [{ width: -0.3, height: '1SH' }], count: 1 }] }],
              },
            ],
          },
        ],
      },
      bottom: {
        height: 8,
        floor: [
          // 倾斜底板
          {
            edge: [{ offset: 2 }],
            facade: [
              {
                once: true,
                proto: [
                  {
                    divide: [
                      {
                        group: [
                          {
                            width: 4,
                            height: 1,
                            transform: [{ rotateX: -15 }, { moveZ: '1SH-1.2' }],
                          },
                        ],
                        count: 1,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // 架空层斜柱
          {
            edge: [
              { offset: 4 },
              { along: 'WIDTH' },
              { clamp: { xMin: 0.45, xMax: 0.4, reverse: true } },
            ],
            facade: [
              {
                once: true,
                proto: [
                  {
                    spacing: [
                      {
                        group: [
                          { x: 2, y: 4, z: '1SH', transform: [{ rotateX: 10 }] },
                          {
                            x: 2,
                            y: 4,
                            z: '1SH',
                            transform: [{ rotateX: -10 }, { moveX: 0.2 }],
                          },
                        ],
                        space: 8,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // 中部通高贯穿体块
          {
            edge: [{ offset: 3 }, { clamp: { xMin: 0.5, xMax: 0.45 } }],
            clampBox: [{ once: true, height: '1BH+12' }],
          },
        ],
      },
    },
  },
}
