# Magiz

一个轻量的参数化建筑生成库

## 项目配置

### 安装

```bash
# For windows
$ npm install
```

### 最小化

magiz.min.js 中包含了引用的三个库（mathjs, polylabel, three），将库剥离后的源码不到100KB。如忽略安全性，可不使用 mathjs。

### 项目案例

+ 在网页中使用：

```js
import { styles, PLAN, STYLES, WEB3D } from './dist/magiz.min.js'

// 创建建筑平面
const plan = new PLAN({
  styleParams: {
    style: 'Random',
    height: 24,
    floorHeight: 3,
    elevation: 9,
    seed: 0
  },
  loopPoints: [
    [[0, 0], [80, 0], [80, 30], [0, 30]]
  ]
})

// 建筑平面按样式库生成建筑模型数据
const data = plan.generate(styles)

// 初始化场景
const web3D = new WEB3D(document.querySelector('#magiz'))

// 用模型数据更新场景
web3D.refresh([data], true, true)

```
