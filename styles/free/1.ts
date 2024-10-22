import type { styleTypes } from '../../src/types/style'

export const styles: styleTypes.styles = {
  preset: {
    '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>': {
      unit: { 缩进: 0, 高度: 1.2, 厚度: 0.2, 抬升: 0 },
      color: { 颜色: '#eee' },
      floor: [
        {
          edge: [{ offset: '1缩进' }],
          extrude: [
            {
              height: '1高度',
              toWall: '1厚度',
              color: '颜色',
              transform: [{ moveZ: '1抬升' }],
            },
          ],
        },
      ],
    },
    '免费中段<楼板缩进,板厚>': {
      unit: { 楼板缩进: 0.5, 板厚: 0.6 },
      floor: [
        {
          edge: [{ offset: -0.4 }],
          extrude: [
            { once: true, height: '-1板厚', transform: [{ moveZ: '1SH' }] },
            { once: true, height: '-1板厚' },
          ],
        },
        {
          edge: [{ offset: '1楼板缩进' }],
          extrude: [{ height: '-1板厚' }],
        },
        {
          extrude: [{ once: true, height: '1SH-1板厚', color: 'G' }],
        },
      ],
    },
    '免费中段竖向<柱宽,间距,楼板缩进>': {
      unit: { 柱宽: 1, 间距: 4, 楼板缩进: 0.5 },
      floor: [
        {
          edge: [{ offset: '1楼板缩进' }],
          floor: { range: [{ top: -1 }] },
          extrude: [{ height: -0.6 }],
        },
        {
          extrude: [{ once: true, height: '1SH-0.6', color: 'G' }],
          facade: [
            {
              once: true,
              proto: [
                {
                  spacing: [
                    {
                      space: '1间距',
                      group: [{ x: '1柱宽', y: '1柱宽', z: '1SH' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    '免费中段随机垂直墙板<墙宽,窗宽,概率><墙板>': {
      unit: { 墙宽: 4, 窗宽: 2, 概率: 0.8 },
      color: { 墙板: '#eee' },
      floor: [
        {
          extrude: [{ once: true, height: '1SH', color: 'G' }],
          facade: [
            {
              once: true,
              proto: [
                {
                  last: true,
                  lastWidth: '1墙宽',
                  spacing: [
                    {
                      control: { chance: '1概率' },
                      space: '1墙宽+1窗宽',
                      group: [
                        {
                          x: '1墙宽',
                          y: 0.5,
                          z: '1SH',
                          color: '墙板',
                          transform: [{ moveX: '0.5墙宽' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    '免费底部加核心筒<楼板缩进,板厚>': {
      unit: { 楼板缩进: 0.5, 板厚: 1.2 },
      floor: [
        {
          edge: [{ offset: '1楼板缩进' }],
          floor: { range: [{ bottom: 1, top: -1 }] },
          extrude: [{ height: '-1板厚' }],
        },
        {
          extrude: [{ once: true, height: '1SH-1板厚', color: 'G' }],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
          extrude: [{ once: true, height: '1BH+4' }],
        },
      ],
    },
    '免费底部竖向加核心筒<柱宽,窗宽,楼板缩进,板厚,降低>': {
      unit: { 柱宽: 1, 窗宽: 2, 楼板缩进: 0.5, 板厚: 1.2, 降低: 0 },
      floor: [
        {
          edge: [{ offset: '1楼板缩进' }],
          floor: { range: [{ bottom: 1, top: -1 }] },
          extrude: [{ height: '-1板厚' }],
        },
        {
          extrude: [{ once: true, height: '1SH-1板厚', color: 'G' }],
          facade: [
            {
              once: true,
              proto: [
                {
                  spacing: [
                    {
                      space: '1柱宽+1窗宽',
                      group: [{ x: '1柱宽', y: '1柱宽', z: '1SH-1降低' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
          extrude: [{ once: true, height: '1BH+4' }],
        },
      ],
    },
    '免费底部马赛克加核心筒<概率><马赛克>': {
      color: { 马赛克: ['#888', '#fff'] },
      unit: { 降低: 0, 概率: 0.8 },
      floor: [
        {
          extrude: [{ once: true, height: '1SH', color: 'G' }],
          facade: [
            {
              proto: [
                {
                  last: true,
                  lastWidth: 4,
                  spacing: [
                    {
                      control: { chance: '1概率' },
                      space: 6,
                      group: [
                        {
                          x: 4,
                          y: 0.5,
                          z: '1FH-0.6',
                          color: '马赛克',
                          transform: [{ moveX: 2 }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          floor: { range: [{ top: -1, bottom: 1 }] },
          // scaleEdges: -1,
          extrude: [{ height: -0.6 }],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
          extrude: [{ once: true, height: '1BH+4' }],
        },
      ],
    },
    '免费底部挑廊加核心筒<缩进>': {
      unit: { 缩进: 3 },
      floor: [
        {
          floor: { range: [{ bottom: 1 }] },
          extrude: [{ height: -0.6 }, { height: 1, color: 'G' }],
        },
        {
          edge: [{ offset: 0.4 }],
          facade: [
            {
              once: true,
              proto: [
                {
                  spacing: [
                    {
                      space: 4,
                      group: [{ x: 1, y: 1, z: '1SH-0.6' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          edge: [{ offset: '1缩进' }],
          extrude: [{ once: true, height: '1SH', color: 'G' }],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
          extrude: [{ once: true, height: '1BH+4' }],
        },
      ],
    },
    '免费底部宽角柱加核心筒<厚度,降低><浅色,深色>': {
      unit: { 厚度: 0.6, 降低: 0 },
      color: { 浅色: '#eee', 深色: '#999' },
      floor: [
        {
          facade: [
            {
              once: true,
              padding: { start: 0.2, end: 0.2 },
              proto: [
                // 两侧墙板
                {
                  area: 'BOTH',
                  divide: [
                    {
                      count: 1,
                      group: [{ width: '1厚度', height: '1SH-1降低', color: '浅色' }],
                    },
                  ],
                },
                // 中间顶部横板
                {
                  area: 'MIDDLE',
                  divide: [
                    {
                      count: 1,
                      group: [
                        {
                          width: '0.8厚度',
                          height: '0.4FH',
                          color: '深色',
                          transform: [{ moveZ: '1SH-0.4FH-1降低' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        // 楼板
        {
          edge: [{ offset: 1 }],
          floor: { range: [{ bottom: 1 }] },
          extrude: [{ height: -1 }],
        },
        // 幕墙
        {
          extrude: [{ once: true, height: '1SH', color: 'G' }],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
          extrude: [{ once: true, height: '1BH+4' }],
        },
      ],
    },
  },
  building: {
    Random: {
      type: 'FREE',
      section: {
        roof: {
          floor: [{ preset: [{ key: '免费屋顶' }] }],
        },
        middle: {
          floor: [{ preset: [{ key: '免费中段' }] }],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [{ preset: [{ key: '免费底部' }] }],
        },
      },
    },
    S0: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 缩进: 1 },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>' }],
            },
          ],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [
            {
              preset: [{ name: '免费底部加核心筒<楼板缩进,板厚>' }],
            },
          ],
        },
      },
    },
    S1: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>' }],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>' }],
            },
          ],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [
            {
              preset: [{ name: '免费底部挑廊加核心筒<缩进>' }],
            },
          ],
        },
      },
    },
    S2: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>' }],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>' }],
            },
          ],
        },
        bottom: {
          height: '0.15BH-0.6',
          floorHeight: 5,
          floor: [
            {
              preset: [{ name: '免费底部宽角柱加核心筒<厚度,降低><浅色,深色>' }],
            },
          ],
        },
      },
    },
    S3: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 高度: 2 },
                  color: { 颜色: '#bbb' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段竖向<柱宽,间距,楼板缩进>' }],
            },
          ],
        },
        bottom: {
          height: '0.1BH',
          floorHeight: 5,
          floor: [
            {
              preset: [{ name: '免费底部宽角柱加核心筒<厚度,降低><浅色,深色>' }],
            },
          ],
        },
      },
    },
    S4: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 高度: 2 },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [
                {
                  name: '免费中段竖向<柱宽,间距,楼板缩进>',
                  unit: { 间距: 3 },
                },
              ],
            },
          ],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                {
                  name: '免费底部马赛克加核心筒<概率><马赛克>',
                  color: { 马赛克: '#eee' },
                },
              ],
            },
          ],
        },
      },
    },
    S5: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 高度: 3, 缩进: -0.2, 抬升: -1 },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [
                {
                  name: '免费中段竖向<柱宽,间距,楼板缩进>',
                  unit: { 柱宽: 1.4, 窗宽: 2 },
                },
              ],
            },
          ],
        },
        bottom: {
          height: '0.15BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                {
                  name: '免费底部竖向加核心筒<柱宽,窗宽,楼板缩进,板厚,降低>',
                  unit: { 柱宽: 1, 窗宽: 3 },
                },
              ],
            },
          ],
        },
      },
    },
  },
}
