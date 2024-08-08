const outMagiz = './dist/magiz.module.min.js'
const outWeb3D = './dist/web3D.module.min.js'

const { build } = require('esbuild')
const path = require('node:path')
const fs = require('node:fs')

/** 插件：模块路径与参数完全相同的才会被排除 */
function strictExternalize(paths) {
  return {
    name: 'strictExternal-plugin',
    setup(build) {
      if (paths.length > 0) {
        build.onResolve({ filter: /.*/ }, (args) => {
          if (args.kind === 'import-statement' && paths.includes(args.path)) {
            return { path: args.path, external: true };
          }
        });
      }
    },
  }
}

/** 清理目录 */
function removeDir(dir) {
  const realPath = path.resolve(dir)
  if (fs.existsSync(realPath)) {
    const stat = fs.statSync(realPath)
    if (stat.isDirectory()) {
      fs.rmSync(realPath, { recursive: true })
      console.log(realPath, 'cleared');
    } else {
      console.log(realPath, 'is not directory');
    }
  } else {
    console.log(realPath, 'is not existed');
  }
}

removeDir('./dist');

build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  plugins: [strictExternalize(['three'])],
  outfile: outMagiz,
}).then(() => {
  console.log('Done: ', outMagiz);
});

build({
  entryPoints: ['src/web3DClass/web3D.ts'],
  bundle: true,
  minify: true,
  format: 'esm',
  plugins: [strictExternalize(['three'])],
  outfile: outWeb3D,
}).then(() => {
  console.log('Done: ', outWeb3D);
});

