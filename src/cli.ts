#!/usr/bin/env node

import { readFileSync } from "node:fs";

type Command = "new" | "list" | "check" | "security" | "lighthouse" | "inspect" | "report";
type SaveRequest = { explicit: boolean; value?: string };

export type ParsedArgs = {
  command?: Command;
  target?: string;
  save: SaveRequest;
  noColor: boolean;
  help?: Command | "all";
  version: boolean;
};

const packageJson = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };
const commands = new Set<Command>([
  "new",
  "list",
  "check",
  "security",
  "lighthouse",
  "inspect",
  "report",
]);

const help = `Deployr ${packageJson.version}
Fast website audits from one simple CLI.

Usage
  deployr <url> [--save [folder]]       Run the full audit
  deployr check [url] [--save [folder]] HTML and SEO basics
  deployr security [url] [--save]       Security headers
  deployr lighthouse [url] [--save]     Performance and accessibility
  deployr new                            Create a client workspace
  deployr inspect [latest|workspace]     Audit and update a workspace
  deployr report [latest|workspace]      Build report and client email
  deployr list                           List workspaces

Options
  --save [folder]  Keep results in a folder or workspace
  --no-color       Plain terminal output
  -h, --help       Show help
  -v, --version    Show version

Examples
  deployr example.com
  deployr example.com --save ./acme-audit
  deployr new
  deployr inspect latest
  deployr report latest`;

const commandHelp: Record<Command, string> = {
  new: `deployr new
Create a reusable client workspace in ./audits.`,
  list: `deployr list
List client workspaces. Newest workspace is marked latest.`,
  check: `deployr check [url|workspace] [--save [folder]]
Check title, metadata, headings, images, and CTA signals.`,
  security: `deployr security [url|workspace] [--save [folder]]
Check HTTPS, HSTS, CSP, frame, referrer, and cookie protections.`,
  lighthouse: `deployr lighthouse [url|workspace] [--save [folder]]
Run Lighthouse performance, accessibility, best-practices, and SEO checks.`,
  inspect: `deployr inspect [url|workspace] [--save [folder]]
Run website, security, and Lighthouse checks together.

Shortcut: deployr <url>`,
  report: `deployr report [latest|workspace]
Create final-report.md and client-email.md from a workspace.`,
};

class CliError extends Error {
  readonly hint?: string;
  readonly exitCode: number;

  constructor(
    message: string,
    hint?: string,
    exitCode = 1,
  ) {
    super(message);
    this.hint = hint;
    this.exitCode = exitCode;
  }
}

function looksLikeDirectUrl(value: string): boolean {
  return (
    /^[a-z][a-z\d+.-]*:\/\//i.test(value) ||
    value.includes(".") ||
    value.startsWith("localhost") ||
    /^\d{1,3}(?:\.\d{1,3}){3}/.test(value)
  );
}

export function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  const parsed: ParsedArgs = {
    save: { explicit: false },
    noColor: false,
    version: false,
  };

  for (let index = args.length - 1; index >= 0; index -= 1) {
    if (args[index] === "--no-color") {
      parsed.noColor = true;
      args.splice(index, 1);
    }
  }

  if (args.includes("-v") || args.includes("--version")) {
    parsed.version = true;
    return parsed;
  }

  if (!args.length) {
    parsed.help = "all";
    return parsed;
  }

  if (args[0] === "help") {
    const requested = args[1];
    if (!requested) {
      parsed.help = "all";
      return parsed;
    }
    if (!commands.has(requested as Command)) {
      throw new CliError(`Unknown command: ${requested}`, "deployr --help", 2);
    }
    parsed.help = requested as Command;
    return parsed;
  }

  if (args[0] === "-h" || args[0] === "--help") {
    parsed.help = "all";
    return parsed;
  }

  if (looksLikeDirectUrl(args[0]!)) {
    parsed.command = "inspect";
  } else if (commands.has(args[0] as Command)) {
    parsed.command = args.shift() as Command;
  } else {
    throw new CliError(`Unknown command: ${args[0]}`, "deployr --help", 2);
  }

  if (args.includes("-h") || args.includes("--help")) {
    parsed.help = parsed.command;
    return parsed;
  }

  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]!;
    if (arg.startsWith("--save=")) {
      const value = arg.slice("--save=".length).trim();
      if (!value) throw new CliError("Save folder cannot be empty.", "deployr <url> --save ./audit", 2);
      parsed.save = { explicit: true, value };
    } else if (arg === "--save") {
      const value = args[index + 1];
      parsed.save = { explicit: true };
      if (value && !value.startsWith("-")) {
        parsed.save.value = value;
        index += 1;
      }
    } else if (arg.startsWith("-")) {
      throw new CliError(`Unknown option: ${arg}`, `deployr help ${parsed.command}`, 2);
    } else {
      positionals.push(arg);
    }
  }

  if (positionals.length > 1) {
    throw new CliError("Too many targets.", `deployr help ${parsed.command}`, 2);
  }
  parsed.target = positionals[0];

  if (parsed.target && ["new", "list"].includes(parsed.command)) {
    throw new CliError(`deployr ${parsed.command} does not accept a target.`, `deployr help ${parsed.command}`, 2);
  }
  if (parsed.save.explicit && !["check", "security", "lighthouse", "inspect"].includes(parsed.command)) {
    throw new CliError(`--save is not supported by deployr ${parsed.command}.`, `deployr help ${parsed.command}`, 2);
  }

  return parsed;
}