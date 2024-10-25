import type { styleTypes } from '../../src/types/styleTypes'

export const styles: styleTypes.styles = {
  preset: {},
  building: {
    R1: {
      tag: ['随机'],
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>' }],
            },
            {
              edge: [{ offset: 1 }],
              preset: [
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
              floor: { range: [{ bottom: 1 }] },
              edge: [{ offset: -1 }],
              extrude: [
                {
                  height: '0.6FH',
                  color: '_WOOD',
                  transform: [{ moveZ: '-0.2FH' }],
                },
              ],
            },
            {
              edge: [{ offset: -1 }],
              extrude: [
                { once: true, height: 0.5, color: '#333' },
                {
                  once: true,
                  height: 0.5,
                  color: '#333',
                  transform: [{ moveZ: '1SH' }],
                },
              ],
            },
            {
              preset: [
                {
                  name: '订阅中段随机垂直墙板<墙宽,窗宽,降低,概率><墙板>',
                  color: { 墙板: '_WOOD' },
                },
              ],
            },
          ],
        },
        bottom: {
          height: '0.1BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                {
                  name: '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>',
                  color: {
                    角柱: '#666',
                    柱子: '#666',
                    楼板: '#333',
                    门: '_WOOD',
                  },
                },
              ],
            },
          ],
        },
      },
    },
    R2: {
      tag: ['随机'],
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>' }],
            },
            {
              preset: [
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  color: { 颜色: '_WOOD' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              edge: [{ offset: -1 }],
              extrude: [
                { height: -1, color: '#666' },
                {
                  height: 0.1,
                  color: '#666',
                  transform: [{ moveZ: '0.33FH-0.38' }],
                },
                {
                  height: 0.1,
                  color: '#666',
                  transform: [{ moveZ: '0.66FH-0.68' }],
                },
                {
                  once: true,
                  height: -1,
                  color: '#666',
                  transform: [{ moveZ: '1SH' }],
                },
              ],
            },
            {
              preset: [
                {
                  name: '订阅中段随机垂直墙板<墙宽,窗宽,降低,概率><墙板>',
                  unit: { 窗宽: 4, 降低: 0.5 },
                  color: { 墙板: '_WOOD' },
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
                  name: '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>',
                  unit: { 降低: 1 },
                  color: {
                    角柱: '#666',
                    柱子: '#666',
                    楼板: '_WOOD',
                    门: '_WOOD',
                  },
                },
              ],
            },
          ],
        },
      },
    },
    R5: {
      tag: ['随机'],
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>' }],
            },
            {
              edge: [{ offset: 1 }],
              preset: [
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
              floor: { range: [{ bottom: 1 }] },
              edge: [{ offset: { x: -1, y: 2 } }],
              extrude: [{ height: -1, color: '#fff' }],
            },
            {
              floor: { range: [{ bottom: 1 }] },
              edge: [{ offset: { x: 2, y: -1 } }],
              extrude: [{ height: -1, color: '#fff' }],
            },
            {
              edge: [{ offset: -0.5 }],
              extrude: [
                { once: true, height: 0.5, color: '#333' },
                {
                  once: true,
                  height: 0.5,
                  color: '#333',
                  transform: [{ moveZ: '1SH' }],
                },
              ],
            },
            {
              preset: [
                {
                  name: '订阅中段随机垂直墙板<墙宽,窗宽,降低,概率><墙板>',
                  color: { 墙板: ['#888', '#bbb', '#eee'] },
                },
              ],
            },
          ],
        },
        bottom: {
          height: '0.1BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                {
                  name: '订阅底部角柱A<柱宽比例,厚度,降低><角柱,柱子,楼板,门,挑檐>',
                  color: {
                    角柱: '#666',
                    柱子: ['#888', '#bbb', '#eee'],
                    楼板: '#333',
                    门: '_WOOD',
                  },
                },
              ],
            },
          ],
        },
      },
    },
    R6: {
      tag: ['随机'],
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '订阅屋顶随机设备<高度,抬升><颜色A,颜色B>' }],
            },
            {
              preset: [
                {
                  name: '订阅屋顶女儿墙<高度,厚度,缩进,抬升><颜色>',
                  unit: { 缩进: 0.5 },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            // 楼板
            {
              extrude: [{ height: -1, transform: [{ moveZ: '1FH' }] }],
            },
            // 底部装饰横板
            {
              edge: [{ offset: { x: -1, y: 2 } }],
              extrude: [{ once: true, height: -1 }],
            },
            {
              floor: { range: [{ bottom: 1 }] },
              edge: [{ along: 'WIDTH' }],
              facade: [
                {
                  padding: { start: 1, end: 4, asRatio: false },
                  proto: [
                    {
                      divide: [
                        {
                          count: 1,
                          group: [{ width: 1, height: -1, color: ['#fff', '#999'] }],
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
          height: 5,
          floor: [
            {
              facade: [
                {
                  once: true,
                  proto: [
                    {
                      last: true,
                      lastWidth: 4,
                      spacing: [
                        {
                          control: { chance: 1 },
                          space: 6,
                          group: [
                            {
                              x: 4,
                              y: 0.5,
                              z: '1BH-0.5',
                              color: ['#999', '#bbb'],
                              transform: [{ moveX: 2 }],
                            },
                          ],
                        },
                      ],
                    },
                    // 门加挑檐
                    {
                      lastWidth: 4,
                      spacing: [
                        {
                          control: { chance: 0.3 },
                          space: 6,
                          group: [
                            {
                              x: 2,
                              y: 0.2,
                              z: 2.4,
                              transform: [{ moveX: 5, moveY: 0.15 }],
                            },
                            {
                              x: 2,
                              y: 0.5,
                              z: '1SH-3.4',
                              transform: [{ moveX: 5, moveZ: 2.4 }],
                              color: ['#fff', '#C6FF00', '#64B5F6'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            // 玻璃幕墙
            {
              edge: [{ offset: 0.75 }],
              facade: [
                {
                  once: true,
                  proto: [
                    {
                      divide: [
                        {
                          count: 1,
                          group: [{ width: 1, height: '1BH-0.5', color: 'G' }],
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
    },
  },
}
