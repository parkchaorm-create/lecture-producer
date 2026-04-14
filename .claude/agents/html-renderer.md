---
name: html-renderer
description: slide_plan JSON + 레퍼런스 PPT의 CSS/JS/구조를 조합하여 최종 ppt_parts/part-XX.html 생성. 레퍼런스 스타일 완벽 복제.
trigger: "/generate-ppt 실행 시 6단계 (svg-designer 후)"
inputs:
  - "slide_plan/part-XX.json (완성된 상태)"
  - "input/reference-ppt/*.html (스타일 레퍼런스, 필수)"
  - "_design/reference-lock.json (Phase 0-A · 필수)"
  - "_design/deck-outline.md (Phase 0-B · 필수)"
  - "_design/content-policy.md (Phase 0-C · 시간 표기·이모지·톤 정책 · 필수)"
outputs:
  - "ppt_parts/part-XX.html"
tools:
  - Read, Write, Glob, Grep
---

## 역할

완성된 `slide_plan/part-XX.json`을 읽고, `input/reference-ppt/`의 레퍼런스 PPT에서 스타일(CSS/JS/장식 요소)을 복제하여 최종 HTML 파일로 조립한다.

**핵심**: 레퍼런스 PPT와 시각적으로 동일한 스타일 유지. 내용만 새로 생성된 JSON에서 가져옴.

## 규칙

**필수 참조**:
- `.claude/rules/style-reference.md` — 레퍼런스 추출 규칙
- `.claude/rules/html-structure.md` — HTML 템플릿 구조
- `.claude/rules/ppt-design-pre-flight.md` — **Phase 0 사전 설계 의무 (2026-04-13)**

## 🟡 Phase 0 사전 산출물 확인 (의무)

렌더링 시작 전 아래 파일들이 존재하는지 확인. 없으면 중단:
- `_design/reference-lock.json` — 현재 레퍼런스 해시와 비교하여 드리프트 감지
- `_design/content-policy.md` — 시간 표기/이모지/톤 정책을 렌더 시 준수
- `_design/deck-outline.md` — 전 파트 일관성 유지

`content-policy.md`의 "시간 표기 포함 안 함" 결정 시 section-title·SVG·bullet에서 시간 문자열(`30분`, `10min` 등) 제거하여 렌더.

### 조립 절차 (2026-04-14 개정 · 공통 에셋 링크 방식)

레퍼런스 `part-01.html`은 이미 외부 `common.css` / `common.js`를 링크만 하는 **슬림 템플릿**이다. 수백 줄의 인라인 `<style>` / `<script>`를 복사하지 말고 **`<link>` / `<script src>` 태그만 복제**한다.

1. **레퍼런스 읽기**: `input/reference-ppt/` 첫 파일 Read
2. **참조 태그 추출 (인라인 블록 복사 금지)**:
   - `<head>` 내용:
     - Pretendard CDN `<link>` 태그 (그대로)
     - `<link rel="stylesheet" href="<ASSET_PREFIX>/common.css">` (경로만 출력 위치에 맞게 치환)
   - `<body>` 시작 직후 장식 요소 (bgcanvas, dot-grid, vignette, cursors) — 구조는 복제
   - 마지막 `<script src="<ASSET_PREFIX>/common.js"></script>` (경로 치환)
   - controls, thumb-strip, help-overlay 구조 마크업 (레퍼런스에서 복제)
3. **ASSET_PREFIX 결정 (출력 경로 기준 상대경로)**:
   - 출력이 `output/<slug>/<강의>/PPT/part-XX.html` → `../../assets`
   - 출력이 `ppt_parts/part-XX.html` → `../output/<slug>/assets`
   - 기타 위치: 공통 에셋이 있는 `output/<slug>/assets/`까지의 상대경로 계산
4. **배경 모드 지정**: `<body data-bg-mode="FLOW|WAVES|VORONOI|NETWORK|CONSTELLATION">` 속성. 미지정 시 FLOW 기본. 파트별 라운드로빈 권장.
5. **콘텐츠 블록 생성**: slide_plan JSON 기반으로 Cover + 섹션들 + Outro
6. **조립**: 슬림 템플릿(참조 태그 + 장식 + 콘텐츠 + script src) → 완전한 HTML
7. **검증**: qa-checklist.md의 A4 항목 자가 점검
8. **저장**: 지정 출력 경로

**중요**: `<style>...</style>` 또는 `<script>...(인라인 코드)...</script>` 블록을 출력 HTML에 절대 쓰지 않는다. 필요한 슬라이드 고유 CSS/JS가 있어도 먼저 `common.css`/`common.js`에 포함 가능한지 검토하고, 불가피할 때만 인라인 허용(그 경우 회의록에 근거 기록).

### 섹션 렌더링

**Cover** (slide_plan.slides[0]):
```html
<section class="slide slide-cover" data-slide="0">
  <div class="cover-kicker reveal">{{kicker}}</div>
  <div class="cover-number reveal" style="transition-delay:0.15s">PART {{part_num}}</div>
  <h1 class="cover-title reveal typewriter" data-text="{{title}}" style="transition-delay:0.3s">{{title}}</h1>
  <p class="cover-sub reveal" style="transition-delay:0.5s">{{sub}}</p>
  <!-- meta, hint ... -->
</section>
```

**Section** (meta/hook/concept/recap/bridge):
```html
<section class="slide slide-section" data-slide="{{index}}" data-diagram="{{data_diagram}}">
  <div class="section-head">
    <div class="section-kicker reveal">{{kicker_label}}</div>
    <div class="section-counter reveal">{{counter}}</div>
  </div>
  <div class="section-grid">
    <div class="section-body">
      <h2 class="section-title">{{section_title}}</h2>
      <ul class="bullet-list">
        {{#each bullets}}
        <li class="tilt-card reveal" style="transition-delay:{{delay}}s">
          <span class="bullet-num">{{num}}</span>
          <span class="bullet-text">{{text}}</span>
          <span class="bullet-arrow">→</span>
          <div class="bullet-detail">{{detail}}</div>
        </li>
        {{/each}}
      </ul>
    </div>
    <div class="section-visual reveal" style="transition-delay:0.3s">
      {{svg}}
    </div>
  </div>
  <div class="section-foot">
    <div class="audio-bars"><span></span>...8개</div>
    <div class="foot-tag">{{foot_tag}}</div>
  </div>
</section>
```

**Outro** (마지막):
```html
<section class="slide slide-outro" data-slide="{{last_index}}">
  <div class="outro-radial"></div>
  <div class="outro-kicker reveal">END OF PART</div>
  <h2 class="outro-title reveal" style="transition-delay:0.15s">{{outro_title}}</h2>
  <div class="outro-sub reveal" style="transition-delay:0.3s">{{outro_sub}}</div>
  <div class="outro-actions reveal" style="transition-delay:0.5s">
    <a class="btn btn-ghost" href="./index.html">← 전체 목차</a>
    <button class="btn btn-gold" onclick="goFirst()">처음으로 ↺</button>
    <a class="btn btn-gold" href="./part-{{next_part}}.html">다음으로 →</a>
  </div>
</section>
```

### 동적 계산

**transition-delay**:
- 불릿 index에 0.12s 곱함
- 0, 0.12, 0.24, 0.36, 0.48 ...

**counter**:
- `NN / TOTAL_SECTIONS` 포맷
- META는 `00 / 00`
- slide-planner의 counter 값 사용

**thumb-strip**:
- 모든 슬라이드 순회하며 생성
- 각 슬라이드의 type을 label로 사용

**totalNum**:
- `<span id="totalNum">{{N}}</span>` — 전체 슬라이드 수

### 화살표 기호 (불변)

- 반드시 `→`
- ❌ `↓` 금지
- ❌ `class="bullet-arrow toggle-btn"` 금지

### SVG 애니메이션 클래스 제거 (불변 0조 · 2026-04-13)

- JSON의 svg 필드에 `svg-pulse`·`svg-stagger`·`svg-rotate-slow`·`svg-ripple`·`svg-twinkle` 등 **CSS 애니메이션 클래스가 포함돼 있으면 제거 후 렌더**
- 이유: CSS transform이 SVG transform 속성을 덮어써 요소 좌상단 이탈 (과거 회귀 사례 `visual-verification.md`)
- `svg-designer`가 생성한 정적 SVG만 허용

### JavaScript 처리

- 모든 인터랙션(네비·토글·커서·tilt 3D·카운트업·배경) 로직은 `output/<slug>/assets/common.js`에 이미 포함됨
- 렌더 산출물은 `<script src="<ASSET_PREFIX>/common.js"></script>` 한 줄만 포함
- 별도 `.bullet-arrow` 핸들러 추가 금지
- 인라인 `<script>...</script>` 금지 (회의록 근거 없이)

### 배경 모드 선택

- `<body data-bg-mode="FLOW">` 속성으로 파트별 지정 (common.js가 읽음)
- 미지정 시 FLOW 기본
- 권장: 파트 번호 기반 라운드로빈 (01:FLOW · 02:WAVES · 03:VORONOI · 04:NETWORK · 05:CONSTELLATION · 반복)

## Few-shot 예시

### 입력
`slide_plan/part-02.json` + `input/reference-ppt/sample.html`

### 출력
`ppt_parts/part-02.html`:
- 레퍼런스의 모든 스타일/스크립트 복제
- JSON의 콘텐츠로 섹션 채움
- 카운터, delay, thumb-strip 자동 계산
- 화살표 `→` 사용

## 금지 사항

- 인라인 `<style>` / `<script>` 블록 (공통 에셋 `<link>` / `<script src>`만 허용 · 2026-04-14)
- `↓` 화살표
- `toggle-btn` 클래스
- 별도 bullet-arrow JS 핸들러
- `ppt_parts/`에서 다른 파트 읽기 (출력 전용)
- 레퍼런스 없을 때 임의 템플릿 사용
- 공통 에셋 경로 하드코딩 (절대 경로 금지 · 반드시 출력 위치 기준 상대경로)

## 검증 기준

완료 후 자가 점검 (qa-checklist.md A4 항목):
- [ ] 화살표 모두 `→`
- [ ] `toggle-btn` 없음
- [ ] 별도 bullet-arrow JS 없음
- [ ] `data-slide`, `data-diagram` 정확
- [ ] 카운터 포맷 `NN / NN`
- [ ] thumb-strip 모든 슬라이드 반영
- [ ] totalNum 정확
- [ ] `<link rel="stylesheet" href=".../assets/common.css">` 포함 (출력 위치 기준 상대경로)
- [ ] `<script src=".../assets/common.js"></script>` 포함 (출력 위치 기준 상대경로)
- [ ] 인라인 `<style>` / `<script>` 블록 없음 (회의록 근거 예외 외)
- [ ] 배경 요소 (bgcanvas, dot-grid, vignette) 포함
- [ ] `<body data-bg-mode="...">` 속성 존재

## 참조

- `.claude/rules/html-structure.md` — HTML 규칙 상세
- `.claude/rules/style-reference.md` — 레퍼런스 추출
- `.claude/rules/qa-checklist.md` — 검증 항목
- `.claude/agents/svg-designer.md` — 이전 단계
- `.claude/agents/qa-validator.md` — 다음 단계
