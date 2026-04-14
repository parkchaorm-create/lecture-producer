#!/usr/bin/env node
/**
 * batch-orchestrator.mjs · v1.2 · O13
 * part-02~N을 Anthropic Message Batches API로 묶어 50% 단가 할인.
 * H1 게이트 존중: part-01은 실시간 · 2~N강 승인 후에만 배치.
 *
 * 사용:
 *   node batch-orchestrator.mjs <slug> <stage>
 *   stage: script | slides | tutorials
 *
 * 전제: ANTHROPIC_API_KEY 환경변수.
 * Claude Code 세션 내부에서 호출되는 경우 graceful fallback.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const [slug, stage] = process.argv.slice(2);
if (!slug || !stage) {
  console.error('Usage: node batch-orchestrator.mjs <slug> <script|slides|tutorials>');
  process.exit(2);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.log('ℹ️  ANTHROPIC_API_KEY 미설정 · 배치 실행 건너뜀');
  console.log('   일반 경로로 진행합니다 (Claude Code 세션이 에이전트를 순차 호출).');
  process.exit(0);
}

const root = `output/${slug}`;
if (!existsSync(root)) { console.error(`❌ ${root} 없음`); process.exit(2); }

// 파트 목록 스캔 (part-01 제외 · H1 게이트 존중)
function collectParts(sub) {
  const dir = join(root, sub);
  if (!existsSync(dir)) return [];
  const parts = [];
  for (const act of readdirSync(dir)) {
    const actPath = join(dir, act);
    try {
      for (const f of readdirSync(actPath)) {
        const m = f.match(/part-(\d{2})\.(md|json|html)$/);
        if (m && m[1] !== '01') parts.push(join(actPath, f));
      }
    } catch {}
  }
  return parts.sort();
}

const inputs = {
  script: collectParts('script_parts'),
  slides: collectParts('slide_plan'),
  tutorials: []  // DEMO 있는 파트만
};

const list = stage === 'tutorials'
  ? readdirSync(join(root, 'script_parts'), { recursive: true, withFileTypes: true })
      .filter(d => d.isFile() && /part-\d+\.md/.test(d.name) && !/part-01/.test(d.name))
      .map(d => join(d.parentPath || d.path, d.name))
  : (inputs[stage] || []);

if (list.length === 0) {
  console.log(`ℹ️  ${stage} 대상 없음 (part-01 제외 후 0개). 먼저 일반 경로로 2~N강 트리거하세요.`);
  process.exit(0);
}

// Batch 요청 JSON Lines 작성
const batchDir = join(root, '_design', 'batches');
mkdirSync(batchDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const batchFile = join(batchDir, `${stage}-${ts}.jsonl`);

const models = JSON.parse(readFileSync('.claude/models.json', 'utf8'));
const modelMap = {
  script: models.recommended['lecture-writer']?.model || 'opus',
  slides: models.recommended['slide-composer']?.model || 'sonnet',
  tutorials: models.recommended['demo-kit-builder']?.model || 'sonnet'
};
const modelName = ({ opus: 'claude-opus-4-6', sonnet: 'claude-sonnet-4-6', haiku: 'claude-haiku-4-5-20251001' })[modelMap[stage]];

const requests = list.map((p, i) => ({
  custom_id: `${stage}-${String(i + 2).padStart(2, '0')}`,
  params: {
    model: modelName,
    max_tokens: stage === 'script' ? 12000 : 6000,
    messages: [
      { role: 'user', content: `[batch mode]\n\n파일: ${p}\n\n본문을 읽고 ${stage} 산출물을 생성하세요.\n(상세 규약은 해당 에이전트 SKILL.md 참조)` }
    ]
  }
}));

writeFileSync(batchFile, requests.map(r => JSON.stringify(r)).join('\n'));
console.log(`📦 Batch 파일 생성: ${batchFile}`);
console.log(`   요청 수: ${requests.length} · 모델: ${modelName}`);

// 실제 Batch API 호출 (optional · 환경 따라 skip)
try {
  const url = 'https://api.anthropic.com/v1/messages/batches';
  console.log(`\n⏩ POST ${url}`);
  const body = { requests };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('❌ Batch 생성 실패:', data);
    process.exit(1);
  }
  console.log(`✅ Batch ID: ${data.id}`);
  console.log(`   상태 확인: GET ${url}/${data.id}`);
  console.log(`   처리 완료 최대 24시간 · 일반적으로 수분~수시간`);
  writeFileSync(join(batchDir, `${stage}-${ts}.meta.json`), JSON.stringify({ batchId: data.id, ts, requestCount: requests.length }, null, 2));
} catch (e) {
  console.error('⚠️  Batch API 호출 오류:', e.message);
  console.log('   Batch 파일은 저장됐으니 수동 업로드 가능합니다.');
  process.exit(1);
}
