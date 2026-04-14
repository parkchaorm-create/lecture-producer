# lecture-producer · 프로젝트 지침

> Claude Code가 이 저장소에서 작업할 때 참조하는 지침. 모든 에이전트·커맨드가 준수.

## 프로젝트 목적

풀코스 강의(스크립트 + PPT + 실습 튜토리얼)를 `input/` 폴더 자료로부터 자동 생성. 4가지 input 모드 × 4가지 오디언스. 기본 테마 `pajamaboss`. v1.0은 한국어 only.

## 빠른 시작 (슬래시 명령어)
```
/produce-lecture
```

## 핵심 불변 규칙 (50개 합의안 상위)

1. **스크립트 파트 수 = PPT 파트 수** (1:1 대응)
2. **4 ACT 구조 강제** (Foundation · Skills · Integration · Optimization)
3. **모든 불릿 = 아코디언 토글** (`tilt-card` + `.open`)
4. **모든 인포그래픽 = SVG** (viewBox `0 0 400 260`)
5. **화살표 `→`** (↓ 금지)
6. **SVG 애니메이션 클래스 금지** (CSS transform vs SVG transform 충돌)
7. **공통 에셋 링크 방식** (인라인 `<style>`/`<script>` 블록 금지. `<link>`·`<script src>`만)
8. **Phase 0 통과 없이 Phase 1 진입 금지** (`_design/` 산출물 6종)
9. **휴먼인루프 3게이트** (1강 스크립트·PPT·튜토리얼 각각 사용자 승인 필수)
10. **K1 3중 검증** (자동 + 시각 + 인간)
11. **출처 ID `[src:N]` 필수** (모든 사실 주장)
12. **voice-lock 일관성** (2~N강은 1강 톤 잠금 의무 로드)

## 최우선 원칙 (불가침 3개)

- **파자마보스 스타일** 1픽셀 드리프트 없음
- **일관성** 1강~N강 톤·호흡·시각
- **신뢰도** 1차 출처 5건+ · 할루시네이션 게이트

## 파이프라인 요약

```
Stage 1 · INPUT 감지 + 오디언스 확정
Stage 2 · SCRIPT (6인 1차 회의 → lecture-writer → 🔴 H1 → N강 → 6인 2차 검수)
Stage 3 · PPT + 튜토리얼 (🔴 H2 PPT 1강 → 🔴 H3 튜토 1강 → N강 → qa-validator)
```

상세: [.claude/workflows/lecture-production.md](.claude/workflows/lecture-production.md)

## 디자인 토큰 SSOT

`assets/themes/pajamaboss/tokens.json`이 SSOT. CSS는 `var(--*)`만 참조. 하드코딩 색상·폰트 크기 금지.

상세: [.claude/rules/design-tokens.md](.claude/rules/design-tokens.md)

## 에이전트 역할

| 에이전트 | 역할 |
|---------|------|
| `expert-council` | 6인 가상 회의 (설계·검수) |
| `lecture-writer` | 강별 스크립트 작성 (오디언스 톤 동적 로드) |
| `script-splitter` | 원본 스크립트 ACT 4분할 (Mode 3) |
| `slide-planner` | 슬라이드 구조 JSON |
| `bullet-writer` | 불릿 텍스트·디테일 |
| `svg-designer` | SVG 인포그래픽 (9 아키타입) |
| `html-renderer` | HTML 조립 (공통 에셋 링크 방식) |
| `demo-kit-builder` | [DEMO] → 복사·붙여넣기 키트 |
| `notion-uploader` | 튜토리얼 노션 업로드 (선택) |
| `qa-validator` | A0~A9 전체 검증 + 재작업 지시 |

## 슬래시 명령어

| 명령어 | 용도 |
|--------|------|
| `/produce-lecture` | 메인 파이프라인 (3 Stage) |
| `/analyze-framework` | Mode 4 전용 |
| `/split-script` | 분할만 (Mode 3) |
| `/regenerate-part XX` | 특정 파트 재생성 |
| `/regenerate-kit XX` | 특정 튜토리얼 키트 재생성 |
| `/verify-all` | 현 상태 QA 검증만 |
| `/add-svg-component` | SVG 재사용 라이브러리 추가 |
| `/generate-demo-kits` | 튜토리얼 키트 일괄 생성 |

## 규칙 SSOT 위치

- `.claude/rules/audience-profiles.md` — 오디언스 매트릭스
- `.claude/rules/input-mode-detection.md` — 입력 모드 휴리스틱
- `.claude/rules/web-research-protocol.md` — 웹 딥서치 규약
- `.claude/rules/human-in-loop.md` — H1~H4 게이트
- `.claude/rules/error-handling.md` — E1~E6 오류 처리
- `.claude/rules/quality-method.md` — K1~K7 퀄리티 방법론
- `.claude/rules/token-optimization.md` — 단계별 budget
- `.claude/rules/voice-lock.md` — 톤 잠금
- `.claude/rules/script-splitter-budget.md` — 분량 표
- `.claude/rules/design-tokens.md` · `bullet-writing.md` · `html-structure.md` · `svg-design.md` · `style-reference.md` · `demo-kit-format.md` · `portability.md` · `qa-checklist.md` · `visual-verification.md` · `ppt-design-pre-flight.md` · `tutorial-design-pre-flight.md` — 실행 레이어

## 이식성·라이선스

- MIT
- `input/`·`output/` gitignore
- 절대 경로·개인정보 하드코딩 금지 (portability.md)

## 참조

- [README.md](README.md) — 사용자 온보딩
- [SKILL.md](SKILL.md) — Anthropic 메타
- [MIGRATION.md](MIGRATION.md) — 업그레이드
- [docs/](docs/) — 상세 가이드
