import { intro, log, outro, spinner } from '@clack/prompts';
import { bgMagentaBright } from 'colorette';
import { execa } from 'execa';
import gradient from 'gradient-string';
import { create } from '../utils.js';
import { PackageManager } from './package-manager.js';
import { ask } from './questions.js';

export async function main() {
    console.clear();
    intro(bgMagentaBright(' ts-gen '));

    const { options, dir, git, pkgMgr } = await ask();

    const s = spinner();

    s.start('Creating your project');

    create(dir, options);

    s.stop('Project created');

    process.chdir(dir);

    if (git) {
        s.start('Initializing git');

        await execa('git', ['init', '-b', 'main']);

        if (options.repo)
            await execa('git', ['remote', 'add', 'origin', options.repo]);

        s.stop('Git initialized');
    }

    const pm = PackageManager(pkgMgr);

    await pm.changeSettings(options);

    s.start('Installing packages');

    await pm.install();

    s.stop('Packages installed');

    outro('done.');

    intro('Head to your project');

    log.info(`cd ${dir}`);

    outro(gradient.cristal.multiline('Happy Coding !'));
}
