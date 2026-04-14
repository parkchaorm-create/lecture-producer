---
name: verify-all
description: 현재 ppt_parts/ 전체를 QA 체크리스트로 검증 (생성 없이 검증만).
---

# /verify-all — 전체 PPT 검증

생성된 PPT에 문제가 있는지 `qa-validator` 에이전트를 호출해 전체 검증한다.

## 사용법

```
/verify-all
/verify-all --parts=02,05
/verify-all --phase=runtime
```

## 절차

1. `qa-validator` 에이전트 호출
2. **Phase 0 (A0) 산출물 검증 먼저** — `_design/` 6개 (+튜토리얼 5개/파트) 존재 확인 (2026-04-13 의무)
3. `.claude/rules/qa-checklist.md` 전 항목 체크 (A1~A6, B1~B4, C1~C6)
4. **시각 검증** — `--playwright` 플래그 또는 기본 포함 시 캡처 + overlap 검사 (`.claude/rules/visual-verification.md`)
5. `verify-report.json` 생성
6. 콘솔에 요약 출력

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--parts=XX,YY` | 특정 파트만 검증 |
| `--phase=preventive|runtime|regression` | 특정 단계만 |
| `--fix` | 자동 수정 가능한 항목 고침 (화살표, 고아 `});` 등) |
| `--playwright` | Playwright 런타임 테스트 포함 (Node 필요) |

## 시나리오

**시나리오 1: 빠른 체크**
```
/verify-all
```

**시나리오 2: 특정 파트**
```
/verify-all --parts=03
```

**시나리오 3: 자동 수정**
```
/verify-all --fix
# 화살표 ↓ → → 자동 변환, 고아 }); 자동 제거 등
```

**시나리오 4: 런타임까지**
```
/verify-all --playwright
# 브라우저에서 실제 렌더링 테스트
```

## 실패 시

문제 발견 시 책임 에이전트 + 재실행 명령 제시:
```
❌ 3 issues found

1. ppt_parts/part-03.html: bullet-text 35자 초과 (slide 4, bullet 2)
   → 해결: /regenerate-part 03 --slides=concept

2. ppt_parts/part-05.html: SVG 중복 (part-02와 동일 hash)
   → 해결: /regenerate-part 05

3. ppt_parts/part-07.html: 화살표 ↓ 잔존 (5곳)
   → 해결: /verify-all --fix
```

## 참조

- `.claude/agents/qa-validator.md` — 검증 에이전트
- `.claude/rules/qa-checklist.md` — 검증 항목
