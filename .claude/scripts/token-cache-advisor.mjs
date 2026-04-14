#!/usr/bin/env node
/**
 * token-cache-advisor.mjs · v1.2 · O11 측정
 * Anthropic 응답의 cache_creation_input_tokens·cache_read_input_tokens를 로컬 로그에서 파싱해 히트율 계산.
 * 사용자가 세션 종료 후 수동 실행 → _postmortem.md에 요약 기록.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node token-cache-advisor.mjs <slug>'); process.exit(2); }

const root = `output/${slug}`;
if (!existsSync(root)) { console.error(`❌ ${root} 없음`); process.exit(2); }

// API 응답 로그 위치 (에이전트가 _design/api-logs/*.json으로 저장한다고 가정)
const logDir = join(root, '_design', 'api-logs');
if (!existsSync(logDir)) {
  console.log('ℹ️  API 로그 없음 · 에이전트가 _design/api-logs/*.json으로 응답 저장 시 분석 가능');
  console.log('   일반 사용에서는 Claude Code 내부 세션이 로그를 외부화하지 않을 수 있습니다.');
  process.exit(0);
}

let totalInput = 0, totalOutput = 0, cacheCreation = 0, cacheRead = 0;
const byAgent = {};

for (const f of readdirSync(logDir)) {
  if (!f.endsWith('.json')) continue;
  const log = JSON.parse(readFileSync(join(logDir, f), 'utf8'));
  const u = log.usage || {};
  const input = u.input_tokens || 0;
  const output = u.output_tokens || 0;
  const cc = u.cache_creation_input_tokens || 0;
  const cr = u.cache_read_input_tokens || 0;
  totalInput += input; totalOutput += output; cacheCreation += cc; cacheRead += cr;
  const agent = log.agent || 'unknown';
  byAgent[agent] = byAgent[agent] || { calls: 0, input: 0, cr: 0 };
  byAgent[agent].calls++;
  byAgent[agent].input += input;
  byAgent[agent].cr += cr;
}

const hitRate = totalInput === 0 ? 0 : (cacheRead / (cacheRead + totalInput - cacheRead) * 100);
const savingRate = totalInput === 0 ? 0 : (cacheRead * 0.9 / totalInput * 100); // 캐시 히트는 원가 10%

console.log(`\n📊 Cache Advisor · ${slug}\n`);
console.log(`Total input tokens:    ${totalInput.toLocaleString()}`);
console.log(`Cache read (hit):      ${cacheRead.toLocaleString()}`);
console.log(`Cache creation (miss): ${cacheCreation.toLocaleString()}`);
console.log(`Output tokens:         ${totalOutput.toLocaleString()}\n`);
console.log(`캐시 히트율: ${hitRate.toFixed(1)}% (목표 65%+)`);
console.log(`실효 비용 절감: 약 ${savingRate.toFixed(1)}%\n`);
console.log('에이전트별:');
for (const [a, s] of Object.entries(byAgent).sort((x, y) => y[1].input - x[1].input)) {
  const r = s.input === 0 ? 0 : (s.cr / s.input * 100);
  console.log(`  ${a.padEnd(20)} ${s.calls}회 · ${s.input.toLocaleString()} · 히트 ${r.toFixed(0)}%`);
}

// _postmortem.md에 append
const pm = join(root, '_postmortem.md');
const summary = `\n## Cache 효율 (${new Date().toISOString()})\n- 캐시 히트율: ${hitRate.toFixed(1)}%\n- 실효 절감: ${savingRate.toFixed(1)}%\n- 총 입력: ${totalInput.toLocaleString()} / 캐시 읽기: ${cacheRead.toLocaleString()}\n`;
if (existsSync(pm)) {
  writeFileSync(pm, readFileSync(pm, 'utf8') + summary);
} else {
  writeFileSync(pm, `# Postmortem · ${slug}\n${summary}`);
}
console.log(`\n✅ _postmortem.md 갱신`);
