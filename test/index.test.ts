import { camel } from 'case';
import { $ } from 'execa';
import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';
import { afterEach, test } from 'vitest';
import { CreateOptions } from '../src/types.js';
import { create, shared, templateDir, templates } from '../src/utils.js';

const cacheDir = join(__dirname, '.cache');

const langs = ['ts', 'js'] as const;

afterEach(() => {
    rmSync(cacheDir, { recursive: true, force: true });
});

test(
    'create',
    async (t) => {
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

                create(baseDir, baseOptions);

                t.expect(existsSync(baseDir), 'folder should exist').toBe(true);

                const files = readdirSync(
                    join(templateDir, 'templates', type, lang),
                );

                t.expect(
                    readdirSync(baseDir),
                    'files should match the template',
                ).toStrictEqual(files);

                if (files.includes('tsconfig.json'))
                    await t
                        .expect(
                            $`tsc --noEmit -p ${baseDir}`,
                            'failed to typecheck',
                        )
                        .resolves.not.toThrow();

                t.expect(
                    rmSync.bind(null, baseDir, { recursive: true }),
                ).not.toThrow();

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

                    create(dir, options);

                    t.expect(existsSync(dir), 'folder should exist').toBe(true);

                    const sharedFiles = readdirSync(
                        join(templateDir, 'shared', template),
                    );

                    t.expect(
                        readdirSync(dir),
                        'files should match the template',
                    ).toStrictEqual(
                        files
                            .concat(
                                sharedFiles.filter((v) => !files.includes(v)),
                            )
                            .sort(),
                    );
                }
            }
        }
    },
    { timeout: 0 },
);
