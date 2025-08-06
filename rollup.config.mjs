import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  external: (id) => id.startsWith('./apiops-cycles-method-data/'),
  output: [
    {
      file: 'dist/canvascreator.cjs',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/canvascreator.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/canvascreator.esm.min.js',
      format: 'esm'
    }
    ],
  plugins: [nodeResolve(), commonjs(), json(), terser()]
};
