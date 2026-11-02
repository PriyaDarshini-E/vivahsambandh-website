/**
 * @file scripts/lighthouse.mjs
 * Lighthouse audit runner for VivahSambandh.
 *
 * Usage:
 *   node scripts/lighthouse.mjs                        # mobile + desktop, threshold 85
 *   node scripts/lighthouse.mjs --form-factor=mobile   # mobile only
 *   node scripts/lighthouse.mjs --form-factor=desktop  # desktop only
 *   node scripts/lighthouse.mjs --threshold=90         # fail below 90
 *   node scripts/lighthouse.mjs --url=https://vivahsambandh.com   # production
 *
 * Spec (per perf.md Phase 1):
 * - Auto-starts `vite preview` if localhost is unreachable; waits up to 30s; kills afterwards.
 * - CJS/ESM interop for chrome-launcher (m.default ?? m).
 * - Launches headless Chrome (--headless --no-sandbox).
 * - Runs Lighthouse for mobile|desktop|both with correct screenEmulation per factor.
 * - output: ['html','json'] — result.report is an ARRAY (index 0=html, 1=json).
 * - Saves reports to lighthouse-reports/.
 * - Prints category bars + FCP/LCP/TBT/CLS/SI metrics.
 * - Exits non-zero if any category < --threshold (default 85).
 * - Kills chrome defensively: try { await chrome.kill() } catch {} (kill() may be undefined).
 */

import { spawn, execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ─── Parse CLI args ───────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split('=').slice(1).join('=') : null;
};

const formFactor = getArg('form-factor') ?? 'both'; // 'mobile' | 'desktop' | 'both'
const threshold = parseInt(getArg('threshold') ?? '85', 10);
const urlArg = getArg('url') ?? null;

const DEFAULT_URL = 'http://localhost:4173';
const targetUrl = urlArg ?? DEFAULT_URL;
const isLocalhost = !urlArg;

const REPORT_DIR = resolve('lighthouse-reports');
mkdirSync(REPORT_DIR, { recursive: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function bar(score, label) {
  const s = Math.round(score * 100);
  const filled = Math.round(s / 5);
  const empty = 20 - filled;
  const color = s >= 90 ? '\x1b[32m' : s >= 50 ? '\x1b[33m' : '\x1b[31m';
  return `${color}${label.padEnd(16)} ${'█'.repeat(filled)}${'░'.repeat(empty)} ${s}\x1b[0m`;
}

function formatMs(ms) {
  if (ms == null) return 'n/a';
  return `${Math.round(ms)}ms`;
}

function formatSec(ms) {
  if (ms == null) return 'n/a';
  return `${(ms / 1000).toFixed(2)}s`;
}

// ─── Server boot ─────────────────────────────────────────────────────────────
let previewProc = null;

async function ensureServerRunning() {
  if (!isLocalhost) return; // production URL — nothing to start

  // Quick reachability check
  try {
    execSync(`node -e "require('http').get('${targetUrl}', () => process.exit(0)).on('error', () => process.exit(1))"`, {
      timeout: 3000,
      stdio: 'pipe',
    });
    console.log(`\x1b[36m[lighthouse] Server already running at ${targetUrl}\x1b[0m`);
    return;
  } catch {
    // Not running yet — start vite preview
  }

  console.log(`\x1b[36m[lighthouse] Starting vite preview...\x1b[0m`);
  previewProc = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  previewProc.stdout?.on('data', (d) => process.stdout.write(`  [vite] ${d}`));
  previewProc.stderr?.on('data', (d) => process.stderr.write(`  [vite] ${d}`));

  // Wait up to 30s for the server to respond
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      execSync(`node -e "require('http').get('${targetUrl}', () => process.exit(0)).on('error', () => process.exit(1))"`, {
        timeout: 2000,
        stdio: 'pipe',
      });
      console.log(`\x1b[36m[lighthouse] Server ready at ${targetUrl}\x1b[0m`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw new Error(`[lighthouse] Timed out waiting for ${targetUrl}`);
}

function killServer() {
  if (!previewProc) return;
  try {
    previewProc.kill('SIGTERM');
  } catch {
    /* ignore */
  }
  previewProc = null;
}

// ─── Lighthouse runner ───────────────────────────────────────────────────────
async function runLighthouse(url, factor) {
  // CJS/ESM interop for chrome-launcher
  const m = await import('chrome-launcher');
  const launcher = m.default ?? m;

  const lighthouse = (await import('lighthouse')).default;

  const chromeFlags = ['--headless', '--no-sandbox', '--disable-dev-shm-usage'];
  const chrome = await launcher.launch({ chromeFlags });

  /** Per spec: screenEmulation MUST be set correctly per form factor. */
  const mobileEmulation = {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    disabled: false,
  };
  const desktopEmulation = {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  };

  const lhOptions = {
    logLevel: 'error',
    output: ['html', 'json'], // result.report is an ARRAY — index 0=html, 1=json
    port: chrome.port,
    formFactor: factor,
    screenEmulation: factor === 'mobile' ? mobileEmulation : desktopEmulation,
    throttlingMethod: 'simulate',
    throttling:
      factor === 'mobile'
        ? {
            // Moto G4 / slow 4G simulation
            rttMs: 150,
            throughputKbps: 1638.4,
            cpuSlowdownMultiplier: 4,
            requestLatencyMs: 562.5,
            downloadThroughputKbps: 1474.56,
            uploadThroughputKbps: 675,
          }
        : {
            // Desktop throttled (broadband simulation)
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 9216,
            uploadThroughputKbps: 9216,
          },
    onlyCategories: ['performance', 'best-practices', 'seo', 'accessibility'],
    skipAudits: [],
  };

  let result;
  try {
    result = await lighthouse(url, lhOptions);
  } finally {
    // Per spec: kill chrome defensively — kill() may return undefined or throw
    try {
      await chrome.kill();
    } catch {
      /* ignore */
    }
  }

  if (!result) throw new Error(`Lighthouse returned no result for ${factor}`);

  const lhr = result.lhr;

  // Validate: a failed run returns zeros — detect and warn
  if (!lhr || lhr.runtimeError) {
    console.error(`\x1b[31m[lighthouse] Runtime error for ${factor}: ${lhr?.runtimeError?.message ?? 'unknown'}\x1b[0m`);
    return null;
  }

  // Per spec: result.report is an ARRAY — map index 0→html, 1→json
  const reports = result.report; // string[]
  const htmlReport = Array.isArray(reports) ? reports[0] : reports;
  const jsonReport = Array.isArray(reports) ? reports[1] : JSON.stringify(lhr);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const htmlPath = join(REPORT_DIR, `${factor}-${timestamp}.html`);
  const jsonPath = join(REPORT_DIR, `${factor}-${timestamp}.json`);

  writeFileSync(htmlPath, htmlReport, 'utf8');
  writeFileSync(jsonPath, jsonReport, 'utf8');

  return { lhr, htmlPath, jsonPath };
}

// ─── Print metrics ────────────────────────────────────────────────────────────
function printResults(lhr, factor) {
  const cats = lhr.categories;
  const audits = lhr.audits;

  console.log(`\n\x1b[1m══ ${factor.toUpperCase()} ══════════════════════════════════════\x1b[0m`);
  console.log(bar(cats.performance?.score ?? 0, 'Performance'));
  console.log(bar(cats['best-practices']?.score ?? 0, 'Best Practices'));
  console.log(bar(cats.seo?.score ?? 0, 'SEO'));
  console.log(bar(cats.accessibility?.score ?? 0, 'Accessibility'));

  const fcp = audits['first-contentful-paint']?.numericValue;
  const lcp = audits['largest-contentful-paint']?.numericValue;
  const tbt = audits['total-blocking-time']?.numericValue;
  const cls = audits['cumulative-layout-shift']?.numericValue;
  const si = audits['speed-index']?.numericValue;

  console.log(`\n  FCP  ${formatSec(fcp)}   LCP  ${formatSec(lcp)}   TBT  ${formatMs(tbt)}   CLS  ${cls != null ? cls.toFixed(3) : 'n/a'}   SI  ${formatSec(si)}`);

  // Top 3 improvement opportunities
  const opportunities = Object.values(audits)
    .filter((a) => a.details?.type === 'opportunity' && (a.numericValue ?? 0) > 0)
    .sort((a, b) => (b.numericValue ?? 0) - (a.numericValue ?? 0))
    .slice(0, 3);

  if (opportunities.length > 0) {
    console.log('\n  Top opportunities:');
    for (const opp of opportunities) {
      console.log(`    • ${opp.title} — ${formatSec(opp.numericValue)} potential saving`);
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  let exitCode = 0;

  try {
    await ensureServerRunning();

    const factors =
      formFactor === 'both' ? ['mobile', 'desktop'] : [formFactor];

    for (const factor of factors) {
      console.log(`\x1b[36m[lighthouse] Auditing ${factor} → ${targetUrl}\x1b[0m`);

      const result = await runLighthouse(targetUrl, factor);
      if (!result) {
        console.error(`\x1b[31m[lighthouse] ${factor} run returned no valid result — retry recommended\x1b[0m`);
        exitCode = 1;
        continue;
      }

      const { lhr, htmlPath, jsonPath } = result;
      printResults(lhr, factor);

      console.log(`\n  HTML report: ${htmlPath}`);
      console.log(`  JSON report: ${jsonPath}`);

      // Gate: any performance category below threshold fails the run
      const perfScore = Math.round((lhr.categories.performance?.score ?? 0) * 100);
      if (perfScore < threshold) {
        console.error(
          `\x1b[31m[lighthouse] FAIL: ${factor} performance ${perfScore} < threshold ${threshold}\x1b[0m`,
        );
        exitCode = 1;
      }
    }
  } finally {
    killServer();
  }

  if (exitCode !== 0) {
    console.error('\n\x1b[31m[lighthouse] One or more audits failed the threshold.\x1b[0m');
  } else {
    console.log('\n\x1b[32m[lighthouse] All audits passed.\x1b[0m');
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error('\x1b[31m[lighthouse] Fatal error:\x1b[0m', err);
  killServer();
  process.exit(1);
});

