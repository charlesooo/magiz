# Magiz

一个用于生成轻量化建筑模型的 JS 库
a JavaScript library for generating Lightweight Building Model

Magiz 在轻量化的数据结构、生成逻辑、渲染效率、跨平台等方面都有优化，适合在web端展示城市级尺度的模型场景。
Magiz has been optimized for lightweight data structures, generation logic, rendering efficiency, and cross platform capabilities, making it suitable for displaying city level model scenes on the web.

## 须知 Notice

目前还是 ``esm`` 打包的 **测试版**，全部功能可用，但仅包含了几个基础样式，文档也仅针对核心功能，后续再完善。

At present, it is still a **beta version** bundled as ``esm``, with all functions available, but only a few basic styles, and the documentation is only for the core functions, which will be further improved in the future.

## 演示 Demo

+ [Another Marseille](http://architech.fun/demo/)

  将建筑大师柯布西耶设计的马赛公寓转换成参数化样式
  Convert the Marseille apartment designed by famous architect Corbusier into a parametric style

+ [Infinite city](http://architech.fun/demo-city/)

  1917栋参数化建筑的城市场景
  The urban scene of 1917 parameterized buildings

## 案例 Example

打开并编辑 ``./example/index.html`` 以查看生成的模型。
Open and edit ``./example/index.html`` to view the generated model.

1. Magiz的功能依赖于Three.js，需要先通过importmap导入three.module.min.js
Magiz's functionality relies on Three.js, which requires importing Three.module.min.js through an importmap first

    ```html
    <script type="importmap">
      {
        "imports": {
          "three": "https://cdn.staticfile.net/three.js/0.160.0/three.module.min.js"
        }
      }
    </script>
    ```

2. import ``esm`` functions

    ```html
    <script type="module">
      // Magiz 的核心功能
      // core functions of Magiz
      import { PLAN, STYLES, styles } from '../dist/magiz.module.min.js'
      // 一些即插即用的 Three.js 基本功能
      // Some basic Three.js functions ready to use
      import WEB3D from '../dist/web3D.module.min.js'

      // 初始化 three.js 场景
      // init three.js scene
      const web3D = new WEB3D('#magiz')
      // 设置镜头。许多Three.js对象被绑定为属性。
      // setup camera. many Three.js object are bounded as attribute
      web3D.camera.position.set(100, 50, 100)

      // 初始化建筑平面对象
      // init a building plan object
      const plan = new PLAN({
        params:{
          style: 'Random',
          height: 24,
          floorHeight: 3,
          elevation: 9,
          seed: 0,
          matchSpacing: 2,
        },
        loops: [
          [
            [0, 0],
            [80, 0],
            [80, 30],
            [0, 30],
          ],
        ]
      })

      // 初始化用于缓存生成结果的全局变量
      // init a global var to cache data generated
      const data = { colorMap: [], models: [] }
      // 将生成的模型数据缓存到全局变量
      // generate model data to global var
      plan.toModel(data, styles, { x: 0, y: 0 })
      // 利用全局变量渲染场景
      // use global var to render scene
      web3D.refresh(data, { grayScale: false, showEdge: true })
    </script>
    ```

## 参数说明 Params Description

+ new PLAN({ params, loops })

    ```ts
    params: {
      // 指定建筑样式名称
      // name of building style
      style: 'Blocks'|'Random'|'S0'|'S1'|'S2'|'S3'|'S4'|'S5'
      // 指定建筑高度
      // total height of building (m)
      height: number
      // 指定建筑层高
      // floor height of building (m)
      floorHeight: number
      // 指定建筑标高
      // elevation of building (m)
      elevation: number
      // 指定随机数种子，0表示完全随机
      // init seed with a number. 0 means to init seed randomly
      seed: number
      // 指定拟合平面的矩形宽度
      // set width of rectangle to match a plan shape (m)
      matchSpacing: number
    }

    // 3 阶数组以支持包含孔洞的平面
    // 3 level array to enable holes in polygon
    loops: [x: number, y: number][][]
    ```

+ web3D.refresh(data, params)

    ```ts

    params: {
      // 开关渲染模型颜色
      // toggle model colors
      grayScale: boolean
      // 开关渲染模型边线
      // toggle model edges
      showEdge: boolean
      // 如果一次生成输入了多个平面，设为真
      // turn this on if generating multiple plans
      inplace: boolean
    }

    // 用于缓存 web3D.refresh(...) 生成结果的全局变量，以便多次生成
    // global var to cache data for mutiple call of web3D.refresh(...)
    data: {
      // 缓存多次生成后的全部颜色值
      // caching all generated color values
      colorMap: string[],
      // 模型数据
      // model data
      models: rawBuilding[]
    }

    type rawBuilding = {
      // 暂时无用
      // unavailable
      info: { floorArea: number, floors: number },
      // 重置平面中心到原点后的平面相对坐标点
      // relative points after reset center of plan to origin
      points: [x: number, y: number][][],
      // 原平面的中心点
      // real center of plan
      center: [x: number, y: number],
      // 如果一次生成输入了多个平面 (params.inplace=true)，该值为该平面相对于全部平面的中心的中心点
      // center related to the center of multiple plans, for params.inplace=true
      centerRelative: [x: number, y: number],
      // PLAN 对象的参数引用
      // params ref of PLAN instance
      params: params,
      // 将平面长边对齐X轴时的弧度
      // radian to align the longest edge of plan to x-axis
      rotate: number,
      data: {
        // instancedMesh数据：默认材质的立方体
        // instancedMesh data：box with basic material
        box: rawData,
        // instancedMesh数据：玻璃材质的立方体
        // instancedMesh data：box with glass material
        boxGlass: rawData,
        // instancedMesh数据：默认材质的坡屋顶
        // instancedMesh data：sloping roof with basic material
        sloping: rawData,
        // instancedMesh数据：玻璃材质的坡屋顶
        // instancedMesh data：sloping roof with glass material
        slopingGlass: rawData,
      },
    }

    type rawData = {
      // 包含多个16位变形矩阵的数组
      // 4x4 Matrices in array
      matrices: number[][],
      // data.colorMap 中的序号，多个序号表示随机颜色
      // indexs in data.colorMap. mutiple indexes means random color
      colors: string[]
    }[]

    ```

## 其他信息 More info

Author: 周 曦
website: <http://architech.fun/>
E-mail:  <453154007@qq.com>
Wechat:  Ketchup
