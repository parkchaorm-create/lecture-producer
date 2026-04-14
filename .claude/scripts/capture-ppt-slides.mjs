#!/usr/bin/env node
// PPT 슬라이드 시각 검증 캡처 스크립트
//
// 용도: 각 PPT HTML 파일의 슬라이드별 section-visual(SVG 인포그래픽)을
//       PNG로 캡처해 시각 QA에 사용.
//
// 사용법:
//   node .claude/scripts/capture-ppt-slides.mjs [--dir PATH] [--out PATH] [--full]
//
// 기본값:
//   --dir = output/<slug>/01강_AI핵심과_자기소개/PPT
//   --out = _viz_review
//   --full = 선택. 전체 뷰포트 캡처도 추가
//
// 전제:
//   npm install --save-dev playwright
//   npx playwright install chromium
//
// 산출물: OUT/part-NN/slide-XX.png
//
// QA 체크리스트(.claude/rules/qa-checklist.md 섹션 B3 런타임)에서 참조.

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    dir: 'output/<slug>/01강_AI핵심과_자기소개/PPT',
    out: '_viz_review',
    full: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') out.dir = args[++i];
    else if (args[i] === '--out') out.out = args[++i];
    else if (args[i] === '--full') out.full = true;
  }
  return out;
}

(async () => {
  const { dir, out: outDir, full } = parseArgs();
  const BASE = path.resolve(dir);
  const OUT = path.resolve(outDir);

  if (!fs.existsSync(BASE)) {
    console.error(`❌ PPT dir not found: ${BASE}`);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const files = fs.readdirSync(BASE)
    .filter(f => /^part-\d+\.html$/.test(f))
    .sort();

  console.log(`📸 Capturing ${files.length} PPT files from ${BASE}`);

  for (const file of files) {
    const pp = file.match(/part-(\d+)\.html/)[1];
    const url = 'file:///' + path.join(BASE, file).replace(/\\/g, '/');
    await page.goto(url);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(800);

    const slideCount = await page.$$eval('section.slide', els => els.length);
    const partOut = path.join(OUT, `part-${pp}`);
    fs.mkdirSync(partOut, { recursive: true });

    for (let i = 0; i < slideCount; i++) {
      await page.evaluate(idx => window.go && window.go(idx), i);
      // Wait for animations: stagger delays + reveal transitions + custom keyframes
      await page.waitForTimeout(3500);

      const ii = String(i).padStart(2, '0');
      const visual = await page.$(`section.slide[data-slide="${i}"] .section-visual`);
      const target = visual || await page.$(`section.slide[data-slide="${i}"]`);
      if (target) {
        await target.screenshot({ path: path.join(partOut, `slide-${ii}.png`) });
      }
      if (full) {
        await page.screenshot({ path: path.join(partOut, `full-slide-${ii}.png`) });
      }
    }
    console.log(`  ✓ part-${pp}: ${slideCount} slides captured`);
  }

  await browser.close();
  console.log(`✅ Done. Output: ${OUT}`);
})();
