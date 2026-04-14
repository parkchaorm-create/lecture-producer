// SVG 블록 내부의 애니메이션 클래스만 제거 (JS·CSS 영향 없음)
import fs from 'fs';
import path from 'path';

const PPT_DIR = process.argv[2] || 'output/<slug>/01강_AI핵심과_자기소개/PPT';
const ANIM_CLASSES = ['svg-stagger', 'svg-pulse2', 'svg-pulse', 'svg-rotate-slow',
  'svg-twinkle', 'svg-spin', 'svg-ripple', 'svg-draw-path', 'svg-draw',
  'svg-check-mark', 'svg-progress', 'svg-countup'];

const files = fs.readdirSync(PPT_DIR).filter(f => f.endsWith('.html'));
let totalRm = 0;

for (const f of files) {
  const fp = path.join(PPT_DIR, f);
  let html = fs.readFileSync(fp, 'utf8');
  let count = 0;

  // SVG 블록만 찾아 그 안에서만 처리
  html = html.replace(/<svg[\s\S]*?<\/svg>/g, (svgBlock) => {
    let block = svgBlock;
    for (const ac of ANIM_CLASSES) {
      const re = new RegExp(`\\b${ac}\\b\\s*`, 'g');
      block = block.replace(re, () => { count++; return ''; });
    }
    // 빈 class="" 정리
    block = block.replace(/\s*class=""\s*/g, ' ');
    block = block.replace(/\s*class="\s+"/g, '');
    // animation-delay style 제거
    block = block.replace(/\s*style="animation-delay:[^"]*"/g, '');
    block = block.replace(/\s*style="\s*animation-delay:[^;"]*;?\s*"/g, '');
    block = block.replace(/\s*style="animation:[^"]*"/g, '');
    // 인라인 @keyframes 제거 (SVG 안에 있는 것만)
    block = block.replace(/<style>@keyframes[\s\S]*?<\/style>/g, '');
    return block;
  });

  fs.writeFileSync(fp, html);
  console.log(`✓ ${f}: ${count} classes stripped`);
  totalRm += count;
}
console.log(`\nTotal: ${totalRm} animation refs removed (SVG only · JS·CSS preserved)`);
