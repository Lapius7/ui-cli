<div align="center">

<p align="center"><b>English</b> | <a href="README.ja.md">日本語</a></p>

<h1 align="center">Lapius UI CLI</h1>

<h3 align="center">Add Lapius UI components to your project with one command.</h3>

<p align="center">A small CLI that installs Lapius UI components. It checks the registry, then calls the shadcn CLI for you.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lapius/ui"><img alt="npm" src="https://img.shields.io/npm/v/@lapius/ui?style=flat-square&color=cb3837&logo=npm"></a>
  <a href="https://ui.shadcn.com"><img alt="shadcn" src="https://img.shields.io/badge/built%20on-shadcn%2Fui-000000?style=flat-square&logo=shadcnui&logoColor=white"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/Lapius7/ui-cli?style=flat-square&color=97ca00"></a>
  <a href="https://github.com/Lapius7/ui-cli/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/Lapius7/ui-cli?style=flat-square&color=e3b341&logo=github"></a>
  <a href="https://github.com/Lapius7/ui-cli/commits/main"><img alt="Last commit" src="https://img.shields.io/github/last-commit/Lapius7/ui-cli?style=flat-square&color=3b82f6"></a>
</p>

<p align="center"><a href="#quick-start">Quick start</a> · <a href="#commands">Commands</a> · <a href="#how-it-works">How it works</a> · <a href="#development">Development</a></p>

</div>

---

## Features

- **Add by name**: `ui add <name...>` installs one or more components.
- **Typo help**: a wrong name gets the closest match, for example "did you mean test1?".
- **Follows your package manager**: runs shadcn through pnpm, bun, yarn or npm, whichever started it.
- **Plain output**: set `NO_COLOR=1` to turn colors off.

## Quick start

Run it without installing. You need Node.js 18 or later and a project that shadcn can add components to.

```sh
pnpm dlx @lapius/ui list
pnpm dlx @lapius/ui add test1
```

The package provides two commands, `ui` and `lapius-ui`.

## Commands

| Command | What it does |
|---|---|
| `ui add <name...>` | Add components (several at once). A wrong name shows the closest match |
| `ui list` | List the available components (alias `ui ls`) |

| Option | What it does |
|---|---|
| `-o`, `--overwrite` | Overwrite existing files |
| `-y`, `--yes` | Skip confirmation |
| `-p`, `--path <dir>` | Install to a custom directory |
| `-c`, `--cwd <dir>` | Run in another project directory |
| `-h`, `--help` / `-v`, `--version` | Help / version |

Options are passed to shadcn as they are.

## How it works

1. `ui add` fetches `https://shadcn.lapius7.com/r/registry.json` and checks that every name exists.
2. It runs `shadcn@latest add https://shadcn.lapius7.com/<name>` through the package manager that is running it (`pnpm dlx`, `bunx --bun`, `yarn dlx` or `npx --yes`).

## Safety

> [!NOTE]
> Not verified: running `ui add` end to end against a real project. `ui --help` was run locally. The registry URL answers and currently lists one component, `test1` (Spotlight Card). The version string in `src/cli.ts` is `0.1.0` while `package.json` says `0.1.1`.

## Development

```sh
bun install && bun run build && node dist/cli.js --help
```

`bun run typecheck` runs `tsc --noEmit`.

## License

[MIT](LICENSE)
