import { check } from '../../class/styles/utils'

export const simple = {
  'T:女儿墙': check({
    unit: { 缩进: 0, 高度: 1.2, 厚度: 0.2, 抬升: 0 },
    color: { 颜色: '#eee' },
    floor: [
      {
        edge: [{ offset: '1缩进' }],
        extrude: [
          {
            height: '1高度',
            thickness: '1厚度',
            color: '颜色',
            trans: [{ moveZ: '1抬升' }],
          },
        ],
      },
    ],
  }),
  'M:横向': check({
    unit: { 楼板出挑: 1, 楼板厚: 1, 底部修正: 0 },
    color: { 颜色: '_METAL' },
    floor: [
      {
        control: { indent: { start: '1底部修正', end: -1 } },
        edge: [{ offset: '-1楼板出挑' }],
        extrude: [{ height: '1楼板厚', trans: [{ moveZ: '-0.5楼板厚' }] }],
      },
      {
        control: { total: 1 },
        extrude: [{ height: '1SH', color: 'G' }],
      },
    ],
  }),
  'M:竖向': check({
    unit: { 间距: 8, 楼板缩进: 0.5, 柱宽: 2, 底部修正: 0 },
    color: { 宽柱颜色: '_CONCRETE', 柱颜色: '_METAL' },
    floor: [
      {
        control: { indent: { start: '1底部修正', end: -1 } },
        edge: [{ offset: '1楼板缩进' }],
        extrude: [{ height: 0.6, trans: [{ moveZ: -0.3 }] }],
      },
      {
        control: { total: 1 },
        extrude: [{ height: '1SH', color: 'G' }],
        vertical: [
          {
            array: [
              {
                space: '1间距',
                boxes: [{ widthX: '1柱宽', depthY: '1柱宽', heightZ: '1SH', color: '宽柱颜色' }],
              },
            ],
          },
        ],
      },
    ],
  }),
  'B:横向': check({
    unit: { 间距: 8, 楼板出挑: 1.5, 楼板厚: 3, 顶部修正: 0 },
    color: {},
    floor: [
      {
        control: { indent: { end: '1顶部修正' } },
        edge: [{ offset: '-1楼板出挑' }],
        extrude: [{ height: '-1楼板厚', trans: [{ moveZ: '1FH+0.5楼板厚' }] }],
      },
      {
        control: { total: 1 },
        extrude: [{ height: '1SH', color: 'G' }],
        vertical: [
          { array: [{ space: '1间距', boxes: [{ widthX: 2, depthY: 2, heightZ: '1SH' }] }] },
        ],
      },
    ],
  }),
  'B:竖向': check({
    unit: { 柱宽: 3, 柱缩进: 0.6, 间距: 8, 楼板缩进: -1, 楼板厚: 1.2, 降低: 0 },
    color: { 门: '_METAL' },
    floor: [
      {
        control: { indent: { start: 1 } },
        edge: [{ offset: '1楼板缩进' }],
        extrude: [{ height: '-1楼板厚' }],
      },
      {
        control: { total: 1 },
        extrude: [{ height: '1SH-1降低', color: 'G' }],
        vertical: [
          {
            array: [
              {
                space: '1间距',
                boxes: [{ widthX: '1柱宽', depthY: '1柱宽', heightZ: '1SH-1降低' }],
              },
            ],
          },
        ],
      },
    ],
  }),
  'B:核心筒': check({
    unit: { 缩进: 6, 高度修正: 3 },
    color: { 颜色: '_CONCRETE' },
    floor: [
      {
        control: { total: 1 },
        edge: [{ offset: '1缩进' }],
        extrude: [{ height: '1BH+1高度修正', color: '颜色' }],
      },
    ],
  }),
}
