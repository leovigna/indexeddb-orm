import * as esbuild from 'esbuild';
import { NodeResolvePlugin } from '@esbuild-plugins/node-resolve';
import * as glob from 'glob';

const files = glob.default.sync('src/**/*.{ts,tsx,json}');
//console.debug(files);

const excludeNodeModulesPlugin = NodeResolvePlugin({
  extensions: ['.ts', '.js', '.json'],
  onResolved: (resolved) => {
    //console.debug(resolved)
    if (resolved.includes('node_modules')) {
      return {
        external: true,
      };
    }
    return resolved;
  },
});

const ESBUILD_WATCH = process.env.ESBUILD_WATCH === 'true' || process.env.ESBUILD_WATCH === '1';
const watch = ESBUILD_WATCH
  ? {
    onRebuild: (error) => {
      if (error) console.error('watch esbuild failed:', error);
      else console.log('watch esbuild succeeded');
    },
  }
  : false;

const baseConfig = {
  sourcemap: 'external',
  inject: [],
  plugins: [excludeNodeModulesPlugin],
  watch,
};

//CJS Library (Testing)
await esbuild.default.build({
  entryPoints: files,
  bundle: false,
  outdir: 'lib/cjs',
  //outExtension: { '.js': '.cjs' },
  format: 'cjs',
  ...baseConfig,
});

//ESM Library
await esbuild.default.build({
  entryPoints: files,
  bundle: false,
  outdir: 'lib/esm',
  format: 'esm',
  ...baseConfig,
});

//CJS Bundle
await esbuild.default.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  outfile: 'dist/indexeddb-orm-lib.cjs.js',
  format: 'cjs',
  external: ['url', 'events', 'path'],
  ...baseConfig,
});

await esbuild.default.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/indexeddb-orm-lib.cjs.min.js',
  format: 'cjs',
  external: ['url', 'events', 'path'],
  ...baseConfig,
});

//ESM Bundle
await esbuild.default.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: false,
  outfile: 'dist/indexeddb-orm-lib.es.js',
  format: 'esm',
  external: ['path', 'events', 'url'],
  ...baseConfig,
});

await esbuild.default.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  outfile: 'dist/indexeddb-orm-lib.es.min.js',
  format: 'esm',
  external: ['path', 'events', 'url'],
  ...baseConfig,
});
