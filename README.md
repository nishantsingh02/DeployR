# Deployr

Fast, client-ready website audits from one TypeScript CLI.

```text
deployr example.com
```

That one command runs the HTML, security, performance, accessibility, best-practices, and SEO checks. Deployr shows a clear terminal summary and asks whether to save the reports.

## Install

```bash
npm install -g deployr
```

Requirements:

- Node.js 24 or newer
- Chrome, Chromium, Brave, Edge, or Helium for Lighthouse

No Rust toolchain or build step is needed.

## Common workflows

Run a complete one-off audit:

```bash
deployr example.com
deployr example.com --save ./example-audit
```

Run one focused check:

```bash
deployr check example.com
deployr security example.com
deployr performance example.com
```

Create a reusable client workspace:

```bash
deployr new
deployr inspect latest
deployr report latest
```

Workspaces live in the current directory:

```text
audits/2026-07-29-example/
├─ brief.md
├─ workspace.md
├─ findings.md
├─ final-report.md
├─ client-email.md
└─ raw/lighthouse.json
```

## Commands

| Command | Result |
| --- | --- |
| `deployr <url>` | Run the complete audit |
| `deployr check [url]` | Check HTML and SEO basics |
| `deployr security [url]` | Check security headers |
| `deployr performance [url]` | Run performance, vitals, & accessibility check (alias: `perf`) |
| `deployr new` | Create a client workspace |
| `deployr inspect [latest\|workspace]` | Run every check and update a workspace |
| `deployr report [latest\|workspace]` | Build the report and client email |
| `deployr list` | List workspaces |

> **Note:** The short alias `dpr` is also supported (e.g. `dpr example.com`).

Add `--save [folder]` to any audit command. Use an existing workspace name or `latest` to save into a workspace.

```bash
deployr check example.com --save ./example-audit
deployr security example.com --save latest
```

Use `deployr help <command>` for focused help.

## Browser override

```bash
DEPLOYR_BROWSER_PATH="/path/to/browser" deployr performance example.com
```

## Report settings

Deployr reads `deployr.config.json` (or `shipsafe.config.json` for backwards compatibility) from the directory where you run it. The included file shows the supported agency name, auditor name, and service pricing fields.

## Development

```bash
npm install
npm test
node src/cli.ts --help
```

The CLI runs TypeScript directly on Node 24. There is no generated build folder. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the code map.
