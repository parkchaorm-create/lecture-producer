# HTML Structure Rules (HTML 템플릿 규칙)

> `html-renderer` 에이전트의 필수 참조. 모든 PPT HTML은 이 구조를 따른다.

## SVG 애니메이션 클래스 금지 (불변 0조 · 2026-04-13)

렌더링 시 SVG 내 `class="svg-pulse"`·`svg-stagger`·`svg-rotate-slow`·`svg-ripple`·`svg-twinkle` 등 CSS 애니메이션 클래스가 있으면 **제거**한 뒤 HTML에 기록한다. 이유·대체: `.claude/rules/svg-design.md` 불변 0조.

검증: `grep -c 'class="svg-[a-z]' ppt_parts/*.html` → 0

## 전체 문서 구조

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Part {{NUM}} · {{SHORT_TITLE}} — {{SERIES_NAME}}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css">
  <style>
    /* 레퍼런스 PPT의 <style> 블록 그대로 복사 */
  </style>
</head>
<body>
  <canvas id="bgcanvas"></canvas>
  <div class="dot-grid"></div>
  <div class="vignette"></div>
  <div class="cursor-dot"></div>
  <div class="cursor-ring"></div>
  
  <main id="deck">
    <!-- 슬라이드들 순차 배치 -->
    {{COVER_SECTION}}
    {{ALL_SECTIONS}}
    {{OUTRO_SECTION}}
  </main>
  
  <div class="controls">...</div>
  <div class="thumb-strip" id="thumbStrip">...</div>
  <div class="help-overlay" id="helpOverlay">...</div>
  
  <script>
    /* 레퍼런스 PPT의 <script> 블록 그대로 복사 */
  </script>
</body>
</html>
```

## 슬라이드 타입별 구조

### Cover (data-slide="0")
```html
<section class="slide slide-cover" data-slide="0">
  <div class="cover-kicker reveal">{{KICKER}}</div>  <!-- 예: "ACT 1 · 공연장" -->
  <div class="cover-number reveal" style="transition-delay:0.15s">PART {{NUM}}</div>
  <h1 class="cover-title reveal typewriter" data-text="{{TITLE}}" style="transition-delay:0.3s">{{TITLE}}</h1>
  <p class="cover-sub reveal" style="transition-delay:0.5s">{{SUB}}</p>
  <div class="cover-meta reveal" style="transition-delay:0.8s">
    <span class="meta-dot"></span>
    <span>인터랙티브 슬라이드 · 마우스·키보드로 조작</span>
  </div>
  <div class="cover-hint reveal" style="transition-delay:1s">⌨ ← → 이동 · <kbd>F</kbd> 전체화면 · <kbd>?</kbd> 도움말 · <kbd>T</kbd> 썸네일</div>
</section>
```

### Section (META, HOOK, CONCEPT, RECAP, BRIDGE)
```html
<section class="slide slide-section" data-slide="{{N}}" data-diagram="{{TYPE}}">
  <div class="section-head">
    <div class="section-kicker reveal">{{TYPE_LABEL}}</div>  <!-- "META · 파트 메타" 등 -->
    <div class="section-counter reveal">{{COUNTER}}</div>     <!-- "01 / 07" 등 -->
  </div>
  <div class="section-grid">
    <div class="section-body">
      <h2 class="section-title">{{TITLE}}</h2>
      <ul class="bullet-list">
        {{BULLETS}}
      </ul>
    </div>
    <div class="section-visual reveal" style="transition-delay:0.3s">
      {{SVG}}
    </div>
  </div>
  <div class="section-foot">
    <div class="audio-bars"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
    <div class="foot-tag">{{TYPE}}</div>
  </div>
</section>
```

### Bullet (아코디언 토글)
```html
<li class="tilt-card reveal" style="transition-delay:{{DELAY}}s">
  <span class="bullet-num">{{NUM}}</span>
  <span class="bullet-text">{{TEXT}}</span>
  <span class="bullet-arrow">→</span>
  <div class="bullet-detail">{{DETAIL}}</div>
</li>
```

**중요**:
- 화살표는 **반드시 `→`** (오른쪽 화살표)
- `bullet-arrow`에 `toggle-btn` 클래스 추가 금지
- `bullet-detail`은 JS/CSS로 토글됨 (tilt-card에 `.open` 클래스 추가 시 펼쳐짐)

### Outro (마지막 슬라이드)
```html
<section class="slide slide-outro" data-slide="{{LAST_NUM}}">
  <div class="outro-radial"></div>
  <div class="outro-kicker reveal">END OF PART</div>
  <h2 class="outro-title reveal" style="transition-delay:0.15s">{{OUTRO_TITLE}}</h2>
  <div class="outro-sub reveal" style="transition-delay:0.3s">NEXT · Part {{NEXT_NUM}} · {{NEXT_HINT}}</div>
  <div class="outro-actions reveal" style="transition-delay:0.5s">
    <a class="btn btn-ghost" href="./index.html">← 전체 목차</a>
    <button class="btn btn-gold" onclick="goFirst()">처음으로 ↺</button>
    <a class="btn btn-gold" href="./part-{{NEXT_NUM_PADDED}}.html">다음으로 →</a>
  </div>
</section>
```

## data-diagram 속성

섹션 타입 식별자:
- `meta` — 파트 메타
- `hook` — 오프닝 훅
- `concept` — 핵심 개념
- `recap` — 복습
- `bridge` — 다음 파트 연결
- `check` — 체크리스트 (선택)
- `overview` — 개요 (선택)

## section-kicker 라벨 표기

- `META · 파트 메타`
- `HOOK · 오프닝 훅`
- `CONCEPT · 개념`
- `RECAP · 복습`
- `BRIDGE · 다음 악장`

## section-counter 규칙

- 첫 번째 section (META) 카운터: `00 / 00`
- 이후: `01 / NN`, `02 / NN`, ... , `NN / NN`
- NN = 전체 section 개수 (cover, outro 제외)
- 계산: `currentIndex / totalSections`

## transition-delay 계산

불릿 개수에 따라:
- 3개: `0.0s → 0.12s → 0.24s`
- 4개: `0.0s → 0.12s → 0.24s → 0.36s`
- 5개: `0.0s → 0.12s → 0.24s → 0.36s → 0.48s`
- **기본 간격: 0.12s**

## thumb-strip 생성

모든 슬라이드에 대해 카드 생성:
```html
<div class="thumb-strip-inner" id="thumbInner">
  <div class="thumb" data-idx="0"><span class="thumb-num">01</span><span class="thumb-label">COVER</span></div>
  <div class="thumb" data-idx="1"><span class="thumb-num">02</span><span class="thumb-label">META</span></div>
  <!-- ... -->
  <div class="thumb" data-idx="{{N}}"><span class="thumb-num">{{N+1}}</span><span class="thumb-label">END</span></div>
</div>
```

## 화살표 기호 (불변)

- `bullet-arrow` 내부: **`→`** (고정)
- ❌ `↓` 금지
- ❌ `class="bullet-arrow toggle-btn"` 금지

## JavaScript 핸들러 (불변)

### 필수: tilt-card 클릭 핸들러 (레퍼런스에서 복사)
```javascript
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => { ... });  // 3D 효과
  card.addEventListener('mouseleave', () => { ... });
  card.addEventListener('click', () => {
    card.classList.toggle('open');  // 아코디언 토글
  });
});
```

### 금지: 별도 bullet-arrow 핸들러
```javascript
// ❌ 추가하지 말 것 (중복이고, stopPropagation()이 tilt-card와 충돌함)
document.querySelectorAll('.bullet-arrow').forEach(el => {
  el.addEventListener('click', e => { e.stopPropagation(); ... });
});
```

## 레퍼런스 참조

- 새 프로젝트: `input/reference-ppt/*.html`에서 구조/스타일 추출
- 기준 파일 (원본): `ppt_parts/part-01.html`
- CSS 전체 블록과 JS 전체 블록은 **그대로 복사** (수정 금지)

## 검증

### 자동
- 화살표 `→` 확인: `grep -c 'bullet-arrow">→' ppt_parts/*.html`
- `↓` 잔존 검출: `grep -c 'bullet-arrow">↓' ppt_parts/*.html` → 0
- `toggle-btn` 검출: `grep -c 'toggle-btn' ppt_parts/*.html` → 0
- 별도 bullet-arrow 핸들러: `grep -c "querySelectorAll\('\.bullet-arrow'\)" ppt_parts/*.html` → 0
- 고아 `});` 검출: 다중 `});\n\n\n});` → 0
- 카운터 정합: section 수 == 마지막 카운터의 NN

### 런타임
- 브라우저에서 열어 까만 화면 없는지 확인
- 콘솔 에러 없는지 확인
- 불릿 클릭 시 펼쳐짐 동작

## 참조
- `.claude/rules/design-tokens.md` — 디자인 토큰
- `.claude/rules/bullet-writing.md` — 불릿 내용 규칙
- `.claude/rules/style-reference.md` — 레퍼런스 PPT 추출
- `.claude/rules/qa-checklist.md` — 검증 체크리스트
