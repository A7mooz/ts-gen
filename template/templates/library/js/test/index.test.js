import { test } from 'vitest';

import { expect } from 'vitest';
import { ok } from '..';

test('"ok" must be a string', () => {
    expect(ok).string('ok');
});
