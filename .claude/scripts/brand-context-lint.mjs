#!/usr/bin/env node
/**
 * brand-context-lint.mjs · v1.2
 * brand-context/<name>/ 구조·필수 파일·로고 규격 검증.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node brand-context-lint.mjs brand-context/<name>');
  console.error('       node brand-context-lint.mjs --all  (모든 브랜드)');
  process.exit(2);
}

const brands = target === '--all'
  ? readdirSync('brand-context', { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => join('brand-context', d.name))
  : [target];

let totalFail = 0;

for (const dir of brands) {
  if (!existsSync(dir)) {
    console.error(`❌ ${dir} 없음`);
    totalFail++;
    continue;
  }

  const findings = [];
  function check(cond, msg) { if (!cond) findings.push(msg); }
  function fileExists(rel) { return existsSync(join(dir, rel)); }
  function read(rel) {
    try { return readFileSync(join(dir, rel), 'utf8'); } catch { return null; }
  }

  // 필수 파일
  check(fileExists('brand.yaml'),                      '필수 · brand.yaml 없음');
  check(fileExists('profile/instructor.md'),            '필수 · profile/instructor.md 없음');
  check(fileExists('assets/logo/logo.svg'),             '필수 · assets/logo/logo.svg 없음');
  check(fileExists('copy/legal.md'),                    '필수 · copy/legal.md 없음');

  // brand.yaml 핵심 필드
  const yml = read('brand.yaml') || '';
  check(/^name:\s*\S/m.test(yml),        'brand.yaml · name 비어있음');
  check(/^displayName:\s*['"]?\S/m.test(yml), 'brand.yaml · displayName 비어있음');
  check(/^license:\s*\S/m.test(yml),     'brand.yaml · license 비어있음');

  // 로고 SVG
  const svg = read('assets/logo/logo.svg') || '';
  check(/<svg[^>]+viewBox=/i.test(svg),  '로고 SVG · viewBox 누락');
  check(/<title[^>]*>/i.test(svg),       '로고 SVG · <title> 접근성 태그 누락');

  // 저작권 표기
  const legal = read('copy/legal.md') || '';
  check(/©|Copyright|All rights reserved|CC-BY|MIT/i.test(legal), 'legal.md · 저작권 표기 누락');

  // 치환 변수 사용 여부 · 모두 brand.yaml 변수로 정의됐는지
  const copyFiles = ['cta.md', 'outro-credits.md', 'taglines.md', 'legal.md'];
  const definedVars = new Set(['year']); // year는 자동 치환
  // variables: 섹션 이후 들여쓴 key: 모두 수집
  const lines = yml.split('\n');
  let inVar = false;
  for (const ln of lines) {
    if (/^variables\s*:/.test(ln)) { inVar = true; continue; }
    if (inVar) {
      if (/^\S/.test(ln)) { inVar = false; continue; }
      const m = ln.match(/^\s+(\w+)\s*:/);
      if (m) definedVars.add(m[1]);
    }
  }
  for (const f of copyFiles) {
    const text = read(`copy/${f}`);
    if (!text) continue;
    for (const m of text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
      if (!definedVars.has(m[1])) {
        findings.push(`copy/${f} · 치환 변수 {{${m[1]}}}가 brand.yaml.variables에 정의되지 않음`);
      }
    }
  }

  // 결과
  if (findings.length === 0) {
    console.log(`✅ ${dir} 통과`);
  } else {
    console.log(`❌ ${dir} · ${findings.length}건`);
    for (const f of findings) console.log(`   ${f}`);
    totalFail++;
  }
}

process.exit(totalFail > 0 ? 1 : 0);
