import { cancel, confirm, group, isCancel, select, text } from '@clack/prompts';
import { dim } from 'colorette';
import { existsSync, readdirSync } from 'fs';
import type { Prompts } from '../types';
import { templates } from '../utils.js';

export async function ask(args: string[]) {
    const dir =
        args[0] ||
        (await text({
            message: `Where you want the project to be? ${dim(
                '(leave blank to use the current directory)',
            )}`,
            defaultValue: '.',
            placeholder: './my-app',
        }));

    if (isCancel(dir)) {
        cancel('Operation cancelled');
        process.exit(0);
    }

    if (existsSync(dir) && readdirSync(dir).length > 0) {
        const shouldContinue = await confirm({
            message: 'Directory is not empty. Continue?',
            initialValue: false,
        });

        if (!shouldContinue || isCancel(shouldContinue)) {
            cancel('Operation cancelled');
            process.exit(0);
        }
    }

    const { pkgMgr, git, ...options } = await group<Prompts>(
        {
            lang: () =>
                select({
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
                select({
                    message: 'What is your project type?',
                    options: templates.map((v) => ({ value: v })),
                }),
            moduleType: ({ results }) =>
                results.type === 'library'
                    ? Promise.resolve('commonjs')
                    : select({
                          message: 'What module type you prefer?',
                          options: [
                              {
                                  value: 'module',
                                  label: 'EcmaScript (ESM)',
                                  hint: 'recommended',
                              },
                              {
                                  value: 'commonjs',
                                  label: 'Common JS (CJS)',
                              },
                          ],
                      }),
            git: () =>
                confirm({
                    message: 'Do you want to initialize git?',
                    initialValue: true,
                }),
            repo: () =>
                text({
                    message: "What's your repo link (doesn't have to exist)",
                    placeholder: 'https://',
                    validate(value) {
                        if (!value) return;

                        if (!value.match(/^https?:\/\//))
                            value = `https://${value}`;

                        if (!URL.canParse(value)) return 'Invalid URL fromat';
                    },
                }),
            lint: () =>
                confirm({
                    message: 'Do you want to add linting?',
                    initialValue: true,
                }),
            hooks: ({ results }) =>
                results.git
                    ? confirm({
                          message: 'Do you want to add git hooks with husky?',
                          initialValue: true,
                      })
                    : Promise.resolve(false),
            commitLint: ({ results }) =>
                results.hooks
                    ? confirm({
                          message: 'Do you want to add git commit linting?',
                          initialValue: true,
                      })
                    : Promise.resolve(false),
            pkgMgr: () =>
                select({
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
                cancel('Operation cancelled.');
                process.exit(0);
            },
        },
    );

    if (options.repo && !options.repo.match(/^https?:\/\//))
        options.repo = `https://${options.repo}`;

    return { dir, options, pkgMgr, git };
}
