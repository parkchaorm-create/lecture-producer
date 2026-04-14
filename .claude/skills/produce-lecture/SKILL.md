---
name: produce-lecture
description: 풀코스 강의 1편을 input 폴더로부터 e2e 자동 생성. 4가지 입력 모드(참고자료·목차·완성 스크립트·프레임워크) × 3 오디언스 + 커스텀. 3단계 파이프라인 · 첫 1강 휴먼인루프 3게이트 · K1 3중 검증 · 파자마보스 테마.
argument-hint: "[--slug <name>] [--theme pajamaboss] [--with-quiz] [--upload-notion] [--asset-base <url>] [--ascii-paths]"
disable-model-invocation: false
---

# /produce-lecture

풀코스 강의 e2e 생성 스킬. 전체 규약은 `.claude/workflows/lecture-production.md` 상태 기계를 따른다.

## 입력 체크리스트
- `input/brief/*` — 강의 기획서 (필수)
- `input/mode-N-*/` 중 하나 — 활성 폴더 (필수)
- `branding/<audience>/` 3종(tone·glossary·persona) — 오디언스 결정 후 로드
- `assets/themes/<theme>/` — 기본 pajamaboss

## 3 Stage 요약

### Stage 1 · INPUT 감지 + 오디언스 확정
1. 활성 mode-N 폴더 스캔 (`input-mode-detection.md` 휴리스틱)
2. AskUserQuestion 4지선다 · 오디언스 확정
3. `output/<slug>/_design/intake.json` 기록
4. `cost-estimator.mjs <part-count>` 출력 + 사용자 확인 (v1.1)
5. `backup.mjs create <slug>` (v1.1 · B5)

### Stage 2 · SCRIPT
1. `expert-council` 1차 회의 (Opus · 60k budget)
2. Phase 0 산출물 6종
3. 모드별 분기 (Mode 1/2 웹리서치 · Mode 3 분할만 · Mode 4 framework 경유)
4. `lecture-writer`로 part-01 스크립트
5. **🔴 G1-Script 게이트** · AskUserQuestion 5지선다 · `_design/human-feedback-01.md` 저장
6. 승인 시 voice-lock.md 자동 생성
7. part-02~N 일괄 (voice-lock + human-feedback 의무 로드)
8. `expert-council` 2차 검수
9. `citation-check.mjs output/<slug>` (v1.1 · E6)

### Stage 3 · PPT + 튜토리얼
1. `regression-briefing.mjs <slug>` (v1.1 · K6)
2. part-01: slide-planner → bullet-writer → svg-designer → html-renderer
3. **🔴 G2-PPT 게이트**
4. part-02~N PPT 일괄
5. part-01 `demo-kit-builder`
6. **🔴 G3-Tutorial 게이트**
7. part-02~N 튜토리얼 일괄
8. (옵션) `notion-uploader` — NOTION_TOKEN 있을 때
9. `qa-validator` A0~A11 전체 (v1.1 포함)
10. `similarity-check.mjs` (v1.1 · K2)
11. `ppt/index.html` 강의 목차 생성
12. `_postmortem.md` 작성 (K7)

## 휴먼인루프 5지선다 (H2)
각 G1·G2·G3 게이트에서:
1. 승인 / 2. 톤만 수정 / 3. 구조 재설계 / 4. 재시도 / 5. 중단

선택 + 자유 텍스트 → `_design/human-feedback-<part>.md` 영구 저장.

## 출력 구조

```
output/<slug>/
├── _meta.json · _design/ · _backup/<ts>/
├── script_parts/ACT{1-4}/
├── ppt/ · tutorials/
├── slide_plan/ · _viz_review/
└── _postmortem.md
```

## 관련 문서
- 워크플로우: `.claude/workflows/lecture-production.md`
- 휴먼인루프: `.claude/rules/human-in-loop.md`
- 토큰 Budget: `.claude/rules/token-optimization.md`
- 퀄리티 방법론: `.claude/rules/quality-method.md`
- 오디언스: `.claude/rules/audience-profiles.md`
- 디자인 토큰: `assets/themes/pajamaboss/tokens.json`
