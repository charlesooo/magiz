import { check, COLOR } from '../class/styleClass/utils'

export const simple = {
  'T:女儿墙': check({
    unit: { 缩进: 0, 高度: 1.2, 厚度: 0.2, 抬升: 0 },
    color: { 颜色: '#eee' },
    floor: [
      {
        edge: [{ offset: '缩进' }],
        extrude: [
          {
            height: '高度',
            thickness: '厚度',
            color: '颜色',
            trans: [{ moveZ: '抬升' }],
          },
        ],
      },
    ],
  }),
  'M:横向': check({
    unit: { 楼板出挑: 1, 楼板厚: 1, 底部修正: 0 },
    color: { 颜色: COLOR.METAL },
    floor: [
      {
        ctrlFloor: { indent: { start: '底部修正', end: -1 } },
        edge: [{ offset: '-楼板出挑' }],
        extrude: [{ height: '楼板厚', trans: [{ moveZ: '-0.5楼板厚' }] }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH', color: 'G' }],
      },
    ],
  }),
  'M:竖向': check({
    unit: { 间距: 8, 柱宽: 2, 柱深: 2, 楼板缩进: 0.5, 底部修正: 0 },
    color: { 宽柱颜色: COLOR.CONCRETE, 柱颜色: COLOR.METAL },
    floor: [
      {
        ctrlFloor: { indent: { start: '底部修正', end: -1 } },
        edge: [{ offset: '楼板缩进' }],
        extrude: [{ height: 0.6, trans: [{ moveZ: -0.3 }] }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH', color: 'G' }],
        vertical: [
          {
            array: [
              {
                space: '间距',
                boxes: [{ widthX: '柱宽', depthY: '柱深', heightZ: 'SH', color: '宽柱颜色' }],
              },
            ],
          },
        ],
      },
    ],
  }),
  /** 不会像 “M:竖向” 因柱深过大而出挑 */
  'M:竖向进深对齐': check({
    unit: {
      间距: 6,
      柱宽: 4,
      柱深: 1,
      楼板缩进: 0.5,
      底部修正: 0,
      /** 尽端无出挑：0.5柱宽-0.5柱深 */
      进深对齐: <'0.5柱宽-0.5柱深' | number>0,
      交叉: <1 | 0>1,
    },
    color: { 宽柱颜色: COLOR.CONCRETE, 柱颜色: COLOR.METAL },
    floor: [
      {
        ctrlFloor: { indent: { start: '底部修正', end: -1 } },
        edge: [{ offset: '楼板缩进' }],
        extrude: [{ height: 0.6, trans: [{ moveZ: -0.3 }] }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH', color: 'G' }],
        vertical: [
          {
            sandwich: '交叉',
            endWidth: '进深对齐',
            array: [
              {
                space: '间距',
                boxes: [{ widthX: '柱宽', depthY: '柱深', heightZ: 'SH', color: '宽柱颜色' }],
              },
            ],
          },
        ],
      },
    ],
  }),
  'M:竖向尽端交叉': check({
    unit: { 间距: 6, 柱宽: 4, 柱深: 1, 楼板缩进: 0.5, 底部修正: 0 },
    color: { 宽柱颜色: COLOR.CONCRETE, 柱颜色: COLOR.METAL },
    floor: [
      {
        ctrlFloor: { indent: { start: '底部修正', end: -1 } },
        edge: [{ offset: '楼板缩进' }],
        extrude: [{ height: 0.6, trans: [{ moveZ: -0.3 }] }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH', color: 'G' }],
        vertical: [
          {
            sandwich: true,
            endWidth: 1,
            array: [
              {
                space: '间距',
                boxes: [{ widthX: '柱宽', depthY: '柱深', heightZ: 'SH', color: '宽柱颜色' }],
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
        ctrlFloor: { indent: { end: '顶部修正' } },
        edge: [{ offset: '-楼板出挑' }],
        extrude: [{ height: '-楼板厚', trans: [{ moveZ: 'FH+0.5楼板厚' }] }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH', color: 'G' }],
        vertical: [
          { array: [{ space: '间距', boxes: [{ widthX: 2, depthY: 2, heightZ: 'SH' }] }] },
        ],
      },
    ],
  }),
  'B:竖向': check({
    unit: { 柱宽: 3, 间距: 8, 楼板缩进: -1, 楼板厚: 1.2, 降低: 0 },
    color: { 门: COLOR.METAL },
    floor: [
      {
        ctrlFloor: { indent: { start: 1 } },
        edge: [{ offset: '楼板缩进' }],
        extrude: [{ height: '-楼板厚' }],
      },
      {
        ctrlFloor: { total: 1 },
        extrude: [{ height: 'SH-降低', color: 'G' }],
        vertical: [
          {
            ctrlArray: { chance: 1 },
            array: [
              {
                space: '间距',
                boxes: [{ widthX: '柱宽', depthY: '柱宽', heightZ: 'SH-降低' }],
              },
            ],
          },
        ],
      },
    ],
  }),
  'B:核心筒': check({
    unit: { 缩进: 6, 高度修正: 3 },
    color: { 颜色: COLOR.CONCRETE },
    floor: [
      {
        ctrlFloor: { total: 1 },
        edge: [{ offset: '缩进' }],
        extrude: [{ height: 'H+高度修正', color: '颜色' }],
      },
    ],
  }),
}
