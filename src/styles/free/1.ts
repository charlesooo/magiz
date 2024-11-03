import { randPick, pick } from "../../class/style"
import { presetData } from "../presetData"
import type { styleTypes } from "../../types/styleTypes"

export const styles: styleTypes.styles = {
  Random: {
    tags: {},
    type: "FREE",
    section: {
      roof: {
        floor: [{ presets: [randPick(presetData, { mark: "S", section: "T" })] }],
      },
      middle: {
        floor: [{ presets: [randPick(presetData, { mark: "S", section: "M" })] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [{ presets: [randPick(presetData, { mark: "S", section: "B" })] }],
      },
    },
  },
  SV: {
    tags: { orient: "V" },
    type: "FREE",
    section: {
      roof: {
        floor: [{ presets: [pick(presetData["ST:女儿墙"], { unit: { 高度: 2 } })] }],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:竖向"])] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          {
            presets: [pick(presetData["SB:横向"]), pick(presetData["SB:通高核心筒"])],
          },
        ],
      },
    },
  },
  SL: {
    tags: { orient: "L" },
    type: "FREE",
    section: {
      roof: {
        floor: [{ presets: [pick(presetData["ST:女儿墙"], { unit: { 高度: 2 } })] }],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:横向"])] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          { presets: [pick(presetData["SB:竖向"]), pick(presetData["SB:通高核心筒"])] },
        ],
      },
    },
  },
  S2: {
    tags: {},
    type: "FREE",
    section: {
      roof: {
        floor: [{ presets: [pick(presetData["ST:女儿墙"], { unit: { 缩进: 1 } })] }],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:竖向"])] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [{ presets: [pick(presetData["SB:角柱"])] }],
      },
    },
  },
  S3: {
    tags: {},
    type: "FREE",
    section: {
      roof: {
        floor: [
          {
            presets: [
              pick(presetData["ST:女儿墙"], {
                unit: { 高度: 2 },
                color: { 颜色: "#bbb" },
              }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:竖向"])] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [{ presets: [pick(presetData["SB:角柱"])] }],
      },
    },
  },
  S4: {
    tags: {},
    type: "FREE",
    section: {
      roof: {
        floor: [{ presets: [pick(presetData["ST:女儿墙"], { unit: { 高度: 2 } })] }],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:竖向"], { unit: { 间距: 3 } })] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["SB:马赛克加核心筒"], { color: { 马赛克: ["#eee"] } }),
            ],
          },
        ],
      },
    },
  },
  S5: {
    tags: {},
    type: "FREE",
    section: {
      roof: {
        floor: [
          {
            presets: [
              pick(presetData["ST:女儿墙"], { unit: { 高度: 3, 缩进: -0.2, 抬升: -1 } }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [pick(presetData["SM:竖向"], { unit: { 柱宽: 1.4 } })] }],
      },
      bottom: {
        height: "0.15BH",
        floorHeight: 5,
        floor: [{ presets: [pick(presetData["SB:竖向"], { unit: { 柱宽: 1 } })] }],
      },
    },
  },
}
