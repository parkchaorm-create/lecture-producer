#!/usr/bin/env node
/**
 * cost-estimator.mjs · v1.1
 * /produce-lecture 실행 전 예상 토큰·비용 사전 표시.
 * 입력: 강의 메타 (part 수·오디언스). 출력: 단계별 예상치.
 *
 * 가격 기준 (2026 Q1 공개 기준 · 변동 시 수정):
 *   Claude Opus 4.6: input $15/M · output $75/M
 *   Claude Sonnet 4.6: input $3/M · output $15/M
 *   Claude Haiku 4.5: input $1/M · output $5/M
 */
const PRICING = {
  opus:   { in: 15 / 1e6, out: 75 / 1e6 },
  sonnet: { in:  3 / 1e6, out: 15 / 1e6 },
  haiku:  { in:  1 / 1e6, out:  5 / 1e6 }
};

// 단계별 token budget · rules/token-optimization.md C7'
const STAGES = [
  { name: '6인 1차 회의',      model: 'opus',   in: 60_000, out: 10_000, perPart: false },
  { name: '스크립트 작성',      model: 'opus',   in: 40_000, out: 12_000, perPart: true  },
  { name: '6인 2차 검수',      model: 'opus',   in: 60_000, out:  8_000, perPart: false },
  { name: 'slide-planner',    model: 'sonnet', in: 15_000, out:  5_000, perPart: true  },
  { name: 'bullet-writer',    model: 'sonnet', in: 15_000, out:  4_000, perPart: true  },
  { name: 'svg-designer',     model: 'opus',   in: 20_000, out:  6_000, perPart: true  },
  { name: 'html-renderer',    model: 'sonnet', in: 10_000, out:  8_000, perPart: true  },
  { name: 'demo-kit-builder', model: 'sonnet', in: 12_000, out:  4_000, perPart: true  },
  { name: 'qa-validator',     model: 'sonnet', in: 15_000, out:  2_000, perPart: true  }
];

function estimate(totalParts) {
  let totalIn = 0, totalOut = 0, totalCost = 0;
  const rows = [];
  for (const s of STAGES) {
    const n = s.perPart ? totalParts : 1;
    const inTok = s.in * n;
    const outTok = s.out * n;
    const cost = inTok * PRICING[s.model].in + outTok * PRICING[s.model].out;
    totalIn += inTok; totalOut += outTok; totalCost += cost;
    rows.push({ stage: s.name, model: s.model, n, inTok, outTok, cost });
  }
  return { rows, totalIn, totalOut, totalCost };
}

function fmt(n) { return n.toLocaleString('en-US'); }
function money(n) { return '$' + n.toFixed(2); }

const parts = parseInt(process.argv[2] || '6', 10);
const r = estimate(parts);

console.log(`\n💰 Cost Estimate · ${parts} parts\n`);
console.log('Stage                 Model   ×N   Input       Output     Cost');
console.log('─'.repeat(70));
for (const row of r.rows) {
  console.log(
    row.stage.padEnd(22) +
    row.model.padEnd(8) +
    String(row.n).padStart(3) + '  ' +
    fmt(row.inTok).padStart(10) + '  ' +
    fmt(row.outTok).padStart(9) + '  ' +
    money(row.cost).padStart(7)
  );
}
console.log('─'.repeat(70));
console.log(
  'TOTAL'.padEnd(22) + ''.padEnd(8) + ''.padStart(3) + '  ' +
  fmt(r.totalIn).padStart(10) + '  ' +
  fmt(r.totalOut).padStart(9) + '  ' +
  money(r.totalCost).padStart(7)
);
console.log(`\n⚠️  재시도·휴먼인루프 재작성으로 ±30% 변동 가능. 상한 예산: ${money(r.totalCost * 1.3)}\n`);

// JSON 출력 옵션
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(r, null, 2));
}
