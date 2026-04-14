#!/usr/bin/env node
/**
 * diff-capture.mjs · v1.1 · E4
 * Playwright로 expected vs actual 슬라이드 캡처 후 사이드바이사이드 HTML diff 생성.
 * Playwright 미설치 시 graceful skip.
 *
 * 사용: node .claude/scripts/diff-capture.mjs <expected-html> <actual-html> [out-dir]
 */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, basename, join } from 'path';

const [expected, actual, outDir = '_viz_review/diff'] = process.argv.slice(2);

if (!expected || !actual) {
  console.error('Usage: node diff-capture.mjs <expected.html> <actual.html> [out-dir]');
  process.exit(2);
}
if (!existsSync(expected) || !existsSync(actual)) {
  console.error('❌ 입력 HTML 파일 없음');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.log('ℹ️  Playwright 미설치 · 시각 diff 건너뜀');
  console.log('   설치: npm install --save-dev playwright && npx playwright install chromium');
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 });

async function captureAll(htmlPath, label) {
  const page = await context.newPage();
  await page.goto('file://' + resolve(htmlPath));
  await page.waitForTimeout(500);
  const slideCount = await page.locator('.slide').count();
  const files = [];
  for (let i = 0; i < slideCount; i++) {
    await page.evaluate(idx => {
      document.querySelectorAll('.slide').forEach((s, j) => s.classList.toggle('active', j === idx));
    }, i);
    await page.waitForTimeout(300);
    const file = join(outDir, `${label}-slide-${String(i + 1).padStart(2, '0')}.png`);
    const el = page.locator('.slide.active');
    await el.screenshot({ path: file });
    files.push(file);
  }
  await page.close();
  return files;
}

const expectedImgs = await captureAll(expected, 'expected');
const actualImgs = await captureAll(actual, 'actual');
await browser.close();

// 사이드바이사이드 HTML
const rows = Math.min(expectedImgs.length, actualImgs.length);
let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Visual Diff</title>
<style>body{font-family:system-ui;background:#0D0D0D;color:#E8E0CC;padding:20px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:40px}
.col h3{color:#e2c793;margin:0 0 8px}img{width:100%;border:1px solid #3a3730}</style></head><body>
<h1>Visual Diff · expected vs actual</h1>`;
for (let i = 0; i < rows; i++) {
  html += `<div class="row">
    <div class="col"><h3>Expected · slide ${i + 1}</h3><img src="${basename(expectedImgs[i])}"></div>
    <div class="col"><h3>Actual · slide ${i + 1}</h3><img src="${basename(actualImgs[i])}"></div>
  </div>`;
}
html += '</body></html>';
const diffPath = join(outDir, 'diff.html');
writeFileSync(diffPath, html);

console.log(`✅ Visual diff 생성: ${diffPath}`);
console.log(`   expected ${expectedImgs.length}장 · actual ${actualImgs.length}장`);
