# Input Mode Detection (입력 모드 감지 휴리스틱)

> `/produce-lecture` Stage 1에서 4가지 입력 모드를 감지. 사용자 결정 사항: **파일 확장자·내용 휴리스틱 (LLM 판단)** + 애매 시 확인.

## 4가지 모드

| Mode | 폴더 | 입력 | 후속 처리 |
|------|------|------|-----------|
| 1 | `input/mode-1-references/` | 참고자료 다수 + `brief/` | 웹 크롤링 + 자동 목차 설계 |
| 2 | `input/mode-2-outline/` | 목차 md + `brief/` | 웹 보강 + 목차별 스크립트 |
| 3 | `input/mode-3-fullscript/` | 완성 스크립트 + `brief/` | 분할만 (lecture-writer 스킵) |
| 4 | `input/mode-4-framework/` | 프레임워크 정의 + `brief/` | `/analyze-framework` 경유 |

## 감지 절차

1. `input/mode-N-*/` 각 폴더 스캔 → 파일 존재 여부
2. 복수 폴더 활성 시 → AskUserQuestion으로 사용자 선택
3. 단일 폴더 활성 시 → 해당 모드로 자동 진입
4. 빈 상태 시 → 사용법 안내 후 중단

## 휴리스틱 (폴더 명시 외)

사용자가 폴더 구분 없이 `input/`에 파일 쏟아넣은 경우:

| 신호 | 추정 모드 |
|------|-----------|
| 파일 20개+·다양한 확장자(pdf·jpg·md 혼재) | Mode 1 (참고자료) |
| 목차·TOC·차례 단어가 포함된 md 1~2개 | Mode 2 (목차) |
| 10000자+의 본문 md (챕터 구조) | Mode 3 (완성 스크립트) |
| "Step 1:"·"프레임워크"·"방법론" 반복되는 md | Mode 4 (프레임워크) |

LLM이 brief 내용을 읽고 위 신호로 추정 → 확신도 <80% 시 사용자 확인.

## Brief 필수

모든 모드에서 `input/brief/` 비어 있으면 **중단**. 기획서 템플릿 안내:
```
❌ input/brief/ 폴더가 비어 있습니다.

templates/lecture-brief.md를 복사해서 input/brief/에 작성 후 다시 시도하세요.
```

## 애매함 처리

```
🤔 입력 모드가 애매합니다.

감지된 신호:
- mode-1-references/: 3개 파일 (PDF 1, 이미지 2)
- mode-2-outline/: outline.md 1개

[1] Mode 1 (참고자료 기반 · 웹 크롤링 포함)
[2] Mode 2 (목차 기반 · 보강 크롤링만)
[3] 혼합 모드 (Mode 2 사용 + 참고자료를 보조로)
```

## 참조

- `.claude/commands/produce-lecture.md` — Stage 1 진입점
- `templates/lecture-brief.md` — 기획서 템플릿
