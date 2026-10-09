import { Workspace } from "./workspace.ts";

export type Brief = {
  clientName: string;
  website: string;
  businessType: string;
  goal: string;
  targetCustomer: string;
  conversionAction: string;
};

type AgencyConfig = {
  agencyName: string;
  auditorName: string;
  auditPrice: string;
  refreshPrice: string;
  growthPrice: string;
};

const defaultConfig: AgencyConfig = {
  agencyName: "Your Agency",
  auditorName: "Website Auditor",
  auditPrice: "Custom quote",
  refreshPrice: "Custom quote",
  growthPrice: "Custom quote",
};

function field(markdown: string, label: string): string {
  return (
    markdown
      .split(/\r?\n/)
      .find((line) => line.startsWith(`${label}:`))
      ?.slice(label.length + 1)
      .trim() ?? ""
  );
}

export function parseBrief(markdown: string): Brief {
  const heading =
    markdown
      .split(/\r?\n/)
      .find((line) => line.startsWith("# ") && line.endsWith(" Audit Brief"))
      ?.slice(2, -" Audit Brief".length) ?? "Client";
  return {
    clientName: heading,
    website: field(markdown, "Website"),
    businessType: field(markdown, "Business type"),
    goal: field(markdown, "Goal"),
    targetCustomer: field(markdown, "Target customer"),
    conversionAction: field(markdown, "Main conversion action"),
  };
}

function stripTitle(markdown: string): string {
  return markdown.replace(/^# [^\n]+\r?\n(?:\r?\n)?/, "").trim();
}

function pageHeading(file: string): string {
  const name = file
    .replace(/^pages\//, "")
    .replace(/\.md$/i, "")
    .replace(/[-_/]+/g, " ");
  if (name === "home") return "Homepage";
  return name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(" ");
}

function sectionFile(files: Map<string, string>, file: string, fallback: string): string {
  const content = stripTitle(files.get(file) ?? "");
  return content || fallback;
}

function workspaceSection(
  files: Map<string, string>,
  headingName: string,
  fallback: string,
): string | null {
  const workspace = files.get("workspace.md");
  if (!workspace) return null;
  const lines = workspace.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${headingName}`);
  if (start === -1) return null;
  const next = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  const content = lines.slice(start + 1, next === -1 ? undefined : next).join("\n").trim();
  return content || fallback;
}

function present(value: string, fallback = "Not specified"): string {
  return value.trim() || fallback;
}

export function buildFinalReport(
  config: AgencyConfig,
  folderName: string,
  files: Map<string, string>,
): string {
  const brief = parseBrief(files.get("brief.md") ?? "");
  const legacyPages = [...files]
    .filter(([file]) => file.startsWith("pages/") && file.endsWith(".md"))
    .map(([file, content]) => `### ${pageHeading(file)} Review\n\n${stripTitle(content)}`)
    .join("\n\n");
  const workspacePages = workspaceSection(files, "Page Reviews", "");
  const pageReviews =
    workspacePages && !workspacePages.includes("No page reviews provided yet.")
      ? workspacePages
      : legacyPages || "No page reviews captured yet.";

  return `# ${brief.clientName} Website Audit

Prepared by ${config.auditorName}, ${config.agencyName}
Audit folder: ${folderName}

## Context

Website: ${present(brief.website)}
Goal: ${present(brief.goal)}
Business type: ${present(brief.businessType)}
Target customer: ${present(brief.targetCustomer)}
Main conversion action: ${present(brief.conversionAction)}

## Scorecard

${workspaceSection(files, "Scorecard", "Not completed yet.") ?? sectionFile(files, "scorecard.md", "Not completed yet.")}

## Automated Check

${workspaceSection(files, "Automated Check", "Not run yet.") ?? sectionFile(files, "automated-check.md", "Not run yet.")}

## Security Check

${workspaceSection(files, "Security Check", "Not run yet.") ?? sectionFile(files, "security.md", "Not run yet.")}

## Lighthouse Check

${workspaceSection(files, "Lighthouse Check", "Not run yet.") ?? sectionFile(files, "lighthouse.md", "Not run yet.")}

## Findings

${sectionFile(files, "findings.md", "No findings captured yet.")}

## Page Reviews

${pageReviews}

## Recommended Next Step

Audit: ${config.auditPrice}
Refresh: ${config.refreshPrice}
Growth: ${config.growthPrice}

Use the audit to prioritise immediate fixes. If most findings need design, copy, and frontend changes, the Refresh package is likely the best next step.
`;
}