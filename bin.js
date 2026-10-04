#!/usr/bin/env node
const major = Number(process.versions.node.split('.')[0]);

if (major < 26) {
  process.stderr.write(
    `create-ohne: ohne needs Node 26 or newer, found ${process.versions.node}.\n`,
  );
  process.exitCode = 1;
} else {
  // Dynamic only: a static import links first, failing on older Node and before the strip hook is in.
  await import('ohnejs/register');
  const { create } = await import('ohnejs/create');
  await create(process.argv.slice(2));
}
