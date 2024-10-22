import type { styleTypes } from '../../src/types/style'

export const styles: styleTypes.styles = {
  preset: {
    ///////////////// using basic.ts /////////////////
    '订阅中部45度拟合立面<出挑><横板>': {
      unit: { 出挑: 1 },
      color: { 横板: '_WOOD' },
      floor: [
        {
          floor: { range: [{ top: -1 }] },
          // scaleEdges: '-1出挑',
          extrude: [{ height: -1, color: '横板' }],
        },
        {
          match: [
            {
              once: true,
              flexes: [
                { width: 0.4, height: '1SH-1' },
                { width: 3, height: '1SH-1', color: 'G' },
              ],
              along: 45,
            },
          ],
        },
      ],
    },
    '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>': {
      unit: { 板宽: 0.4, 窗宽: 4, 窗进深: 0.5, 修正高度: 0, 修正标高: 0 },
      color: { 颜色: '#fff' },
      floor: [
        {
          match: [
            {
              sandwich: true,
              once: true,
              flexes: [
                {
                  width: '1板宽',
                  height: '1SH+1修正高度',
                  color: '颜色',
                  transform: [{ moveZ: '1修正标高' }],
                },
                {
                  width: '1窗宽',
                  height: '1SH+1修正高度',
                  color: 'G',
                  shrink: '2窗进深',
                  transform: [{ moveZ: '1修正标高' }],
                },
              ],
              along: 'DEPTH',
            },
          ],
        },
      ],
    },
  },
  building: {
    M451: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  color: { 颜色: '_WOOD' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [{ preset: [{ name: '订阅中部45度拟合立面<出挑><横板>' }] }],
        },
        bottom: {
          height: '0.15BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                {
                  name: '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>',
                  color: { 角柱: '_WOOD' },
                  unit: { 降低: 1 },
                },
              ],
            },
          ],
        },
      },
    },
    M452: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  color: { 颜色: '#666' },
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
                  name: '订阅中部45度拟合立面<出挑><横板>',
                  unit: { 出挑: 0.4 },
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
                  name: '订阅底部立面A<间距,柱宽,格宽,降低><柱,格,楼板,门,挑檐>',
                  color: { 柱: '#666', 格: '#eee', 楼板: '_WOOD', 门: '#fff' },
                  unit: { 降低: 1 },
                },
              ],
            },
          ],
        },
      },
    },
    M01: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  unit: { 缩进: 1 },
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
                  name: '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>',
                  unit: { 修正标高: -0.5 },
                },
              ],
            },
            {
              edge: [{ offset: 0.5 }],
              extrude: [
                { height: -1, color: '_WOOD' },
                { once: true, height: -1, color: '_WOOD', transform: [{ moveZ: '1SH' }] },
              ],
              facade: [
                {
                  proto: [
                    {
                      divide: [
                        {
                          count: 1,
                          group: [{ width: -0.1, height: 1, color: 'G' }],
                        },
                      ],
                    },
                  ],
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
              edge: [{ offset: 0.5 }],
              preset: [
                {
                  name: '订阅底部立面A<间距,柱宽,格宽,降低><柱,格,楼板,门,挑檐>',
                  color: { 柱: '#fff', 楼板: '_WOOD', 门: '_WOOD' },
                  unit: { 降低: 1 },
                },
              ],
            },
          ],
        },
      },
    },
    M02: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              preset: [{ name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>' }],
            },
            {
              preset: [{ name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>' }],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [
                {
                  name: '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>',
                  unit: { 修正标高: -0.5 },
                },
              ],
            },
            {
              floor: { range: [{ top: -1 }] },
              edge: [{ offset: { x: 0.5, y: -1 } }],
              extrude: [{ height: -1, color: '_WOOD' }],
            },
          ],
        },
        bottom: {
          height: '0.15BH',
          floorHeight: 5,
          floor: [
            {
              edge: [{ offset: 0.5 }],
              preset: [
                {
                  name: '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>',
                  unit: { 柱宽比例: 0.1, 降低: 1 },
                  color: { 角柱: '#fff', 柱子: '#fff', 门: '_WOOD' },
                },
              ],
            },
            {
              edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
              extrude: [{ height: '1BH' }],
            },
          ],
        },
      },
    },
    M03: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  unit: { 厚度: 0.4, 缩进: -0.4 },
                  color: { 颜色: '#bbb' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              edge: [{ offset: -0.5 }],
              preset: [
                {
                  name: '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>',
                  unit: { 板宽: 2, 窗宽: 2, 窗进深: 0.4, 修正标高: -0.5 },
                  color: { 颜色: '_WOOD' },
                },
              ],
            },
            {
              floor: { range: [{ top: -1 }] },
              extrude: [{ height: -1 }],
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
                  name: '订阅底部立面A<间距,柱宽,格宽,降低><柱,格,楼板,门,挑檐>',
                  color: { 柱: '#bbb', 格: '#fff', 楼板: '#666', 门: '_WOOD' },
                  unit: { 间距: 5, 柱宽: 2, 降低: 1 },
                },
              ],
            },
          ],
        },
      },
    },
    M04: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              // scaleEdges: 0.5,
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  unit: { 缩进: 1 },
                  color: { 颜色: '#666' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              floor: { range: [{ top: 0.15, asRatio: true }] },
              preset: [
                {
                  name: '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>',
                  unit: { 窗进深: -0.4 },
                  color: { 颜色: '#666' },
                },
              ],
            },
            {
              floor: { range: [{ top: 0.15, asRatio: true }] },
              // scaleEdges: 0.5,
              extrude: [
                { height: -1, color: '_WOOD' },
                {
                  once: true,
                  height: -1,
                  color: '_WOOD',
                  transform: [{ moveZ: '1SH' }],
                },
              ],
            },
            {
              floor: { range: [{ top: 0.15, asRatio: true, reverse: true }] },
              // scaleEdges: 1,
              extrude: [
                {
                  height: -1,
                  color: '_WOOD',
                  transform: [{ moveZ: '1FH' }],
                },
              ],
            },
            {
              floor: { range: [{ top: 0.15, asRatio: true, reverse: true }] },
              extrude: [{ once: true, height: '1SH-1', color: 'G' }],
              facade: [
                {
                  once: true,
                  proto: [
                    {
                      last: true,
                      spacing: [
                        {
                          space: 1,
                          group: [{ x: 0.2, y: 0.6, z: '1SH-1', color: '#666' }],
                        },
                      ],
                    },
                  ],
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
                  name: '订阅底部格栅A<间距,柱宽,格宽,降低><浅色,深色,门,挑檐>',
                  unit: { 柱宽: 2, 降低: 1 },
                  color: { 深色: '#666', 浅色: '#fff' },
                },
              ],
            },
            {
              edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
              extrude: [{ once: true, height: '1BH' }],
            },
          ],
        },
      },
    },
    M05: {
      section: {
        roof: {
          height: 3,
          floor: [
            {
              // scaleEdges: 0.5,
              preset: [
                {
                  name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>',
                },
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  color: { 颜色: '#666' },
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
                  name: '订阅中部开间拟合立面<板宽,窗宽,窗进深,修正高度,修正标高><颜色>',
                  unit: { 窗进深: -0.4 },
                  color: { 颜色: '#666' },
                },
              ],
            },
            {
              edge: [{ offset: -0.5 }],
              extrude: [
                { height: -1, color: '_WOOD' },
                {
                  once: true,
                  height: -1,
                  color: '_WOOD',
                  transform: [{ moveZ: '1SH' }],
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
                  name: '订阅底部立面A<间距,柱宽,格宽,降低><柱,格,楼板,门,挑檐>',
                  unit: { 柱宽: 2, 降低: 1 },
                  color: { 柱: '#666', 格: '#666', 楼板: '_WOOD', 门: '_WOOD' },
                },
              ],
            },
          ],
        },
      },
    },
  },
}
