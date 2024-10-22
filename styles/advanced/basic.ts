import type { styleTypes } from '../../src/types/style'

export const styles: styleTypes.styles = {
  preset: {
    '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>': {
      unit: { 高度: 2, 抬升: 0 },
      color: { 颜色A: '#eee', 颜色B: ['#666', '#333'] },
      floor: [
        {
          floor: { number: 1 },
          edge: [{ offset: { x: 0.1, y: 0.1, asRatio: true } }],
          match: [
            {
              flexes: [
                { width: 2 },
                { width: 4, height: '1高度', color: '颜色A', transform: [{ moveZ: '1抬升' }] },
              ],
              control: { chance: 0.8 },
              along: 'WIDTH',
              sandwich: true,
            },
            {
              flexes: [
                { width: 1 },
                { width: 2, height: '0.5高度', color: '颜色B', transform: [{ moveZ: '1抬升' }] },
              ],
              control: { chance: 0.2 },
              along: 'DEPTH',
              sandwich: true,
            },
          ],
        },
      ],
    },
    '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>': {
      unit: { 高度: 1.5, 厚度: 0.2, 缩进: 0, 抬升: 0 },
      color: { 颜色: '' },
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
    '订阅中段随机垂直墙板<墙宽,窗宽,降低,概率><墙板>': {
      unit: { 墙宽: 4, 窗宽: 2, 降低: 0, 概率: 0.8 },
      color: { 墙板: '#eee' },
      floor: [
        {
          extrude: [{ once: true, height: '1SH-1降低', color: 'G' }],
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
                          y: 0.2,
                          z: '1SH-1降低',
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
    '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>': {
      unit: { 柱宽比例: 0.2, 厚度: 0.6, 降低: 0 },
      color: { 角柱: '#bbb', 柱子: '#bbb', 楼板: '#666', 门: '#666', 挑檐: '#666' },
      floor: [
        {
          facade: [
            {
              once: true,
              padding: { start: '1柱宽比例', end: '1柱宽比例' },
              proto: [
                // 两侧角柱
                {
                  area: 'BOTH',
                  divide: [
                    { count: 1, group: [{ width: '2厚度', height: '1SH-1降低', color: '角柱' }] },
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
                          width: '1.6厚度',
                          height: '0.2*(1SH-1降低)',
                          color: '楼板',
                          transform: [{ moveZ: '0.8*(1SH-1降低)' }],
                        },
                      ],
                    },
                  ],
                },
                // 柱子
                {
                  first: false,
                  spacing: [
                    {
                      space: 4,
                      group: [
                        {
                          x: 1,
                          y: '1厚度',
                          z: '0.8*(1SH-1降低)',
                          color: '柱子',
                          transform: [{ moveY: '0.5厚度-0.2' }],
                        },
                      ],
                    },
                  ],
                },
                // 入口和挑檐
                {
                  spacing: [
                    {
                      control: { chance: 0.2 },
                      space: 4,
                      group: [
                        {
                          x: 1.6,
                          y: 0.2,
                          z: 3,
                          color: '门',
                          transform: [{ moveX: 2 }],
                        },
                        {
                          x: 4,
                          y: 2,
                          z: 0.2,
                          color: '挑檐',
                          transform: [{ moveX: 2, moveZ: 3 }],
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
          floor: { range: [{ bottom: 1 }] },
          extrude: [{ height: -1, color: '楼板' }],
        },
        // 幕墙
        {
          edge: [{ offset: '0.5厚度+0.3' }],
          facade: [
            {
              once: true,
              proto: [
                {
                  divide: [
                    {
                      count: 1,
                      group: [{ width: 1, height: '1SH-1降低-1', color: 'G' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    '订阅底部立面A<间距,柱宽,格宽,降低><柱,格,楼板,门,挑檐>': {
      unit: { 间距: 8, 柱宽: 3, 格宽: 0.4, 降低: 1 },
      color: { 柱: '#eee', 格: '#fff', 楼板: '#bbb', 门: '#666', 挑檐: '#666' },
      floor: [
        {
          extrude: [{ once: true, height: '1SH-1降低', color: 'G' }],
          facade: [
            {
              once: true,
              proto: [
                // 竖向柱子
                {
                  last: true,
                  lastWidth: '1柱宽',
                  spacing: [
                    {
                      space: '1柱宽+(1间距-1柱宽)/4',
                      group: [
                        {
                          x: '1柱宽',
                          y: 0.6,
                          z: '1SH-1降低',
                          color: '柱',
                          transform: [{ moveX: '1柱宽/2' }],
                        },
                      ],
                    },
                    {
                      space: '(1间距-1柱宽)/4',
                      group: [
                        {
                          x: '1格宽',
                          y: 1,
                          z: '1SH-1FH+1-1降低',
                          color: '格',
                          transform: [{ moveZ: '1FH-1' }],
                        },
                      ],
                      repeat: 2,
                    },
                  ],
                },
                // 门和挑檐
                {
                  lastWidth: '1柱宽',
                  spacing: [
                    {
                      control: { chance: 0.2 },
                      space: '1间距',
                      group: [
                        {
                          x: '1间距',
                          y: 3,
                          z: 0.2,
                          color: '挑檐',
                          transform: [{ moveX: '0.5间距+0.5柱宽', moveY: 0.5, moveZ: 3.1 }],
                        },
                        {
                          x: 0.8,
                          y: 0.2,
                          z: 3,
                          color: '门',
                          transform: [{ moveX: '0.5间距+0.5柱宽-0.4' }],
                        },
                        {
                          x: 0.8,
                          y: 0.2,
                          z: 3,
                          color: '门',
                          transform: [{ moveX: '0.5间距+0.5柱宽+0.4' }],
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
          edge: [{ offset: -0.2 }],
          floor: { range: [{ bottom: 1 }] },
          extrude: [{ height: -1, color: '楼板' }],
        },
        {
          edge: [{ offset: { x: 0.1, y: 0.1, asRatio: true } }],
          extrude: [{ once: true, height: '1SH' }],
        },
      ],
    },
    '订阅底部格栅A<间距,柱宽,格宽,降低><浅色,深色,门,挑檐>': {
      unit: { 间距: 8, 柱宽: 3, 格宽: 0.4, 降低: 1 },
      color: { 浅色: '#eee', 深色: '#bbb', 门: '#666', 挑檐: '#666' },
      floor: [
        {
          extrude: [{ once: true, height: '1SH-1降低', color: 'G' }],
          facade: [
            {
              once: true,
              proto: [
                // 格栅
                {
                  last: true,
                  spacing: [
                    {
                      space: 1,
                      group: [
                        {
                          x: 0.1,
                          y: 0.6,
                          z: '1SH-1.6',
                          color: '深色',
                          transform: [{ moveZ: 0.6 }],
                        },
                      ],
                    },
                  ],
                },
                {
                  divide: [
                    {
                      count: 1,
                      group: [
                        {
                          width: 0.2,
                          height: 0.6,
                          color: '深色',
                        },
                      ],
                    },
                  ],
                },
                // 门和挑檐
                {
                  lastWidth: '1柱宽',
                  spacing: [
                    {
                      control: { chance: 0.2 },
                      space: '1间距',
                      group: [
                        {
                          x: 0.8,
                          y: 1,
                          z: 3,
                          color: '门',
                          transform: [{ moveX: '0.5间距+0.5柱宽-0.4' }],
                        },
                        {
                          x: 0.8,
                          y: 1,
                          z: 3,
                          color: '门',
                          transform: [{ moveX: '0.5间距+0.5柱宽+0.4' }],
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
          // scaleEdges: 0.5,
          floor: { range: [{ bottom: 1 }] },
          extrude: [{ height: -1, color: '浅色' }],
        },
      ],
    },
  },
  building: {},
}
