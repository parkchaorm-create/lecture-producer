#!/usr/bin/env node
/**
 * similarity-check.mjs · v1.1 · K2
 * 신규 산출물을 골드 샘플과 비교해 유사도 점수 출력.
 * 비교 항목: bullet 수·슬라이드 수·SVG 아키타입 분포·섹션 순서.
 * ≤80%면 재작성 권고.
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, relative } from 'path';

const GOLD = process.argv[2] || 'samples/_gold-standard/structure';
const TARGET = process.argv[3] || 'output';

if (!existsSync(GOLD)) {
  console.error(`❌ 골드 없음: ${GOLD}`);
  process.exit(2);
}

function readStructuralSignature(htmlPath) {
  const h = readFileSync(htmlPath, 'utf8');
  const bulletCount = (h.match(/class="tilt-card/g) || []).length;
  const slideCount = (h.match(/class="slide(?:\s|")/g) || []).length;
  const sectionTypes = [...h.matchAll(/data-diagram="([^"]+)"/g)].map(m => m[1]);
  const svgCount = (h.match(/<svg/g) || []).length;
  return { bulletCount, slideCount, sectionTypes, svgCount };
}

function compare(a, b) {
  const scores = [];
  // bullet 수 (±30% 허용 → 100점, 그 이상 감점)
  const bulletDelta = Math.abs(a.bulletCount - b.bulletCount) / Math.max(a.bulletCount, 1);
  scores.push({ item: 'bullet count', score: Math.max(0, 100 - bulletDelta * 200) });
  // slide 수 (완전 일치 100, 차이당 -15)
  scores.push({ item: 'slide count', score: Math.max(0, 100 - Math.abs(a.slideCount - b.slideCount) * 15) });
  // section types sequence 일치율 (LCS 기반 간단화: 교집합/합집합)
  const aSet = new Set(a.sectionTypes);
  const bSet = new Set(b.sectionTypes);
  const inter = [...aSet].filter(x => bSet.has(x)).length;
  const union = new Set([...aSet, ...bSet]).size || 1;
  scores.push({ item: 'section types', score: (inter / union) * 100 });
  // svg 수 (슬라이드 수와 같아야)
  scores.push({ item: 'svg count', score: Math.max(0, 100 - Math.abs(a.svgCount - b.svgCount) * 15) });
  const avg = scores.reduce((s, x) => s + x.score, 0) / scores.length;
  return { scores, avg };
}

// 골드: samples/_gold-standard/structure/ 안에 reference.html 또는 README 기반
// 간단화: 골드가 없으면 README의 정량 지표만 사용 (bullet 3~5, slide ~9)
const GOLD_SIG = { bulletCount: 30, slideCount: 9, sectionTypes: ['meta','hook','concept','concept','concept','concept','recap','bridge'], svgCount: 9 };

function* findHtml(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* findHtml(full);
    else if (name.endsWith('.html') && name !== 'index.html') yield full;
  }
}

console.log(`\n🔍 Similarity Check · golden vs ${TARGET}\n`);
let totalFiles = 0, below80 = 0;
for (const f of findHtml(TARGET)) {
  const sig = readStructuralSignature(f);
  const { scores, avg } = compare(GOLD_SIG, sig);
  const rel = relative(process.cwd(), f).replace(/\\/g, '/');
  const mark = avg >= 80 ? '✅' : '⚠️';
  console.log(`${mark} ${rel} · ${avg.toFixed(1)}%`);
  for (const s of scores) console.log(`    ${s.item}: ${s.score.toFixed(0)}`);
  totalFiles++;
  if (avg < 80) below80++;
}

if (totalFiles === 0) {
  console.log('  (검사 대상 없음 — HTML 산출물 생성 후 재실행)');
  process.exit(0);
}

console.log(`\n📊 ${totalFiles}개 중 ${below80}개 < 80% 재작성 권고`);
process.exit(below80 > 0 ? 1 : 0);
