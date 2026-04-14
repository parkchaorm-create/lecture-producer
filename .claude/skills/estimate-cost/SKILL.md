---
name: estimate-cost
description: 풀코스 강의 제작 예상 토큰·비용 사전 표시. 파트 수를 인자로 받음. /produce-lecture 실행 전 의사결정 돕기.
argument-hint: "<part-count>"
disable-model-invocation: false
allowed-tools: Bash
---

# /estimate-cost

강의 제작에 필요한 예상 비용을 단계별로 표시.

## 사용 예
```
/estimate-cost 6
/estimate-cost 9
```

## 실행

!`node .claude/scripts/cost-estimator.mjs $ARGUMENTS`

## 가격 기준 (변동 가능)
- Opus 4.6: input $15/M · output $75/M
- Sonnet 4.6: input $3/M · output $15/M
- Haiku 4.5: input $1/M · output $5/M

## 단계별 Budget (rules/token-optimization.md · C7')
- 6인 회의 1·2차 (Opus · 60k in / 10k out)
- 스크립트 작성 (Opus · 40k + 12k × N)
- 렌더 (Sonnet · 합산 ~52k × N)
- 검증 (Sonnet · 15k × N)

## 참조
- 스크립트: `.claude/scripts/cost-estimator.mjs`
- 규칙: `.claude/rules/token-optimization.md`
