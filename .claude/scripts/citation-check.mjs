#!/usr/bin/env node
/**
 * citation-check.mjs · v1.1 · E6
 * 스크립트 파트의 사실 주장에 [src:N] 출처 ID 부착 여부 검증.
 * 입력: output/<slug>/script_parts/**\/part-*.md
 * 출력: 누락 목록 + 통과율
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const target = process.argv[2] || 'output';
if (!existsSync(target)) {
  console.error(`❌ 대상 없음: ${target}`);
  process.exit(2);
}

// 사실 주장 휴리스틱 (숫자·퍼센트·연도·고유명사·단정 조사가 들어간 문장)
const FACT_PATTERNS = [
  /\d+(?:\.\d+)?\s*(?:%|퍼센트|배|원|달러|\$|명|건|개월|년|년대|시간|분)/,
  /\b(19|20)\d{2}\s*년/,
  /(공식|발표|통계|보고서|조사|연구|논문)/,
  /(최초|최대|최고|유일|독점|1위|2위|3위)/
];
const CITATION_RE = /\[src:\d+\]/;
const SENTENCE_SPLIT = /[.。!?]\s+/;

function* findParts(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* findParts(full);
    else if (st.isFile() && /part-\d+\.md$/.test(name)) yield full;
  }
}

let totalFacts = 0, missingCitations = 0;
const findings = [];

for (const f of findParts(target)) {
  const rel = relative(process.cwd(), f).replace(/\\/g, '/');
  const text = readFileSync(f, 'utf8');
  // 코드블록·인용·메타 제외
  const body = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^>.*/gm, '')
    .replace(/^#.*/gm, '')
    .replace(/^---[\s\S]*?---/m, '');
  const sentences = body.split(SENTENCE_SPLIT).map(s => s.trim()).filter(Boolean);
  for (const s of sentences) {
    const isFact = FACT_PATTERNS.some(p => p.test(s));
    if (!isFact) continue;
    totalFacts++;
    if (!CITATION_RE.test(s)) {
      missingCitations++;
      findings.push({ file: rel, sentence: s.slice(0, 80) + (s.length > 80 ? '…' : '') });
    }
  }
}

const pass = totalFacts - missingCitations;
const rate = totalFacts === 0 ? 100 : (pass / totalFacts * 100).toFixed(1);

console.log(`\n📚 Citation Check\n`);
console.log(`총 사실 주장 추정: ${totalFacts}`);
console.log(`출처 ID 부착: ${pass} (${rate}%)`);
console.log(`누락: ${missingCitations}\n`);

if (missingCitations > 0) {
  console.log('❌ 누락 문장 (상위 10개):');
  for (const f of findings.slice(0, 10)) {
    console.log(`  ${f.file}`);
    console.log(`    "${f.sentence}"`);
  }
  if (findings.length > 10) console.log(`  ... 외 ${findings.length - 10}건`);
  process.exit(1);
} else {
  console.log('✅ 모든 사실 주장에 [src:N] 부착 완료');
  process.exit(0);
}
