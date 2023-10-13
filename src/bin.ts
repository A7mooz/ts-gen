#!/usr/bin/env -S node --enable-source-maps

import { main } from './helpers/main.js';

const args = process.argv.slice(2);

await main(args);
