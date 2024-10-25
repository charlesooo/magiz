import type { styleTypes } from '../../src/types/styleTypes'

export const styles: styleTypes.styles = {
  preset: {
    '马赛公寓撞色立面阳台<出挑><颜色组合>': {
      unit: { 出挑: 2 },
      color: { 颜色组合: ['#F44336', '#388E3C', '#FFC107'] },
      floor: [
        // 各层元素
        {
          facade: [
            {
              once: true,
              proto: [
                {
                  divide: [
                    {
                      count: 1,
                      group: [
                        {
                          width: '-1出挑',
                          height: -0.4,
                          transform: [{ moveY: '-0.5出挑', moveZ: '1SH' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // 出挑阳台
            {
              proto: [
                {
                  divide: [
                    {
                      count: 1,
                      group: [
                        // 阳台扶手
                        {
                          width: 0.2,
                          height: 0.4,
                          transform: [{ moveY: '0.1-1出挑', moveZ: 1 }],
                        },
                        // 阳台护墙
                        {
                          width: 0.2,
                          height: 1,
                          color: '#bbb',
                          transform: [{ moveY: '0.2-1出挑' }],
                        },
                        // 阳台楼板
                        { width: '-2出挑', height: -0.4 },
                      ],
                    },
                  ],
                },
                // 随机彩色隔墙
                {
                  first: false,
                  spacing: [
                    {
                      space: 4,
                      group: [
                        {
                          x: 0.4,
                          y: '2出挑-0.6',
                          z: '1FH-0.4',
                          color: '颜色组合',
                        },
                      ],
                      control: { chance: 0.4 },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // 通高元素
        {
          facade: [
            {
              once: true,
              proto: [
                //补齐顶部出挑
                {
                  divide: [
                    {
                      group: [
                        {
                          width: '-1出挑',
                          height: -0.4,
                          transform: [{ moveZ: '1SH' }],
                        },
                      ],
                      count: 1,
                    },
                  ],
                },
                // 竖向通高隔板
                {
                  last: true,
                  spacing: [
                    {
                      group: [
                        {
                          x: 0.2,
                          y: '2出挑+0.2',
                          z: '1SH',
                          transform: [{ moveZ: -0.2 }],
                        },
                      ],
                      space: 4,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    马赛公寓通高格栅: { floor: [{}] },
    '马赛公寓中段方窗<墙高,柱宽,间距><墙颜色>': {
      unit: { 墙高: '1FH-1.6', 柱宽: 0.6, 间距: 2 },
      color: { 墙颜色: '#fff' },
      floor: [
        {
          facade: [
            {
              once: true,
              padding: { start: '0.5柱宽', end: '0.5柱宽', asRatio: false },
              proto: [
                {
                  last: true,
                  spacing: [
                    {
                      group: [{ x: '1柱宽', y: 0.5, z: '1SH' }],
                      space: '1间距',
                    },
                  ],
                },
              ],
            },
            {
              proto: [
                {
                  divide: [
                    {
                      group: [{ width: -0.2, height: '1墙高', color: '墙颜色' }],
                      count: 1,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    '马赛公寓屋顶通风塔<数量>': {
      unit: { 数量: 2 },
      floor: [
        {
          adjunct: [
            {
              once: true,
              count: '1数量',
              boxes: [
                { x: 2, y: 2, z: 10, transform: [{ rotateX: 5 }] },
                {
                  x: 2,
                  y: 2,
                  z: 10,
                  transform: [{ rotateX: 5 }, { rotateZ: 120 }],
                },
                {
                  x: 2,
                  y: 2,
                  z: 10,
                  transform: [{ rotateX: 5 }, { rotateZ: 240 }],
                },
                { x: 0.2, y: 1.8, z: 10.5, transform: [{ rotateX: 5 }] },
                {
                  x: 0.2,
                  y: 1.8,
                  z: 10.5,
                  transform: [{ rotateX: 5 }, { rotateZ: 120 }],
                },
                {
                  x: 0.2,
                  y: 1.8,
                  z: 10.5,
                  transform: [{ rotateX: 5 }, { rotateZ: 240 }],
                },
                { x: 2, y: 2, z: 0.2, transform: [{ moveY: -1, moveZ: 10.5 }] },
                {
                  x: 2,
                  y: 2,
                  z: 0.2,
                  transform: [{ moveY: -1, moveZ: 10.5 }, { rotateZ: 120 }],
                },
                {
                  x: 2,
                  y: 2,
                  z: 0.2,
                  transform: [{ moveY: -1, moveZ: 10.5 }, { rotateZ: 240 }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  building: {
    Marseille: {
      section: {
        roof: {
          height: 2,
          floor: [
            {
              extrude: [{ height: 1.5, toWall: 0.4 }, { height: 0.4 }],
            },
            {
              floor: { number: 1 },
              edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
              preset: [{ name: '马赛公寓屋顶通风塔<数量>' }],
              boxInside: [
                {
                  once: true,
                  along: 'LONGEST',
                  count: 9,
                  flex: { width: 2, height: 4, color: '#bbb' },
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
              edge: [{ clamp: { xMax: 0.5 } }],
              floor: { range: [{ bottom: 0.35, top: 0.5, asRatio: true }] },
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
              edge: [{ clamp: { xMax: 0.5 } }],
              floor: {
                range: [
                  { bottom: 0.35, asRatio: true, reverse: true },
                  { top: 0.5, asRatio: true, reverse: true },
                ],
              },
              preset: [{ name: '马赛公寓撞色立面阳台<出挑><颜色组合>' }],
            },
            {
              edge: [{ clamp: { xMin: 0.6, xMax: 0.1 } }],
              preset: [{ name: '马赛公寓撞色立面阳台<出挑><颜色组合>' }],
            },
            {
              edge: [{ clamp: { xMin: 0.9 } }, { along: 'DEPTH' }],
              preset: [{ name: '马赛公寓撞色立面阳台<出挑><颜色组合>' }],
            },
            // 中部方窗
            {
              edge: [{ clamp: { xMin: 0.5, xMax: 0.4 } }],
              preset: [{ name: '马赛公寓中段方窗<墙高,柱宽,间距><墙颜色>' }],
            },
            // 端部板墙
            {
              edge: [{ clamp: { xMin: 0.9 } }, { along: 'WIDTH' }],
              facade: [
                {
                  once: true,
                  proto: [
                    {
                      divide: [{ group: [{ width: -0.3, height: '1SH' }], count: 1 }],
                    },
                  ],
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
                      last: true,
                      spacing: [
                        {
                          group: [
                            {
                              x: 2,
                              y: 4,
                              z: '1SH',
                              transform: [{ rotateX: 10 }],
                            },
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
  },
}
