import { Options, defineConfig } from 'tsup';

const shared: Options = {
    clean: true,
    platform: 'node',
    target: 'node18',
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
        entry: { bin: 'src/cli/index.ts' },
        format: 'esm',
        banner: {
            js: '#!/usr/bin/env -S node --enable-source-maps',
        },
    },
]);
