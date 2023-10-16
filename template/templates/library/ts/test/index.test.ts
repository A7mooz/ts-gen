import { expect, test } from 'vitest';
import { ok } from '../src/index';

test('"ok" must be a string', () => {
    expect(ok).string('ok');
});
