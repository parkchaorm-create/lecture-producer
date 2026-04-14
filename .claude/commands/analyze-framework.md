---
name: analyze-framework
description: Mode 4 전용 — 퍼스널브랜딩 프레임워크 분석 후 강의 1편 설계. 변형 3종(요약·심화·사례형) 중 사용자 선택.
---

# /analyze-framework

`input/mode-4-framework/` 폴더의 프레임워크 정의를 분석해 강의 1편으로 변환.

## 사용법

```
/analyze-framework [--variant summary|deep|cases]
```

- `--variant` 미지정 시 사용자에게 AskUserQuestion으로 질의

## 입력 형식

`input/mode-4-framework/` 안에 다음 중 하나:
- `framework.md` — 프레임워크 정의 (단계·요소·규칙)
- `framework.json` — 구조화된 정의
- `templates/lecture-brief.md`로 시작하는 기획서 + 프레임워크 첨부

## 변형 3종

### Summary (요약형 · 30~45분)
- 프레임워크의 핵심 5~7개 요소를 빠르게 소개
- 각 요소당 1~2분 + 1개 사례
- 톤: youtube-longform 또는 online-course 짧은 챕터 형식

### Deep (심화형 · 90~120분)
- 각 요소를 단계별 깊게
- 적용 워크북·실습 포함
- 톤: public-lecture 또는 online-course 긴 챕터

### Cases (사례형 · 60~90분)
- 프레임워크 적용 사례 5~8개 중심
- 사례→공통 패턴→프레임워크 도출 역순 구성
- 톤: youtube-longform 또는 online-course

## 절차

1. `input/mode-4-framework/` 파일 Read
2. AskUserQuestion: 변형 3지선다 + 오디언스 4지선다
3. `analyze-framework` 결과를 `_design/framework-analysis.md`에 저장
4. `lecture-writer`에 변형·오디언스·분석 결과 전달
5. 이후는 `/produce-lecture` Stage 2~3와 동일

## 검증

- 프레임워크의 모든 요소가 강의 본문에 1회 이상 등장해야 함 (grep 검증)
- 변형별 분량 budget 준수

## 참조
- `templates/framework-spec.md` — 프레임워크 입력 템플릿
- `.claude/agents/lecture-writer.md` — 후속 작성자
- `.claude/commands/produce-lecture.md` — 메인 파이프라인
