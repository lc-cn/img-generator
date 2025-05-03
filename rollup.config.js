import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { defineConfig } from 'rollup';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  external: ['fs', 'path', 'https', 'http', 'jsdom', 'satori', '@resvg/resvg-js', '@fontsource/roboto'],
}); 