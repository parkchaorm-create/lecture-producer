# Quality Method (최고 퀄리티 도달 방법론 SSOT)

> 사용자 직접 지시 (2026-04-14): 최고 퀄리티 보장 방법.

## K1 · 3중 검증 의무 (v1.0 필수)

모든 산출물은 아래 3개 층 **모두** 통과해야 릴리스. 한 층이라도 빠지면 출시 금지.

| 층 | 방법 | 담당 |
|----|------|------|
| **자동** | qa-checklist A0~A9, theme-lint, portability-check | qa-validator |
| **시각** | Playwright 캡처 + svg-self-verify | svg-designer + capture script |
| **인간** | H1~H3 게이트 | 사용자 (AskUserQuestion) |

## K2 · 레퍼런스 비교 (v1.1)

매 산출물을 골드 샘플과 자동 비교:
- **구조 hash**: 섹션 순서·타입 분포
- **밀도**: bullet 수·SVG 텍스트 수
- **색상 분포**: SVG 팔레트 사용 비율

유사도 ≤80% 시 재작성. `.claude/scripts/similarity-check.mjs` (v1.1).

## K3 · 반복 정련 루프 (v1.0)

**"첫 산출은 80% 퀄리티"** 전제.

각 에이전트 작업 후:
1. 자체 self-critique 1회 (페르소나 P1~P4 기준 + 금지어 + 출처)
2. 비평 결과 반영해 수정
3. 그 후에야 다음 에이전트·사용자에게 제출

## K4 · 금지어/필수어 사전 (v1.0)

`branding/<audience>/glossary.md`를 모든 생성물 작성 **전·후** grep:
- 전: 시스템 프롬프트에 "이 단어 쓰지 마라" 주입
- 후: 결과 grep 검증, 1건이라도 검출 시 재작성

## K5 · 실측 우선 (v1.1)

추정 금지. 아래만 신뢰:
- 좌표 · 크기: Playwright `getBBox()` 실측
- 글자 수: `(str.length)` 직접 계산
- 웹 사실: WebSearch 결과의 1차 출처
- 시간: 실제 스크립트 낭독 시간(분당 300자 기준)

## K6 · 회귀 사례 강제 학습 (v1.1)

`regression-briefing.md` (기존 visual-verification.md의 발견 사례 누적분)을:
- svg-designer·html-renderer·lecture-writer 시스템 프롬프트에 **의무 주입**
- 최근 5건 + 심각도 HIGH 전부

## K7 · 포스트모템 (v1.0)

매 강의 완성 후 `output/<slug>/_postmortem.md` 작성:
- 총 소요 시간·토큰 수·비용
- 재시도 발생 단계와 횟수
- 사용자 피드백 요약
- 다음 강의에서 회피할 패턴

신규 강의 시작 시 lecture-writer가 기존 `_postmortem.md` 전부 읽어 학습.

## 릴리스 게이트 (v1.0 DoD)

K1 + K3 + K4 + K7 모두 통과 = v1.0 Definition of Done의 퀄리티 조항 충족.

## 참조

- `.claude/rules/human-in-loop.md` — K1의 인간 층
- `.claude/rules/error-handling.md` — E계층과의 연계
- `samples/_gold-standard/` — 골드 베이스라인
- `_postmortem.md` — K7 산출물 위치
