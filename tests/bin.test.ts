import { deepStrictEqual, doesNotMatch, match, strictEqual } from 'node:assert';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { version } from 'ohnejs';

import { run } from './_run.ts';

const NPM = 'npm/11.16.0 node/v26.3.0 darwin arm64 workspaces/false';

const PNPM = 'pnpm/12.9.1 npm/? node/v26.3.0 darwin arm64';

const FILES = ['.gitignore', 'ohne.config.ts', 'package.json', 'tsconfig.json'];

describe('bin', () => {
  let root: string;

  function dir(): string {
    return mkdtempSync(join(root, 'run-'));
  }

  function manifest(path: string): { name: string; dependencies: Record<string, string> } {
    return JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'));
  }

  before(() => {
    root = mkdtempSync(join(tmpdir(), 'create-ohne-'));
  });

  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('scaffolds a project pinned to the installed `ohnejs`', () => {
    const cwd = dir();
    const { code, stderr } = run(['app', '--yes'], { cwd });
    strictEqual(code, 0);
    doesNotMatch(stderr, /Warning/);
    deepStrictEqual(readdirSync(join(cwd, 'app')).sort(), FILES);
    strictEqual(manifest(join(cwd, 'app')).dependencies.ohnejs, version);
  });

  it('runs from under `node_modules`, as installed, without a strip warning', () => {
    const cwd = dir();
    const nodeArgs = ['--preserve-symlinks', '--preserve-symlinks-main'];
    const { code, stderr } = run(['app', '--yes'], { cwd, nodeArgs });
    strictEqual(code, 0);
    doesNotMatch(stderr, /Warning/);
    deepStrictEqual(readdirSync(join(cwd, 'app')).sort(), FILES);
  });

  it('takes the scaffold flags', () => {
    const cwd = dir();
    strictEqual(run(['app', '--yes', '--name', 'foo'], { cwd }).code, 0);
    strictEqual(manifest(join(cwd, 'app')).name, 'foo');
  });

  it('exits 1 and leaves a non-empty directory alone', () => {
    const cwd = dir();
    writeFileSync(join(cwd, 'keep.txt'), 'mine');
    const { code, stderr } = run(['.', '--yes'], { cwd });
    strictEqual(code, 1);
    match(stderr, /Directory not empty/);
    deepStrictEqual(readdirSync(cwd), ['keep.txt']);
  });

  it('drops the `--` that pnpm passes through', () => {
    const cwd = dir();
    const env = { npm_config_user_agent: PNPM };
    strictEqual(run(['app', '--', '--yes', '--name', 'foo'], { cwd, env }).code, 0);
    strictEqual(manifest(join(cwd, 'app')).name, 'foo');
  });

  it('keeps the `--` under npm, which consumed its own', () => {
    const cwd = dir();
    const env = { npm_config_user_agent: NPM };
    strictEqual(run(['--yes', '--', '-dash'], { cwd, env }).code, 0);
    deepStrictEqual(readdirSync(join(cwd, '-dash')).sort(), FILES);
  });

  it('defaults to pnpm only when pnpm launches it', () => {
    const cases: [string | undefined, RegExp][] = [
      [PNPM, /pnpm dev/],
      [NPM, /npm run dev/],
      ['bun/1.3.14 npm/? node/v24.3.0 darwin arm64', /npm run dev/],
      [undefined, /npm run dev/],
    ];
    for (const [agent, next] of cases) {
      const env: Record<string, string> = agent ? { npm_config_user_agent: agent } : {};
      match(run(['app', '--yes'], { cwd: dir(), env }).stderr, next);
    }
  });

  it('shows its own help', () => {
    const { code, stdout } = run(['--help'], { cwd: root });
    strictEqual(code, 0);
    match(stdout, /^create-ohne /);
    match(stdout, /directory/);
  });

  it('prints the `ohnejs` version it scaffolds', () => {
    strictEqual(run(['--version'], { cwd: root }).stdout, `${version}\n`);
  });

  it('applies the printer env flags', () => {
    const cwd = dir();
    const { code, stdout, stderr } = run(['app', '--yes', '--no-color', '--silent'], { cwd });
    strictEqual(code, 0);
    strictEqual(stdout + stderr, '');
    strictEqual(existsSync(join(cwd, 'app', 'package.json')), true);
  });

  it('refuses a Node older than 26 in one line', () => {
    const cwd = dir();
    const fake =
      'data:text/javascript,Object.defineProperty(process.versions,"node",{value:"22.2.0"})';
    const { code, stdout, stderr } = run(['app', '--yes'], { cwd, nodeArgs: ['--import', fake] });
    strictEqual(code, 1);
    strictEqual(stdout, '');
    match(stderr, /^create-ohne: .+ found 22\.2\.0\.\n$/);
    deepStrictEqual(readdirSync(cwd), []);
  });
});
