# Error Handling (오류 처리 SSOT)

> 사용자 직접 지시 (2026-04-14): 오류·검증·문제 해결 표준화.

## E1 · 3계층 오류 분류

| 계층 | 예 | 복구 경로 |
|------|----|-----------|
| **L1 도구 오류** | 파일 없음, 토큰 초과, 네트워크 실패 | 지수 백오프 3회 재시도 (E3) |
| **L2 검증 실패** | qa-checklist A0~A9 위반, 금지어 검출, 출처 누락 | 해당 에이전트 재실행 (최대 2회) |
| **L3 품질 미달** | 골드 베이스라인 미달, 유사도 <80% | 프롬프트 강화 + 1회 재시도 → 안 되면 사용자 알림 |

## E2 · 오류 보고 포맷

모든 런타임 오류 → 아래 3종 필수 출력:

```
🔴 Error · <agent-name> · <phase>

Stack trace:
<full trace>

Reproduce:
<exact command or prompt>

Files involved:
- <path1>
- <path2>

Next action:
<L1 재시도 · L2 에이전트 재호출 · L3 사용자 확인>
```

## E3 · 자동 재시도 정책

- **L1 도구 오류**: 지수 백오프 `[1s, 2s, 4s]` 3회
- **외부 API 401/403**: 재시도 **금지**, 즉시 사용자 알림 (토큰 확인)
- **외부 API 429 (rate limit)**: 백오프 `[5s, 15s, 30s]` 3회
- **외부 API 5xx**: 백오프 `[2s, 6s, 12s]` 3회
- **L2 검증 실패**: 동일 에이전트 재호출 최대 2회 (C7' budget)
- **L3 품질 미달**: 1회 재시도 후 사용자 확인

## E4 · 시각 검증 실패 (v1.1)

Playwright 캡처 검증 실패 시:
- `_viz_review/<part>/diff/` 폴더에 expected vs actual PNG 사이드바이사이드
- `visual-audit-report.md`에 좌표·원인·제안 수정

## E5 · 콘텐츠 검증 통과율 (v1.1)

자동 검증 결과를 **통과율 %**로 표시:
```
qa-validator 결과: 8/10 통과 (80%)
 ✅ A1 구조 정규화
 ✅ A2 디자인 토큰
 ❌ A3 불릿 규칙 — part-03 bullet-text 32자 (30자 초과)
 ❌ A6 레퍼런스 준수 — 인라인 <style> 잔존
```

## E6 · 출처 역추적 (v1.1)

- 모든 사실 주장에 `[src:N]` 부착
- `citation-check.mjs`가 누락 시 적색 실패
- `_design/citation-index.md`에 풀 출처 매핑
- 누락 주장은 스크립트에서 `⚠️ [src:?]`로 시각 표시

## 로그 위치

- 파이프라인 로그: `output/<slug>/_postmortem.md`
- 개별 에러: `output/<slug>/_design/errors/<timestamp>.log`

## 참조

- `.claude/rules/quality-method.md` — K1 3중 검증
- `.claude/scripts/citation-check.mjs` — E6
- `.claude/scripts/diff-capture.mjs` — E4
