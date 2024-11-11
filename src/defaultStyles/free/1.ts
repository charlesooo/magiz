import { preset } from '../../class/styles/utils'
import { floorPreset } from '../presetData'
import type { styleTypes } from '../../types/styleTypes'

export const styles: styleTypes.styles = {
  SV: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset(floorPreset['ST:女儿墙'], { unit: { 高度: 2 }, color: { 颜色: '#999' } }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:横向'])] }],
      },
      bottom: {
        height: '0.2BH',
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(floorPreset['SB:横向']), preset(floorPreset['SB:通高核心筒'])],
          },
        ],
      },
    },
  },
  SL: {
    tags: { orient: 'L' },
    type: 'FREE',
    section: {
      roof: {
        floor: [{ presets: [preset(floorPreset['ST:女儿墙'], { unit: { 高度: 2 } })] }],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:横向'])] }],
      },
      bottom: {
        height: '0.2BH',
        floorHeight: 5,
        floor: [
          { presets: [preset(floorPreset['SB:竖向']), preset(floorPreset['SB:通高核心筒'])] },
        ],
      },
    },
  },
  S2: {
    tags: {},
    type: 'FREE',
    section: {
      roof: {
        floor: [{ presets: [preset(floorPreset['ST:女儿墙'], { unit: { 缩进: 1 } })] }],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:竖向'])] }],
      },
      bottom: {
        height: '0.2BH',
        floorHeight: 5,
        floor: [{ presets: [preset(floorPreset['SB:角柱'])] }],
      },
    },
  },
  S3: {
    tags: {},
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset(floorPreset['ST:女儿墙'], {
                unit: { 高度: 2 },
                color: { 颜色: '#bbb' },
              }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:竖向'])] }],
      },
      bottom: {
        height: '0.2BH',
        floorHeight: 5,
        floor: [{ presets: [preset(floorPreset['SB:角柱'])] }],
      },
    },
  },
  S4: {
    tags: {},
    type: 'FREE',
    section: {
      roof: {
        floor: [{ presets: [preset(floorPreset['ST:女儿墙'], { unit: { 高度: 2 } })] }],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:竖向'], { unit: { 间距: 3 } })] }],
      },
      bottom: {
        height: '0.2BH',
        floorHeight: 5,
        floor: [
          {
            presets: [preset(floorPreset['SB:马赛克加核心筒'], { color: { 马赛克: ['#eee'] } })],
          },
        ],
      },
    },
  },
  S5: {
    tags: {},
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [
              preset(floorPreset['ST:女儿墙'], { unit: { 高度: 3, 缩进: -0.2, 抬升: -1 } }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(floorPreset['SM:竖向'], { unit: { 柱宽: 1.4 } })] }],
      },
      bottom: {
        height: '0.15BH',
        floorHeight: 5,
        floor: [{ presets: [preset(floorPreset['SB:竖向'], { unit: { 柱宽: 1 } })] }],
      },
    },
  },
}
