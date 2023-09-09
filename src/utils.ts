import { execSync } from 'child_process';
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
        commitLint = true,
    }: CreateOptions,
) {
    const source = path.join(templateDir, 'templates', type, lang);

    fs.cpSync(source, dir, { recursive: true });

    execSync(`cd ${dir} && npm pkg set name=${name}`);

    if (lint) cpShared('eslint', dir);
    if (hooks) {
        cpShared('husky', dir);
        if (lint)
            fs.appendFileSync(
                path.join(dir, '.husky', 'pre-commit'),
                ` && npm lint\n`,
            );
    }
    if (commitLint) cpShared('commit_lint', dir);
}

function cpShared(name: string, dir: string) {
    if (!shared.includes(name))
        throw new Error(`"${name}" is not a valid shared template`);

    const source = path.join(templateDir, 'shared', name);

    fs.cpSync(source, dir, {
        recursive: true,
        filter: (src) => src !== `${source}/package.json`,
    });

    combine(path.join(dir, 'package.json'), path.join(source, 'package.json'));
}

function sort(obj: Record<string, unknown>) {
    return Object.keys(obj)
        .sort()
        .reduce((sorted: Record<string, unknown>, key) => {
            sorted[key] = obj[key];
            return sorted;
        }, {});
}

function combine(basePath: string, extendPath: string) {
    const base = readJson(basePath);
    const extend = readJson(extendPath);

    const combined = merge.recursive(true, base, extend);

    ['dependencies', 'devDependencies'].forEach((key) => {
        if (combined[key]) combined[key] = sort(combined[key]);
    });

    writeJson(basePath, combined);
}

function readJson(path: string) {
    const json = fs.readFileSync(path, {
        encoding: 'utf-8',
    });
    return JSON.parse(json);
}

function writeJson(path: string, data: unknown) {
    const json = JSON.stringify(data, null, 4) + '\n';
    fs.writeFileSync(path, json);
}

export const templateDir = path.join(process.cwd(), 'template');

export const templates = fs.readdirSync(path.join(templateDir, 'templates'));

export const shared = fs.readdirSync(path.join(templateDir, 'shared'));
