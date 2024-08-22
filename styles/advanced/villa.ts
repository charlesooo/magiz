import type { styleTypes } from '../../src/types/style'

export const styles: styleTypes.styles = {
  preset: {
    '新中式别墅坡屋顶<高度,出挑><颜色,屋顶颜色>': {
      unit: { 高度: 2, 出挑: 0.5 },
      color: { 颜色: '#863', 屋顶颜色: '#666' },
      floor: [
        {
          slopingRoof: [{ height: '1高度-0.3', color: '屋顶颜色', transform: [{ moveZ: 0.3 }] }],
        },
        {
          // scaleEdges: '-1出挑',
          extrude: [{ height: 0.2, color: '颜色', transform: [{ moveZ: 0.1 }] }],
        },
        {
          // scaleEdges: '0.1-1出挑',
          extrude: [{ height: 0.1 }],
        },
      ],
    },
    '新中式别墅段顶线脚<总高,标高><颜色>': {
      unit: { 总高: 0.6, 标高: '1BH-2.6' },
      color: { 颜色: '#eee' },
      floor: [
        {
          // scaleEdges: -0.2,
          extrude: [
            {
              once: true,
              height: 0.1,
              color: '颜色',
              transform: [{ moveZ: '1标高+1总高-0.1' }],
            },
            {
              once: true,
              height: 0.1,
              color: '颜色',
              transform: [{ moveZ: '1标高' }],
            },
          ],
        },
        {
          extrude: [
            {
              once: true,
              height: '1总高-0.2',
              color: '颜色',
              transform: [{ moveZ: '1标高+0.1' }],
            },
          ],
          facade: [
            {
              once: true,
              proto: [
                {
                  spacing: [
                    {
                      group: [
                        {
                          x: 0.2,
                          y: 0.2,
                          z: '1总高-0.2',
                          color: '颜色',
                          transform: [{ moveZ: '1标高+0.1' }],
                        },
                      ],
                      space: 0.6,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    '新中式别墅竖向划分阳台门<总高,标高><颜色>': {
      unit: { 总高: '1SH', 标高: 0.45 },
      color: { 颜色: '#541' },
      floor: [
        {
          facade: [
            {
              once: true,
              proto: [
                // 门上饰面，填充剩余段高
                {
                  spacing: [
                    {
                      space: 0.3,
                      group: [
                        {
                          x: 0.1,
                          y: 0.4,
                          z: '1SH-1标高-2.6',
                          color: '颜色',
                          transform: [{ moveZ: '1标高+2.6' }],
                        },
                      ],
                    },
                  ],
                  first: false,
                },
                // 门上横隔断
                {
                  spacing: [
                    { space: 0.1 },
                    {
                      space: 1.4,
                      group: [
                        {
                          width: -0.5,
                          height: 0.2,
                          color: '颜色',
                          transform: [{ moveZ: '1标高+2.4' }],
                        },
                      ],
                    },
                  ],
                  last: true,
                },
                {
                  spacing: [
                    { space: 0.1, group: [{ x: 0.2, y: 0.8, z: '1总高', color: '颜色' }] },
                    {
                      space: 0.7,
                      group: [
                        {
                          width: -0.2,
                          height: 2.4,
                          color: '颜色',
                          transform: [{ moveZ: '1标高' }],
                        },
                      ],
                    },
                    {
                      space: 0.7,
                      group: [
                        {
                          width: -0.2,
                          height: 2.4,
                          color: '颜色',
                          transform: [{ moveZ: '1标高' }],
                        },
                        // 该处为正中心，生成门把手
                        {
                          x: 0.1,
                          y: 0.5,
                          z: 0.6,
                          transform: [{ moveX: -0.2, moveZ: '1标高+0.6' }],
                        },
                        {
                          x: 0.1,
                          y: 0.5,
                          z: 0.6,
                          transform: [{ moveX: 0.2, moveZ: '1标高+0.6' }],
                        },
                      ],
                    },
                  ],
                  last: true,
                },
              ],
            },
          ],
        },
      ],
    },
    '新中式别墅横向门搭配竖向划分入户门<><颜色>': {
      color: { 颜色: '#541' },
      floor: [
        {
          facade: [
            {
              proto: [
                {
                  divide: [
                    {
                      group: [
                        { width: -0.3, height: 2.2, color: '颜色' },
                        {
                          width: -0.6,
                          height: 0.2,
                          color: '颜色',
                          shrink: -0.6,
                          transform: [{ moveX: -0.3, moveZ: 2.2 }],
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
      ],
    },
    '新中式别墅竖向划分立面窗<总高><浅色,深色>': {
      unit: { 总高: '1SH' },
      color: { 浅色: '#863', 深色: '#541' },
      floor: [
        {
          facade: [
            {
              once: true,
              proto: [
                {
                  spacing: [
                    { space: 1, group: [{ width: 0.2, height: '1总高' }] },
                    { space: 0.1, group: [{ x: 0.1, y: 0.3, z: '1总高', color: '浅色' }] },
                    { space: 0.6, group: [{ x: 0.1, y: 0.1, z: '1总高', color: '深色' }] },
                    { space: 1.2, group: [{ x: 0.1, y: 0.1, z: '1总高', color: '深色' }] },
                    { space: 0.6, group: [{ x: 0.1, y: 0.1, z: '1总高', color: '深色' }] },
                    { space: 0.1, group: [{ x: 0.1, y: 0.1, z: '1总高', color: '深色' }] },
                  ],
                  last: true,
                  lastWidth: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    '新中式别墅横向划分立面窗<墙板高,墙板降低><浅色,深色>': {
      unit: { 墙板高: 1.4, 墙板降低: 0.4 },
      color: { 浅色: '#863', 深色: '#541' },
      floor: [
        {
          facade: [
            {
              proto: [
                {
                  spacing: [
                    { space: 1 },
                    {
                      space: 2.6,
                      group: [
                        // 横窗格
                        {
                          width: -0.1,
                          height: 0.05,
                          color: '深色',
                          transform: [{ moveZ: 2.2 }],
                        },
                        // 横墙板
                        {
                          width: -0.2,
                          height: '1墙板高',
                          color: '浅色',
                          transform: [{ moveZ: '-1墙板降低' }],
                        },
                      ],
                    },
                  ],
                  last: true,
                  lastWidth: 1,
                },
              ],
            },
          ],
        },
      ],
    },
    '新中式别墅角柱<柱高><颜色>': {
      unit: { 柱高: '1BH-4' },
      color: { 颜色: '#541' },
      floor: [
        {
          facade: [
            {
              once: true,
              proto: [
                {
                  divide: [
                    {
                      group: [
                        {
                          x: 0.7,
                          y: 0.7,
                          z: -0.6,
                          color: '颜色',
                          transform: [{ moveZ: '1柱高' }],
                        },
                        { x: 0.6, y: 0.6, z: '1柱高-0.6' },
                        { x: 0.7, y: 0.7, z: 1, color: '颜色' },
                      ],
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
    '新中式别墅门廊柱<出挑,柱高><颜色>': {
      unit: { 出挑: 2, 柱高: '1BH-2.6' },
      color: { 颜色: '#541' },
      floor: [
        {
          facade: [
            {
              once: true,
              proto: [
                {
                  last: true,
                  divide: [
                    {
                      group: [
                        // 顶部装饰块
                        {
                          x: 0.3,
                          y: 0.7,
                          z: 0.3,
                          color: '颜色',
                          transform: [{ moveZ: '1柱高-0.4', moveY: '-1出挑' }],
                        },
                        { x: 0.6, y: 0.6, z: '1柱高', transform: [{ moveY: '-1出挑' }] },
                        { x: 0.7, y: 0.7, z: 1, color: '颜色', transform: [{ moveY: '-1出挑' }] },
                        // 灯
                        {
                          x: 0.1,
                          y: 0.8,
                          z: 0.1,
                          color: '颜色',
                          transform: [{ moveZ: 2.4, moveY: '-1出挑' }],
                        },
                        {
                          x: 0.08,
                          y: 0.78,
                          z: 0.9,
                          transform: [{ moveZ: 1.5, moveY: '-1出挑' }],
                        },
                        {
                          x: 0.1,
                          y: 0.8,
                          z: 0.1,
                          color: '颜色',
                          transform: [{ moveZ: 1.4, moveY: '-1出挑' }],
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
      ],
    },
    '新中式别墅门廊三级台阶<出挑>': {
      unit: { 出挑: 2 },
      floor: [
        {
          facade: [
            {
              once: true,
              proto: [
                {
                  divide: [
                    {
                      group: [
                        {
                          width: '2出挑',
                          height: 0.15,
                          transform: [{ moveZ: 0.3 }],
                        },
                        {
                          width: '2出挑+0.6',
                          height: 0.15,
                          shrink: -0.6,
                          transform: [{ moveX: -0.3, moveZ: 0.15 }],
                        },
                        {
                          width: '2出挑+1.2',
                          height: 0.15,
                          shrink: -1.2,
                          transform: [{ moveX: -0.6 }],
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
      ],
    },
    '新中式别墅门廊阳台线脚<出挑,板厚><颜色>': {
      unit: { 出挑: 2, 板厚: 0.4 },
      color: { 颜色: '#863' },
      floor: [
        // 外廊顶部线脚饰块
        {
          facade: [
            // 顶板和线脚
            {
              once: true,
              proto: [
                {
                  last: true,
                  spacing: [
                    {
                      group: [
                        {
                          x: 0.2,
                          y: '2出挑+1',
                          z: 0.4,
                          transform: [{ moveZ: '1SH-0.5' }],
                        },
                      ],
                      space: 0.6,
                    },
                  ],
                },
                // 外廊顶部线脚
                {
                  divide: [
                    {
                      count: 1,
                      group: [
                        {
                          width: '2出挑+1.6',
                          height: 0.2,
                          shrink: -1.6,
                          color: '#863',
                          transform: [{ moveX: -0.8, moveZ: '1SH+0.1' }],
                        },
                        {
                          width: '2出挑+1.2',
                          height: 0.1,
                          shrink: -1.2,
                          transform: [{ moveX: -0.6, moveZ: '1SH' }],
                        },
                        {
                          width: '2出挑+1',
                          height: 0.1,
                          shrink: -1,
                          transform: [{ moveX: -0.5, moveZ: '1SH-0.1' }],
                        },
                        {
                          width: '2出挑+0.8',
                          height: 0.4,
                          shrink: -0.8,
                          transform: [{ moveX: -0.4, moveZ: '1SH-0.5' }],
                        },
                        {
                          width: '2出挑+1',
                          height: 0.1,
                          shrink: -1,
                          transform: [{ moveX: -0.5, moveZ: '1SH-0.6' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // 各层阳台
            {
              proto: [
                // 玻璃围栏侧面
                {
                  last: true,
                  divide: [
                    {
                      group: [
                        {
                          x: 0.02,
                          y: '1出挑',
                          z: 1,
                          color: 'G',
                          transform: [{ moveY: '-0.5出挑' }],
                        },
                      ],
                      count: 1,
                    },
                  ],
                },
                {
                  divide: [
                    // 玻璃围栏正面
                    {
                      group: [
                        {
                          width: 0.02,
                          height: 1,
                          color: 'G',
                          transform: [{ moveY: '-1出挑' }],
                        },
                      ],
                      count: 1,
                    },
                    // 楼板带线脚
                    {
                      group: [
                        {
                          width: '2出挑+1',
                          height: -0.1,
                          shrink: -1,
                          color: '颜色',
                          transform: [{ moveX: -0.5 }],
                        },
                        {
                          width: '2出挑+0.8',
                          height: '0.2-1板厚',
                          shrink: -0.7,
                          color: '颜色',
                          transform: [{ moveX: -0.35, moveZ: -0.1 }],
                        },
                        {
                          width: '2出挑+1',
                          height: 0.1,
                          shrink: -0.8,
                          color: '颜色',
                          transform: [{ moveX: -0.4, moveZ: '-1板厚' }],
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
      ],
    },
  },
  building: {
    新中式别墅: {
      section: {
        roof: {
          height: 2,
          floor: [
            {
              preset: [{ name: '新中式别墅坡屋顶<高度,出挑><颜色,屋顶颜色>' }],
            },
          ],
        },
        middle: {
          floor: [
            {
              setEdges: [{ clamp: { xCentral: 1.2, asRatio: false } }],
              preset: [{ name: '新中式别墅横向门搭配竖向划分入户门<><颜色>' }],
            },
            {
              setEdges: [{ clamp: { xCentral: 2, asRatio: false, reverse: true } }],
              preset: [{ name: '新中式别墅横向划分立面窗<墙板高,墙板降低><浅色,深色>' }],
            },
            {
              setEdges: [{ clamp: { xCentral: 3, asRatio: false } }],
              preset: [{ name: '新中式别墅门廊阳台线脚<出挑,板厚><颜色>' }],
            },
          ],
        },
        bottom: {
          height: 3,
          floor: [
            {
              setEdges: [{ clamp: { xCentral: 2, asRatio: false } }],
              preset: [
                {
                  unit: { 总高: '1BH-2.6' },
                  name: '新中式别墅竖向划分阳台门<总高,标高><颜色>',
                },
              ],
            },
            {
              setEdges: [{ clamp: { xCentral: 2, asRatio: false, reverse: true } }],
              preset: [
                {
                  unit: { 总高: '1BH-2.6' },
                  name: '新中式别墅竖向划分立面窗<总高><浅色,深色>',
                },
                {
                  unit: { 墙板高: 1, 墙板降低: 0 },
                  color: { 浅色: '#541' },
                  name: '新中式别墅横向划分立面窗<墙板高,墙板降低><浅色,深色>',
                },
              ],
            },
            {
              preset: [
                { name: '新中式别墅段顶线脚<总高,标高><颜色>' },
                { name: '新中式别墅角柱<柱高><颜色>' },
              ],
              extrude: [{ once: true, height: '1BH-2.5', color: 'G' }],
            },
            {
              setEdges: [{ clamp: { xCentral: 3, asRatio: false } }],
              preset: [
                { name: '新中式别墅门廊柱<出挑,柱高><颜色>' },
                { name: '新中式别墅门廊三级台阶<出挑>' },
              ],
            },
          ],
        },
      },
    },
  },
}
