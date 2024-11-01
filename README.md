# Magiz

一个用于生成轻量化建筑模型的 JS 库
Magiz 在轻量化的数据结构、生成逻辑、渲染效率、跨平台等方面都有优化，适合在web端展示城市级尺度的模型场景。

A JavaScript library for generating Lightweight Building Model.
Magiz has been optimized for lightweight data structures, generation logic, rendering efficiency, and cross platform capabilities, making it suitable for displaying city level model scenes on the web.

## Notice

**Functions may change in the future.**

## Demo

<https://charlesooo.github.io/magiz-demo/>

- Convert the Marseille apartment designed by architect Corbusier into a parametric style

- urban scene with 1917 parameterized buildings

- 武汉工业大学 建筑编码课程 2024

## Usage

Refer to [example](./example/index.html) to start development or to create and debug styles.

Refer to [./src/types/magizTypes.d.ts](./src/types/magizTypes.d.ts) for tips and type checking of core functions.

## Custom Styles

- ### Files related

    [./src/types/styleTypes.d.ts](./src/types/styleTypes.d.ts) is for tips and type checking of TS style files.

    [./styles/free/](./styles/free/1.ts) contains TS style examples, remember to import ``styleTypes.d.ts`` at the top of new style file.

- ### Steps

1. Create ``your_custom_style.ts``

    ```ts
    import type { styleTypes } from './path/to/styleTypes.d.ts'
    export const styles: styleTypes.styles = {
      preset:{...},
      building:{
        your_style_name:{...}
      }
    }
    ```

2. Edit [./styles//index.ts](./styles/index.ts)

    ```ts
    // import your_custom_style
    import { styles as your_custom_style } from './path/to/your_custom_style.ts'
    // insert it so can be bundled into magizAndView.module.js
    const styles = new StyleHandler(..., your_custom_style)
    ```

3. Bundle and watch ``magizAndView.module.js``

    ```bash
    npm run dev
    ```

4. Init and edit [example page](./example/index.html). Set style to "your_style_name" which is defined in ``your_custom_style.ts``.

    ```ts
      // change these 3 variables to control
      const style = "your_style_name"
      const height = 24
      const match = 0
    ```

    > Recommended to init with [VSC](https://code.visualstudio.com/) and [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.

5. Edit ``your_custom_style.ts``, press **Ctrl+S** to save file and check out the result on [example page](./example/index.html).

## Info

Author: 周 曦
website: <http://www.architech.fun/>
E-mail:  <453154007@qq.com>
Wechat:  Ketchup
