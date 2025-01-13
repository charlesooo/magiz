# Magiz

生成轻量化建筑模型

Magiz 独特的体块生成逻辑可在 three.js 中通过一次 drawCall 渲染所有模型。适合在 web 端展示城市级尺度的模型场景。

For Generating Lightweight Building Models.

Magiz's unique block generation logic can render all models in Three.js with a single drawCall. Suitable for displaying city level model scenarios on the web.

## Notice

**Functions may change in the future.**

## Demo

<https://charlesooo.github.io/magiz-demo/>

- Convert the Marseille apartment designed by architect Corbusier into a parametric style

- Urban scene with 1917 parameterized buildings

- college summer camp 2024 (武汉工业大学建筑编码课程)

## Basic Usage

```bash
npm i
```

First install dependencies.

```bash
npm run build
```

Bundle TS to ESM (`dist\magiz.module.min.js`).

Localhost [example/index.html](./example/index.html) to see demo. this page can be the start point of creating new styles.

Refer to [src/types](./src/types) for tips and type details.

To develop with ViewClass, which is a custom three.js environment, use `npm run dev_` or `npm run build_` instead.

## Main Feature

To enable block only generation mode, set match to a none zero block size.

```ts
const plan = new Plan({ match: 2 })
```

This will only use block combinations for buildings and can be presented as 'instancedMesh' in Three.js to render all models in one drawCall.

## Custom Styles

- ### Files related

  [src/types/styleTypes.d.ts](./src/types/styleTypes.d.ts) contains tips and type details for styles.

  [src/styles](./src/styles) contains style examples.

- ### Steps

1. Start watching files. Any changes will be bundled into `dist\magiz.module.min.js`

   ```bash
   npm run dev
   ```

2. Localhost `example/index.html`

   Recommend to init with [VSC](https://code.visualstudio.com/) and [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.

3. Edit `src\styles\preset.ts` to create your presets

   Preset are style chunks can be reused in styles. `src/class/styleClass/utils` provide **'check'** functions to offer type checking and param tips.

4. Edit `src\styles\simple.ts` to create your styles

   `src/class/styleClass/utils` provide **'preset'** functions to import style chunks from `src\styles\preset.ts` and offer type checking and param tips.

## Need More Styles

If someone creates a new style and is interested in contributing, please PR to establish a public awesome style library.

## License

[GPLv3](./LICENSE)

## Misc

Any opinions and suggestions are welcomed !

Author: 周 曦
website: <http://www.architech.fun/>
E-mail: <453154007@qq.com>
Wechat: Ketchup
