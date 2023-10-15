import { defineConfig } from 'tsup';

export default defineConfig({
    clean: true,
    entry: ['src/index.js'],
    format: ['esm', 'cjs'],
    platform: 'node',
    target: 'node18',
    // Put your external packages here
    external: [],
    // treeshake: true, // tree-shaking is disabled temporarily due to an issue with source maps
    minify: true,
    splitting: false,
    sourcemap: true,
});
