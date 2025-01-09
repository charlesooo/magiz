import { type styleTypes, preset } from '../class/styleClass/utils'
import { simple } from './preset'

export const styles: styleTypes.styles = {
  SV0: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'])],
          },
        ],
      },
      bottom: {
        height: '1H',
        floor: [
          {
            presets: [
              preset(simple['M:竖向'], { unit: { 底部修正: 2 } }),
              preset(simple['B:核心筒']),
            ],
          },
        ],
      },
    },
  },
  SV11: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'], { unit: { 高度: 2 } })],
          },
        ],
      },
      middle: {
        floor: [
          {
            presets: [preset(simple['M:竖向进深对齐'])],
          },
        ],
      },
      bottom: {
        height: '0.2H',
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(simple['B:横向']), preset(simple['B:核心筒'])],
          },
        ],
      },
    },
  },
  SV1: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'], { unit: { 高度: 2 } })],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(simple['M:竖向'], { unit: { 底部修正: 1 } })] }],
      },
      bottom: {
        height: '0.2H',
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(simple['B:横向']), preset(simple['B:核心筒'])],
          },
        ],
      },
    },
  },
  SV2: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'], { unit: { 高度: 2 } })],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(simple['M:竖向'])] }],
      },
      bottom: {
        height: '0.2H',
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(simple['B:竖向']), preset(simple['B:核心筒'])],
          },
        ],
      },
    },
  },
  SL0: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(simple['T:女儿墙'], { unit: { 抬升: 0.5 } })],
          },
        ],
      },
      bottom: {
        height: '1H',
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [
              preset(simple['M:横向'], { unit: { 底部修正: 2 } }),
              preset(simple['B:核心筒']),
            ],
          },
        ],
      },
    },
  },
  SL1: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'], { unit: { 高度: 2 } })],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(simple['M:横向'], { unit: { 底部修正: 1 } })] }],
      },
      bottom: {
        height: '0.2H',
        floorHeight: 5,
        floor: [
          {
            presets: [preset(simple['B:横向']), preset(simple['B:核心筒'])],
          },
        ],
      },
    },
  },
  SL2: {
    tags: { orient: 'V' },
    type: 'FREE',
    section: {
      roof: {
        floor: [
          {
            presets: [preset(simple['T:女儿墙'], { unit: { 高度: 2 } })],
          },
        ],
      },
      middle: {
        floor: [{ presets: [preset(simple['M:横向'])] }],
      },
      bottom: {
        height: '0.2H',
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 1 }],
            presets: [preset(simple['B:竖向']), preset(simple['B:核心筒'])],
          },
        ],
      },
    },
  },
}
