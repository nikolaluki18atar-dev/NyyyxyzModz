import {defineConfig, globalIgnores} from 'eslint/config';
import {FlatCompat} from '@eslint/eslintrc';
import {fileURLToPath} from 'node:url';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';

const compat=new FlatCompat({baseDirectory:fileURLToPath(new URL('.',import.meta.url))});

export default defineConfig([
  ...compat.config(nextVitals),
  ...compat.config(nextTs),
  {rules:{'@typescript-eslint/no-explicit-any':'warn'}},
  globalIgnores(['.next/**','out/**','build/**','next-env.d.ts'])
]);
