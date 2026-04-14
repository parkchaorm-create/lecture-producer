# Design Tokens (SSOT · 단일 진실의 원천)

> **모든 에이전트/스킬은 이 파일을 최종 권위로 참조한다.** 이 파일에 없는 값은 사용 금지.

## 색상 토큰 (변경 금지)

```css
--black: #0D0D0D;    /* 배경 */
--ink:   #141414;    /* 보조 배경 */
--gold:  #e2c793;    /* 주요 강조 */
--gold-soft: #b8941f;/* 어두운 금색 */
--cream: #F7F0DF;    /* 밝은 텍스트 */
--text:  #E8E0CC;    /* 본문 텍스트 */
--muted: #7a7666;    /* 보조 텍스트 */
--dim:   #3a3730;    /* 매우 어두운 테두리 */
--border:#1f1d19;    /* 기본 테두리 */
```

### 색상 사용 규칙
- SVG 내에서는 오직 `#e2c793`, `#F7F0DF`, `#7a7666`, `#3a3730` 네 개만 사용
- HTML/CSS에서는 변수로만 참조 (`var(--gold)`)
- **금지**: 위 목록에 없는 색상 (예: `#ff0000`, `blue`, `red` 등)
- **금지**: 그라데이션에 브랜드 외 색상

## 폰트 토큰

- 주 폰트: `'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif`
- 모노스페이스: `'JetBrains Mono', monospace` (숫자/코드에만)
- CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css`
- `letter-spacing: -0.01em` (본문 기본)

## SVG 토큰 (불변)

- `viewBox="0 0 400 260"` 고정 (다른 값 절대 금지)
- 텍스트 최소 `font-size="11"` (그 이하 금지)
- 권장 텍스트 크기: 12~18px
- 한 SVG당 `<text>` 요소 최대 8개 (초과 시 분할)

## 슬라이드 레이아웃 토큰

- 섹션 그리드: `grid-template-columns: 1fr 400px` (내용 / SVG)
- 슬라이드 여백: 외곽 64px, 섹션 간 32px
- 불릿 카드 패딩: 16px 20px
- 불릿 상세 max-height (열림): 200px

## 애니메이션 타이밍

- 전환 지속: 0.3~0.6s
- 불릿 등장 간격 (transition-delay): **0.12s 간격**
- SVG 애니메이션 duration: 0.6~1.8s

## 참조 파일 (값 출처 확인용)
- `ppt_parts/part-01.html` — 모든 토큰의 실제 사용 사례
- `SLIDE_AUTHORING_GUIDE.md` — 원본 가이드

## 검증 방법
- 런타임: `grep -E '#[0-9a-fA-F]{6}' ppt_parts/*.html` → 결과가 위 팔레트 외 색상이면 실패
- SVG: `grep -E 'viewBox="[^"]+"' ppt_parts/*.html` → `0 0 400 260` 외 viewBox는 실패
- 폰트: `font-size="[0-9]"` 중 11 미만은 실패
