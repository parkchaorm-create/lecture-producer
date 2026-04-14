---
name: generate-demo-kits
description: script_parts의 모든 파트에서 [DEMO] 섹션을 추출하여 복사·붙여넣기 가능한 실습 키트를 DEMO_kit_parts/ 폴더에 생성.
---

# /generate-demo-kits — DEMO 실습 키트 일괄 생성

각 파트의 데모 섹션을 시청자가 영상을 멈추지 않고도 바로 따라할 수 있는 **복사·붙여넣기 키트** 문서로 만든다.

## 사용법

```
/generate-demo-kits
/generate-demo-kits --parts=02,07,10
/generate-demo-kits --no-push
```

## 실행 전 체크

1. `script_parts/` 비어 있지 않은지 확인
   - 비어 있으면 중단:
     ```
     ❌ script_parts/ 폴더가 비어 있습니다.
     
     먼저 /generate-ppt 또는 /split-script로 스크립트를 분할하세요.
     ```

2. `script_parts/_act_map.json` 존재 확인

3. `DEMO_kit_parts/` 폴더 없으면 자동 생성

## 절차

### 1. 파트 목록 수집
- `_act_map.json` Read → 전체 파트 매핑 확인
- `--parts=` 플래그 있으면 해당 파트만 필터링

### 1.5. Phase 0 · Tutorial Pre-Flight 확인 (2026-04-13 · 의무)

각 DEMO 파트별로 아래 산출물 존재 확인. 누락 시 해당 파트 건너뜀 + 사용자에게 보고:
- `input/materials/ui-captures/<tool>/` (UI 스크린샷)
- `_design/failure-scenarios-<part>.md` (10개+)
- `_design/walkthrough-<part>.log` (실제 수행 로그)
- `_design/tutorial-meeting-<part>.md` (5인 회의록)
- `_design/user-check-<part>.md` (초안 완료 후)

상세: `.claude/rules/tutorial-design-pre-flight.md`

### 2. demo-kit-builder 에이전트 호출
- 각 파트별로 호출 (또는 일괄 처리)
- 입력: `script_parts/{ACT}/part-XX.md`
- 출력: `DEMO_kit_parts/{ACT}/part-XX-kit.md`

### 3. DEMO 0개 파트 처리
- DEMO 섹션이 0개인 파트는 키트 생성 건너뜀
- 보고에는 "DEMO 없음" 표시

### 4. `_index.md` 생성
- 전체 키트 목록을 ACT별 표로 정리
- 각 키트의 DEMO 수, 예상 시간 포함

### 5. 검증
- 모든 키트가 표준 포맷 따르는지 확인 (`.claude/rules/demo-kit-format.md`)
- 누락된 키트 없는지 확인

### 6. Git Commit + Push (기본 활성)
- `--no-push` 없으면 자동:
  ```bash
  git add DEMO_kit_parts/
  git commit -m "feat: auto-generated DEMO kits (<N> kits)"
  git push
  ```

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--parts=XX,YY` | 특정 파트만 생성 |
| `--no-push` | git push 건너뜀 |
| `--force` | 기존 키트 덮어쓰기 (기본은 새 키트만) |
| `--dry-run` | 생성 없이 어떤 키트가 만들어질지만 표시 |

## 완료 후 보고

```
✅ DEMO 키트 생성 완료

📁 DEMO_kit_parts/
   ACT 1 (foundation): 0개 키트 (DEMO 없음)
   ACT 2 (skills): 5개 키트 (총 25분)
   ACT 3 (integration): 3개 키트 (총 18분)
   ACT 4 (optimization): 2개 키트 (총 12분)
   
   총 10개 키트, 총 약 55분 분량

🔍 검증: 모든 키트 표준 포맷 통과

🚀 Git: 커밋 + 푸시 완료

다음: DEMO_kit_parts/_index.md 에서 전체 목록 확인
```

## 시나리오

### 시나리오 1: 처음 키트 생성
```
/generate-demo-kits
```
모든 파트의 키트를 일괄 생성.

### 시나리오 2: 특정 파트만
```
/generate-demo-kits --parts=07,10,15
```
선택 파트만 생성/재생성.

### 시나리오 3: 미리보기
```
/generate-demo-kits --dry-run
```
어떤 파트에 키트가 생길지만 표시 (생성 안 함).

### 시나리오 4: 조용히 (푸시 없이)
```
/generate-demo-kits --no-push
```
검토 후 수동 푸시.

## 파이프라인 통합

`/generate-ppt`의 단계 7.5에서 자동 호출됨. 별도로 실행하려면 이 명령어 사용.

## 참조

- `.claude/agents/demo-kit-builder.md` — 키트 생성 에이전트
- `.claude/rules/demo-kit-format.md` — 표준 포맷 SSOT
- `.claude/commands/regenerate-kit.md` — 단일 파트 재생성
- `.claude/workflows/ppt-generation.md` — 워크플로우 단계 7.5
