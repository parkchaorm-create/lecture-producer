# Tutorial Design Pre-Flight (실습 튜토리얼 사전 설계 체크리스트)

> **도입 근거**: `.claude/rules/_meetings/2026-04-13_ppt-tutorial-design-upgrade.md` 5인 회의 합의안.
> **적용 대상**: `DEMO_kit_parts/` 산출물 및 노션 실습 튜토리얼 문서 작성.
> **원칙**: 튜토리얼은 **사전 파일럿(walk-through) 없이** 작성할 수 없다.

## 왜 필요한가

"이 명령을 치면 이런 결과가 나옵니다"를 스크립트 텍스트만 보고 작성하면:
- 실제 UI/CLI 출력과 미묘하게 다름 (버전 차이)
- 예상 실패 시나리오를 뒤늦게 수집 → "자주 발생하는 문제" 섹션이 공허함
- 사용자가 2단계부터 막혀도 키트는 계속 진행

근본 해결: **작성자가 실제로 한 번 수행한 뒤 기록을 바탕으로 작성**.

## Phase 0 · 의무 사전 단계 (5개)

모든 산출물은 `_design/` 폴더에 저장된다.

### Phase 0-A · UI 캡처 수집 (필수)
- 실행: 튜토리얼에 등장하는 모든 도구의 UI 스크린샷을 사전 촬영
- 저장 위치: `input/materials/ui-captures/<tool-name>/NN-<step>.png`
- 예:
  - `input/materials/ui-captures/claude-code/01-install.png`
  - `input/materials/ui-captures/claude-code/02-first-run.png`
- 금지: "아마 이런 화면일 것" 추측으로 설명 작성
- 캡처 없는 도구는 튜토리얼에서 언급 금지 또는 "UI 설명 없이 CLI 명령만" 모드

### Phase 0-B · 실패 시나리오 사전 수집 (필수)
- 실행: 각 파트별로 **예상 실패 최소 10개** 사전 수집
- 산출물: `_design/failure-scenarios-<part>.md`
- 필수 포맷:
  ```markdown
  ## 1. command not found: claude
  - 발생 조건: Claude Code 미설치
  - 재현 단계: ...
  - 해결: ...
  ```
- 검증: 키트의 "🐛 자주 발생하는 문제" 표에 **최소 5개 반영** 필수

### Phase 0-C · Walk-through 로그 (필수)
- 실행: 작성자가 처음부터 끝까지 **실제로 수행**
- 산출물: `_design/walkthrough-<part>.log`
- 기록 내용:
  - 각 명령의 실제 출력 (터미널 로그)
  - 소요 시간 (mm:ss 단위)
  - 중간 막힌 지점 + 어떻게 돌파했는지
  - 최종 성공 스크린샷
- 이 로그 없이 키트 작성 불가

### Phase 0-D · Tutorial 5인 회의 (필수)
- 참석자:
  - P1 시각 디자인 (스크린샷 배치·하이라이트)
  - P2 교육 UX (단계 세분화·인지부하)
  - P3 프론트엔드/엔지니어 (명령어 정확성·OS 분기)
  - P4 교재 설계 (용어·난이도·분량)
  - P5 QA (체크포인트·실패 복구)
- 의제:
  1. 대상 난이도 (초보/중급/고급) 확정
  2. 용어집 확정 (혼동 방지)
  3. OS 분기 범위 (Windows only? macOS 포함?)
  4. 예상 소요 시간 검증
- 산출물: `_design/tutorial-meeting-<part>.md`

### Phase 0-E · 사용자 확인 체크포인트 (필수 · HITL)
- 실행: 키트 초안 완료 후 **실제 사용자(또는 사용자 역할 에이전트)**에게 질의
- 질문:
  1. "이 키트만 보고 처음부터 끝까지 따라할 수 있나요?"
  2. "복사·붙여넣기 영역이 명확한가요?"
  3. "실패 시 복구 안내가 충분한가요?"
- 산출물: `_design/user-check-<part>.md`
- 3가지 중 하나라도 "아니오" → 키트 재작성

## 회의실 5인 구성 (튜토리얼 특화)

| 역할 | 책임 |
|------|------|
| P1 시각 디자인 | 스크린샷·하이라이트·단계 시각 |
| P2 교육 UX | 단계 세분화·실패 복구 경로 |
| P3 엔지니어 | 명령어 정확성·OS 호환·버전 |
| P4 교재 설계 | 용어 일관성·난이도·분량 |
| P5 QA | 체크포인트·사용자 테스트 |

## 검증 체크리스트 (자동)

`demo-kit-builder` 실행 전 아래를 모두 만족해야 함:

- [ ] `input/materials/ui-captures/` 존재 (필요 도구별)
- [ ] `_design/failure-scenarios-<part>.md` 존재 + 10개 이상
- [ ] `_design/walkthrough-<part>.log` 존재 + 최종 성공 표기
- [ ] `_design/tutorial-meeting-<part>.md` 존재 + 4인 이상 서명
- [ ] `_design/user-check-<part>.md` 존재 + 3개 질문 모두 "예"

하나라도 빠지면 해당 파트 키트 생성 **차단**.

## 위반 시 재작업 표시

```
[TUTORIAL-A0-FAIL] Phase 0 산출물 누락 · part-XX
  · 누락: _design/walkthrough-part-02.log
  · 복구: 작성자가 실제 수행 후 로그 제출
```

## 키트 포맷과의 관계

- 이 규칙은 **Phase 0 (사전)** 전용
- 키트 파일 자체의 포맷은 `.claude/rules/demo-kit-format.md` 참조
- demo-kit-builder는 Phase 0 산출물을 **입력**으로 받아 키트를 생성

## 참조

- `.claude/rules/_meetings/2026-04-13_ppt-tutorial-design-upgrade.md` — 도입 회의록
- `.claude/rules/demo-kit-format.md` — 키트 포맷 SSOT
- `.claude/agents/demo-kit-builder.md` — 키트 생성 에이전트
- `.claude/rules/qa-checklist.md` — A0 섹션
- `.claude/workflows/ppt-generation.md` — Phase 0 통합 지점
