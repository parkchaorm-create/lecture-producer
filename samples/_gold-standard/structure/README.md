# Gold Standard · Structure (구조 골드)

> 파자마보스 스타일의 레이아웃·밀도·정보 위계 SSOT. 콘텐츠(텍스트)가 아닌 **구조**만 담는다. 도메인·오디언스 무관.

## 슬라이드당 정량 지표

| 항목 | 기준 |
|------|------|
| 슬라이드당 bullet 수 | 3~5개 |
| bullet-text 길이 | 20~30자 |
| bullet-detail 길이 | 40~120자 |
| 슬라이드당 SVG 텍스트 | ≤8개 |
| SVG 아키타입 | A1~A9 중 선택 |
| 섹션 타입 순서 | Cover → META → HOOK → CONCEPT(N) → RECAP → BRIDGE → OUTRO |

## 파트당 정량 지표

| 항목 | 기준 |
|------|------|
| 실습 키트 체크포인트 | ≥3개 |
| [DEMO] 섹션 | 있음 (선택) |
| bullet 총 개수 | 12~20개 |
| SVG 인포그래픽 | 슬라이드당 1개 |

## ACT 분포 (4분할)

| ACT | 파트 비중 |
|-----|-----------|
| ACT1 Foundation | 15~25% |
| ACT2 Skills | 30~40% |
| ACT3 Integration | 20~30% |
| ACT4 Optimization | 15~20% |

## 불변 원칙

- Cover는 1개, Outro는 1개
- 섹션 카운터는 `NN / NN` 포맷
- 모든 bullet은 아코디언 토글 (tilt-card)
- 화살표는 `→` (↓ 금지)

## 검증

`.claude/scripts/similarity-check.mjs` (v1.1)가 새 산출물을 이 구조와 비교해 유사도 출력.

## 참조

- `.claude/rules/bullet-writing.md` — bullet 규칙
- `.claude/rules/svg-design.md` — 아키타입
- `.claude/rules/html-structure.md` — 섹션 순서
