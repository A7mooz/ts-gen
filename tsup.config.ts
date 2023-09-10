import { Options, defineConfig } from 'tsup';

const shared: Options = {
    clean: true,
    platform: 'node',
    target: 'node16',
    minify: true,
    splitting: false,
    sourcemap: true,
    shims: true,
};

export default defineConfig([
    {
        ...shared,
        entry: ['src/index.ts'],
        format: ['esm', 'cjs'],
        dts: true,
    },
    {
        ...shared,
        entry: ['src/bin.ts'],
        format: ['esm'],
    },
]);
