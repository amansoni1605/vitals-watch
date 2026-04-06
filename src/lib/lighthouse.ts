import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export type WebVital = "lcp" | "cls" | "inp" | "fid" | "ttfb";

export type AuditResult = {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    seo: number;
    bestPractices: number;
  };
  vitals: Record<WebVital, number | null>;
  lighthouseVersion: string;
};

const VITAL_KEYS: Record<WebVital, string> = {
  lcp: "largest-contentful-paint",
  cls: "cumulative-layout-shift",
  inp: "interaction-to-next-paint",
  fid: "max-potential-fid",
  ttfb: "server-response-time",
};

export async function runLighthouseAudit(url: string): Promise<AuditResult> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "vitals-"));
  const outputPath = path.join(tmpDir, "report.json");

  try {
    execSync(
      [
        "npx lighthouse",
        url,
        "--output=json",
        `--output-path=${outputPath}`,
        "--chrome-flags='--headless --no-sandbox'",
        "--only-categories=performance,accessibility,seo,best-practices",
        "--quiet",
      ].join(" "),
      { stdio: "pipe" }
    );

    const raw = JSON.parse(fs.readFileSync(outputPath, "utf-8"));

    const vitals: Record<WebVital, number | null> = {
      lcp: null, cls: null, inp: null, fid: null, ttfb: null,
    };

    for (const [key, auditKey] of Object.entries(VITAL_KEYS) as [WebVital, string][]) {
      const audit = raw.audits?.[auditKey];
      vitals[key] = audit?.numericValue ?? null;
    }

    return {
      url,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(raw.categories.performance.score * 100),
        accessibility: Math.round(raw.categories.accessibility.score * 100),
        seo: Math.round(raw.categories.seo.score * 100),
        bestPractices: Math.round(raw.categories["best-practices"].score * 100),
      },
      vitals,
      lighthouseVersion: raw.lighthouseVersion,
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

export function scoreToRating(score: number): "good" | "needs-improvement" | "poor" {
  if (score >= 90) return "good";
  if (score >= 50) return "needs-improvement";
  return "poor";
}

export function isRegression(prev: number, current: number, threshold = 5): boolean {
  return prev - current >= threshold;
}
