import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

/**
 * How `run` starts `bin.js`.
 */
export interface RunOptions {
  /**
   * The directory the run scaffolds from.
   */
  cwd: string;

  /**
   * Variables laid over the inherited environment.
   * Set `npm_config_user_agent` here to play a package manager.
   */
  env?: Record<string, string>;

  /**
   * Flags for `node` itself, placed before `bin.js`.
   *
   * @default
   * []
   */
  nodeArgs?: string[];
}

/**
 * What a `bin.js` run printed and how it exited.
 */
export interface RunResult {
  /**
   * The exit code.
   */
  code: number | null;

  /**
   * Everything written to stdout.
   */
  stdout: string;

  /**
   * Everything written to stderr.
   */
  stderr: string;
}

const BIN = join(import.meta.dirname, '..', 'bin.js');

const LEAKED = ['npm_config_user_agent', 'NODE_COMPILE_CACHE', 'FORCE_COLOR', 'SILENT', 'DEBUG'];

/**
 * Runs `bin.js` with `args` in a child process, without a TTY and without color.
 * It drops what `pnpm test` would leak: the user agent, the compile cache, and the printer's env flags.
 */
export function run(args: string[], { cwd, env = {}, nodeArgs = [] }: RunOptions): RunResult {
  const base: Record<string, string | undefined> = { ...process.env, NO_COLOR: '1' };
  for (const name of LEAKED) delete base[name];
  const result = spawnSync(process.execPath, [...nodeArgs, BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...base, ...env },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}
