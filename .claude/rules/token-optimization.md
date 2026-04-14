# Token Optimization (토큰 최적화 SSOT)

> 사용자 직접 지시 (2026-04-14): 토큰 절감을 설계 원칙에 반영. 기존 인라인 방식 대비 -30% 목표.

## 단계별 Budget (C7')

| 단계 | 입력 상한 | 에이전트 |
|------|-----------|----------|
| 6인 회의 1·2차 | **60k 토큰** | expert-council |
| 스크립트 작성 | **40k 토큰** | lecture-writer |
| PPT 렌더 | **25k 토큰** | slide-planner / bullet-writer / svg-designer / html-renderer |
| 검증 | **15k 토큰** | qa-validator |

초과 시 **사용자 확인** 후 진행 (비용 경고 포함).

## O1 · 공통 에셋 분리

`assets/themes/<theme>/common.css`·`common.js` 외부화. html-renderer는 `<link>`·`<script src>`만. 파트당 ~700줄 절감.

## O2 · 규칙 파일 분할 로드

에이전트 frontmatter의 `inputs`에 **필요한 규칙만** 명시:
- html-renderer → `html-structure.md` + `design-tokens.md` (svg-design 등 불필요 제외)
- svg-designer → `svg-design.md` + `design-tokens.md` + `visual-verification.md`의 회귀 브리핑만
- lecture-writer → `audience-profiles.md` + `branding/<audience>/*`만

## O3 · 컨텍스트 캐시 친화적 배치

Anthropic 프롬프트 캐시 5분 TTL 활용:
- **앞쪽(불변)**: 규칙·레퍼런스·브랜드보이스·골드 샘플 구조 → 캐시 히트
- **뒤쪽(가변)**: 현재 파트 JSON·웹 크롤링 결과 → 캐시 미스 감수

## O4 · 중간 산출물 슬림화

- `slide_plan/part-XX.json`에서 SVG 전체 코드 대신 **파일 경로 참조** (`assets/svg_components/XX.svg`)
- bullet detail 120자 상한 (bullet-writing.md 기존 규칙)
- 회의록은 외부 파일, inline은 ≤500자 요약 (B7)

## O5 · 에이전트 호출 최소화

- 작은 수정은 `/regenerate-part XX` 또는 `/regenerate-kit XX` 경유
- 6인 회의는 회당 1회만, 결과 캐싱
- 동일 부분 재작성 시 diff만 전달 (full replace 금지)

## O6 · 웹 크롤링 결과 캐싱

- WebSearch·WebFetch 결과 → `_design/web-cache-<topic>.md`
- 30일 TTL · 사용자 수동 무효화 가능
- 동일 주제 재크롤링 차단

## O7 · Few-shot 구조 요약

골드 샘플을 few-shot으로 주입 시 **전체 본문 대신 구조 요약 JSON**만:
```json
{
  "slide_count": 9,
  "bullets_per_slide": [3,4,4,3,5,4,3,4,3],
  "svg_archetypes": ["A1","A3","A4","A5","A6","A7","A2","A9","A1"],
  "tone_sample": "첫 30자..."
}
```

## 측정

`.claude/scripts/token-budget.mjs` (v1.0 선택 · v1.1 필수):
- 파이프라인 각 단계 예상 토큰 수 출력
- 초과 시 경고 + 사용자 확인
- 실제 사용량 vs 예산 비교 로그

## 참조

- `.claude/rules/error-handling.md` — budget 초과 처리
- `.claude/rules/quality-method.md` — 절감이 K1 3중 검증을 깎지 않도록
