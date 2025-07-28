import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/canvascreator.cjs',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/canvascreator.esm.js',
      format: 'esm'
    }
  ],
  plugins: [nodeResolve(), commonjs(), json()]
};
