# create-ohne

Scaffolds a new [ohne](https://ohne.dev) project. It runs the scaffold of the `ohnejs` version it
writes into your `package.json`, and it has no dependencies but `ohnejs`.
[Installation](https://ohne.dev/docs/start/installation) takes the new project through its first
run.

## Usage

You need Node 26 or newer.

```sh
npm create ohne my-app
```

```sh
pnpm create ohne my-app
```

## Flags

With npm, flags go after `--`. npm reads every flag before it as its own, so `--yes`, `--force`,
`--git`, `--name`, and `--pm` there never reach the scaffold:

```sh
npm create ohne my-app -- --yes --git
```

pnpm, yarn, and bun hand the flags on as they are, so they need no `--`, and one is ignored if you
pass it. [The CLI guide](https://ohne.dev/docs/project/cli#npm-create-ohne) lists every flag.

## Versions

The project it writes pins `ohnejs` to the exact version this package depends on. `--version`
prints that version.

## Contributing

With `ohne` cloned beside it, run `pnpm install` and `pnpm test`.
`node bin.js ../ohne-scratch --ohne-path ../ohne` scaffolds against your checkout.
