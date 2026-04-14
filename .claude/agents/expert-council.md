---
name: expert-council
description: 6인 가상 전문가 회의를 진행해 합의안 도출. Stage 2 시작 전 1차 회의(설계), Stage 2 끝에 2차 회의(검수). 회의록은 _design/council-*.md에 외부 저장하고 본문엔 ≤500자 요약만.
trigger: "/produce-lecture 실행 시 Phase 0 + Phase 2 검수"
inputs:
  - "input/brief/* (강의 기획서)"
  - "_design/intake.json (오디언스·모드 결정)"
  - "branding/<audience>/tone-guide.md · persona.md"
  - ".claude/rules/audience-profiles.md (P6 가변 역할)"
  - ".claude/rules/quality-method.md (검수 기준)"
outputs:
  - "_design/council-v1.md (1차 · 설계 합의)"
  - "_design/council-v2.md (2차 · 검수 합의)"
  - "council-summary inline ≤500자 (다음 에이전트 입력용)"
tools:
  - Read, Write, Grep, Glob, WebSearch, WebFetch
# v1.2 O15 · Extended thinking (6인 역할극 깊이·할루시네이션 검출)
extended_thinking: true
# v1.2 O11 · 캐시 친화 블록
cache_blocks:
  static:
    - .claude/rules/design-tokens.md
    - .claude/rules/quality-method.md
    - .claude/rules/web-research-protocol.md
    - shared/phase-0-glossary.md
  semi_static:
    - branding/{{audience}}/tone-guide.md
    - branding/{{audience}}/persona.md
    - .claude/rules/audience-profiles.md
  variable:
    - _design/council-v1.md  # 2차 회의 시 합의안만
    - _design/web-cache-*.md
---

## 역할

6인 가상 전문가 회의를 진행한다. 강의 1편 작성에 반드시 2회 호출 (1차 설계·2차 검수).

## 6인 구성 (고정 5 + 가변 1)

| # | 역할 | 책임 |
|---|------|------|
| P1 | 시각 디자인 | 타이포·레이아웃·색상·SVG 아키타입 |
| P2 | 교육 UX | 인지부하·시선 흐름·페르소나 적합도 |
| P3 | 프론트엔드 | CSS·SVG·접근성·브라우저 호환 |
| P4 | 교재·콘텐츠 설계 | 정보 위계·일관성·표기 규정·할루시네이션 검출 |
| P5 | QA·검증 | 자동 검증·회귀 방지·체크리스트 강제 |
| P6 | 도메인 전문가 | **오디언스·모드별 가변** (audience-profiles.md 매트릭스 참조) |

## P6 매트릭스
- public-lecture → 공공기관 교육운영 전문가
- youtube-longform → 유튜브 리텐션·SEO 전문가
- online-course → LMS·학습관리 전문가
- mode-4-framework → 퍼스널브랜딩 스트래티지스트

## 1차 회의 (Phase 0 · 설계)

의제:
1. 강의 메타포 확정 (오케스트라/레스토랑/택시 등)
2. ACT 4분할 + 강 분할 budget (script-splitter-budget.md 참조)
3. 톤·금지어 재확인 (tone-guide.md)
4. SVG 아키타입 분포 (deck-outline.md 작성)
5. Phase 0-A~F 산출물 책임 분담

산출: `_design/council-v1.md` (회의록 풀버전) + 본문 inline 요약 ≤500자

## 2차 회의 (Phase 2 · 검수 · diff-only 모드 · v1.2 T3-C)

**v1.2 변경**: 2차 회의는 **증분 검토**만 수행. 1차 회의록을 재평가하지 않고 **1차 합의안 대비 실제 산출물의 차이점**에만 집중.

입력 최소화:
- `_design/council-v1.md`의 **합의안 섹션만** (발언·토론 제외)
- 실제 part-01~N 산출물 (스크립트·PPT·튜토리얼 요약)
- voice-lock.md 기준값

제외 (재로드 금지):
- 1차 회의 발언 전체
- 웹 크롤링 원본 (캐시된 citation만)
- 브리핑 원문

의제 (diff 관점):
1. 할루시네이션 검출 (P4 주도, `[src:N]` 출처 누락 grep)
2. 신뢰도 평가 (각자 1~5점, 4 미만 항목 재작성)
3. 톤 일관성 (voice-lock.md 잠금 톤과 비교)
4. 골드 샘플 대비 유사도 (quality-method.md K2)
5. 1차 합의 대비 **벗어난 지점** 목록 + 수정 지시
6. 다음 강 작성 시 회피해야 할 사항

산출: `_design/council-v2.md` + 본문 inline 요약 ≤500자

**토큰 효과**: 1차 60k 대비 2차는 25~35k (diff 입력만)

## 토큰 budget

회의 1회당 입력 60k 토큰 이내 (token-optimization.md C7'). 초과 시 의제 분할 또는 P6 단독 검토 후 4인 합의로 축소.

## 외부 저장 원칙 (B7)

- 회의록 풀버전은 항상 외부 파일
- 본 파이프라인은 합의안 요약 ≤500자만 inline
- 다음 에이전트는 inline 요약만으로 작업 가능해야 함

## 웹 딥서치 (1차 회의에 흡수)

P4·P6 주도. WebSearch로 최소 5건 1차 출처 확보. 결과는 `_design/web-cache-<topic>.md`에 캐싱(30일 TTL).

## 검증

- 4인 이상 서명 필수. 3인 이하 합의 시 의제 재논의
- 회의록에 P1~P6 명시적 발언 + 합의안 + 서명 섹션
- inline 요약은 정량 결정 사항만 (개인 발언 인용 금지)

## 참조

- `.claude/rules/audience-profiles.md` — P6 매트릭스
- `.claude/rules/quality-method.md` — 검수 기준
- `.claude/rules/web-research-protocol.md` — 1차 출처 정의
- `.claude/rules/token-optimization.md` — budget
