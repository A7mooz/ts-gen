import fs from 'fs';
import merge from 'merge';
import path from 'path';
import type { CreateOptions } from './types';

export function create(
    dir: string,
    {
        name = path.basename(path.resolve(dir)),
        type,
        lang,
        lint = true,
        hooks = true,
        commitLint = hooks,
        repo,
        moduleType = type === 'library' ? 'commonjs' : 'module',
    }: CreateOptions,
) {
    const source = path.join(templateDir, 'templates', type, lang);

    fs.cpSync(source, dir, { recursive: true });

    const pkg = readJson(path.join(dir, 'package.json'));

    pkg.name = name;

    if (moduleType === 'commonjs') delete pkg.type;
    else pkg.type = moduleType;

    writeJson(path.join(dir, 'package.json'), pkg);

    if (lint) cpShared('eslint', dir);
    if (hooks) {
        cpShared('husky', dir);
        if (lint) {
            fs.appendFileSync(
                path.join(dir, '.husky', 'pre-commit'),
                ` && npm lint\n`,
            );

            const lintstagedrc = path.join(dir, '.lintstagedrc.json');

            writeJson(
                lintstagedrc,
                merge(readJson(lintstagedrc), {
                    '*.{mjs,js,cjs,ts,jsx,tsx}': 'eslint --fix',
                }),
            );
        }
    }
    if (commitLint) cpShared('commit_lint', dir);
    if (repo) {
        cpShared('repo', dir);

        if (!repo.match(/^https?:\/\//)) repo = `https://${repo}`;

        const url = new URL(repo);

        fs.writeFileSync(
            path.join(dir, 'package.json'),
            fs
                .readFileSync(path.join(dir, 'package.json'), {
                    encoding: 'utf-8',
                })
                .replaceAll('https://url', url.href.replace(/\/$/, '')),
        );
    }
}

export function cpShared(name: string, dir: string) {
    if (!shared.includes(name))
        throw new Error(`"${name}" is not a valid shared template`);

    const source = path.join(templateDir, 'shared', name);

    fs.cpSync(source, dir, {
        recursive: true,
        filter: (src) => path.basename(src) !== 'package.json',
    });

    combine(path.join(dir, 'package.json'), path.join(source, 'package.json'));
}

export function sort(obj: Record<string, unknown>) {
    return Object.keys(obj)
        .sort()
        .reduce((sorted: Record<string, unknown>, key) => {
            sorted[key] = obj[key];
            return sorted;
        }, {});
}

export function combine(basePath: string, extendPath: string) {
    const base = readJson(basePath);
    const extend = readJson(extendPath);

    const combined = merge.recursive(true, base, extend);

    ['dependencies', 'devDependencies'].forEach((key) => {
        if (combined[key]) combined[key] = sort(combined[key]);
    });

    writeJson(basePath, combined);
}

export function readJson(path: string) {
    const json = fs.readFileSync(path, {
        encoding: 'utf-8',
    });
    return JSON.parse(json);
}

export function writeJson(path: string, data: unknown) {
    const json = JSON.stringify(data, null, 4) + '\n';
    fs.writeFileSync(path, json);
}

export const templateDir = path.resolve(
    __dirname,
    path.basename(__dirname) === 'dist' ? '..' : '../..',
    'template',
);

export const templates = fs.readdirSync(path.join(templateDir, 'templates'));

export const shared = fs.readdirSync(path.join(templateDir, 'shared'));
