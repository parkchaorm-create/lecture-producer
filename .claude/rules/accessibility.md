# Accessibility (접근성 규약 · v1.1)

> F3 합의 반영. PPT·실습 튜토리얼이 시각장애·청각장애·인지장애 수강생도 사용 가능하도록 WCAG AA 기준.

## A1. SVG 인포그래픽
- 모든 `<svg>`에 `<title>` 의무 (스크린 리더 우선 읽음)
- 보조 설명 `<desc>` 권장 (30~100자)
- `<svg role="img" aria-labelledby="title-ID desc-ID">` 연결

```html
<svg viewBox="0 0 400 260" role="img" aria-labelledby="t1 d1">
  <title id="t1">ChatGPT vs Claude Code 비교</title>
  <desc id="d1">왼쪽은 ChatGPT 아이콘, 오른쪽은 Claude Code 아이콘. 중앙에 VS 기호.</desc>
  ...
</svg>
```

## A2. 색상 대비 (WCAG AA)
- 본문 텍스트 대비 비율 ≥ 4.5:1
- 큰 텍스트(18pt+) ≥ 3:1
- 파자마보스 기본 조합 통과 수치:
  - `#E8E0CC` on `#0D0D0D` → 13.4:1 ✅
  - `#e2c793` on `#0D0D0D` → 10.2:1 ✅
  - `#7a7666` on `#0D0D0D` → 4.6:1 ✅ (최소)
- 신규 테마 작성 시 대비 사전 검증 (`contrast-check.mjs`)

## A3. 키보드 내비
- 모든 인터랙션 요소 `tabindex` 접근 가능
- 포커스 스타일 명확 (`outline: 2px solid var(--gold)`)
- 키보드만으로 슬라이드 이동·토글·도움말 전부 조작 가능
- ESC로 overlay·thumb-strip 닫기

## A4. ARIA 속성
- tilt-card: `role="button"` + `aria-expanded="true|false"`
- controls: `aria-label` 명시 (`aria-label="다음 슬라이드"`)
- thumb-strip: `role="tablist"` + 각 thumb는 `role="tab"` + `aria-selected`
- help-overlay: `role="dialog"` + `aria-modal="true"`

## A5. 자막·대체 텍스트
- 이미지 `<img alt="...">` 필수 (빈 alt는 장식용만)
- 동영상·오디오는 자막 (.vtt) 동봉 (실습 튜토리얼에 영상 포함 시)

## A6. 움직임 민감성
- `@media (prefers-reduced-motion: reduce)` 분기:
  - 배경 캔버스 애니메이션 정지 (`requestAnimationFrame` 중단)
  - Reveal 트랜지션 즉시
  - SVG 애니메이션 클래스는 이미 금지 (불변 0조)

## A7. OS 강제 색상 대응 (C1')
- `<meta name="color-scheme" content="dark">` 헤드
- 카드·SVG에 `forced-color-adjust: none` (Windows High Contrast·iOS Smart Invert가 골드 팔레트 덮지 않도록)

## 검증 (qa-checklist A11)
- [ ] 모든 `<svg>`에 `<title>` 존재
- [ ] 본문·큰 텍스트·보조 색상 모두 WCAG AA 통과
- [ ] `prefers-reduced-motion` 분기 적용
- [ ] 모든 인터랙션에 `aria-label` 또는 의미 있는 텍스트
- [ ] 키보드만으로 풀 플로우 완수 (수동 E2E)
- [ ] `color-scheme dark` + `forced-color-adjust: none` 적용

## 참조
- `.claude/rules/qa-checklist.md` A11 접근성
- `.claude/scripts/contrast-check.mjs` (v1.1)
- `assets/themes/pajamaboss/tokens.json` accessibility 섹션
