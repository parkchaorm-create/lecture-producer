---
name: produce-lecture
description: 풀코스 강의 1편을 input 폴더로부터 e2e 자동 생성. 3단계 파이프라인 + 첫 1강 휴먼인루프 게이트.
---

# /produce-lecture

풀코스 강의 1편 e2e 생성. 4가지 입력 모드 × 4가지 오디언스 × 파자마보스 테마.

## 사용법

```
/produce-lecture [--slug <name>] [--theme <name>] [--brand <brand-slug>] [--with-quiz] [--upload-notion] [--ascii-paths] [--asset-base <url>] [--batch] [--plan-only] [--skip-hil]
```

## 옵션
- `--slug <name>` — 강의 식별자 (영문 kebab-case). 미지정 시 brief에서 자동 추출 또는 사용자 질의
- `--theme <name>` — 시각 테마. 기본 `pajamaboss`
- `--brand <brand-slug>` — 제공자 브랜드 (v1.2) · 미지정 시 `_default` 중립 브랜드
- `--with-quiz` — 강 끝에 평가 슬라이드 자동 추가 (v1.1)
- `--upload-notion` — 튜토리얼을 노션으로 업로드 (NOTION_TOKEN 필요)
- `--ascii-paths` — 출력 파일명을 ASCII slug로 (Windows 경로 길이 회피용)
- `--asset-base <url>` — assets를 절대 URL로 (CDN/GitHub Pages 배포용)
- `--batch` — **v1.2 O13** · 1강 승인 후 2~N강을 Message Batches API로 묶어 50% 할인. `ANTHROPIC_API_KEY` 필요
- `--plan-only` — **v1.2 O14 legacy** · slide-composer 대신 기존 slide-planner + bullet-writer 2단계 사용
- `--skip-hil` — (위험) 휴먼인루프 3게이트 모두 자동 승인. 운영 환경 금지 · 개발 전용
- `--deploy [worktree|separate:<o>/<r>|local]` — **v1.2** · 모든 강 완성 후 GitHub Pages 자동 배포 (상대경로 rewrite 포함)

## 파이프라인 (3 Stage)

### Stage 1 · INPUT 감지 + 오디언스 확정
1. `input/mode-N-*/` 스캔 → 활성 모드 판정 (input-mode-detection.md 휴리스틱)
2. `input/brief/`에서 강의 슬러그·제목 추출
3. AskUserQuestion: 오디언스 4지선다 (public-lecture / youtube-longform / online-course / 사용자 추가)
4. 결과를 `output/<slug>/_design/intake.json`에 기록
5. 비용 사전 표시 (cost-estimator.mjs · v1.1)

### Stage 2 · SCRIPT 제작
1. **Phase 0**: `expert-council` 1차 회의 → `_design/council-v1.md`
2. **Phase 0 산출물 6종** 생성 (ppt-design-pre-flight.md)
3. 모드별 분기:
   - Mode 1 / 2 → `lecture-writer` + WebSearch 최신성
   - Mode 3 → `script-splitter` 분할만
   - Mode 4 → `analyze-framework` → `lecture-writer`
4. 강별 스크립트 → `output/<slug>/script_parts/ACT{1-4}/part-XX.md`
5. **🔴 H1 게이트**: 1강 스크립트 완성 후 사용자 승인 필수
6. 승인 시 2~N강 일괄 작성. voice-lock.md 의무 로드
7. **Phase 2**: `expert-council` 2차 검수 → `_design/council-v2.md`

### Stage 3 · PPT + 실습 튜토리얼
1. 강별 [DEMO] 외 본문 → `slide-planner` → `bullet-writer` → `svg-designer` → `html-renderer`
2. 출력: `output/<slug>/ppt/NN강_<제목>.html`
3. **🔴 H2 게이트**: 1강 PPT 완성 후 사용자 승인 필수
4. 강별 [DEMO] → `demo-kit-builder` → `output/<slug>/tutorials/NN강_<제목>-kit.md`
5. **🔴 H3 게이트**: 1강 튜토리얼 완성 후 사용자 승인 필수
6. 승인 시 2~N강 일괄 진행
7. (옵션) `--upload-notion` → `notion-uploader`
8. `qa-validator`로 A0~A9 전체 검증
9. `output/<slug>/ppt/index.html` 강의 목차 자동 생성
10. `output/<slug>/_postmortem.md` 작성

## 휴먼인루프 5지선다 (H2)

각 게이트에서:
1. 승인 (다음 단계 진행)
2. 톤만 수정 (lecture-writer 재실행, 구조 유지)
3. 구조 재설계 (slide-planner부터 재실행)
4. 재시도 (동일 에이전트 재호출)
5. 중단 (파이프라인 종료, 산출물 보존)

선택 + 자유 텍스트 코멘트 → `_design/human-feedback-<part>.md` 영구 저장

## 출력 구조

```
output/<lecture-slug>/
├── _meta.json
├── _design/                # Phase 0 산출물 + 회의록 + 피드백
├── _backup/<timestamp>/    # 자동 백업 (B5)
├── script_parts/ACT{1-4}/
├── ppt/
│   ├── index.html
│   └── NN강_<제목>.html
├── tutorials/
│   └── NN강_<제목>-kit.md
├── slide_plan/             # 중간 JSON
├── _viz_review/            # Playwright 캡처
├── _notion-upload.log      # (옵션)
└── _postmortem.md
```

## 사전 조건
- `input/brief/` 비어 있지 않음
- `input/mode-N-*/` 중 하나 이상 활성
- `branding/<audience>/` 3종(tone·glossary·persona) 존재
- `assets/themes/<theme>/` 존재 (기본 pajamaboss)

## 참조
- `.claude/workflows/lecture-production.md` — 상태 기계
- `.claude/rules/human-in-loop.md` — H1~H4
- `.claude/rules/audience-profiles.md` — 오디언스 매트릭스
- `.claude/rules/input-mode-detection.md` — 모드 휴리스틱
