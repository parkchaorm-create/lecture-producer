#!/usr/bin/env node
/**
 * tests/e2e/smoke.mjs · v1.1 · F2
 * 스킬팩 기본 무결성 회귀 테스트.
 * - 3개 lint 통과
 * - 필수 파일 존재
 * - 레퍼런스 PPT 구문 유효성
 * - cost-estimator 정상 동작
 *
 * GitHub Actions·로컬 둘 다 동작.
 */
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const results = [];
function test(name, fn) {
  try { fn(); results.push({ name, pass: true }); }
  catch (e) { results.push({ name, pass: false, err: e.message }); }
}

// 1. Lint 3종 통과
test('portability-check 통과', () => {
  execSync('node .claude/scripts/portability-check.mjs .', { stdio: 'pipe' });
});
test('theme-lint 통과', () => {
  execSync('node .claude/scripts/theme-lint.mjs .', { stdio: 'pipe' });
});
test('path-lint 통과', () => {
  execSync('node .claude/scripts/path-lint.mjs .', { stdio: 'pipe' });
});

// 2. 필수 파일 존재
const REQUIRED = [
  'README.md', 'CLAUDE.md', 'SKILL.md', 'MIGRATION.md', 'LICENSE', 'CHANGELOG.md', '.gitignore',
  '.claude/VERSION', '.claude/README.md', '.claude/settings.local.json',
  'assets/themes/pajamaboss/tokens.json',
  'assets/themes/pajamaboss/theme.yaml',
  'assets/themes/pajamaboss/common.css',
  'assets/themes/pajamaboss/common.js',
  'templates/reference-ppt/part-01.html',
  'templates/lecture-brief.md',
  'templates/framework-spec.md',
  'branding/_template/tone-guide.md',
  'branding/public-lecture/tone-guide.md',
  'branding/youtube-longform/tone-guide.md',
  'branding/online-course/tone-guide.md',
  'samples/mode-1-references/README.md',
  'samples/_gold-standard/structure/README.md',
  'samples/_gold-standard/content/README.md',
  'docs/notion-setup.md',
  // v1.2 신규 필수
  'shared/phase-0-glossary.md',
  '.claude/models.json',
  '.claude/rules/model-allocation.md',
  '.claude/rules/cache-structure.md',
  '.claude/rules/brand-context.md',
  '.claude/agents/slide-composer.md',
  '.claude/agents/brand-injector.md',
  '.claude/commands/init-brand.md',
  '.claude/skills/slide-composer/SKILL.md',
  '.claude/scripts/batch-orchestrator.mjs',
  '.claude/scripts/token-cache-advisor.mjs',
  '.claude/scripts/brand-context-lint.mjs',
  '.claude/scripts/backup.mjs',
  '.claude/scripts/regression-briefing.mjs',
  'templates/fewshot-structured.json',
  'brand-context/README.md',
  'brand-context/_template/brand.yaml',
  'brand-context/_template/profile/instructor.md',
  'brand-context/_template/assets/logo/logo.svg',
  'brand-context/_template/copy/legal.md',
  'brand-context/_default/brand.yaml',
  'brand-context/_default/assets/logo/logo.svg',
  'brand-context/_default/copy/legal.md'
];
for (const f of REQUIRED) {
  test(`파일 존재 · ${f}`, () => {
    if (!existsSync(f)) throw new Error('누락');
  });
}

// 3. 필수 에이전트·커맨드·규칙
const AGENTS = ['expert-council','lecture-writer','notion-uploader','bullet-writer','demo-kit-builder','html-renderer','qa-validator','script-splitter','slide-planner','svg-designer','slide-composer','brand-injector'];
for (const a of AGENTS) test(`에이전트 · ${a}`, () => {
  if (!existsSync(`.claude/agents/${a}.md`)) throw new Error('없음');
});
const RULES = ['audience-profiles','input-mode-detection','web-research-protocol','human-in-loop','error-handling','quality-method','token-optimization','voice-lock','script-splitter-budget','accessibility','quiz-slide','model-allocation','cache-structure','brand-context'];
for (const r of RULES) test(`규칙 · ${r}`, () => {
  if (!existsSync(`.claude/rules/${r}.md`)) throw new Error('없음');
});

// 4. tokens.json 유효 JSON
test('tokens.json 파싱', () => {
  const t = JSON.parse(readFileSync('assets/themes/pajamaboss/tokens.json', 'utf8'));
  if (!t.palette || !t.palette.gold) throw new Error('palette.gold 없음');
  if (!t.fontSize || !t.fontSize.bulletText) throw new Error('fontSize.bulletText 없음');
});

// 5. 레퍼런스 PPT 슬림 유지
test('레퍼런스 PPT 슬림 (≤600줄)', () => {
  const lines = readFileSync('templates/reference-ppt/part-01.html', 'utf8').split('\n').length;
  if (lines > 600) throw new Error(`${lines}줄 · 인라인 블록 잔존 의심`);
});

// 6. cost-estimator 동작
test('cost-estimator 실행', () => {
  const out = execSync('node .claude/scripts/cost-estimator.mjs 6', { stdio: 'pipe' }).toString();
  if (!/TOTAL/.test(out)) throw new Error('TOTAL 출력 없음');
});

// v1.2 · brand-context-lint 통과
test('brand-context-lint · _template + _default 통과', () => {
  execSync('node .claude/scripts/brand-context-lint.mjs --all', { stdio: 'pipe' });
});

// v1.2 · models.json 파싱
test('models.json 파싱', () => {
  const m = JSON.parse(readFileSync('.claude/models.json', 'utf8'));
  if (!m.recommended || !m.recommended['lecture-writer']) throw new Error('lecture-writer 매핑 없음');
  if (!m.fallback) throw new Error('fallback 없음');
});

// v1.2 · fewshot-structured.json 파싱
test('fewshot-structured.json 파싱', () => {
  const f = JSON.parse(readFileSync('templates/fewshot-structured.json', 'utf8'));
  if (!f.policy || !f.structuredExample) throw new Error('스키마 키 누락');
});

// v1.2 · batch 할인 동작
test('cost-estimator --batch 모드', () => {
  const out = execSync('node .claude/scripts/cost-estimator.mjs 6 --batch', { stdio: 'pipe' }).toString();
  if (!/BATCH/.test(out)) throw new Error('BATCH 표기 없음');
});

// v1.2 · deploy-ppt 스크립트 존재
test('deploy-ppt.mjs 존재', () => {
  if (!existsSync('.claude/scripts/deploy-ppt.mjs')) throw new Error('없음');
});

// v1.2 · deploy-ppt skill
test('skill · deploy-ppt', () => {
  if (!existsSync('.claude/skills/deploy-ppt/SKILL.md')) throw new Error('없음');
});

// v1.3 · 대시보드
test('dashboard · server.mjs', () => { if (!existsSync('dashboard/server.mjs')) throw new Error('없음'); });
test('dashboard · public/index.html', () => { if (!existsSync('dashboard/public/index.html')) throw new Error('없음'); });
test('dashboard · public/app.js', () => { if (!existsSync('dashboard/public/app.js')) throw new Error('없음'); });
test('dashboard · public/dashboard.css', () => { if (!existsSync('dashboard/public/dashboard.css')) throw new Error('없음'); });
test('dashboard · README.md', () => { if (!existsSync('dashboard/README.md')) throw new Error('없음'); });
test('package.json · dashboard 스크립트', () => {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  if (!pkg.scripts?.dashboard) throw new Error('scripts.dashboard 없음');
});
test('server.mjs 구문 유효', () => { execSync('node --check dashboard/server.mjs', { stdio: 'pipe' }); });

// 7. VERSION 일치
test('VERSION 일치', () => {
  const v = readFileSync('.claude/VERSION', 'utf8').trim();
  if (!/^\d+\.\d+\.\d+$/.test(v)) throw new Error(`부적합 · ${v}`);
});

// 리포트
const pass = results.filter(r => r.pass).length;
const fail = results.length - pass;
console.log(`\n🧪 Smoke Test · ${pass}/${results.length} passed\n`);
for (const r of results) {
  if (r.pass) console.log(`  ✅ ${r.name}`);
  else console.log(`  ❌ ${r.name} · ${r.err}`);
}
console.log();
process.exit(fail > 0 ? 1 : 0);
