#!/usr/bin/env -S node --enable-source-maps

import * as p from '@clack/prompts';
import * as color from 'colorette';
import { execa } from 'execa';
import fs from 'fs';
import gradient from 'gradient-string';
import type { Prompts } from './types.js';
import { create, templates } from './utils.js';

async function main() {
    console.clear();
    p.intro(color.bgMagentaBright(' ts-gen '));

    const dir = await p.text({
        message: `Where you want the project to be? ${color.dim(
            '(leave blank to use the current directory)',
        )}`,
        defaultValue: '.',
        placeholder: './my-app',
    });

    if (p.isCancel(dir)) {
        p.cancel('Operation cancelled');
        return process.exit(0);
    }

    if (fs.existsSync(dir) && fs.readdirSync(dir).length > 0) {
        const shouldContinue = await p.confirm({
            message: 'Directory is not empty. Continue?',
            initialValue: false,
        });

        if (!shouldContinue || p.isCancel(shouldContinue)) {
            p.cancel('Operation cancelled');
            return process.exit(0);
        }
    }

    const { pkgMgr, git, ...options } = await p.group<Prompts>(
        {
            lang: () =>
                p.select({
                    message: 'What language do want to use?',
                    options: [
                        {
                            value: 'ts',
                            label: 'TypeScript',
                            hint: 'recommended',
                        },
                        { value: 'js', label: 'JavaScript' },
                    ],
                }),
            type: () =>
                p.select({
                    message: 'What is your project type?',
                    options: templates.map((v) => ({ value: v })),
                }),
            git: () =>
                p.confirm({
                    message: 'Do you want to initialize git?',
                    initialValue: true,
                }),
            lint: ({ results }) =>
                results.git
                    ? p.confirm({
                          message: 'Do you want to add linting?',
                          initialValue: true,
                      })
                    : Promise.resolve(false),
            hooks: ({ results }) =>
                results.git
                    ? p.confirm({
                          message: 'Do you want to add git hooks with husky?',
                          initialValue: true,
                      })
                    : Promise.resolve(false),
            commitLint: ({ results }) =>
                results.hooks
                    ? p.confirm({
                          message: 'Do you want to add git commit linting?',
                          initialValue: true,
                      })
                    : Promise.resolve(false),
            pkgMgr: () =>
                p.select({
                    message: 'What package manager do you want to use?',
                    options: [
                        { value: 'npm' },
                        { value: 'yarn' },
                        { value: 'pnpm' },
                    ],
                }),
        },
        {
            onCancel() {
                p.cancel('Operation cancelled.');
                process.exit(0);
            },
        },
    );

    const spinner = p.spinner();

    spinner.start('Creating your project');

    create(dir, options);

    spinner.stop('Project created');

    process.chdir(dir);

    if (git) {
        spinner.start('Initializing git');

        await execa('git', ['init', '-b', 'main']);

        spinner.start('Git initialized');
    }

    spinner.start('Installing packages');

    await execa(pkgMgr, ['install']);

    spinner.stop('Packages installed');

    p.outro('done.');

    p.intro('Head to your project');

    p.log.info(`cd ${dir}`);

    p.outro(gradient.cristal.multiline('Happy Coding !'));
}

main().catch(console.error);
