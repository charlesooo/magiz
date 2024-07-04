import type { styleParams } from '../../types/style'

export const styles: styleParams.styles = {
  preset: {},
  building: {
    S6: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 缩进: 1, 高度: 2 },
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
                  name: '免费中段竖向<柱宽,窗宽,楼板缩进>',
                  unit: { 柱宽: 2, 楼板缩进: -0.2 },
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
                  name: '免费底部竖向加核心筒<柱宽,窗宽,楼板缩进,板厚,降低>',
                  unit: { 柱宽: 2, 降低: 0.6 },
                },
              ],
            },
          ],
        },
      },
    },
    S7: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 缩进: 1, 高度: 1 },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>', unit: { 楼板缩进: -1 } }],
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
                  name: '免费底部竖向加核心筒<柱宽,窗宽,楼板缩进,板厚,降低>',
                  unit: { 柱宽: 1, 窗宽: 1.5, 降低: 1 },
                },
              ],
            },
          ],
        },
      },
    },
    S8: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 缩进: 1, 高度: 2 },
                  color: { 颜色: '#999' },
                },
              ],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>', unit: { 楼板缩进: -0.5 } }],
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
                  name: '免费底部宽角柱加核心筒<厚度,降低><浅色,深色>',
                  unit: { 降低: 0.6 },
                },
              ],
            },
          ],
        },
      },
    },
    S9: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>', unit: { 缩进: 1 } }],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [{ name: '免费中段<楼板缩进,板厚>', unit: { 楼板缩进: -0.5 } }],
            },
          ],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [
            {
              preset: [{ name: '免费底部马赛克加核心筒<概率><马赛克>' }],
            },
          ],
        },
      },
    },
    S10: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 高度: 2, 抬升: 0.6 },
                  color: { 颜色: '#888' },
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
                  name: '免费中段随机垂直墙板<墙宽,窗宽,概率><墙板>',
                  unit: { 概率: 1 },
                },
              ],
            },
            {
              floorRange: [{ bottom: 1 }],
              // scaleEdges: 0.5,
              extrude: [{ height: -0.6 }],
            },
            {
              extrude: [{ once: true, height: 0.6, transform: [{ moveZ: '1SH' }] }],
            },
          ],
        },
        bottom: {
          height: '0.2BH',
          floorHeight: 5,
          floor: [
            {
              preset: [
                { name: '免费底部马赛克加核心筒<概率><马赛克>', color: { 马赛克: '#888' } },
              ],
            },
          ],
        },
      },
    },
    S11: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [{ name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>', unit: { 抬升: 0.6 } }],
            },
          ],
        },
        middle: {
          floor: [
            {
              preset: [
                {
                  name: '免费中段随机垂直墙板<墙宽,窗宽,概率><墙板>',
                  unit: { 墙宽: 0.1, 窗宽: 2, 楼板缩进: -0.5, 概率: 1 },
                },
              ],
            },
            {
              floorRange: [{ bottom: 1 }],
              // scaleEdges: 0.5,
              extrude: [{ height: -0.6 }],
            },
            {
              extrude: [
                { once: true, height: 0.6, transform: [{ moveZ: '1SH' }] },
                { once: true, height: -1 },
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
                  name: '免费底部竖向加核心筒<柱宽,窗宽,楼板缩进,板厚,降低>',
                  unit: { 窗宽: 2 },
                },
              ],
            },
          ],
        },
      },
    },
    S12: {
      type: 'FREE',
      section: {
        roof: {
          floor: [
            {
              preset: [
                {
                  name: '免费屋顶女儿墙<缩进,高度,厚度,抬升><颜色>',
                  unit: { 高度: 2, 抬升: 0.6 },
                  color: { 颜色: '#bbb' },
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
                  name: '免费中段随机垂直墙板<墙宽,窗宽,概率><墙板>',
                  unit: { 墙宽: 0.1, 窗宽: 2, 楼板缩进: -0.5, 概率: 1 },
                },
              ],
            },
            {
              floorRange: [{ bottom: 1 }],
              // scaleEdges: 0.5,
              extrude: [{ height: -0.6 }],
            },
            {
              extrude: [
                { once: true, height: 0.6, transform: [{ moveZ: '1SH' }] },
                { once: true, height: -1 },
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
                  name: '免费底部宽角柱加核心筒<厚度,降低><浅色,深色>',
                  unit: { 窗宽: 2 },
                },
              ],
            },
          ],
        },
      },
    },
  },
}
