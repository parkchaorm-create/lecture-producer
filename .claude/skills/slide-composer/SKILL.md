---
name: slide-composer
description: 파트 1개를 슬라이드 구조 + 불릿 텍스트·디테일로 1회 호출 생성. slide-planner + bullet-writer 통합 (v1.2 O14). --plan-only 시 구조만.
argument-hint: "<partNum> [--plan-only]"
disable-model-invocation: false
---

# /slide-composer

파트 원고 → slide_plan JSON 단일 호출 생성.

## 기본 호출

```
/slide-composer 01
```
→ `output/<slug>/slide_plan/part-01.json` 생성 (slides[] · 각 슬라이드에 structure + bullets)

## 구조만 생성 (legacy 호환)

```
/slide-composer 01 --plan-only
```
→ bullets 배열 빈 상태 · 이후 `bullet-writer`가 별도 채움

## 입력
- `output/<slug>/script_parts/ACT*/part-$ARGUMENTS[0].md`
- `_design/voice-lock.md` (2강 이후)
- `branding/<audience>/` 3종

## 출력
- `output/<slug>/slide_plan/part-$ARGUMENTS[0].json`

## 관련
- 에이전트: `.claude/agents/slide-composer.md`
- 규칙: `.claude/rules/bullet-writing.md` · `html-structure.md`
- 효과: slide-planner + bullet-writer 2호출 → 1호출 · 오버헤드 -30%
