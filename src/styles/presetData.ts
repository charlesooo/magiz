import { check } from "../class/style"

/** 唯一的预设样式数据
 * @命名规则 标记 (S|C|V|M) 适用部位 (T|M|B|省略表示通用) : 名称 */
export const presetData = {
  // #region Simple 简单
  "ST:女儿墙": check({
    unit: { 缩进: 0, 高度: 1.2, 厚度: 0.2, 抬升: 0 },
    color: { 颜色: "#eee" },
    floor: [
      {
        edge: [{ offset: "1缩进" }],
        extrude: [
          {
            height: "1高度",
            thickness: "1厚度",
            color: "颜色",
            transform: [{ moveZ: "1抬升" }],
          },
        ],
      },
    ],
  }),
  "SM:横向": check({
    unit: { 楼板缩进: -1, 楼板厚: 1 },
    color: { 颜色: "_METAL" },
    floor: [
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: "-1楼板厚", transform: [{ moveZ: "1FH" }] }],
      },
      {
        extrude: [{ once: true, height: "1SH-1楼板厚", color: "G" }],
      },
    ],
  }),
  "SM:竖向": check({
    unit: { 柱宽: 2, 间距: 4, 楼板缩进: 0.5, 幕墙降顶: -0.4, 幕墙抬升: 0 },
    color: { 柱颜色: "_CONCRETE" },
    floor: [
      {
        control: { last: 1 },
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: -0.6 }],
      },
      {
        extrude: [
          {
            once: true,
            height: "1SH+1幕墙降顶",
            transform: [{ moveZ: "1幕墙抬升" }],
            color: "G",
          },
        ],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    space: "1间距",
                    group: [{ x: "1柱宽", y: "1柱宽", z: "1SH", color: "柱颜色" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "SM:随机垂直墙板": check({
    unit: { 墙宽: 4, 窗宽: 2, 概率: 0.8 },
    color: { 墙板: "#eee" },
    floor: [
      {
        extrude: [{ once: true, height: "1SH", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    control: { chance: "1概率" },
                    space: "1墙宽+1窗宽",
                    group: [
                      {
                        x: "1墙宽",
                        y: 0.5,
                        z: "1SH",
                        color: "墙板",
                        transform: [{ moveX: "0.5墙宽" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "SB:横向": check({
    unit: { 降顶: 0, 楼板缩进: -0.5, 楼板厚: 3 },
    color: {},
    floor: [
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: "-1楼板厚" }],
      },
      {
        extrude: [{ once: true, height: "1SH-1降顶", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    count: 4,
                    control: { chance: 0.5 },
                    group: [{ x: 2, y: 1, z: "1FH-1楼板厚" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "SB:竖向": check({
    unit: { 柱宽: 2, 柱缩进: 0.6, 间距: 5, 楼板缩进: -0.5, 楼板厚: 1.2, 降低: 0 },
    color: {},
    floor: [
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: "-1楼板厚", transform: [{ moveZ: "1FH" }] }],
      },
      {
        extrude: [{ once: true, height: "1SH-1楼板厚", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    space: "1间距",
                    group: [{ x: "1柱宽", y: "1柱宽", z: "1SH-1降低" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "SB:竖向放大一端": check({
    unit: { 柱宽: 2, 放大宽度: 9, 楼板缩进: -0.5, 楼板厚: 1.2, 降低: 0 },
    color: {},
    floor: [
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: "-1楼板厚", transform: [{ moveZ: "1FH" }] }],
      },
      {
        extrude: [{ once: true, height: "1SH-1楼板厚", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    control: { first: 1 },
                    space: "1放大宽度",
                    group: [
                      {
                        x: "1柱宽",
                        y: "1放大宽度",
                        z: "1SH-1降低",
                        transform: [{ moveY: "0.5放大宽度-0.5柱宽" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "SB:马赛克加核心筒": check({
    color: { 马赛克: ["#888", "#fff"] },
    unit: { 降低: 0, 概率: 0.8 },
    floor: [
      {
        extrude: [{ once: true, height: "1SH", color: "G" }],
        facade: [
          {
            proto: [
              {
                spacing: [
                  {
                    control: { chance: "1概率" },
                    space: 6,
                    group: [
                      {
                        x: 4,
                        y: 0.5,
                        z: "1FH-0.6",
                        color: "马赛克",
                        transform: [{ moveX: 2 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        // scaleEdges: -1,
        extrude: [{ height: -0.6 }],
      },
      {
        edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
        extrude: [{ once: true, height: "1BH+4" }],
      },
    ],
  }),
  "SB:挑廊加核心筒": check({
    unit: { 缩进: 3 },
    color: {},
    floor: [
      {
        extrude: [{ height: -0.6 }, { height: 1, color: "G" }],
      },
      {
        edge: [{ offset: 0.4 }],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    space: 4,
                    group: [{ x: 1, y: 1, z: "1SH-0.6" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        edge: [{ offset: "1缩进" }],
        extrude: [{ once: true, height: "1SH", color: "G" }],
      },
      {
        edge: [{ offset: { x: 0.1, y: 0.2, asRatio: true } }],
        extrude: [{ once: true, height: "1BH+4" }],
      },
    ],
  }),
  "SB:角柱": check({
    unit: { 降顶: 0, 厚度: 0.6, 楼板缩进: 0.5 },
    color: { 颜色: "#999" },
    floor: [
      {
        facade: [
          {
            once: true,
            padding: { start: 0.2, end: 0.2 },
            proto: [
              // 两侧墙板
              {
                area: "BOTH",
                divide: [
                  {
                    count: 1,
                    group: [{ width: "1厚度", height: "1SH-1降顶" }],
                  },
                ],
              },
              // 中间顶部横板
              {
                area: "MIDDLE",
                divide: [
                  {
                    count: 1,
                    group: [
                      {
                        width: "0.8厚度",
                        height: "0.4FH",
                        color: "颜色",
                        transform: [{ moveZ: "1SH-0.4FH-1降顶" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      // 楼板
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: -1, transform: [{ moveZ: "1FH" }] }],
      },

      {
        extrude: [{ once: true, height: "1SH", color: "G" }],
      },
    ],
  }),
  "SB:通高核心筒": check({
    unit: { 缩进: 6, 高度修正: 3 },
    color: { 颜色: "_CONCRETE" },
    floor: [
      {
        edge: [{ offset: "1缩进" }],
        extrude: [{ once: true, height: "1BH+1高度修正", color: "颜色" }],
      },
    ],
  }),
  // #endregion
  // #region Complex 复杂
  "CT:随机设备": check({
    unit: { 高度: 2, 抬升: 0 },
    color: { 颜色A: "#eee", 颜色B: ["#666", "#333"] },
    floor: [
      {
        edge: [{ offset: { x: 0.1, y: 0.1, asRatio: true } }],
        match: [
          {
            flexes: [
              { width: 2 },
              {
                width: 4,
                height: "1高度",
                color: "颜色A",
                transform: [{ moveZ: "1抬升" }],
              },
            ],
            control: { chance: 0.8 },
            along: "WIDTH",
            sandwich: true,
          },
          {
            flexes: [
              { width: 1 },
              {
                width: 2,
                height: "0.5高度",
                color: "颜色B",
                transform: [{ moveZ: "1抬升" }],
              },
            ],
            control: { chance: 0.2 },
            along: "DEPTH",
            sandwich: true,
          },
        ],
      },
    ],
  }),
  "CT:女儿墙": check({
    unit: { 高度: 1.5, 厚度: 0.2, 缩进: 0, 抬升: 0 },
    color: { 颜色: "#fff" },
    floor: [
      {
        edge: [{ offset: "1缩进" }],
        extrude: [
          {
            height: "1高度",
            thickness: "1厚度",
            color: "颜色",
            transform: [{ moveZ: "1抬升" }],
          },
        ],
      },
    ],
  }),
  "CM:随机垂直墙板": check({
    unit: { 墙宽: 4, 窗宽: 2, 降低: 0, 概率: 0.8 },
    color: { 墙板: "#eee" },
    floor: [
      {
        extrude: [{ once: true, height: "1SH-1降低", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    control: { chance: "1概率" },
                    space: "1墙宽+1窗宽",
                    group: [
                      {
                        x: "1墙宽",
                        y: 0.2,
                        z: "1SH-1降低",
                        color: "墙板",
                        transform: [{ moveX: "0.5墙宽" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "CB:角柱A": check({
    unit: { 柱宽比例: 0.2, 厚度: 0.6, 降低: 0 },
    color: { 角柱: "#bbb", 柱子: "#bbb", 楼板: "#666", 门: "#666", 挑檐: "#666" },
    floor: [
      {
        facade: [
          {
            once: true,
            padding: { start: "1柱宽比例", end: "1柱宽比例" },
            proto: [
              // 两侧角柱
              {
                area: "BOTH",
                divide: [
                  {
                    count: 1,
                    group: [{ width: "2厚度", height: "1SH-1降低", color: "角柱" }],
                  },
                ],
              },
              // 中间顶部横板
              {
                area: "MIDDLE",
                divide: [
                  {
                    count: 1,
                    group: [
                      {
                        width: "1.6厚度",
                        height: "0.2*(1SH-1降低)",
                        color: "楼板",
                        transform: [{ moveZ: "0.8*(1SH-1降低)" }],
                      },
                    ],
                  },
                ],
              },
              // 柱子
              {
                spacing: [
                  {
                    space: 4,
                    group: [
                      {
                        x: 1,
                        y: "1厚度",
                        z: "0.8*(1SH-1降低)",
                        color: "柱子",
                        transform: [{ moveY: "0.5厚度-0.2" }],
                      },
                    ],
                  },
                ],
              },
              // 入口和挑檐
              {
                spacing: [
                  {
                    control: { chance: 0.2 },
                    space: 4,
                    group: [
                      {
                        x: 1.6,
                        y: 0.2,
                        z: 3,
                        color: "门",
                        transform: [{ moveX: 2 }],
                      },
                      {
                        x: 4,
                        y: 2,
                        z: 0.2,
                        color: "挑檐",
                        transform: [{ moveX: 2, moveZ: 3 }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      // 楼板
      {
        extrude: [{ height: -1, color: "楼板" }],
      },
      // 幕墙
      {
        edge: [{ offset: "0.5厚度+0.3" }],
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    count: 1,
                    group: [{ width: 1, height: "1SH-1降低-1", color: "G" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "CB:立面A": check({
    unit: { 间距: 8, 柱宽: 3, 格宽: 0.4, 降低: 1 },
    color: { 柱: "#eee", 格: "#fff", 楼板: "#bbb", 门: "#666", 挑檐: "#666" },
    floor: [
      {
        extrude: [{ once: true, height: "1SH-1降低", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              // 竖向柱子
              {
                spacing: [
                  {
                    space: "1柱宽+(1间距-1柱宽)/4",
                    group: [
                      {
                        x: "1柱宽",
                        y: 0.6,
                        z: "1SH-1降低",
                        color: "柱",
                        transform: [{ moveX: "1柱宽/2" }],
                      },
                    ],
                  },
                  {
                    space: "(1间距-1柱宽)/4",
                    group: [
                      {
                        x: "1格宽",
                        y: 1,
                        z: "1SH-1FH+1-1降低",
                        color: "格",
                        transform: [{ moveZ: "1FH-1" }],
                      },
                    ],
                    repeat: 2,
                  },
                ],
              },
              // 门和挑檐
              {
                spacing: [
                  {
                    control: { chance: 0.2 },
                    space: "1间距",
                    group: [
                      {
                        x: "1间距",
                        y: 3,
                        z: 0.2,
                        color: "挑檐",
                        transform: [{ moveX: "0.5间距+0.5柱宽", moveY: 0.5, moveZ: 3.1 }],
                      },
                      {
                        x: 0.8,
                        y: 0.2,
                        z: 3,
                        color: "门",
                        transform: [{ moveX: "0.5间距+0.5柱宽-0.4" }],
                      },
                      {
                        x: 0.8,
                        y: 0.2,
                        z: 3,
                        color: "门",
                        transform: [{ moveX: "0.5间距+0.5柱宽+0.4" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        edge: [{ offset: -0.2 }],
        extrude: [{ height: -1, color: "楼板" }],
      },
      {
        edge: [{ offset: { x: 0.1, y: 0.1, asRatio: true } }],
        extrude: [{ once: true, height: "1SH" }],
      },
    ],
  }),
  "CB:格栅A": check({
    unit: { 间距: 8, 柱宽: 3, 格宽: 0.4, 降低: 1 },
    color: { 浅色: "#eee", 深色: "#bbb", 门: "#666", 挑檐: "#666" },
    floor: [
      {
        extrude: [{ once: true, height: "1SH-1降低", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              // 格栅
              {
                spacing: [
                  {
                    space: 1,
                    group: [
                      {
                        x: 0.1,
                        y: 0.6,
                        z: "1SH-1.6",
                        color: "深色",
                        transform: [{ moveZ: 0.6 }],
                      },
                    ],
                  },
                ],
              },
              {
                divide: [
                  {
                    count: 1,
                    group: [
                      {
                        width: 0.2,
                        height: 0.6,
                        color: "深色",
                      },
                    ],
                  },
                ],
              },
              // 门和挑檐
              {
                spacing: [
                  {
                    control: { chance: 0.2 },
                    space: "1间距",
                    group: [
                      {
                        x: 0.8,
                        y: 1,
                        z: 3,
                        color: "门",
                        transform: [{ moveX: "0.5间距+0.5柱宽-0.4" }],
                      },
                      {
                        x: 0.8,
                        y: 1,
                        z: 3,
                        color: "门",
                        transform: [{ moveX: "0.5间距+0.5柱宽+0.4" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        // scaleEdges: 0.5,
        extrude: [{ height: -1, color: "浅色" }],
      },
    ],
  }),
  "CB:横向格栅": check({
    unit: { 楼板缩进: -0.5, 楼板厚: 1 },
    color: {},
    floor: [
      {
        edge: [{ offset: "1楼板缩进" }],
        extrude: [{ height: "-1楼板厚" }],
      },
      {
        extrude: [
          { thickness: -0.4, height: 0.2, transform: [{ moveZ: "(1FH-1楼板厚)*0.25" }] },
          { thickness: -0.4, height: 0.2, transform: [{ moveZ: "(1FH-1楼板厚)*0.5" }] },
          { thickness: -0.4, height: 0.2, transform: [{ moveZ: "(1FH-1楼板厚)*0.75" }] },
        ],
      },
      {
        extrude: [{ once: true, height: "1SH-1楼板厚", color: "G" }],
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  { count: 4, control: { chance: 0.5 }, group: [{ x: 2, y: 1, z: 3 }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "CS:马赛撞色阳台": check({
    unit: { 出挑: 2 },
    color: { 颜色组合: ["#F44336", "#388E3C", "#FFC107"] },
    floor: [
      // 各层元素
      {
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    count: 1,
                    group: [
                      {
                        width: "-1出挑",
                        height: -0.4,
                        transform: [{ moveY: "-0.5出挑", moveZ: "1SH" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // 出挑阳台
          {
            proto: [
              {
                divide: [
                  {
                    count: 1,
                    group: [
                      // 阳台扶手
                      {
                        width: 0.2,
                        height: 0.4,
                        transform: [{ moveY: "0.1-1出挑", moveZ: 1 }],
                      },
                      // 阳台护墙
                      {
                        width: 0.2,
                        height: 1,
                        color: "#bbb",
                        transform: [{ moveY: "0.2-1出挑" }],
                      },
                      // 阳台楼板
                      { width: "-2出挑", height: -0.4 },
                    ],
                  },
                ],
              },
              // 随机彩色隔墙
              {
                spacing: [
                  {
                    space: 4,
                    group: [
                      {
                        x: 0.4,
                        y: "2出挑-0.6",
                        z: "1FH-0.4",
                        color: "颜色组合",
                      },
                    ],
                    control: { chance: 0.4 },
                  },
                ],
              },
            ],
          },
        ],
      },
      // 通高元素
      {
        facade: [
          {
            once: true,
            proto: [
              //补齐顶部出挑
              {
                divide: [
                  {
                    group: [
                      {
                        width: "-1出挑",
                        height: -0.4,
                        transform: [{ moveZ: "1SH" }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
              // 竖向通高隔板
              {
                spacing: [
                  {
                    group: [
                      {
                        x: 0.2,
                        y: "2出挑+0.2",
                        z: "1SH",
                        transform: [{ moveZ: -0.2 }],
                      },
                    ],
                    space: 4,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "CM:马赛中段方窗": check({
    unit: { 墙高: "1FH-1.6", 柱宽: 0.6, 间距: 2 },
    color: { 墙颜色: "_CONCRETE" },
    floor: [
      {
        facade: [
          {
            once: true,
            padding: { start: "0.5柱宽", end: "0.5柱宽", asRatio: false },
            proto: [
              {
                spacing: [
                  {
                    group: [{ x: "1柱宽", y: 0.5, z: "1SH" }],
                    space: "1间距",
                  },
                ],
              },
            ],
          },
          {
            proto: [
              {
                divide: [
                  {
                    group: [{ width: -0.2, height: "1墙高", color: "墙颜色" }],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "CB:马赛通风塔": check({
    unit: { 数量: 2 },
    color: {},
    floor: [
      {
        adjunct: [
          {
            once: true,
            count: "1数量",
            boxes: [
              { x: 2, y: 2, z: 10, transform: [{ rotateX: 5 }] },
              {
                x: 2,
                y: 2,
                z: 10,
                transform: [{ rotateX: 5 }, { rotateZ: 120 }],
              },
              {
                x: 2,
                y: 2,
                z: 10,
                transform: [{ rotateX: 5 }, { rotateZ: 240 }],
              },
              { x: 0.2, y: 1.8, z: 10.5, transform: [{ rotateX: 5 }] },
              {
                x: 0.2,
                y: 1.8,
                z: 10.5,
                transform: [{ rotateX: 5 }, { rotateZ: 120 }],
              },
              {
                x: 0.2,
                y: 1.8,
                z: 10.5,
                transform: [{ rotateX: 5 }, { rotateZ: 240 }],
              },
              { x: 2, y: 2, z: 0.2, transform: [{ moveY: -1, moveZ: 10.5 }] },
              {
                x: 2,
                y: 2,
                z: 0.2,
                transform: [{ moveY: -1, moveZ: 10.5 }, { rotateZ: 120 }],
              },
              {
                x: 2,
                y: 2,
                z: 0.2,
                transform: [{ moveY: -1, moveZ: 10.5 }, { rotateZ: 240 }],
              },
            ],
          },
        ],
      },
    ],
  }),
  // #endregion
  // #region V 新中式别墅
  "VT:四坡顶": check({
    unit: { 高度: 2, 出挑: 0.5 },
    color: { 颜色: "#863", 屋顶颜色: "#666" },
    floor: [
      {
        slopingRoof: [
          {
            form: "4",
            height: "1高度-0.3",
            color: "屋顶颜色",
            transform: [{ moveZ: 0.3 }],
          },
        ],
      },
      {
        // scaleEdges: '-1出挑',
        extrude: [{ height: 0.2, color: "颜色", transform: [{ moveZ: 0.1 }] }],
      },
      {
        // scaleEdges: '0.1-1出挑',
        extrude: [{ height: 0.1 }],
      },
    ],
  }),
  "VT:线脚": check({
    unit: { 总高: 0.6, 标高: "1BH-2.6" },
    color: { 颜色: "#eee" },
    floor: [
      {
        // scaleEdges: -0.2,
        extrude: [
          {
            once: true,
            height: 0.1,
            color: "颜色",
            transform: [{ moveZ: "1标高+1总高-0.1" }],
          },
          {
            once: true,
            height: 0.1,
            color: "颜色",
            transform: [{ moveZ: "1标高" }],
          },
        ],
      },
      {
        extrude: [
          {
            once: true,
            height: "1总高-0.2",
            color: "颜色",
            transform: [{ moveZ: "1标高+0.1" }],
          },
        ],
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    group: [
                      {
                        x: 0.2,
                        y: 0.2,
                        z: "1总高-0.2",
                        color: "颜色",
                        transform: [{ moveZ: "1标高+0.1" }],
                      },
                    ],
                    space: 0.6,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VM:整段竖向划分阳台门": check({
    unit: { 总高: "1SH", 标高: 0.45 },
    color: { 颜色: "#541" },
    floor: [
      {
        facade: [
          {
            once: true,
            proto: [
              // 门上饰面，填充剩余段高
              {
                spacing: [
                  {
                    space: 0.3,
                    group: [
                      {
                        x: 0.1,
                        y: 0.4,
                        z: "1SH-1标高-2.6",
                        color: "颜色",
                        transform: [{ moveZ: "1标高+2.6" }],
                      },
                    ],
                  },
                ],
              },
              // 门上横隔断
              {
                spacing: [
                  { space: 0.1 },
                  {
                    space: 1.4,
                    group: [
                      {
                        width: -0.5,
                        height: 0.2,
                        color: "颜色",
                        transform: [{ moveZ: "1标高+2.4" }],
                      },
                    ],
                  },
                ],
              },
              {
                spacing: [
                  { space: 0.1, group: [{ x: 0.2, y: 0.8, z: "1总高", color: "颜色" }] },
                  {
                    space: 0.7,
                    group: [
                      {
                        width: -0.2,
                        height: 2.4,
                        color: "颜色",
                        transform: [{ moveZ: "1标高" }],
                      },
                    ],
                  },
                  {
                    space: 0.7,
                    group: [
                      {
                        width: -0.2,
                        height: 2.4,
                        color: "颜色",
                        transform: [{ moveZ: "1标高" }],
                      },
                      // 该处为正中心，生成门把手
                      {
                        x: 0.1,
                        y: 0.5,
                        z: 0.6,
                        transform: [{ moveX: -0.2, moveZ: "1标高+0.6" }],
                      },
                      {
                        x: 0.1,
                        y: 0.5,
                        z: 0.6,
                        transform: [{ moveX: 0.2, moveZ: "1标高+0.6" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VM:横向门搭配竖向划分入户门": check({
    unit: {},
    color: { 颜色: "#541" },
    floor: [
      {
        facade: [
          {
            proto: [
              {
                divide: [
                  {
                    group: [
                      { width: -0.3, height: 2.2, color: "颜色" },
                      {
                        width: -0.6,
                        height: 0.2,
                        color: "颜色",
                        shrink: -0.6,
                        transform: [{ moveX: -0.3, moveZ: 2.2 }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VM:整段竖向划分立面窗": check({
    unit: { 总高: "1SH" },
    color: { 浅色: "#863", 深色: "#541" },
    floor: [
      {
        facade: [
          {
            once: true,
            proto: [
              {
                spacing: [
                  { space: 1, group: [{ width: 0.2, height: "1总高" }] },
                  { space: 0.1, group: [{ x: 0.1, y: 0.3, z: "1总高", color: "浅色" }] },
                  { space: 0.6, group: [{ x: 0.1, y: 0.1, z: "1总高", color: "深色" }] },
                  { space: 1.2, group: [{ x: 0.1, y: 0.1, z: "1总高", color: "深色" }] },
                  { space: 0.6, group: [{ x: 0.1, y: 0.1, z: "1总高", color: "深色" }] },
                  { space: 0.1, group: [{ x: 0.1, y: 0.1, z: "1总高", color: "深色" }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VM:横向划分立面窗": check({
    unit: { 墙板高: 1.4, 墙板降低: 0.4 },
    color: { 浅色: "#863", 深色: "#541" },
    floor: [
      {
        facade: [
          {
            proto: [
              {
                spacing: [
                  { space: 1 },
                  {
                    space: 2.6,
                    group: [
                      // 横窗格
                      {
                        width: -0.1,
                        height: 0.05,
                        color: "深色",
                        transform: [{ moveZ: 2.2 }],
                      },
                      // 横墙板
                      {
                        width: -0.2,
                        height: "1墙板高",
                        color: "浅色",
                        transform: [{ moveZ: "-1墙板降低" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VB:通高角柱": check({
    unit: { 柱高: "1BH-4" },
    color: { 颜色: "#541" },
    floor: [
      {
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    group: [
                      {
                        x: 0.7,
                        y: 0.7,
                        z: -0.6,
                        color: "颜色",
                        transform: [{ moveZ: "1柱高" }],
                      },
                      { x: 0.6, y: 0.6, z: "1柱高-0.6" },
                      { x: 0.7, y: 0.7, z: 1, color: "颜色" },
                    ],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VB:通高门廊柱": check({
    unit: { 出挑: 2, 柱高: "1BH-2.6" },
    color: { 颜色: "#541" },
    floor: [
      {
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    group: [
                      // 顶部装饰块
                      {
                        x: 0.3,
                        y: 0.7,
                        z: 0.3,
                        color: "颜色",
                        transform: [{ moveZ: "1柱高-0.4", moveY: "-1出挑" }],
                      },
                      { x: 0.6, y: 0.6, z: "1柱高", transform: [{ moveY: "-1出挑" }] },
                      {
                        x: 0.7,
                        y: 0.7,
                        z: 1,
                        color: "颜色",
                        transform: [{ moveY: "-1出挑" }],
                      },
                      // 灯
                      {
                        x: 0.1,
                        y: 0.8,
                        z: 0.1,
                        color: "颜色",
                        transform: [{ moveZ: 2.4, moveY: "-1出挑" }],
                      },
                      {
                        x: 0.08,
                        y: 0.78,
                        z: 0.9,
                        transform: [{ moveZ: 1.5, moveY: "-1出挑" }],
                      },
                      {
                        x: 0.1,
                        y: 0.8,
                        z: 0.1,
                        color: "颜色",
                        transform: [{ moveZ: 1.4, moveY: "-1出挑" }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VB:门廊三级台阶": check({
    unit: { 出挑: 2 },
    color: {},
    floor: [
      {
        facade: [
          {
            once: true,
            proto: [
              {
                divide: [
                  {
                    group: [
                      {
                        width: "2出挑",
                        height: 0.15,
                        transform: [{ moveZ: 0.3 }],
                      },
                      {
                        width: "2出挑+0.6",
                        height: 0.15,
                        shrink: -0.6,
                        transform: [{ moveX: -0.3, moveZ: 0.15 }],
                      },
                      {
                        width: "2出挑+1.2",
                        height: 0.15,
                        shrink: -1.2,
                        transform: [{ moveX: -0.6 }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  "VM:门廊阳台线脚": check({
    unit: { 出挑: 2, 楼板厚: 0.4 },
    color: { 颜色: "#863" },
    floor: [
      // 外廊顶部线脚饰块
      {
        facade: [
          // 顶板和线脚
          {
            once: true,
            proto: [
              {
                spacing: [
                  {
                    group: [
                      {
                        x: 0.2,
                        y: "2出挑+1",
                        z: 0.4,
                        transform: [{ moveZ: "1SH-0.5" }],
                      },
                    ],
                    space: 0.6,
                  },
                ],
              },
              // 外廊顶部线脚
              {
                divide: [
                  {
                    count: 1,
                    group: [
                      {
                        width: "2出挑+1.6",
                        height: 0.2,
                        shrink: -1.6,
                        color: "#863",
                        transform: [{ moveX: -0.8, moveZ: "1SH+0.1" }],
                      },
                      {
                        width: "2出挑+1.2",
                        height: 0.1,
                        shrink: -1.2,
                        transform: [{ moveX: -0.6, moveZ: "1SH" }],
                      },
                      {
                        width: "2出挑+1",
                        height: 0.1,
                        shrink: -1,
                        transform: [{ moveX: -0.5, moveZ: "1SH-0.1" }],
                      },
                      {
                        width: "2出挑+0.8",
                        height: 0.4,
                        shrink: -0.8,
                        transform: [{ moveX: -0.4, moveZ: "1SH-0.5" }],
                      },
                      {
                        width: "2出挑+1",
                        height: 0.1,
                        shrink: -1,
                        transform: [{ moveX: -0.5, moveZ: "1SH-0.6" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          // 各层阳台
          {
            proto: [
              // 玻璃围栏侧面
              {
                divide: [
                  {
                    group: [
                      {
                        x: 0.02,
                        y: "1出挑",
                        z: 1,
                        color: "G",
                        transform: [{ moveY: "-0.5出挑" }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
              {
                divide: [
                  // 玻璃围栏正面
                  {
                    group: [
                      {
                        width: 0.02,
                        height: 1,
                        color: "G",
                        transform: [{ moveY: "-1出挑" }],
                      },
                    ],
                    count: 1,
                  },
                  // 楼板带线脚
                  {
                    group: [
                      {
                        width: "2出挑+1",
                        height: -0.1,
                        shrink: -1,
                        color: "颜色",
                        transform: [{ moveX: -0.5 }],
                      },
                      {
                        width: "2出挑+0.8",
                        height: "0.2-1楼板厚",
                        shrink: -0.7,
                        color: "颜色",
                        transform: [{ moveX: -0.35, moveZ: -0.1 }],
                      },
                      {
                        width: "2出挑+1",
                        height: 0.1,
                        shrink: -0.8,
                        color: "颜色",
                        transform: [{ moveX: -0.4, moveZ: "-1楼板厚" }],
                      },
                    ],
                    count: 1,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  }),
  // #endregion
  // #region M 拟合
  "MM:45度拟合": check({
    unit: { 出挑: 1 },
    color: { 横板: "_WOOD" },
    floor: [
      {
        extrude: [{ height: -1, color: "横板" }],
      },
      {
        match: [
          {
            once: true,
            flexes: [
              { width: 0.4, height: "1SH-1" },
              { width: 3, height: "1SH-1", color: "G" },
            ],
            along: 45,
          },
        ],
      },
    ],
  }),
  "MM:开间拟合": check({
    unit: { 板宽: 0.4, 窗宽: 4, 窗进深: 0.5, 修正高度: 0, 修正标高: 0 },
    color: { 颜色: "#fff" },
    floor: [
      {
        match: [
          {
            sandwich: true,
            once: true,
            flexes: [
              {
                width: "1板宽",
                height: "1SH+1修正高度",
                color: "颜色",
                transform: [{ moveZ: "1修正标高" }],
              },
              {
                width: "1窗宽",
                height: "1SH+1修正高度",
                color: "G",
                shrink: "2窗进深",
                transform: [{ moveZ: "1修正标高" }],
              },
            ],
            along: "DEPTH",
          },
        ],
      },
    ],
  }),
  // #endregion
}
