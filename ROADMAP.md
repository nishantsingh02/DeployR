# Deployr Roadmap

Planned features, grouped by priority. Nothing here is implemented unless marked **Done**.
Agents: do not start an item unless explicitly asked. See `AGENTS.md` for repo rules.

Status key: `[ ]` not started, `[~]` in progress, `[x]` done.

---

## Phase 1: Foundation (unlocks everything else)

### 1.1 Core library extraction `[ ]`
Move analysis and report logic into `src/core/` so the CLI, MCP server, and future frontends share one implementation.
- Core functions take plain inputs and return plain data (no terminal output, no `process.exit`).
- `cli.ts` becomes a thin layer: parse, call core, format.
- Keep all existing commands, flags, and output paths unchanged.

### 1.2 Structured findings `[ ]`
Replace free-text-only results with typed findings.
- Shape: `id`, `category`, `severity` (critical / high / medium / low / info), `title`, `evidence`, `recommendation`.
- Scorecard and report sections are generated from findings.
- Findings are sortable, filterable, and diffable.

### 1.3 Stable JSON output `[ ]`
- `--json` flag on all check commands.
- Documented schema, versioned (`schemaVersion`).
- Required for MCP, CI, and diffing.

---

## Phase 2: Agent access

### 2.1 MCP server `[ ]`
Expose Deployr to AI agents. Stdio transport first, HTTP later if needed.

Tools:
- `run_html_check`, `run_security_check`, `run_lighthouse`, `full_audit`
- `create_workspace`, `list_workspaces`, `inspect_workspace`
- `add_finding`, `generate_report`

Resources:
- Workspace files (`brief.md`, `findings.md`, `final-report.md`, `client-email.md`)
- Latest audit summary

Notes:
- Call core directly, never shell out to the CLI.
- Return structured JSON from tools.
- Validate URLs and block private/internal addresses (SSRF protection), since agents can pass arbitrary input.

---

## Phase 3: Client-facing value

### 3.1 PDF / HTML report export `[ ]`
- `deployr report <workspace> --format pdf|html`
- Branded with agency name from config; optional logo and accent color.
- Clients rarely want Markdown, so this is the biggest perceived-value gain.

### 3.2 Audit diffing and history `[ ]`
- `deployr diff <workspace-a> <workspace-b>` and `deployr diff --previous`.
- Show score deltas, new findings, resolved findings.
- Powers the "refresh" and "growth" service tiers (before/after proof).

### 3.3 Config-driven budgets `[ ]`
- Per-client thresholds in config (performance, accessibility, required headers).
- Report highlights pass/fail against agreed targets.

### 3.4 Plain-language client mode `[ ]`
- Report variant that explains each finding in non-technical terms and ties it to business impact.

---

## Phase 4: Deeper checks

Each follows the pattern in `AGENTS.md` section 9 (analyzer, CLI formatter, Markdown formatter, tests).

| Check | Notes | Status |
|---|---|---|
| Broken links and redirect chains | Internal first; rate-limit external | `[ ]` |
| SSL/TLS | Cert expiry, protocol versions, chain issues | `[ ]` |
| robots.txt and sitemap.xml | Presence, validity, conflicts | `[ ]` |
| Canonical and hreflang | Duplicate and conflicting tags | `[ ]` |
| Structured data | JSON-LD validation | `[ ]` |
| Accessibility | axe-core on key pages | `[ ]` |
| Mobile and viewport | Meta viewport, tap targets | `[ ]` |
| Third-party scripts and cookies | Count, weight, consent banner presence | `[ ]` |
| Images | Weight, format (WebP/AVIF), missing dimensions and alt | `[ ]` |
| Tech stack fingerprinting | CMS, frameworks, CDN, outdated versions | `[ ]` |

### Multi-page crawling `[ ]`
- Audit N pages from the sitemap or a given list, then aggregate results.
- Depth and page limits, concurrency cap, polite delay.
- Feeds the "Page Reviews" section of the report.

---

## Phase 5: Dev workflow and automation

### 5.1 CI mode `[ ]`
- `--fail-under <score>` and per-category thresholds.
- Non-zero exit codes on failure.
- JSON and SARIF output.
- Official GitHub Action.

### 5.2 Scheduled re-audits `[ ]`
- Re-run audits on a schedule and alert on regressions (builds on diffing).

---

## Phase 6: AI-assisted narrative (optional)

Deterministic checks remain the source of truth. The LLM only writes narrative from structured findings.

- Executive summary for the report.
- Prioritized fix plan with effort estimates.
- Plain-language explanations for the client email.
- Must be opt-in (`--ai`), with the provider and key set via config or env, and never required.

---

## Suggested build order

1. Core extraction (1.1)
2. Structured findings (1.2) and JSON output (1.3)
3. MCP server (2.1)
4. PDF export (3.1)
5. Audit diffing (3.2)
6. Extra checks (Phase 4), highest client value first: broken links, accessibility, SSL, robots/sitemap
7. CI mode (5.1)
8. AI narrative (Phase 6)

## Out of scope (for now)

- Hosted SaaS or web dashboard
- User accounts and multi-user collaboration
- Non-TypeScript rewrites
