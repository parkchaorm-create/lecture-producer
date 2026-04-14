#!/usr/bin/env node
/**
 * portability-check.mjs
 * aiMarketer 특화 표현·절대경로·개인정보 하드코딩 검출.
 * 0건이어야 통과.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.argv[2] || '.';
const SKIP_DIRS = new Set(['node_modules', '.git', 'input', 'output', '_backup', 'dist', 'build']);
const SKIP_FILE_NAMES = new Set(['portability-check.mjs', 'CHANGELOG.md']);

const PATTERNS = [
  { re: /C:\\\\Users\\\\Admin/gi, label: '절대경로(Windows · Admin)' },
  { re: /\/Users\/Admin/g, label: '절대경로(macOS · Admin)' },
  { re: /\/home\/[a-z0-9_-]+\//gi, label: '절대경로(Linux · home)', exceptIn: /portability\.md$/ },
  { re: /aiMarketer/g, label: 'aiMarketer 특화' },
  { re: /output2_AI_marketer_course/g, label: 'output2 특화' },
  { re: /공공기관/g, label: '공공기관 특화(branding/public-lecture·audience-profiles·예시 맥락은 예외)', exceptIn: /(branding[\\\/]public-lecture|brand-context[\\\/]_template|audience-profiles\.md|human-in-loop\.md|expert-council\.md|lecture-writer\.md|brand-context\.md|init-brand\.md|brand-injector\.md|accessibility\.md|dashboard[\\\/]|slide-composer\.md|script-splitter-budget\.md|assets[\\\/]themes[\\\/])/ },
  { re: /가상 클라이언트 4종/g, label: 'aiMarketer 가상 클라이언트 특화' },
  { re: /슬랙 채널 6개 표준/g, label: 'aiMarketer 슬랙 특화' },
  { re: /\b(api[_ ]?key|password|secret)\b\s*[:=]\s*['"]([^'"]+)['"]/gi, label: '하드코딩된 시크릿 의심', placeholderFilter: v => !/^(your-|REPLACE_|xxxxx|example|placeholder|<|secret_REPLACE)/i.test(v) }
];

const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      walk(full);
    } else if (st.isFile()) {
      if (SKIP_FILE_NAMES.has(name)) continue;
      if (!/\.(md|js|mjs|cjs|json|yaml|yml|html|css|ts|tsx|jsx)$/i.test(name)) continue;
      const rel = relative(ROOT, full).replace(/\\/g, '/');
      const content = readFileSync(full, 'utf8');
      for (const p of PATTERNS) {
        if (p.exceptIn && p.exceptIn.test(rel)) continue;
        const matches = [...content.matchAll(p.re)];
        if (!matches.length) continue;
        const real = p.placeholderFilter
          ? matches.filter(m => p.placeholderFilter(m[2] || m[1] || m[0]))
          : matches;
        if (real.length) {
          findings.push({ file: rel, label: p.label, count: real.length, sample: real[0][0].slice(0, 80) });
        }
      }
    }
  }
}

walk(ROOT);

if (findings.length === 0) {
  console.log('✅ Portability check passed (0 findings)');
  process.exit(0);
} else {
  console.log(`❌ Portability check failed (${findings.length} finding${findings.length > 1 ? 's' : ''})\n`);
  for (const f of findings) {
    console.log(`  ${f.file}`);
    console.log(`    ${f.label} · ${f.count} match · "${f.sample}"`);
  }
  process.exit(1);
}
