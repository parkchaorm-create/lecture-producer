---
name: split-script
description: 원본 스크립트를 4 ACT × 표준 섹션 구조로 분할만 실행 (PPT 생성 없이).
---

# /split-script — 스크립트 분할만 실행

원본 스크립트를 파트별로 분할하여 `script_parts/`에 저장. PPT 생성은 하지 않음.

## 사용법

```
/split-script
/split-script --format=lecture
/split-script --partition=topic
```

## 용도

- PPT 만들기 전에 분할 결과만 먼저 확인
- 분할 결과를 수동 편집한 뒤 이어서 `/generate-ppt --skip-split` 같은 흐름 (추후 지원)
- 다른 용도로 파트별 스크립트가 필요할 때

## 절차

1. `input/script/` 확인 (비어 있으면 중단)
2. Interview (간소화 - Q2, Q3만)
3. `script-splitter` 에이전트 호출
4. 결과 보고:
   ```
   ✅ 스크립트 분할 완료
     - ACT 1: 2개 파트
     - ACT 2: 3개 파트
     - ACT 3: 2개 파트
     - ACT 4: 1개 파트
     - 총 8개 파트
     - DEMO 섹션 5개 식별
   ```

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--format=lecture|youtube|auto` | 스크립트 형식 지정 |
| `--partition=header|count|topic` | 파티셔닝 전략 |
| `--count=N` | partition=count일 때 파트 수 |

## 참조

- `.claude/agents/script-splitter.md`
- `.claude/commands/generate-ppt.md` — 전체 파이프라인
