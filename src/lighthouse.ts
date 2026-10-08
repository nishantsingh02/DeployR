import { existsSync } from "node:fs";

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