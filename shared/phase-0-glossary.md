# Phase 0 Glossary (공유 용어 사전)

> **목적**: 모든 에이전트·규칙이 반복 설명하던 "Phase 0" 개념을 1곳에 통합. 각 에이전트는 이 파일 경로 1줄만 참조.
> **토큰 절감**: O10 · 에이전트·규칙에서 중복 제거로 약 3% 입력 절감.

## Phase 0이란

`/produce-lecture` 파이프라인에서 **Stage 2(SCRIPT) 진입 전 반드시 통과해야 하는 사전 설계 단계**. 6인 전문가 회의·정책 결정·레퍼런스 잠금 등을 묶어 Phase 0 산출물 6+5종을 `_design/` 하위에 생성.

## 산출물 (PPT 트랙 · 6종 필수)

1. `_design/reference-lock.json` — `templates/reference-ppt/` 해시 잠금
2. `_design/deck-outline.md` — 전 파트 슬라이드 구조·아키타입 분포표
3. `_design/content-policy.md` — 시간/이모지/톤/숫자/외래어 표기 정책 체크
4. `_design/visual-language-meeting.md` — 6인 시각 언어 회의록
5. `_design/regression-briefing.md` — 최근 HIGH 사례 5건 (K6 자동 주입)
6. `_design/density-budget.json` — 슬라이드 유형별 bullet 수·SVG 텍스트 수 상한

## 산출물 (Tutorial 트랙 · DEMO 있는 파트별 5종 필수)

1. `input/materials/ui-captures/` — 도구별 UI 스크린샷
2. `_design/failure-scenarios-<part>.md` — 예상 실패 10개
3. `_design/walkthrough-<part>.log` — 실제 수행 로그
4. `_design/tutorial-meeting-<part>.md` — 튜토리얼 5인 회의록
5. `_design/user-check-<part>.md` — 사용자 확인 3질문

## 차단 정책

- `_design/` 산출물 미완성 시 **Stage 2 진입 금지** (A0-FAIL)
- `qa-validator`가 파이프라인 시작 시 체크, 누락 발견 시 중단

## v1.2 (2026-04-14) 추가

- `_design/council-v1.md` · `council-v2.md` — 6인 회의록 풀버전 (inline에는 ≤500자 요약만 · B7)
- `_design/intake.json` — Stage 1 결과 (오디언스·모드)
- `_design/voice-lock.md` — 1강 톤 잠금 (G1 승인 후)
- `_design/human-feedback-<part>.md` — 휴먼인루프 피드백 누적
- `_design/framework-analysis.md` — Mode 4 전용

## 참조

- `.claude/rules/ppt-design-pre-flight.md` — Phase 0 PPT 트랙 상세
- `.claude/rules/tutorial-design-pre-flight.md` — Phase 0 Tutorial 트랙 상세
- `.claude/rules/qa-checklist.md` A0 — 산출물 검증
- `.claude/workflows/lecture-production.md` — 상태 기계
