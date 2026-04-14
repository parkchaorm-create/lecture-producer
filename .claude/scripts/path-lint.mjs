#!/usr/bin/env node
/**
 * path-lint.mjs
 * Windows MAX_PATH(260자) 초과 가능성 있는 파일 경로 사전 검출.
 * 한글·이모지 인코딩 안전성 함께 점검.
 */
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = process.argv[2] || '.';
const MAX_PATH = 260;
const WARN_PATH = 220;
const WIN_PREFIX_ASSUMED = 50; // 사용자 프로젝트 위치 보정 (C:\Users\xxx\Documents\dev\lecture-producer\)

const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const assumed = WIN_PREFIX_ASSUMED + full.length - ROOT.length;
    if (assumed > MAX_PATH) {
      findings.push({ file: full, assumed, severity: 'ERROR' });
    } else if (assumed > WARN_PATH) {
      findings.push({ file: full, assumed, severity: 'WARN' });
    }
    // 한글 + 공백 + 이모지 동시 있으면 URL 인코딩 주의
    if (/[\u3131-\uD79D]/.test(name) && /\s/.test(name) && /[\u{1F300}-\u{1FAFF}]/u.test(name)) {
      findings.push({ file: full, label: '한글+공백+이모지 혼합 (URL 인코딩 불안)', severity: 'WARN' });
    }
    try {
      if (statSync(full).isDirectory()) walk(full);
    } catch { /* symlink 등 skip */ }
  }
}

try {
  walk(ROOT);
} catch (e) {
  console.error('스캔 실패:', e.message);
  process.exit(2);
}

const errors = findings.filter(f => f.severity === 'ERROR');
const warns = findings.filter(f => f.severity === 'WARN');

console.log(`Path lint · ERROR ${errors.length} · WARN ${warns.length}`);
for (const f of errors) console.log(`  🔴 ${f.file} (~${f.assumed}자)`);
for (const f of warns) console.log(`  🟡 ${f.file}${f.assumed ? ' (~' + f.assumed + '자)' : ''}${f.label ? ' · ' + f.label : ''}`);

process.exit(errors.length > 0 ? 1 : 0);
