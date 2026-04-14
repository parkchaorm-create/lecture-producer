#!/usr/bin/env node
/**
 * theme-lint.mjs · v1.4 개선 (테마별 동적 팔레트 로드)
 * 각 테마 폴더의 tokens.json에서 palette·svgPalette를 읽어 허용 색 결정.
 * 테마 밖 파일(templates/reference-ppt 등)은 모든 테마의 팔레트를 합집합으로 허용.
 * common.css는 var(--*)만 사용해야 하므로 공통 토큰 외 하드코딩 감지.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.argv[2] || '.';
const TARGET_DIRS = ['assets/themes', 'templates/reference-ppt'];
const SKIP_FILES = new Set(['tokens.json', 'theme.yaml', 'README.md']);

const HARDCODE_RE = [
  { re: /#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\b/g, label: 'hex 색상 (팔레트 외)' },
  { re: /\brgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g, label: 'rgb (알파 없음 · 팔레트 사용 권장)' },
  { re: /\bhsla?\(\s*\d+/g, label: 'hsl/hsla' }
];

// 테마별 팔레트 로드
function loadThemePalette(themeDir) {
  const tp = join(themeDir, 'tokens.json');
  if (!existsSync(tp)) return new Set();
  try {
    const t = JSON.parse(readFileSync(tp, 'utf8'));
    const palette = t.palette || {};
    const svgPalette = t.svgPalette || [];
    const all = [...Object.values(palette), ...svgPalette]
      .filter(v => typeof v === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(v))
      .map(v => v.toLowerCase());
    return new Set(all);
  } catch { return new Set(); }
}

// 모든 테마의 hex 합집합 (테마 밖 파일용 · 레퍼런스 PPT 등)
const allThemesDir = join(ROOT, 'assets/themes');
const UNION_PALETTE = new Set();
if (existsSync(allThemesDir)) {
  for (const t of readdirSync(allThemesDir)) {
    try {
      const p = loadThemePalette(join(allThemesDir, t));
      p.forEach(c => UNION_PALETTE.add(c));
    } catch {}
  }
}
// dot-grid 배경색 등 공통 허용
UNION_PALETTE.add('#1a1a1a');

function normalizeHex(h) {
  const lower = h.toLowerCase();
  return lower.length === 4
    ? '#' + lower.slice(1).split('').map(c => c + c).join('')
    : lower;
}

const findings = [];

function walk(dir, themePalette) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) { walk(full, themePalette); continue; }
    if (SKIP_FILES.has(name)) continue;
    if (!/\.(css|js|mjs|html)$/i.test(name)) continue;

    const rel = relative(ROOT, full).replace(/\\/g, '/');
    const content = readFileSync(full, 'utf8');

    for (const p of HARDCODE_RE) {
      const matches = content.match(p.re);
      if (!matches) continue;
      for (const m of matches) {
        if (p.label.startsWith('hex')) {
          const normalized = normalizeHex(m);
          if (themePalette.has(normalized)) continue;
          if (UNION_PALETTE.has(normalized)) continue;
        }
        findings.push({ file: rel, label: p.label, value: m });
      }
    }
  }
}

// assets/themes/ 하위는 각 테마 폴더별 팔레트로 검사
const themesBase = join(ROOT, 'assets/themes');
if (existsSync(themesBase)) {
  for (const t of readdirSync(themesBase)) {
    const td = join(themesBase, t);
    if (!statSync(td).isDirectory()) continue;
    const palette = loadThemePalette(td);
    // 자기 테마 팔레트 + 공통(dot-grid 등)
    const effectivePalette = new Set([...palette, '#1a1a1a']);
    walk(td, effectivePalette);
  }
}

// templates/reference-ppt 등은 UNION 사용
for (const d of TARGET_DIRS) {
  if (d === 'assets/themes') continue;
  const fp = join(ROOT, d);
  if (!existsSync(fp)) continue;
  walk(fp, UNION_PALETTE);
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
