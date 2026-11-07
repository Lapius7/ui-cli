# @lapius/ui

Lapius UI のコンポーネントを、プロジェクトに追加する CLI。内部で shadcn CLI を呼びます。

```bash
pnpm dlx @lapius/ui add test1
pnpm dlx @lapius/ui list
```

| コマンド | 内容 |
|---|---|
| `ui add <name...>` | コンポーネントを追加（複数可）。名前を間違えると近い候補を出す |
| `ui list` | 使えるコンポーネントの一覧 |

オプション `-o/--overwrite` `-y/--yes` `-p/--path` `-c/--cwd` は shadcn にそのまま渡します。

- 実行中のパッケージマネージャー（pnpm / bun / yarn / npm）に合わせて shadcn を起動します。
- `NO_COLOR=1` で色を消せます。

## 開発

```bash
bun install && bun run build && node dist/cli.js --help
```

## ライセンス

MIT
