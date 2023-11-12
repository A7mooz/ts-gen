import { camel } from 'case';
import { $ } from 'execa';
import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { afterAll, describe, test } from 'vitest';
import { CreateOptions } from '../src/types.js';
import { create, shared, templateDir, templates } from '../src/utils.js';

const cacheDir = join(__dirname, '.cache');

const langs = ['ts', 'js'] as const;

afterAll(() => {
    rmSync(cacheDir, { recursive: true, force: true });
});

describe('test create', () => {
    for (const type of templates) {
        for (const lang of langs) {
            const baseDir = join(cacheDir, type, lang);
            const baseOptions: CreateOptions = {
                lang,
                type,
                commitLint: false,
                hooks: false,
                lint: false,
            };

            test("create doesn't throw", (t) => {
                t.expect(() => create(baseDir, baseOptions)).not.toThrow();
            });

            test('folder should exist', (t) => {
                t.expect(existsSync(baseDir)).toBe(true);
            });

            const files = readdirSync(
                join(templateDir, 'templates', type, lang),
            );

            test('files should match the template', (t) => {
                t.expect(readdirSync(baseDir)).toStrictEqual(files);
            });

            if (files.includes('tsconfig.json'))
                test(
                    'Type-checking',
                    async (t) => {
                        await t
                            .expect($`tsc --noEmit -p ${baseDir}`)
                            .resolves.not.toThrow();
                    },
                    { timeout: 0 },
                );

            test('removing base', (t) => {
                t.expect(() =>
                    rmSync(baseDir, { recursive: true }),
                ).not.toThrow();
            });

            for (const template of shared) {
                const dir = join(baseDir, template);

                const options = {
                    ...baseOptions,
                    [`${
                        template === 'eslint'
                            ? 'lint'
                            : template === 'husky'
                            ? 'hooks'
                            : camel(template)
                    }`]:
                        template === 'repo'
                            ? process.env.npm_package_repository_url
                            : true,
                } as CreateOptions;

                test("create doesn't throw", (t) => {
                    t.expect(() => create(dir, options)).not.toThrow();
                });

                test('folder should exist', (t) => {
                    t.expect(existsSync(dir)).toBe(true);
                });

                const sharedFiles = readdirSync(
                    join(templateDir, 'shared', template),
                );

                test('files should match the template', (t) => {
                    t.expect(readdirSync(dir)).toStrictEqual(
                        files
                            .concat(
                                sharedFiles.filter((v) => !files.includes(v)),
                            )
                            .sort(),
                    );
                });
            }
        }
    }
});
