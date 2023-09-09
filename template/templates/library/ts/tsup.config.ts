import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'node',
    target: 'node18',
    // Put your external packages here
    external: [],
    treeshake: true,
    minify: true,
    splitting: false,
    sourcemap: true,
});
