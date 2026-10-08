import { existsSync } from "node:fs";

import { resultBlock, type Feedback } from "./ui.ts";

const opportunityIds = [
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "uses-optimized-images",
  "modern-image-formats",
  "uses-responsive-images",
  "unminified-javascript",
  "unminified-css",
  "uses-text-compression",
  "server-response-time",
  "redirects",
  "bootup-time",
  "mainthread-work-breakdown",
  "third-party-summary",
];

const browserCandidates = [
  "/Applications/Helium.app/Contents/MacOS/Helium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

type LighthouseCategory = { score?: number | null };
type LighthouseAudit = {
  title?: string;
  score?: number | null;
  displayValue?: string;
  description?: string;
};

export type LighthouseResult = {
  finalDisplayedUrl?: string;
  finalUrl?: string;
  categories?: Record<string, LighthouseCategory | undefined>;
  audits?: Record<string, LighthouseAudit | undefined>;
};

export type LighthouseSummary = {
  url: string;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  vitals: { lcp: string; cls: string; tbt: string };
  opportunities: Array<{
    id: string;
    title: string;
    score: number;
    displayValue: string;
    description: string;
  }>;
};

type BrowserOptions = {
  browserPath?: string;
};

export function findBrowserPath({
  env = process.env,
  config = {},
  exists = existsSync,
}: {
  env?: NodeJS.ProcessEnv;
  config?: BrowserOptions;
  exists?: (value: string) => boolean;
} = {}): string | null {
  const candidates = [
    config.browserPath,
    env.DEPLOYR_BROWSER_PATH,
    env.SHIPSAFE_BROWSER_PATH,
    env.AUDITKIT_BROWSER_PATH,
    env.CHROME_PATH,
    ...browserCandidates,
  ].filter((value): value is string => Boolean(value));

  return candidates.find((candidate) => exists(candidate)) ?? null;
}

function categoryScore(category: LighthouseCategory | undefined): number | null {
  return typeof category?.score === "number" ? Math.round(category.score * 100) : null;
}

function auditValue(audits: LighthouseResult["audits"], id: string): string {
  return audits?.[id]?.displayValue ?? "n/a";
}

export function summarizeLighthouse(lhr: LighthouseResult): LighthouseSummary {
  const audits = lhr.audits ?? {};
  const opportunities = opportunityIds
    .map((id) => ({ id, ...audits[id] }))
    .filter(
      (
        audit,
      ): audit is LighthouseAudit & {
        id: string;
        title: string;
        score: number;
      } => Boolean(audit.title && typeof audit.score === "number" && audit.score < 0.9),
    )
    .slice(0, 6)
    .map((audit) => ({
      id: audit.id,
      title: audit.title,
      score: Math.round(audit.score * 100),
      displayValue: audit.displayValue ?? "",
      description: audit.description ?? "",
    }));

  return {
    url: lhr.finalDisplayedUrl ?? lhr.finalUrl ?? "",
    scores: {
      performance: categoryScore(lhr.categories?.performance),
      accessibility: categoryScore(lhr.categories?.accessibility),
      bestPractices: categoryScore(lhr.categories?.["best-practices"]),
      seo: categoryScore(lhr.categories?.seo),
    },
    vitals: {
      lcp: auditValue(audits, "largest-contentful-paint"),
      cls: auditValue(audits, "cumulative-layout-shift"),
      tbt: auditValue(audits, "total-blocking-time"),
    },
    opportunities,
  };
}