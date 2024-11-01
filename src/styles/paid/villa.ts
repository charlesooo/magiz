import { preset } from '../../class/style'
import type { styleTypes } from '../../types/styleTypes'

export const styles: styleTypes.styles = {
  新中式别墅: {
    tags: { use: 'R' },
    section: {
      roof: {
        height: 2,
        floor: [
          {
            presets: [preset({ name: 'VT:四坡顶' })],
          },
        ],
      },
      middle: {
        floor: [
          {
            edge: [{ clamp: { xCentral: 1.2, asRatio: false } }],
            presets: [preset({ name: 'VM:横向门搭配竖向划分入户门' })],
          },
          {
            edge: [{ clamp: { xCentral: 2, asRatio: false, reverse: true } }],
            presets: [preset({ name: 'VM:横向划分立面窗' })],
          },
          {
            edge: [{ clamp: { xCentral: 3, asRatio: false } }],
            presets: [preset({ name: 'VM:门廊阳台线脚' })],
          },
        ],
      },
      bottom: {
        height: 3,
        floor: [
          {
            edge: [{ clamp: { xCentral: 2, asRatio: false } }],
            presets: [preset({ name: 'VM:整段竖向划分阳台门', unit: { 总高: '1BH-2.6' } })],
          },
          {
            edge: [{ clamp: { xCentral: 2, asRatio: false, reverse: true } }],
            presets: [
              preset({ name: 'VM:整段竖向划分立面窗', unit: { 总高: '1BH-2.6' } }),
              preset({
                name: 'VM:横向划分立面窗',
                unit: { 墙板高: 1, 墙板降低: 0 },
                color: { 浅色: '#541' },
              }),
            ],
          },
          {
            presets: [preset({ name: 'VT:线脚' }), preset({ name: 'VB:通高角柱' })],
            extrude: [{ once: true, height: '1BH-2.5', color: 'G' }],
          },
          {
            edge: [{ clamp: { xCentral: 3, asRatio: false } }],
            presets: [preset({ name: 'VB:通高门廊柱' }), preset({ name: 'VB:门廊三级台阶' })],
          },
        ],
      },
    },
  },
}
