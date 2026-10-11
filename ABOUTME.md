# Deployr

**Deployr** is a fast, lightweight Node.js CLI tool built to run clear, actionable, and client-ready website audits directly from your terminal.

---

## What Deployr Does

Deployr inspects any website URL and provides simple health scores, identifies issues, and generates ready-to-send reports and client proposals in seconds.

---

## Current Features

### 1. 🔍 Fast HTML & SEO Check
- Scans page title, meta description, and canonical links.
- Checks heading structure (H1 hierarchy) and missing image `alt` tags.
- Verifies call-to-action (CTA) presence and basic page structure.
- **Command:** `node src/cli.ts check <url>`

### 2. 🛡️ Security Header Inspection
- Evaluates HTTPS configuration.
- Checks essential security headers: HSTS, Content Security Policy (CSP), X-Frame-Options, and Referrer-Policy.
- Verifies secure cookie flags (`Secure`, `HttpOnly`, `SameSite`).
- **Command:** `node src/cli.ts security <url>`

### 3. ⚡ Performance & Core Web Vitals
- Launches a headless Chrome browser to run automated performance, accessibility, best practices, and SEO audits.
- Delivers category scores (0–100) and captures Core Web Vitals (LCP, CLS, TBT).
- Lists top optimization opportunities (e.g. render-blocking resources, unminified CSS).
- **Command:** `node src/cli.ts performance <url>` (alias: `perf`)

### 4. 🚀 Full Comprehensive Audit
- Combines HTML, security, and performance checks into a single command.
- Displays a clean, color-coded terminal overview.
- Prompts to save results into Markdown and raw JSON files.
- **Command:** `node src/cli.ts <url>`

### 5. 📁 Client Workspace System
- Create organized, client-specific folders in `./audits` with interactive prompts (business type, target audience, conversion goals).
- Keeps all notes, raw data, and findings neatly organized per client.
- **Commands:** `node src/cli.ts new`, `node src/cli.ts list`, `node src/cli.ts inspect latest`

### 6. 📄 Client-Ready Reports & Email Drafts
- Generates polished Markdown reports (`final-report.md`) tailored to clients.
- Drafts ready-to-send client pitch emails (`client-email.md`) with custom pricing from `deployr.config.json`.
- **Command:** `node src/cli.ts report latest`

---

## How to Run

```bash
# Run full audit
node src/cli.ts example.com

# Run specific checks
node src/cli.ts check example.com
node src/cli.ts security example.com
node src/cli.ts performance example.com

# To use the global "deployr" command directly in terminal:
npm link
deployr example.com
```
