import type { Feedback, Signal } from "./ui.ts";
import { resultBlock, scoreStatus } from "./ui.ts";

export type FetchedPage = {
  url: string;
  status: number;
  html: string;
  bytes: number;
  headers: Headers;
};

export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) throw new Error("Website URL is required.");

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new Error(`Invalid website URL: ${input}`);
  }

  if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
    throw new Error(`Invalid website URL: ${input}`);
  }

  return url.href;
}

export async function fetchWebsite(input: string): Promise<FetchedPage> {
  const url = normalizeUrl(input);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Deployr",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`Could not reach ${url} (${message})`);
  }

  const html = await response.text();
  return {
    url: response.url || url,
    status: response.status,
    html,
    bytes: Buffer.byteLength(html),
    headers: response.headers,
  };
}