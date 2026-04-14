---
name: regenerate-part
description: 특정 파트만 재생성 (단계 3~7 다시 실행). 분할 결과(script_parts)는 재사용.
---

# /regenerate-part — 특정 파트만 재생성

이미 생성된 PPT 중 특정 파트만 다시 만들고 싶을 때 사용.

## 사용법

```
/regenerate-part 02
/regenerate-part 02,05
/regenerate-part 02 --slides=meta,concept
```

## 절차

0. **Phase 0 산출물 확인** (2026-04-13 의무): `_design/` 6개 PPT 산출물 존재 확인. 없으면 먼저 `/generate-ppt` 프로세스로 Phase 0 수행 후 재시도.
1. 파트 번호 검증 (`script_parts/ACT*/part-XX.md` 존재 확인)
2. 기존 `slide_plan/part-XX.json` 삭제
3. 기존 `ppt_parts/part-XX.html` 삭제
4. `slide-planner` 에이전트 호출 (해당 파트만)
5. `bullet-writer` 에이전트 호출
6. `svg-designer` 에이전트 호출
7. `html-renderer` 에이전트 호출
8. `qa-validator` 에이전트 해당 파트만 검증
9. 검증 통과 시 git commit (push는 `--no-push`로 끌 수 있음)

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--slides=meta,concept` | 특정 슬라이드 타입만 재생성 |
| `--no-push` | git push 건너뜀 |
| `--keep-svg` | 기존 SVG 유지, 텍스트만 재작성 |

## 시나리오

**시나리오 1**: 파트 02의 불릿이 맘에 안 듦
```
/regenerate-part 02 --slides=concept
```

**시나리오 2**: SVG가 중복됨
```
/regenerate-part 05
```

**시나리오 3**: 전체 복원 후 다음 파트 생성
```
/regenerate-part 03,04,05
```

## 참조

- `.claude/commands/generate-ppt.md` — 전체 파이프라인
- `.claude/workflows/ppt-generation.md` — 상태 기계
