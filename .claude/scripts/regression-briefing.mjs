#!/usr/bin/env node
/**
 * regression-briefing.mjs · v1.1 · K6
 * visual-verification.md의 "발견 사례 누적" + 이전 _postmortem.md를
 * 긁어 _design/regression-briefing.md 생성.
 * svg-designer·html-renderer·lecture-writer가 시스템 프롬프트에 주입.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node regression-briefing.mjs <slug>'); process.exit(2); }

const outDir = `output/${slug}/_design`;
mkdirSync(outDir, { recursive: true });

// 소스 1: visual-verification.md 발견 사례 누적
const vv = existsSync('.claude/rules/visual-verification.md')
  ? readFileSync('.claude/rules/visual-verification.md', 'utf8') : '';
const vvSection = vv.match(/## 발견 사례 누적[\s\S]*?(?=\n##\s|$)/);
const vvText = vvSection ? vvSection[0] : '';

// 소스 2: 기존 _postmortem.md들
const pmBits = [];
if (existsSync('output')) {
  for (const s of readdirSync('output')) {
    if (s === slug) continue;
    const pm = `output/${s}/_postmortem.md`;
    if (existsSync(pm)) pmBits.push(`### ${s}\n` + readFileSync(pm, 'utf8'));
  }
}

// 소스 3: 현 강의 내부 이전 _postmortem (있으면)
const myPm = `output/${slug}/_postmortem.md`;
if (existsSync(myPm)) pmBits.unshift(`### ${slug} (이전 빌드)\n` + readFileSync(myPm, 'utf8'));

// 최근 5건 추출 (HIGH 전부) — 단순화: 🔴·ERROR·HIGH 포함 단락
const highlights = [];
for (const txt of [vvText, ...pmBits]) {
  const blocks = txt.split(/\n(?=###\s|####\s|-\s\*\*)/);
  for (const b of blocks) {
    if (/(🔴|ERROR|HIGH|CRITICAL|가장 중요한|가장 위험한)/.test(b)) {
      highlights.push(b.trim());
    }
  }
}

// 빌드
let briefing = `# Regression Briefing · ${slug}\n\n`;
briefing += `> 이전 강의·프로젝트에서 발견된 회귀 사례. svg-designer·html-renderer·lecture-writer는 **작업 시작 전 의무 로드**.\n\n`;

if (highlights.length === 0) {
  briefing += '_아직 누적된 회귀 사례 없음. 이번 강의에서 발견되는 사례가 다음 강의에 주입됩니다._\n';
} else {
  briefing += `## HIGH 심각도 사례 (전체)\n\n`;
  for (const h of highlights.slice(0, 10)) briefing += h + '\n\n---\n\n';
}

// 길이 제한 (1500자 초과 시 앞부분만)
if (briefing.length > 1500) {
  briefing = briefing.slice(0, 1500) + '\n\n_… 이하 생략 (full text in source files)_\n';
}

const dst = join(outDir, 'regression-briefing.md');
writeFileSync(dst, briefing);
console.log(`✅ ${dst} 생성 (${briefing.length}자, ${highlights.length}건 요약)`);
