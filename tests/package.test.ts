import { deepStrictEqual, match, ok } from 'node:assert';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

const ROOT = join(import.meta.dirname, '..');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

describe('package.json', () => {
  it('pins `ohnejs` to an exact version', () => {
    match(pkg.dependencies.ohnejs, /^\d+\.\d+\.\d+(-[\w.]+)?$/);
  });

  it('ships `bin.js` alone', () => {
    deepStrictEqual(pkg.files, ['bin.js']);
  });

  it('names the `create-ohne` bin', () => {
    deepStrictEqual(pkg.bin, { 'create-ohne': './bin.js' });
  });

  it('keeps `bin.js` executable', () => {
    ok(statSync(join(ROOT, 'bin.js')).mode & 0o100);
  });
});
