// SVG 자동 충돌 검증 스크립트
//
// 용도: PPT HTML 파일 내 각 슬라이드 SVG의 텍스트 겹침·이탈을
//       Playwright getBBox API로 실측해 자동 검출.
//
// 사용법:
//   node .claude/scripts/svg-self-verify.mjs <html_file> [slide_index]
//   node .claude/scripts/svg-self-verify.mjs <html_file>            # 전체 슬라이드
//
// 출력 (JSON):
//   {
//     file: "...",
//     slides: [{
//       slide: 3,
//       overlaps: [{a: "마케팅", b: "브랜딩", a_box: {...}, b_box: {...}, gap: -5}],
//       overflow: [{text: "한국어 가능", parent_box: {...}, text_box: {...}, exceed_x: 10}],
//       outside_viewbox: [{el: "text", text: "...", box: {...}}]
//     }]
//   }
//
// 통과 기준: overlaps + overflow + outside_viewbox 모두 비어 있을 것.

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: svg-self-verify.mjs <html_file> [slide_index]');
  process.exit(1);
}
const HTML = path.resolve(args[0]);
const SLIDE = args[1] !== undefined ? parseInt(args[1]) : null;

if (!fs.existsSync(HTML)) {
  console.error('File not found:', HTML);
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('file:///' + HTML.replace(/\\/g, '/'));
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(800);

  const slideCount = await page.$$eval('section.slide', els => els.length);
  const targets = SLIDE !== null ? [SLIDE] : Array.from({ length: slideCount }, (_, i) => i);

  const result = { file: HTML, slides: [] };

  for (const idx of targets) {
    await page.evaluate(i => window.go && window.go(i), idx);
    await page.waitForTimeout(1200);

    const report = await page.evaluate((slideIdx) => {
      const slide = document.querySelector(`section.slide[data-slide="${slideIdx}"]`);
      if (!slide) return null;
      const svgs = slide.querySelectorAll('svg.infographic, .section-visual svg');
      const overlaps = [];
      const overflow = [];
      const outsideViewBox = [];

      const rectsOverlap = (a, b, padding = 2) => {
        return !(a.x + a.width + padding <= b.x ||
                 b.x + b.width + padding <= a.x ||
                 a.y + a.height + padding <= b.y ||
                 b.y + b.height + padding <= a.y);
      };

      svgs.forEach(svg => {
        // viewBox parsing
        const vbAttr = svg.getAttribute('viewBox') || '0 0 400 260';
        const [vbX, vbY, vbW, vbH] = vbAttr.split(/\s+/).map(Number);

        const texts = svg.querySelectorAll('text');
        const textBoxes = [];

        texts.forEach(t => {
          let bbox;
          try { bbox = t.getBBox(); } catch { return; }
          // skip empty text
          if (!t.textContent.trim()) return;
          textBoxes.push({ el: t, box: bbox, text: t.textContent.trim().slice(0, 30) });

          // outside viewBox check (in user-space units after CTM applied)
          // Use getBoundingClientRect as fallback for transformed elements
          if (bbox.x < vbX - 1 || bbox.y < vbY - 1 ||
              bbox.x + bbox.width > vbX + vbW + 1 ||
              bbox.y + bbox.height > vbY + vbH + 1) {
            outsideViewBox.push({
              text: t.textContent.trim().slice(0, 30),
              box: { x: +bbox.x.toFixed(1), y: +bbox.y.toFixed(1),
                     w: +bbox.width.toFixed(1), h: +bbox.height.toFixed(1) },
              viewBox: { x: vbX, y: vbY, w: vbW, h: vbH }
            });
          }
        });

        // text-text overlap (same SVG)
        for (let i = 0; i < textBoxes.length; i++) {
          for (let j = i + 1; j < textBoxes.length; j++) {
            const a = textBoxes[i].box, b = textBoxes[j].box;
            if (rectsOverlap(a, b, 2)) {
              overlaps.push({
                a: textBoxes[i].text,
                b: textBoxes[j].text,
                a_box: { x: +a.x.toFixed(1), y: +a.y.toFixed(1), w: +a.width.toFixed(1), h: +a.height.toFixed(1) },
                b_box: { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }
              });
            }
          }
        }

        // text overflowing parent rect (text inside g with rect sibling)
        textBoxes.forEach(({ el, box, text }) => {
          // find nearest <rect> sibling within same parent <g>
          const parent = el.parentElement;
          if (!parent) return;
          const rects = parent.querySelectorAll(':scope > rect');
          rects.forEach(r => {
            try {
              const rb = r.getBBox();
              // check if text is within this rect (assumed to be parent box)
              if (box.x >= rb.x - 1 && box.y >= rb.y - 1) {
                if (box.x + box.width > rb.x + rb.width + 1 ||
                    box.y + box.height > rb.y + rb.height + 1) {
                  overflow.push({
                    text,
                    parent_box: { x: +rb.x.toFixed(1), y: +rb.y.toFixed(1), w: +rb.width.toFixed(1), h: +rb.height.toFixed(1) },
                    text_box: { x: +box.x.toFixed(1), y: +box.y.toFixed(1), w: +box.width.toFixed(1), h: +box.height.toFixed(1) },
                    exceed_x: +(box.x + box.width - rb.x - rb.width).toFixed(1),
                    exceed_y: +(box.y + box.height - rb.y - rb.height).toFixed(1)
                  });
                }
              }
            } catch {}
          });
        });
      });

      return { slide: slideIdx, overlaps, overflow, outside_viewbox: outsideViewBox };
    }, idx);

    if (report) result.slides.push(report);
  }

  await browser.close();

  // summary
  const totalIssues = result.slides.reduce((s, r) =>
    s + r.overlaps.length + r.overflow.length + r.outside_viewbox.length, 0);
  const passed = totalIssues === 0;

  console.log(JSON.stringify(result, null, 2));
  console.error(`\n${passed ? '✅ PASS' : '❌ FAIL'}: ${totalIssues} issues across ${result.slides.length} slides`);
  process.exit(passed ? 0 : 1);
})();
