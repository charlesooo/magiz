import { preset } from '../../class/style'
import type { styleTypes } from '../../types/styleTypes'

export const styles: styleTypes.styles = {
  R1: {
    tags: {},
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset({ name: 'CT:随机设备' }),
              preset({ name: 'CT:女儿墙', color: { 颜色: '#666' }, unit: { 缩进: 1 } }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          {
            control: { first: 1 },
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
            presets: [preset({ name: 'CM:随机垂直墙板', color: { 墙板: '_WOOD' } })],
          },
        ],
      },
      bottom: {
        height: '0.1BH',
        floorHeight: 5,
        floor: [
          {
            presets: [
              preset({
                name: 'CB:角柱A',
                color: { 角柱: '#666', 柱子: '#666', 楼板: '#333', 门: '_WOOD' },
              }),
            ],
          },
        ],
      },
    },
  },
  R2: {
    tags: {},
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset({ name: 'CT:随机设备' }),
              preset({ name: 'CT:女儿墙', color: { 颜色: '_WOOD' } }),
            ],
          },
          {},
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
            presets: [
              preset({
                name: 'CM:随机垂直墙板',
                unit: { 窗宽: 4, 降低: 0.5 },
                color: { 墙板: '_WOOD' },
              }),
            ],
          },
        ],
      },
      bottom: {
        height: '0.15BH',
        floorHeight: 5,
        floor: [
          {
            presets: [
              preset({
                name: 'CB:角柱A',
                unit: { 降低: 1 },
                color: { 角柱: '#666', 柱子: '#666', 楼板: '_WOOD', 门: '_WOOD' },
              }),
            ],
          },
        ],
      },
    },
  },
  R5: {
    tags: {},
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset({ name: 'CT:随机设备' }),
              preset({ name: 'CT:女儿墙', color: { 颜色: '#666' }, unit: { 缩进: 1 } }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          {
            control: { first: 1 },
            edge: [{ offset: { x: -1, y: 2 } }],
            extrude: [{ height: -1, color: '#fff' }],
          },
          {
            control: { first: 1 },
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
            presets: [preset({ name: 'CM:随机垂直墙板' })],
          },
        ],
      },
      bottom: {
        height: '0.1BH',
        floorHeight: 5,
        floor: [
          {
            presets: [
              preset({
                name: 'CB:角柱A',
                color: { 角柱: '#666', 楼板: '#333', 门: '_WOOD' },
              }),
            ],
          },
        ],
      },
    },
  },
  R6: {
    tags: {},
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset({ name: 'CT:随机设备' }),
              preset({ name: 'CT:女儿墙', unit: { 缩进: 1 } }),
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
            control: { first: 1 },
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
}
