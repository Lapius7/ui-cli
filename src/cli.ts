import { spawn } from "node:child_process";
import * as p from "@clack/prompts";
import pc from "picocolors";

const VERSION = "0.1.0";
const REGISTRY = "https://shadcn.lapius7.com";

type Item = { name: string; title?: string; description?: string };

const out = (s = "") => process.stdout.write(s + "\n");

function help() {
  out(`
${pc.bold("lapius ui")} ${pc.dim(`v${VERSION}`)}
${pc.dim("Install Lapius UI components into your project.")}

${pc.bold("Usage")}
  ${pc.cyan("ui add")} <name...> [options]   Add components
  ${pc.cyan("ui list")}                      Show available components

${pc.bold("Options")}
  -o, --overwrite   Overwrite existing files
  -y, --yes         Skip confirmation
  -p, --path <dir>  Install to a custom directory
  -c, --cwd <dir>   Run in another project directory
  -h, --help        Show this help
  -v, --version     Show version

${pc.bold("Example")}
  ${pc.dim("$")} pnpm dlx @lapius/ui add test1
`);
}

async function loadItems(): Promise<Item[]> {
  const res = await fetch(`${REGISTRY}/r/registry.json`, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Registry responded with ${res.status}`);
  const json = (await res.json()) as { items?: Item[] };
  return json.items ?? [];
}

function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function suggest(name: string, items: Item[]): string | undefined {
  const best = items.map((i) => ({ n: i.name, d: distance(name, i.name) })).sort((a, b) => a.d - b.d)[0];
  return best && best.d <= Math.max(3, Math.ceil(name.length / 2)) ? best.n : undefined;
}

/** 実行中のパッケージマネージャーに合わせて shadcn を呼ぶ */
function runner(): [string, string[]] {
  const ua = process.env.npm_config_user_agent ?? "";
  if (ua.startsWith("pnpm")) return ["pnpm", ["dlx"]];
  if (ua.startsWith("bun")) return ["bunx", ["--bun"]];
  if (ua.startsWith("yarn")) return ["yarn", ["dlx"]];
  return ["npx", ["--yes"]];
}

function run(cmd: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
    c.on("error", () => resolve(127));
    c.on("close", (code) => resolve(code ?? 1));
  });
}

async function list() {
  p.intro(pc.bgCyan(pc.black(" lapius ui ")));
  const s = p.spinner();
  s.start("Loading components");
  let items: Item[];
  try {
    items = await loadItems();
  } catch (e) {
    s.stop(pc.red("Could not load the registry"));
    p.cancel(`${(e as Error).message}\n${pc.dim(REGISTRY)}`);
    process.exit(1);
  }
  s.stop(`${items.length} component${items.length === 1 ? "" : "s"}`);
  const w = Math.max(...items.map((i) => i.name.length), 4);
  for (const i of items) {
    const title = i.title && i.title !== i.name ? pc.dim(` ${i.title}`) : "";
    p.log.message(`${pc.cyan(i.name.padEnd(w))}${title}${i.description ? `\n${" ".repeat(w)} ${pc.dim(i.description)}` : ""}`, { symbol: pc.dim("•") });
  }
  p.outro(`Install with ${pc.cyan("ui add <name>")}`);
}

async function add(names: string[], flags: string[]) {
  p.intro(pc.bgCyan(pc.black(" lapius ui ")));
  if (names.length === 0) {
    p.cancel(`Specify a component. Try ${pc.cyan("ui list")}.`);
    process.exit(1);
  }
  const s = p.spinner();
  s.start("Checking the registry");
  let items: Item[];
  try {
    items = await loadItems();
  } catch (e) {
    s.stop(pc.red("Could not reach the registry"));
    p.cancel(`${(e as Error).message}\n${pc.dim(REGISTRY)}`);
    process.exit(1);
  }
  const known = new Set(items.map((i) => i.name));
  const missing = names.filter((n) => !known.has(n));
  if (missing.length) {
    s.stop(pc.red(`Not found: ${missing.join(", ")}`));
    for (const m of missing) {
      const hint = suggest(m, items);
      if (hint) p.log.warn(`${pc.bold(m)} → did you mean ${pc.cyan(hint)}?`);
    }
    p.cancel(`Run ${pc.cyan("ui list")} to see what is available.`);
    process.exit(1);
  }
  s.stop(`Found ${names.map((n) => pc.cyan(n)).join(", ")}`);

  const [cmd, pre] = runner();
  const args = [...pre, "shadcn@latest", "add", ...names.map((n) => `${REGISTRY}/${n}`), ...flags];
  p.log.step(`${pc.dim("$")} ${pc.dim([cmd, ...args].join(" "))}`);
  const code = await run(cmd, args);
  if (code !== 0) {
    p.cancel(`shadcn exited with code ${code}`);
    process.exit(code);
  }
  p.outro(pc.green("Done"));
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("-v") || argv.includes("--version")) return out(VERSION);
  const [sub, ...rest] = argv;
  if (!sub || sub === "-h" || sub === "--help" || sub === "help") return help();

  // 値を取るフラグと、名前を分ける
  const names: string[] = [];
  const flags: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "-p" || a === "--path" || a === "-c" || a === "--cwd") flags.push(a, rest[++i] ?? "");
    else if (a.startsWith("-")) flags.push(a);
    else names.push(a);
  }

  if (sub === "list" || sub === "ls") return list();
  if (sub === "add") return add(names, flags);
  p.cancel(`Unknown command: ${sub}\nRun ${pc.cyan("ui --help")}.`);
  process.exit(1);
}

main().catch((e) => {
  p.cancel((e as Error).message);
  process.exit(1);
});
