---
name: verify-all
description: 현 output/ 전체를 qa-checklist A0~A11로 검증. 생성 없이 검증만. 통과율 %로 리포트.
disable-model-invocation: false
allowed-tools: Read Grep Glob Bash
---

# /verify-all

기존 산출물 상태를 재생성 없이 검증.

## 검증 범위 (A0~A11)

| 섹션 | 내용 |
|------|------|
| A0 | Phase 0 산출물 존재 (_design 6종 + tutorial 5종) |
| A1 | 스크립트 파트 4 ACT 정규화 |
| A2 | 디자인 토큰 준수 (tokens.json 파레트) |
| A3 | 불릿 규칙 (20~30자·이모지·패턴) |
| A4 | HTML 구조 (화살표 · toggle-btn 없음 · 카운터) |
| A5 | SVG 고유성 (중복률 ≤5%·아키타입 분포) |
| A6 | 공통 에셋 링크 방식 |
| A7 | 오디언스 규격 준수 (분량·톤·금지어) |
| A8 | 샘플 e2e 통과 |
| A9 | 퀄리티 베이스라인 |
| **A10** | **통과율 % (v1.1)** |
| **A11** | **접근성 (v1.1)** |

## 실행 스크립트

```
!`node .claude/scripts/portability-check.mjs . 2>&1 | tail -5`
!`node .claude/scripts/theme-lint.mjs . 2>&1 | tail -5`
!`node .claude/scripts/path-lint.mjs . 2>&1 | tail -5`
!`node .claude/scripts/citation-check.mjs output 2>&1 | tail -10`
!`node .claude/scripts/similarity-check.mjs 2>&1 | tail -20`
!`node tests/e2e/smoke.mjs 2>&1 | tail -10`
```

## 출력
- 섹션별 체크리스트 (통과/실패 표시)
- 최종 통과율 % + 미달 항목 목록
- 재실행 권고 (A10 < 95% 시)

## 관련
- 규칙: `.claude/rules/qa-checklist.md`
- 에이전트: `.claude/agents/qa-validator.md`
