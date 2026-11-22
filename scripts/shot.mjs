// Usage: node scripts/shot.mjs <url> <out.png> [waitMs] [js-to-eval-before-shot]
import { chromium } from 'playwright-core';
const [url = 'http://localhost:5173/', out = 'shot.png', wait = '6000', evalJs] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 850 } });
page.on('console', m => { if (['error', 'warning'].includes(m.type())) console.log(`[${m.type()}]`, m.text()); });
page.on('response', r => { if (r.status() >= 400) console.log('[http]', r.status(), r.url()); });
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(url);
await page.waitForTimeout(Number(wait));
if (evalJs) { await page.evaluate(evalJs); await page.waitForTimeout(1500); }
await page.screenshot({ path: out });
await browser.close();
console.log('saved', out);
