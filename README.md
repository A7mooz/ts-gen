<h1 align="center"> TS-GEN </h1>

<div>
  <div align="center" class="badge-container">
    <a href="https://www.npmjs.com/package/@a7mooz/ts-gen"
      ><img
        src="https://img.shields.io/npm/v/@a7mooz/ts-gen.svg?maxAge=3600"
        alt="NPM version"
    /></a>
    <a href="https://www.npmjs.com/package/@a7mooz/ts-gen"
      ><img
        src="https://img.shields.io/npm/dt/@a7mooz/ts-gen.svg?maxAge=3600"
        alt="NPM downloads"
    /></a>
    <a href="https://github.com/a7mooz/ts-gen/actions"
      ><img
        src="https://github.com/a7mooz/ts-gen/workflows/Check/badge.svg"
        alt="Build status"
    /></a>
  </div>
</div>

# CLI

```bash
$ npx @a7mooz/ts-gen@latest
// Or
$ pnpm dlx @a7mooz/ts-gen
// Or (only yarn v3 and above)
$ yarn dlx @a7mooz/ts-gen
```

# API

## Installation

```bash
$ npm install @a7mooz/ts-gen
// Or
$ pnpm add @a7mooz/ts-gen
// Or
$ yarn add @a7mooz/ts-gen
```

## Usage

### ESM

```js
import { create } from '@a7mooz/ts-gen';

create('project/path', {
    type: 'library',
    lang: 'ts',
    name: 'name',
    lint: true,
    hooks: true,
    commitLint: true,
});
```

### CJS

```js
const { create } = require('@a7mooz/ts-gen');

create('project/path', {
    type: 'library',
    lang: 'ts',
    name: 'name',
    lint: true,
    hooks: true,
    commitLint: true,
});
```

### Options

-   name?: string

    The project's name (defaults to the dir's basename)

-   type: string

    The project's type (must be one of the available templates in `template/templates`)

-   lang: 'ts' | 'js'

    The project's language

-   lint?: boolean

    Whether to add linting (default `true`)

-   hooks?: boolean

    Whether to add husky git hooks (default `true`)

-   commitLint?: boolean

    Whether to add commit linting (only works with git hooks) (defaults to `hooks` option)

-   moduleType?: 'module' | 'commonjs'

    The module type (default `module` if a program and `commonjs` if a library)
