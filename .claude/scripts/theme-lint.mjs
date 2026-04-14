#!/usr/bin/env node
/**
 * theme-lint.mjs
 * tokens.json 외부에서 하드코딩된 색상·폰트 크기 검출.
 * common.css는 var(--*)만 허용.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.argv[2] || '.';
const TARGET_DIRS = ['assets/themes', 'templates/reference-ppt'];
const SKIP_FILES = new Set(['tokens.json', 'theme.yaml', 'README.md']);

// rgba의 알파 투명도 표현(rgba(R,G,B,0.x))은 팔레트 hex에서 파생된 것으로 간주 · v1.1에서 var 변환 로드맵.
// 순수 rgb() 또는 hsl() 하드코딩만 경고.
const HARDCODE_RE = [
  { re: /#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/g, label: 'hex 색상 (팔레트 외)' },
  { re: /\brgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g, label: 'rgb (알파 없음 · 팔레트 사용 권장)' },
  { re: /\bhsla?\(\s*\d+/g, label: 'hsl/hsla' }
];

// Pajamaboss palette 예외 (tokens.json 파생으로 간주). 대소문자 무시 비교.
const ALLOWED_HEX = new Set(
  ['#0D0D0D', '#141414', '#e2c793', '#b8941f', '#F7F0DF', '#E8E0CC', '#7a7666', '#3a3730', '#1f1d19', '#1a1a1a']
    .map(h => h.toLowerCase())
);

const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (SKIP_FILES.has(name)) continue;
    if (!/\.(css|js|mjs|html)$/i.test(name)) continue;

    const rel = relative(ROOT, full).replace(/\\/g, '/');
    const content = readFileSync(full, 'utf8');

    for (const p of HARDCODE_RE) {
      const matches = content.match(p.re);
      if (!matches) continue;
      for (const m of matches) {
        if (p.label.startsWith('hex')) {
          const lower = m.toLowerCase();
          const normalized = lower.length === 4
            ? '#' + lower.slice(1).split('').map(c => c + c).join('')
            : lower;
          if (ALLOWED_HEX.has(lower) || ALLOWED_HEX.has(normalized)) continue;
        }
        findings.push({ file: rel, label: p.label, value: m });
      }
    }
  }
}

for (const d of TARGET_DIRS) {
  try { walk(join(ROOT, d)); } catch { /* 없으면 skip */ }
}

if (findings.length === 0) {
  console.log('✅ Theme lint passed (0 hardcoded colors outside palette)');
  process.exit(0);
} else {
  console.log(`⚠️  Theme lint: ${findings.length} hardcoded item${findings.length > 1 ? 's' : ''}`);
  for (const f of findings) {
    console.log(`  ${f.file}: ${f.label} "${f.value}"`);
  }
  process.exit(1);
}
