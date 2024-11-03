import { pick } from "../../class/style"
import { presetData } from "../presetData"
import type { styleTypes } from "../../types/styleTypes"

export const styles: styleTypes.styles = {
  M451: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], { color: { 颜色: "_WOOD" } }),
            ],
          },
        ],
      },
      middle: { floor: [{ presets: [pick(presetData["MM:45度拟合"])] }] },
      bottom: {
        height: "0.15BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["CB:角柱A"], {
                color: { 角柱: "_WOOD" },
                unit: { 降低: 1 },
              }),
            ],
          },
        ],
      },
    },
  },
  M452: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], { color: { 颜色: "#666" } }),
            ],
          },
        ],
      },
      middle: {
        floor: [{ presets: [pick(presetData["MM:45度拟合"], { unit: { 出挑: 0.4 } })] }],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["CB:立面A"], {
                color: { 柱: "#666", 格: "#eee", 楼板: "_WOOD", 门: "#fff" },
                unit: { 降低: 1 },
              }),
            ],
          },
        ],
      },
    },
  },
  M01: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], { unit: { 缩进: 1 } }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          { presets: [pick(presetData["MM:开间拟合"], { unit: { 修正标高: -0.5 } })] },
          {
            edge: [{ offset: 0.5 }],
            extrude: [
              { height: -1, color: "_WOOD" },
              { once: true, height: -1, color: "_WOOD", transform: [{ moveZ: "1SH" }] },
            ],
            facade: [
              {
                proto: [
                  {
                    divide: [
                      { count: 1, group: [{ width: -0.1, height: 1, color: "G" }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 0.5 }],
            presets: [
              pick(presetData["CB:立面A"], {
                color: { 柱: "#fff", 楼板: "_WOOD", 门: "_WOOD" },
                unit: { 降低: 1 },
              }),
            ],
          },
        ],
      },
    },
  },
  M02: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], { color: { 颜色: "#666" } }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          { presets: [pick(presetData["MM:开间拟合"], { unit: { 修正标高: -0.5 } })] },
          {
            control: { last: 1 },
            edge: [{ offset: { x: 0.5, y: -1 } }],
            extrude: [{ height: -1, color: "_WOOD" }],
          },
        ],
      },
      bottom: {
        height: "0.15BH",
        floorHeight: 5,
        floor: [
          {
            edge: [{ offset: 0.5 }],
            presets: [
              pick(presetData["CB:角柱A"], {
                unit: { 柱宽比例: 0.1, 降低: 1 },
                color: { 角柱: "#fff", 柱子: "#fff", 门: "_WOOD" },
              }),
            ],
          },
          {
            edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
            extrude: [{ height: "1BH" }],
          },
        ],
      },
    },
  },
  M03: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], {
                unit: { 厚度: 0.4, 缩进: -0.4 },
                color: { 颜色: "#bbb" },
              }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          {
            edge: [{ offset: -0.5 }],
            presets: [
              pick(presetData["MM:开间拟合"], {
                unit: { 板宽: 2, 窗宽: 2, 窗进深: 0.4, 修正标高: -0.5 },
                color: { 颜色: "_WOOD" },
              }),
            ],
          },
          { control: { last: 1 }, extrude: [{ height: -1 }] },
        ],
      },
      bottom: {
        height: "0.2BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["CB:立面A"], {
                color: { 柱: "#bbb", 格: "#fff", 楼板: "#666", 门: "_WOOD" },
                unit: { 间距: 5, 柱宽: 2, 降低: 1 },
              }),
            ],
          },
        ],
      },
    },
  },
  M04: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], {
                unit: { 缩进: 1 },
                color: { 颜色: "#666" },
              }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          {
            control: { last: 0.15, asRatio: true, reverse: true },
            presets: [
              pick(presetData["MM:开间拟合"], {
                unit: { 窗进深: -0.4 },
                color: { 颜色: "#666" },
              }),
            ],
            extrude: [
              { height: -1, color: "_WOOD" },
              { once: true, height: -1, color: "_WOOD", transform: [{ moveZ: "1SH" }] },
            ],
          },
          {
            control: { last: 0.15, asRatio: true },
            extrude: [
              { height: -1, color: "_WOOD", transform: [{ moveZ: "1FH" }] },
              { once: true, height: "1SH-1", color: "G" },
            ],
            facade: [
              {
                once: true,
                proto: [
                  {
                    spacing: [
                      {
                        space: 1,
                        group: [{ x: 0.2, y: 0.6, z: "1SH-1", color: "#666" }],
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
        height: "0.15BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["CB:格栅A"], {
                unit: { 柱宽: 2, 降低: 1 },
                color: { 深色: "#666", 浅色: "#fff" },
              }),
            ],
          },
          {
            edge: [{ offset: { x: 0.2, y: 0.2, asRatio: true } }],
            extrude: [{ once: true, height: "1BH" }],
          },
        ],
      },
    },
  },
  M05: {
    tags: {},
    section: {
      roof: {
        height: 3,
        floor: [
          {
            presets: [
              pick(presetData["CT:随机设备"]),
              pick(presetData["CT:女儿墙"], { color: { 颜色: "#666" } }),
            ],
          },
        ],
      },
      middle: {
        floor: [
          {
            presets: [
              pick(presetData["MM:开间拟合"], {
                unit: { 窗进深: -0.4 },
                color: { 颜色: "#666" },
              }),
            ],
          },
          {
            edge: [{ offset: -0.5 }],
            extrude: [
              { height: -1, color: "_WOOD" },
              { once: true, height: -1, color: "_WOOD", transform: [{ moveZ: "1SH" }] },
            ],
          },
        ],
      },
      bottom: {
        height: "0.15BH",
        floorHeight: 5,
        floor: [
          {
            presets: [
              pick(presetData["CB:立面A"], {
                unit: { 柱宽: 2, 降低: 1 },
                color: { 柱: "#666", 格: "#666", 楼板: "_WOOD", 门: "_WOOD" },
              }),
            ],
          },
        ],
      },
    },
  },
}
