---
name: regenerate-kit
description: 특정 파트의 DEMO 키트만 재생성. 이미 만들어진 키트가 마음에 안 들거나 원본 스크립트가 수정됐을 때 사용.
---

# /regenerate-kit — 특정 파트 키트만 재생성

이미 생성된 DEMO 키트 중 특정 파트만 다시 만들고 싶을 때 사용.

## 사용법

```
/regenerate-kit 02
/regenerate-kit 02,07
/regenerate-kit 02 --no-push
```

## 절차

0. **Tutorial Phase 0 확인** (2026-04-13 의무): `_design/walkthrough-<part>.log` 등 5개 산출물 존재 확인. 상세: `.claude/rules/tutorial-design-pre-flight.md`
1. 파트 번호 검증 (`script_parts/{ACT}/part-XX.md` 존재 확인)
2. 기존 `DEMO_kit_parts/{ACT}/part-XX-kit.md` 백업 (선택)
3. 기존 키트 삭제
4. `demo-kit-builder` 에이전트 호출 (해당 파트만)
5. 검증 통과 시 git commit (push는 `--no-push`로 끌 수 있음)
6. `_index.md` 업데이트 (새 키트의 시간/DEMO 수 반영)

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--no-push` | git push 건너뜀 |
| `--backup` | 기존 키트를 `.bak` 확장자로 저장 |
| `--diff` | 재생성 후 이전 버전과 diff 표시 |

## 시나리오

### 시나리오 1: 키트 품질 개선
```
/regenerate-kit 07
```
파트 07의 키트가 마음에 안 들 때.

### 시나리오 2: 원본 스크립트 수정 후
```
/regenerate-kit 02,07,10
```
스크립트의 [DEMO] 섹션을 수정한 뒤 키트 동기화.

### 시나리오 3: 백업 + 비교
```
/regenerate-kit 07 --backup --diff
```
이전 키트 보존하면서 새 버전 만들고 diff 보기.

## 완료 후 보고

```
✅ Part 07 DEMO 키트 재생성 완료

📁 DEMO_kit_parts/ACT2-skills/part-07-kit.md
   - DEMO 수: 5
   - 예상 시간: 8분
   - 카테고리: ⌨️ 명령어, 💬 프롬프트, 📁 파일 경로
   - 체크포인트: 3개

🔍 검증: 표준 포맷 통과

🚀 Git: 커밋 + 푸시 완료
```

## 참조

- `.claude/agents/demo-kit-builder.md`
- `.claude/commands/generate-demo-kits.md` — 일괄 생성
- `.claude/rules/demo-kit-format.md`
