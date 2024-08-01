/** 模块路径与参数完全相同的才会被排除 */
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

require('esbuild').build({
  entryPoints: ['index.js'],
  bundle: true,
  minify: true,
  format: 'esm',
  outfile: './demo/magiz.module.min.js',
  plugins: [strictExternalize(['three'])],
});
