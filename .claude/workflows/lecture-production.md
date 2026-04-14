# Lecture Production Workflow (상태 기계)

> `/produce-lecture` 실행 시 따르는 상태 기계. H1~H4 휴먼인루프 + E1~E6 오류 처리 + K1 3중 검증 통합.

## 상태 다이어그램

```
[START]
  ↓
S1. INPUT 감지 (input-mode-detection)
  ↓
S2. 오디언스 확정 (AskUserQuestion 4지선다)
  ↓
S3. intake.json 저장 + 비용 사전 표시
  ↓
S4. Phase 0 · expert-council 1차 회의 ──┐
  ↓                                    │ 60k 토큰 budget
S5. Phase 0 산출물 6종 생성              │
  ↓                                    │
S6. (모드 분기)                          │
  ├─ Mode 1/2 → WebSearch + lecture-writer
  ├─ Mode 3 → script-splitter만
  └─ Mode 4 → analyze-framework → lecture-writer
  ↓
S7. part-01 스크립트 완성
  ↓
  🔴 G1-Script 게이트 (H1)
     AskUserQuestion 5지선다 → _design/human-feedback-01.md
  ↓ (승인 시)
S8. voice-lock.md 생성
  ↓
S9. part-02~N 스크립트 일괄 (voice-lock·feedback 의무 로드)
  ↓
S10. Phase 2 · expert-council 2차 검수
  ↓
S11. part-01 PPT 렌더 (slide-planner → bullet-writer → svg-designer → html-renderer)
  ↓
  🔴 G2-PPT 게이트 (H1)
  ↓ (승인 시)
S12. part-02~N PPT 일괄
  ↓
S13. part-01 튜토리얼 생성 (demo-kit-builder)
  ↓
  🔴 G3-Tutorial 게이트 (H1)
  ↓ (승인 시)
S14. part-02~N 튜토리얼 일괄
  ↓
S15. qa-validator A0~A9 검증
     ├─ 자동 (K1 층 1)
     ├─ 시각 Playwright (K1 층 2 · v1.1)
     └─ 인간 3 게이트 (K1 층 3)
  ↓
S16. ppt/index.html 강의 목차 생성
  ↓
S17. (옵션) notion-uploader → tutorials
  ↓
S18. _postmortem.md 작성 (K7)
  ↓
[END · 출시]
```

## 게이트 실패 시 복구

- G1 실패 (톤 수정) → S6 재실행, voice-lock 파라미터 강화
- G2 실패 (구조 재설계) → S11의 slide-planner부터 재실행
- G3 실패 (재시도) → S13 재실행
- 중단 → S18 작성 후 파이프라인 종료 (산출물 보존)

## 자동 백업 (B5)

각 Stage 진입 전 `output/<slug>/_backup/<timestamp>/`에 현재 상태 복사. 사용자가 `rollback <timestamp>` 시 복구.

## 토큰 Budget 차단

각 에이전트 호출 전 예산 확인 (token-optimization.md C7'). 초과 시 사용자 확인 후 진행.

## 참조

- `.claude/rules/human-in-loop.md` — H1~H4
- `.claude/rules/error-handling.md` — E1~E6
- `.claude/rules/quality-method.md` — K1~K7
- `.claude/rules/token-optimization.md` — Budget
- `.claude/commands/produce-lecture.md` — 엔트리포인트
