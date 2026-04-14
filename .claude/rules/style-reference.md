# Style Reference Extraction (스타일 레퍼런스 추출 규칙)

> 새 작업 시작 시 `input/` 폴더의 레퍼런스 PPT로부터 스타일을 추출하고 그대로 복제한다.

## Phase 0-A · Reference Lock (2026-04-13 도입 · 필수)

스타일 추출 시작 전 `input/reference-ppt/` 전체 파일의 SHA-256 해시를 `_design/reference-lock.json`에 기록한다. 이후 파이프라인 중간에 레퍼런스가 변경되면 해시 불일치로 자동 감지하여 파이프라인을 중단한다.

상세: `.claude/rules/ppt-design-pre-flight.md` Phase 0-A 절.

## 입력 폴더 구조 (Canonical)

```
input/
├── reference-ppt/           ← [필수] 스타일 복제 대상. 기존 고품질 PPT 1개 이상
│   └── part-XX.html         ← Reveal.js PPT 파일
├── script/                  ← [필수] 원본 스크립트 (강의안, 유튜브 대본, 블로그 등)
│   └── *.txt, *.md, *.docx
└── materials/               ← [선택] 참고 자료 (이미지, 데이터, 기존 자료 등)
    └── *.*
```

### 주의
- 새 작업 시작 시 `script_parts/`, `ppt_parts/`, `slide_plan/`는 **비어 있음**
- 레퍼런스 PPT는 `input/reference-ppt/`에만 존재 (기존 `ppt_parts/`에서 복사하지 않음)
- 다중 레퍼런스 가능: `input/reference-ppt/` 안에 여러 파일 넣으면 모두 학습

## 공통 에셋 분리 SSOT (2026-04-14 · GitHub 공개 대비)

레퍼런스 PPT의 CSS/JS는 **`output/<slug>/assets/common.css` + `common.js`**에 분리 저장되어 있다. 레퍼런스 `input/reference-ppt/part-01.html`은 이미 이 에셋을 `<link>` / `<script src>`로만 참조하는 슬림 템플릿.

### html-renderer 동작 원칙 (인라인 복사 금지)
- `<style>...</style>` / 대용량 `<script>...</script>` 블록 **복사 금지**
- 출력 HTML에는 `<link rel="stylesheet" href="<ASSET_PREFIX>/common.css">` + `<script src="<ASSET_PREFIX>/common.js"></script>`만 포함
- 상세: `.claude/agents/html-renderer.md` 조립 절차

### ASSET_PREFIX (출력 위치별 상대경로)
- `output/<slug>/<강의>/PPT/part-XX.html` → `../../assets`
- `ppt_parts/part-XX.html` → `../output/<slug>/assets`

### 시인성 정책
- 본문 (`.bullet-list li.tilt-card`): **19px** (기존 17px에서 상향)
- 상세 (`.bullet-detail`): **16px** (기존 14px에서 상향)
- 폰트 크기 수정은 반드시 `common.css`에서만 (SSOT)

### 배경 모드
- `<body data-bg-mode="FLOW|WAVES|VORONOI|NETWORK|CONSTELLATION">` 속성
- common.js가 읽어서 해당 애니메이션 실행. 미지정 시 FLOW 기본

### 지금까지 만든 산출물 (소급 적용 제외)
- 2026-04-14 이전 생성된 `output/<slug>/*/PPT/part-*.html`은 인라인 상태 유지
- 신규·재생성 파트부터 공통 에셋 링크 방식 적용

## 스타일 추출 대상 (4대 영역 · 구조 참고용)

> ⚠️ 아래 "추출" 표현은 **구조 참고**용이며, CSS/JS 실제 코드는 복사하지 않는다 (위 분리 정책). 에이전트는 구조/마크업만 레퍼런스에서 복제하고, 스타일·로직은 common.css/js에서 전역 공급.

### 1. HTML 구조
레퍼런스 파일을 Read 도구로 읽어서 아래를 **정확히 복사**:
- `<!DOCTYPE html>` 선언, `<html lang="ko">`, `<head>` 메타태그
- `<title>` 포맷: `Part XX · 제목 — 시리즈명`
- `<link>` 폰트 CDN (Pretendard)
- `<body>` 내 배경 요소: `#bgcanvas`, `.dot-grid`, `.vignette`, 커서 요소
- 섹션 구조: Cover → META → HOOK → CONCEPT(N) → RECAP → BRIDGE → OUTRO
- 각 섹션의 `data-slide`, `data-diagram` 속성 형식
- `section-head`, `section-grid`, `section-foot` 3분할 구조
- `.tilt-card.reveal` 클래스 적용한 불릿 구조
- 컨트롤바 (이전/다음/도움말/전체화면/썸네일)
- 썸네일 스트립 (`.thumb-strip` 내 각 파트 카드)

### 2. CSS (임베디드 `<style>` 블록)
레퍼런스 파일의 `<style>...</style>` 전체 블록을 **그대로 복사**:
- CSS 변수 정의 (`--black`, `--gold` 등) — `design-tokens.md`와 일치 확인
- 배경 레이어 (dot-grid, vignette, bgcanvas 위치/opacity)
- 커스텀 커서 (cursor-dot, cursor-ring)
- `.slide` 공통 스타일 + 각 타입별 (`.slide-cover`, `.slide-section`, `.slide-outro`)
- `.tilt-card` 3D 효과 + hover + open 상태
- `.bullet-list`, `.bullet-num`, `.bullet-text`, `.bullet-arrow`, `.bullet-detail`
- `.reveal` 페이드인 애니메이션
- SVG 애니메이션 클래스 10종 (svg-stagger, svg-pulse, svg-draw-path 등)
- 썸네일 스트립 스타일
- 도움말 오버레이 스타일
- 외곽 장식 (typewriter, outro-radial 등 파트별 고유 효과)

### 3. JavaScript (임베디드 `<script>` 블록)
레퍼런스 파일의 `<script>...</script>` 전체 블록을 **그대로 복사**:
- `SLIDE NAVIGATION` 블록: `next()`, `prev()`, `go()`, `goFirst()`, 썸네일 클릭, 키보드 단축키
- `render()` 함수 + `runCountup()` (카운트업 애니메이션)
- `tilt-card 3D 효과` 블록: `mousemove`로 perspective/rotateY/rotateX 적용 + 클릭 시 `.open` 토글
- `ALGORITHMIC-ART BACKGROUND` 블록: 배경 캔버스 (FLOW, WAVES, VORONOI, CONSTELLATION 중 파트별 1개)
- `Custom cursor` 블록 (mousemove로 cursor-dot/cursor-ring 이동)

**금지**: `document.querySelectorAll('.bullet-arrow').forEach(...)` 별도 핸들러 추가 (tilt-card 클릭이 이미 처리)

### 4. SVG 디자인 언어
레퍼런스 파일 내 모든 `<svg>` 요소를 분석해서 **공통 패턴 추출**:
- `viewBox="0 0 400 260"` 고정
- 색상 팔레트 준수
- 애니메이션 클래스 사용 패턴
- 텍스트 크기 범위 (11~22px)
- 레이어링 (배경→도형→텍스트→강조)
- 스트로크 굵기 컨벤션 (1~2px)

## 스타일 추출 절차 (에이전트 동작)

1. `ls input/reference-ppt/` → 레퍼런스 파일 목록 확인
2. Read 도구로 첫 번째 레퍼런스 파일 전체 읽기
3. 아래 4개 블록을 추출하여 내부 변수에 저장:
   - `{{REFERENCE_HEAD}}` = `<head>...</head>` 내용
   - `{{REFERENCE_STYLE}}` = `<style>...</style>` 내용
   - `{{REFERENCE_SCRIPT}}` = `<script>...</script>` 내용
   - `{{REFERENCE_BODY_CHROME}}` = 배경/커서/컨트롤바 등 장식 요소
4. 추출된 블록을 템플릿에 주입하여 새 PPT 생성

## 일관성 보장 규칙

### 반드시 복제
- 색상 팔레트 (design-tokens.md)
- 폰트 패밀리
- SVG viewBox
- 아코디언 토글 메커니즘 (tilt-card 클릭)
- 키보드 단축키
- 썸네일 스트립 구조

### 파트별로 고유하게 할 것
- `<title>` 텍스트 (파트명 반영)
- 배경 모드 (FLOW/WAVES/VORONOI/CONSTELLATION 중 선택)
- Cover의 타이포그래피 (typewriter 효과의 텍스트)
- SVG 인포그래픽 (절대 중복 금지)
- 섹션 제목 및 불릿 내용

### 레퍼런스와 다른 스크립트 원본이 있어도
- **디자인은 레퍼런스를 따름** (사용자가 바꾸고 싶으면 reference-ppt를 교체)
- 콘텐츠만 새 스크립트 기반으로 생성

## 검증

- 새로 생성한 각 PPT의 `<style>` 블록과 레퍼런스의 `<style>` 블록을 diff → 핵심 스타일(변수, 클래스, 애니메이션) 일치 확인
- 새 PPT에서 불릿 클릭 → 토글 동작 정상
- 새 PPT의 SVG 팔레트가 레퍼런스와 일치

## 참조
- `.claude/rules/design-tokens.md` — 불변 토큰
- `.claude/rules/html-structure.md` — HTML 패턴 상세
- `.claude/agents/script-splitter.md` — 원본 처리
- `.claude/agents/html-renderer.md` — 템플릿 조립 담당
