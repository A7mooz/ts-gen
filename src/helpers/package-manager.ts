import { execa } from 'execa';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CreateOptions } from '../types';

/**
 * Make a new package manager controller
 * @param pkgMgr The package manager
 * @returns Package manager control functions
 */
export function PackageManager(pkgMgr: string) {
    return {
        install: install.bind(null, pkgMgr),
        changeSettings: changeSettings.bind(null, pkgMgr),
    };
}

/**
 * Install the packages using the package manager specified
 * @param pkgMgr The package manager
 * @returns Child process
 */
function install(pkgMgr: string) {
    return execa(pkgMgr, ['install']);
}

/**
 * Change the settings to the chosen package manager
 * @param pkgMgr The package manager
 * @param hooks Whether hooks are enabled
 */
async function changeSettings(pkgMgr: string, options: CreateOptions) {
    // Change hooks
    if (options.hooks) {
        const files = readdirSync('.husky');

        for (const hook of files) {
            const file = join('.husky', hook);

            const content = readFileSync(file, {
                encoding: 'utf-8',
            }).replaceAll('npm', pkgMgr);

            writeFileSync(file, content);
        }
    }

    // Change scripts
    {
        const content = readFileSync('package.json', {
            encoding: 'utf-8',
        }).replaceAll('npm', pkgMgr);

        writeFileSync('package.json', content);
    }
}
