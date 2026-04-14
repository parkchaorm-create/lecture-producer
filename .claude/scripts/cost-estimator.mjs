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

// v1.2 단계별 token budget · token-optimization.md C7' + O12 모델 분배 + O14 slide-composer 통합
// 입력은 cache 히트율 70% 가정 (O11) · 실효 평균 0.55배로 반영
const CACHE_HIT_RATIO = 0.7;
const CACHE_SAVING = 0.9;          // 캐시 히트 토큰은 원가 10%
const effectiveInput = (n) => n * (1 - CACHE_HIT_RATIO * CACHE_SAVING);

const STAGES = [
  { name: '6인 1차 회의',      model: 'opus',   in: 60_000, out: 10_000, perPart: false, cacheable: true  },
  { name: '스크립트 작성',      model: 'opus',   in: 35_000, out: 12_000, perPart: true,  cacheable: true  }, // O8·O9·O10 반영 -12.5%
  { name: '6인 2차 검수 (diff)', model: 'opus',  in: 28_000, out:  6_000, perPart: false, cacheable: true  }, // T3-C diff-only
  { name: 'slide-composer',   model: 'sonnet', in: 22_000, out:  7_000, perPart: true,  cacheable: true  }, // O14: slide-planner + bullet-writer 통합
  { name: 'svg-designer (파트)', model: 'opus', in: 28_000, out: 10_000, perPart: true,  cacheable: true  }, // T3-A 파트 단위 1회
  { name: 'html-renderer',    model: 'sonnet', in:  8_000, out:  7_000, perPart: true,  cacheable: true  },
  { name: 'brand-injector',   model: 'sonnet', in:  5_000, out:  2_000, perPart: false, cacheable: true  }, // v1.2 신규 · 1회만
  { name: 'demo-kit-builder', model: 'sonnet', in: 10_000, out:  4_000, perPart: true,  cacheable: true  },
  { name: 'qa-validator (증분)', model: 'haiku', in: 12_000, out: 2_000, perPart: true,  cacheable: true  }  // O12 Haiku 승격·T3-D 증분
];

function estimate(totalParts, batchDiscount = false) {
  let totalIn = 0, totalOut = 0, totalCost = 0;
  const rows = [];
  for (const s of STAGES) {
    const n = s.perPart ? totalParts : 1;
    const inTok = s.in * n;
    const outTok = s.out * n;
    const effIn = s.cacheable ? effectiveInput(inTok) : inTok;
    // 배치 할인: perPart 단계의 part-02~N만 50% (part-01은 실시간)
    let batchFactor = 1;
    if (batchDiscount && s.perPart && totalParts > 1) {
      batchFactor = (1 + (totalParts - 1) * 0.5) / totalParts;
    }
    const cost = (effIn * PRICING[s.model].in + outTok * PRICING[s.model].out) * batchFactor;
    totalIn += inTok; totalOut += outTok; totalCost += cost;
    rows.push({ stage: s.name, model: s.model, n, inTok, outTok, cost });
  }
  return { rows, totalIn, totalOut, totalCost };
}

function fmt(n) { return n.toLocaleString('en-US'); }
function money(n) { return '$' + n.toFixed(2); }

const parts = parseInt(process.argv[2] || '6', 10);
const batch = process.argv.includes('--batch');
const r = estimate(parts, batch);

console.log(`\n💰 Cost Estimate · ${parts} parts${batch ? ' · BATCH 할인 적용' : ''}\n`);
console.log(`(v1.2 · 캐시 히트율 ${(CACHE_HIT_RATIO * 100)|0}% 가정 · O8·O9·O10·O11·O12·O14 반영)\n`);
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
