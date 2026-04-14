---
name: analyze-framework
description: Mode 4 전용 — 퍼스널브랜딩·방법론 프레임워크를 강의 1편으로 변환. 3가지 변형(요약·심화·사례형) 중 사용자 선택.
argument-hint: "[--variant summary|deep|cases]"
disable-model-invocation: false
---

# /analyze-framework

`input/mode-4-framework/`의 프레임워크 정의를 읽어 강의 1편을 설계.

## 입력
- `input/mode-4-framework/framework.md` 또는 `.json`
- `input/brief/*` 기획서

## 변형 3종

| 변형 | 시간 | 특징 | 권장 오디언스 |
|------|------|------|--------------|
| summary | 30~45분 | 핵심 5~7요소 빠른 소개 | youtube / online |
| deep | 90~120분 | 각 요소 단계별 + 실습 | public-lecture / online |
| cases | 60~90분 | 사례 5~8개 → 패턴 역도출 | youtube / online |

## 절차
1. `framework.md` Read
2. AskUserQuestion: 변형 3지선다 + 오디언스 4지선다
3. `_design/framework-analysis.md` 작성
4. `lecture-writer`에 변형·오디언스·분석 결과 전달
5. 이후 Stage 2~3는 `/produce-lecture` 그대로

## 검증
- 프레임워크의 모든 요소가 강의 본문 1회+ 등장 (grep)
- 변형별 분량 budget 준수 (`script-splitter-budget.md`)

## 관련
- 템플릿: `templates/framework-spec.md`
- 후속: `.claude/skills/produce-lecture/SKILL.md`
