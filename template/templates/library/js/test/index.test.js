import { expect, test } from 'vitest';
import { ok } from '../src/index.js';

test('"ok" must be a string', () => {
    expect(ok).string('ok');
});
