# PPT Generation Workflow (상태 기계)

> `/generate-ppt` 실행 시 따르는 전체 파이프라인 명세. 각 단계의 입력/출력/검증/실패 처리 정의.

## 전체 플로우

```
┌─────────┐
│ [START] │
└────┬────┘
     │
     ▼
┌──────────────────┐
│ 1. INTERVIEW     │ ← 사용자 3가지 질문 (mode/format/partition)
└────┬─────────────┘
     │
     ▼
┌──────────────────────────────┐
│ 1.5. PHASE 0 · PRE-FLIGHT    │ ← ppt-design-pre-flight.md + tutorial-design-pre-flight.md
│   0-A 레퍼런스 Lock           │   산출물: _design/*
│   0-B Deck Outline           │   (2026-04-13 도입 · 5인 회의 합의)
│   0-C Content Policy         │
│   0-D 5인 시각 언어 회의      │
│   0-E 회귀 사례 브리핑        │
│   0-F 정보 밀도 예산          │
└────┬─────────────────────────┘
     │ 검증: _design/ 6개 산출물 모두 존재
     ▼
┌──────────────────┐
│ 2. SPLIT + NORM  │ ← script-splitter 에이전트
│                  │   입력: input/script/*, reference-ppt/*
│                  │   출력: script_parts/ACT*/part-XX.md
└────┬─────────────┘
     │ 검증: 4 ACT + 각 ACT 최소 1파트
     ▼
┌──────────────────┐
│ 3. PLAN          │ ← slide-planner 에이전트 (파트별)
│                  │   입력: script_parts/ACT*/part-XX.md
│                  │   출력: slide_plan/part-XX.json (구조만)
└────┬─────────────┘
     │ 검증: 파트 수 = JSON 수
     ▼
┌──────────────────┐
│ 4. WRITE         │ ← bullet-writer 에이전트 (슬라이드별)
│                  │   입력: slide_plan + 원문
│                  │   출력: slide_plan/part-XX.json (bullets 채움)
└────┬─────────────┘
     │ 검증: 글자수/패턴 규칙
     ▼
┌──────────────────┐
│ 5. DESIGN        │ ← svg-designer 에이전트 (슬라이드별)
│                  │   입력: slide_plan + reference-ppt + svg_components
│                  │   출력: slide_plan/part-XX.json (svg 채움)
└────┬─────────────┘
     │ 검증: 중복률 5% 이하
     ▼
┌──────────────────┐
│ 6. RENDER        │ ← html-renderer 에이전트 (파트별)
│                  │   입력: slide_plan + reference-ppt
│                  │   출력: ppt_parts/part-XX.html
└────┬─────────────┘
     │ 검증: HTML 린트
     ▼
┌──────────────────┐
│ 7. VALIDATE      │ ← qa-validator 에이전트 (전체)
│                  │   입력: ppt_parts/*.html
│                  │   출력: verify-report.json
└────┬─────────────┘
     │ 실패 시 → 단계 3/4/5/6으로 복귀
     ▼
┌──────────────────┐
│ 7.5. DEMO_KIT    │ ← demo-kit-builder 에이전트
│                  │   입력: script_parts/ACT*/part-XX.md
│                  │   출력: DEMO_kit_parts/ACT*/part-XX-kit.md
└────┬─────────────┘
     │ DEMO 0개 파트는 건너뜀
     ▼
┌──────────────────┐
│ 8. THUMBS        │ ← update-index-thumbs.mjs
│                  │   입력: ppt_parts/
│                  │   출력: index.html
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ 9. COMMIT+PUSH   │ ← git (자동, --no-push로 끌 수 있음)
└────┬─────────────┘
     │
     ▼
┌─────────┐
│  [END]  │
└─────────┘
```

## 단계별 상세

### 1. INTERVIEW

**입력**: 없음
**출력**: `config.json` (세션용)
**도구**: AskUserQuestion

질문:
1. mode: split_only | rewrite
2. format: lecture | youtube | auto
3. partition: header | count | topic (+ count 선택 시 N)

**스킵 조건**: `--skip-interview` 플래그 있을 시 기본값 (split_only, auto, header)

### 1.5. PHASE 0 · PRE-FLIGHT (2026-04-13 도입 · 의무)

**입력**: `input/reference-ppt/*`, 사용자 인터뷰 결과
**출력**: `_design/` 폴더 전체

**PPT 트랙** (필수 6 산출물):
- `_design/reference-lock.json`
- `_design/deck-outline.md`
- `_design/content-policy.md`
- `_design/visual-language-meeting.md`
- `_design/regression-briefing.md`
- `_design/density-budget.json`

**튜토리얼 트랙** (DEMO 있는 파트만, 필수 5 산출물 · 파트별):
- `input/materials/ui-captures/` 존재
- `_design/failure-scenarios-<part>.md`
- `_design/walkthrough-<part>.log`
- `_design/tutorial-meeting-<part>.md`
- `_design/user-check-<part>.md` (키트 초안 후)

**검증**: `qa-validator`의 **A0 섹션**. 하나라도 누락 시 단계 2 진입 차단.

**실패 시**: 사용자에게 Phase 0 수행 요청. 자동 생성 불가 (5인 회의·Walk-through는 인간 판단 필요).

**상세**: `.claude/rules/ppt-design-pre-flight.md`, `.claude/rules/tutorial-design-pre-flight.md`

### 2. SPLIT + NORMALIZE

**에이전트**: `script-splitter`
**입력**:
- `input/script/*` (원고)
- `input/reference-ppt/*` (스타일 참조)
- `input/materials/*` (선택)
- config.json

**출력**:
- `script_parts/ACT{1~4}-{name}/part-XX.md` (N개)
- `script_parts/_index.md`
- `script_parts/_act_map.json`

**검증**:
- 4 ACT 폴더 모두 존재
- 각 ACT 최소 1개 파트
- 각 파트에 `[HOOK]`, `[CONCEPT]`, `[RECAP]`, `[BRIDGE]` 섹션
- `_act_map.json` 유효

**실패 시**: 다른 partition 전략으로 재시도. 3회 실패 시 사용자에게 수동 분할 요청.

### 3. PLAN

**에이전트**: `slide-planner`
**반복**: 각 파트별 (N번 호출)
**입력**: `script_parts/ACT*/part-XX.md`
**출력**: `slide_plan/part-XX.json` (구조 스켈레톤)

**검증**:
- JSON 개수 == 파트 개수
- 각 JSON에 `slides` 배열 존재
- 각 slide에 type/index/counter 포함

**실패 시**: 해당 파트만 재실행.

### 4. WRITE (Bullet Writing)

**에이전트**: `bullet-writer`
**반복**: 각 파트별 N번, 각 슬라이드별 M번
**입력**: `slide_plan/part-XX.json` + 원문
**출력**: JSON 업데이트 (bullets, section_title)

**검증**:
- bullet-text 20~30자
- bullet-text 패턴 `{emoji} {keyword} · {core}`
- bullet-detail 원문 근거 존재
- 마크다운 잔재 없음

**실패 시**: 해당 슬라이드만 재실행. 3회 실패 시 수동 개입 요청.

### 5. DESIGN (SVG)

**에이전트**: `svg-designer`
**반복**: 각 슬라이드별
**입력**: JSON + reference-ppt + svg_components/index.json
**출력**: JSON 업데이트 (svg 필드)

**검증**:
- viewBox 정확
- 색상 팔레트 준수
- font-size 11+
- 애니메이션 클래스 1개+
- 중복 hash 없음

**실패 시**: 다른 아키타입 또는 슬롯 변형으로 재시도.

### 6. RENDER (HTML)

**에이전트**: `html-renderer`
**반복**: 각 파트별 N번
**입력**: slide_plan JSON + reference-ppt
**출력**: `ppt_parts/part-XX.html`

**검증**:
- 화살표 `→` 사용
- `toggle-btn` 없음
- 별도 bullet-arrow JS 없음
- 레퍼런스 스타일 블록 포함
- 카운터 정합성

**실패 시**: 템플릿 강제 reset 후 재렌더.

### 7. VALIDATE

**에이전트**: `qa-validator`
**입력**: 모든 `ppt_parts/*.html`
**출력**: `verify-report.json`

**검증**: `.claude/rules/qa-checklist.md` 전 항목

**실패 시**: 책임 에이전트에 매핑하여 해당 단계 재실행.

### 7.5. DEMO_KIT

**에이전트**: `demo-kit-builder`
**입력**:
- `script_parts/ACT*/part-XX.md`
- `script_parts/_act_map.json`

**출력**:
- `DEMO_kit_parts/ACT*/part-XX-kit.md` (DEMO 있는 파트만)
- `DEMO_kit_parts/_index.md`

**검증**: `.claude/rules/demo-kit-format.md` 표준 포맷

**스킵 조건**: DEMO 0개인 파트는 건너뜀

**독립 실행 가능**: `/generate-demo-kits` 슬래시 명령어로 단독 호출 가능

### 8. THUMBS

**도구**: `Bash` (기존 스크립트 실행)
**명령**: `node assets/update-index-thumbs.mjs`
**입력**: `ppt_parts/*.html` + `_act_map.json`
**출력**: `index.html` 업데이트

**ACT별 그룹핑**: 새 버전은 `_act_map.json`을 읽어 ACT별로 썸네일 섹션 분리.

### 9. COMMIT + PUSH

**도구**: `Bash`
**조건**: `--no-push` 없음 AND 모든 검증 통과

**명령**:
```bash
git add script_parts/ slide_plan/ ppt_parts/ DEMO_kit_parts/ index.html assets/svg_components/
git commit -m "feat: auto-generated PPT + DEMO kits from <input-name> (<N> parts)"
git push
```

**실패 시**: 커밋/푸시 중단, 사용자에게 로그 출력.

## 실패 복구 매트릭스

| 실패 단계 | 증상 | 복구 경로 |
|----------|------|----------|
| 1 | 사용자 입력 거부 | 중단, 재시작 |
| 2 | 4 ACT 미달 | partition 전략 변경 후 재시도 |
| 3 | JSON 스키마 오류 | 해당 파트만 재실행 |
| 4 | 글자수 초과 | 해당 슬라이드 재실행 (3회 제한) |
| 5 | SVG 중복 | 다른 아키타입 시도 |
| 6 | HTML 렌더 오류 | 템플릿 reset 후 재렌더 |
| 7 | QA 실패 | 책임 에이전트로 역추적 |
| 8 | 썸네일 오류 | 비치명적, 로그만 남김 |
| 9 | git 오류 | 수동 개입 요청 |

## 병렬 가능 단계

- 단계 3 (PLAN): 파트 수에 따라 병렬 호출 가능
- 단계 4 (WRITE): 파트별 병렬
- 단계 5 (DESIGN): 슬라이드별 병렬 (단, 고유성 검증은 후처리)
- 단계 6 (RENDER): 파트별 병렬

**병렬 제약**: 단계 간에는 순차 실행 필수 (의존성).

## 성능 목표

- 총 파트 수 N일 때:
  - 단계 2: O(1) 한 번
  - 단계 3~6: O(N) 또는 병렬 실행 시 O(log N)
  - 단계 7: O(N) 검증
- 8 파트 기준 약 5~10분 이내 완료 (목표)

## 참조

- `.claude/commands/generate-ppt.md` — 진입점
- `.claude/agents/*` — 각 단계 에이전트
- `.claude/rules/qa-checklist.md` — 검증 기준
